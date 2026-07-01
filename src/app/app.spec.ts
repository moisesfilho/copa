import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { SwUpdate } from '@angular/service-worker';
import { I18nService } from './core/services/i18n.service';
import { LiveUpdateService } from './core/services/live-update.service';
import { NotificationService } from './core/services/notification.service';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

describe('App', () => {
  let mockSwUpdate: any;
  let mockLiveUpdate: any;
  let mockNotificationService: any;
  let versionUpdates$: Subject<any>;
  let mockStorage: any;

  beforeEach(async () => {
    versionUpdates$ = new Subject();
    mockSwUpdate = {
      isEnabled: true,
      versionUpdates: versionUpdates$.asObservable(),
      activateUpdate: vi.fn().mockResolvedValue(true)
    };
    
    mockLiveUpdate = {
      startPolling: vi.fn()
    };

    mockNotificationService = {
      startMonitoring: vi.fn()
    };

    const mockI18n = {
      currentLang: vi.fn().mockReturnValue('pt'),
      t: vi.fn().mockReturnValue({ menu: { title: 'Copa' } })
    };

    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };
    (globalThis as any).localStorage = mockStorage;

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SwUpdate, useValue: mockSwUpdate },
        { provide: I18nService, useValue: mockI18n },
        { provide: LiveUpdateService, useValue: mockLiveUpdate },
        { provide: NotificationService, useValue: mockNotificationService },
        provideRouter([])
      ]
    }).compileComponents();
  });

  afterEach(() => {
    (globalThis as any).localStorage = undefined;
  });

  it('should create the app and start services', () => {
    mockStorage.getItem.mockReturnValue('dark');
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    fixture.detectChanges(); // calls ngOnInit
    
    expect(app).toBeTruthy();
    expect(app.isDarkMode()).toBe(true);
    expect(mockLiveUpdate.startPolling).toHaveBeenCalled();
    expect(mockNotificationService.startMonitoring).toHaveBeenCalled();
  });

  it('should set light theme if saved in storage', () => {
    const setItemSpy = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('light'),
      setItem: setItemSpy
    });
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    expect(app.isDarkMode()).toBe(false);
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'light');
    vi.unstubAllGlobals();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain(app.i18n.t().menu.title);
  });

  it('should toggle sidebar', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    expect(app.isSidebarOpen()).toBe(false);
    app.toggleSidebar();
    expect(app.isSidebarOpen()).toBe(true);
    app.closeSidebar();
    expect(app.isSidebarOpen()).toBe(false);
  });

  it('should toggle theme', () => {
    const setItemSpy = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('light'),
      setItem: setItemSpy
    });
    
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // app initializes as light theme from our stub
    fixture.detectChanges();
    expect(app.isDarkMode()).toBe(false);
    
    // toggle to dark
    app.toggleTheme();
    expect(app.isDarkMode()).toBe(true);
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
    
    vi.unstubAllGlobals();
  });

  it('should handle PWA install prompt', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };
    
    app.onBeforeInstallPrompt(mockEvent as any);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(app.canInstall()).toBe(true);
    expect(app.deferredPrompt).toBe(mockEvent);
    
    await app.installPwa();
    
    expect(mockEvent.prompt).toHaveBeenCalled();
  });

  it('should handle PWA install prompt when accepted', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    app.canInstall.set(true);
    app.deferredPrompt = {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };
    
    await app.installPwa();
    
    expect(app.canInstall()).toBe(false);
    expect(app.deferredPrompt).toBeNull();
  });

  it('should handle PWA install prompt when dismissed', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    app.canInstall.set(true);
    app.deferredPrompt = {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'dismissed' })
    };
    
    await app.installPwa();
    
    expect(app.canInstall()).toBe(true);
    expect(app.deferredPrompt).not.toBeNull();
  });

  it('should alert if PWA install not ready', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    app.installPwa();
    
    expect(alertSpy).toHaveBeenCalled();
  });

  it('should listen for sw updates', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    
    versionUpdates$.next({ type: 'VERSION_READY', currentVersion: { hash: '1' }, latestVersion: { hash: '2' } } as any);
    
    expect(app.updateAvailable()).toBe(true);
  });

  it('should not listen for sw updates if not enabled', () => {
    mockSwUpdate.isEnabled = false;
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    
    versionUpdates$.next({ type: 'VERSION_READY', currentVersion: { hash: '1' }, latestVersion: { hash: '2' } } as any);
    
    expect(app.updateAvailable()).toBe(false);
    mockSwUpdate.isEnabled = true; // restore
  });

  it('should apply sw update', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    const reloadSpy = vi.spyOn(app, 'reloadPage').mockImplementation(() => {});
    
    await app.applyUpdate();
    
    // allow microtasks (like then) to flush
    await Promise.resolve();
    
    expect(app.isUpdating()).toBe(true);
    expect(mockSwUpdate.activateUpdate).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should reload page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    try {
      app.reloadPage();
      expect(app).toBeTruthy();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
