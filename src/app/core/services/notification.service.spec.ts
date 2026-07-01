import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { FifaApiService } from './fifa-api.service';
import { I18nService } from './i18n.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('NotificationService', () => {
  let service: NotificationService;
  let apiSpy: any;
  let i18nSpy: any;
  let originalNotification: any;
  let mockStorage: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn()
    };
    vi.stubGlobal('localStorage', mockStorage);

    apiSpy = {
      getMatches: vi.fn().mockReturnValue(of({ Results: [] }))
    };

    i18nSpy = {
      currentLang: vi.fn().mockReturnValue('pt')
    };

    originalNotification = window.Notification;
    
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: FifaApiService, useValue: apiSpy },
        { provide: I18nService, useValue: i18nSpy }
      ]
    });
  });

  afterEach(() => {
    window.Notification = originalNotification;
    if (service) {
      (service as any).pollSubscription?.unsubscribe();
    }
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should return null from getStorageItem when localStorage is undefined', () => {
    vi.stubGlobal('localStorage', undefined);
    const newService = TestBed.inject(NotificationService);
    expect(newService.notifyAll()).toBe(false); // fallback to false
  });

  it('should be created and load settings from local storage', () => {
    mockStorage.getItem.mockImplementation((key: string) => {
      if (key === 'notifyAll') return 'true';
      if (key === 'notifyFavorite') return 'true';
      if (key === 'notifyTime') return '30';
      return null;
    });
    
    service = TestBed.inject(NotificationService);
    
    expect(service).toBeTruthy();
    expect(service.notifyAll()).toBe(true);
    expect(service.notifyFavorite()).toBe(true);
    expect(service.notifyTime()).toBe(30);
  });

  it('should update settings', () => {
    service = TestBed.inject(NotificationService);
    service.updateSettings(true, false, 45);
    
    expect(service.notifyAll()).toBe(true);
    expect(service.notifyFavorite()).toBe(false);
    expect(service.notifyTime()).toBe(45);
    
    expect(mockStorage.setItem).toHaveBeenCalledWith('notifyAll', 'true');
    expect(mockStorage.setItem).toHaveBeenCalledWith('notifyFavorite', 'false');
    expect(mockStorage.setItem).toHaveBeenCalledWith('notifyTime', '45');
  });

  it('should request permission - unsupported', async () => {
    service = TestBed.inject(NotificationService);
    const originalWindow = { ...window };
    delete (window as any).Notification;
    window.alert = vi.fn();
    
    const res = await service.requestPermission();
    expect(res).toBe(false);
    expect(window.alert).toHaveBeenCalled();
    
    (window as any).Notification = originalWindow.Notification; // restore
  });

  it('should return true if permission already granted', async () => {
    service = TestBed.inject(NotificationService);
    (window as any).Notification = { permission: 'granted' };
    
    const res = await service.requestPermission();
    expect(res).toBe(true);
  });

  it('should request permission from user', async () => {
    service = TestBed.inject(NotificationService);
    (window as any).Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted')
    };
    
    const res = await service.requestPermission();
    expect(res).toBe(true);
    expect(window.Notification.requestPermission).toHaveBeenCalled();
  });

  it('should monitor and trigger notification for upcoming match', () => {
    service = TestBed.inject(NotificationService);
    service.updateSettings(true, false, 15);
    
    const mockNotification = vi.fn();
    (window as any).Notification = mockNotification;
    (window as any).Notification.permission = 'granted';
    
    const now = new Date();
    const upcomingDate = new Date(now.getTime() + 10 * 60000); // 10 minutes from now
    
    const upcomingMatch = {
      IdMatch: 'M1',
      MatchStatus: 1,
      Date: upcomingDate.toISOString(),
      Home: { TeamName: [{ Description: 'Brazil' }] },
      Away: { TeamName: [{ Description: 'Argentina' }] }
    };
    
    apiSpy.getMatches.mockReturnValue(of({ Results: [upcomingMatch] }));
    
    service.startMonitoring();
    vi.advanceTimersByTime(1);
    
    expect(mockNotification).toHaveBeenCalled();
    const notificationCall = mockNotification.mock.calls[0];
    expect(notificationCall[0]).toBe('Partida se aproximando!');
    expect(notificationCall[1].body).toBe('A partida entre Brazil x Argentina começará em breve.');
    
    (service as any).pollSubscription?.unsubscribe();
  });
  
  it('should trigger special notification for favorite team', () => {
    mockStorage.getItem.mockImplementation((key: string) => {
      if (key === 'favoriteTeam') return 'BRA';
      return null;
    });
    service = TestBed.inject(NotificationService);
    service.updateSettings(false, true, 15);
    
    const mockNotification = vi.fn();
    (window as any).Notification = mockNotification;
    (window as any).Notification.permission = 'granted';
    
    const now = new Date();
    const upcomingDate = new Date(now.getTime() + 10 * 60000);
    
    const upcomingMatch = {
      IdMatch: 'M1',
      MatchStatus: 1,
      Date: upcomingDate.toISOString(),
      Home: { IdCountry: 'BRA', TeamName: [{ Description: 'Brazil' }] },
      Away: { IdCountry: 'ARG', TeamName: [{ Description: 'Argentina' }] }
    };
    
    apiSpy.getMatches.mockReturnValue(of({ Results: [upcomingMatch] }));
    
    service.startMonitoring();
    vi.advanceTimersByTime(1);
    
    expect(mockNotification).toHaveBeenCalled();
    const notificationCall = mockNotification.mock.calls[0];
    expect(notificationCall[0]).toBe('Sua Seleção vai jogar!');
    
    (service as any).pollSubscription?.unsubscribe();
  });

  it('should not notify twice for the same match', () => {
    service = TestBed.inject(NotificationService);
    service.updateSettings(true, false, 15);
    
    const mockNotification = vi.fn();
    (window as any).Notification = mockNotification;
    (window as any).Notification.permission = 'granted';
    
    const upcomingDate = new Date(new Date().getTime() + 10 * 60000);
    const upcomingMatch = { IdMatch: 'M1', MatchStatus: 1, Date: upcomingDate.toISOString() };
    
    apiSpy.getMatches.mockReturnValue(of({ Results: [upcomingMatch] }));
    
    service.startMonitoring();
    vi.advanceTimersByTime(60000); // Trigger twice
    
    expect(mockNotification).toHaveBeenCalledTimes(1); // Should only call once due to Set
    
    (service as any).pollSubscription?.unsubscribe();
  });
});

