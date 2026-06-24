import { Component, signal, OnInit, HostListener, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { I18nService } from './core/services/i18n.service';
import { LiveUpdateService } from './core/services/live-update.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  i18n = inject(I18nService);
  liveUpdate = inject(LiveUpdateService);
  notificationService = inject(NotificationService);
  swUpdate = inject(SwUpdate);
  isSidebarOpen = signal(false);
  isDarkMode = signal(true);
  
  updateAvailable = signal(false);
  isUpdating = signal(false);

  canInstall = signal(false);
  deferredPrompt: any;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: Event) {
    // Evita o prompt padrão de aparecer imediatamente
    e.preventDefault();
    // Guarda o evento para ser disparado pelo botão customizado
    this.deferredPrompt = e;
    // Atualiza a UI para mostrar o botão de instalação
    this.canInstall.set(true);
  }

  async installPwa() {
    if (!this.deferredPrompt) {
      alert(
        'A instalação PWA ainda não está pronta! Isso geralmente acontece porque você está rodando no modo de desenvolvimento (npm start) onde o Service Worker fica desativado por padrão, ou porque o aplicativo já está instalado no seu dispositivo.',
      );
      return;
    }

    // Mostra o prompt de instalação
    this.deferredPrompt.prompt();

    // Aguarda a resposta do usuário
    const { outcome } = await this.deferredPrompt.userChoice;

    // Se o usuário instalou, podemos esconder o botão
    if (outcome === 'accepted') {
      this.canInstall.set(false);
      this.deferredPrompt = null;
    }
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.setTheme(false);
    } else {
      this.setTheme(true);
    }

    // Start checking for live matches in the background
    this.liveUpdate.startPolling();
    this.notificationService.startMonitoring();

    // Check for Service Worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailable.set(true);
        });
    }
  }

  applyUpdate() {
    this.isUpdating.set(true);
    this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  toggleTheme() {
    this.setTheme(!this.isDarkMode());
  }

  private setTheme(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }
}
