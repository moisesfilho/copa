import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { SwUpdate } from '@angular/service-worker';
import { I18nService } from './core/services/i18n.service';
import { LiveUpdateService } from './core/services/live-update.service';
import { NotificationService } from './core/services/notification.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    const mockSwUpdate = {
      isEnabled: false,
      versionUpdates: of({}),
      activateUpdate: () => Promise.resolve(true)
    };
    
    const mockLiveUpdate = {
      startPolling: () => {}
    };

    const mockNotificationService = {
      startMonitoring: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SwUpdate, useValue: mockSwUpdate },
        I18nService,
        { provide: LiveUpdateService, useValue: mockLiveUpdate },
        { provide: NotificationService, useValue: mockNotificationService },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain(app.i18n.t().menu.title);
  });
});
