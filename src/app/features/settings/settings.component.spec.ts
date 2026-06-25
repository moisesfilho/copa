import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { I18nService } from '../../core/services/i18n.service';
import { NotificationService } from '../../core/services/notification.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockNotificationService = {
      notifyAll: signal(false),
      notifyFavorite: signal(false),
      notifyTime: signal(10),
      requestPermission: vi.fn().mockResolvedValue(true),
      updateSettings: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        I18nService,
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateSettings on toggling all notifications when permission granted', async () => {
    mockNotificationService.notifyAll.set(true);
    await component.onToggle('all');
    expect(mockNotificationService.requestPermission).toHaveBeenCalled();
    expect(mockNotificationService.updateSettings).toHaveBeenCalledWith(true, false, 10);
  });

  it('should revert notifyAll if permission is not granted', async () => {
    mockNotificationService.requestPermission.mockResolvedValue(false);
    mockNotificationService.notifyAll.set(true);
    
    await component.onToggle('all');
    
    expect(mockNotificationService.notifyAll()).toBe(false);
    expect(mockNotificationService.updateSettings).toHaveBeenCalledWith(false, false, 10);
  });
  
  it('should handle onTimeChange correctly', () => {
    component.onTimeChange({ target: { value: '30' } });
    expect(mockNotificationService.notifyTime()).toBe(30);
    expect(mockNotificationService.updateSettings).toHaveBeenCalledWith(false, false, 30);
  });
});
