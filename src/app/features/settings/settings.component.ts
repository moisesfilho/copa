import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  // Force recompile
  i18n = inject(I18nService);
  private notificationService = inject(NotificationService);

  notifyAll = this.notificationService.notifyAll;
  notifyFavorite = this.notificationService.notifyFavorite;
  notifyTime = this.notificationService.notifyTime;

  async onToggle(type: 'all' | 'favorite') {
    if (type === 'all' && this.notifyAll()) {
      const granted = await this.notificationService.requestPermission();
      if (!granted) {
        this.notifyAll.set(false);
      }
    }

    if (type === 'favorite' && this.notifyFavorite()) {
      const granted = await this.notificationService.requestPermission();
      if (!granted) {
        this.notifyFavorite.set(false);
      }
    }

    this.saveSettings();
  }

  onTimeChange(event: any) {
    this.notifyTime.set(parseInt(event.target.value, 10));
    this.saveSettings();
  }

  private saveSettings() {
    this.notificationService.updateSettings(
      this.notifyAll(),
      this.notifyFavorite(),
      this.notifyTime()
    );
  }
}
