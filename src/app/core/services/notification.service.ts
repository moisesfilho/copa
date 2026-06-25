import { Injectable, inject, signal } from '@angular/core';
import { FifaApiService } from './fifa-api.service';
import { I18nService } from './i18n.service';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(FifaApiService);
  private i18n = inject(I18nService);

  private getStorageItem(key: string): string | null {
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }

  notifyAll = signal<boolean>(this.getStorageItem('notifyAll') === 'true');
  notifyFavorite = signal<boolean>(this.getStorageItem('notifyFavorite') === 'true');
  notifyTime = signal<number>(parseInt(this.getStorageItem('notifyTime') || '15', 10));

  private notifiedMatches = new Set<string>(JSON.parse(this.getStorageItem('notifiedMatches') || '[]'));
  private pollSubscription?: Subscription;

  // constructor removed

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      alert(this.i18n.currentLang() === 'pt' ? 'Seu navegador não suporta notificações.' : 'Your browser does not support notifications.');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  updateSettings(all: boolean, favorite: boolean, time: number) {
    this.notifyAll.set(all);
    this.notifyFavorite.set(favorite);
    this.notifyTime.set(time);
    
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('notifyAll', all.toString());
      localStorage.setItem('notifyFavorite', favorite.toString());
      localStorage.setItem('notifyTime', time.toString());
    }
  }

  startMonitoring() {
    if (this.pollSubscription) return;

    // Check every 1 minute
    this.pollSubscription = timer(0, 60000).pipe(
      switchMap(() => this.api.getMatches(this.i18n.currentLang()))
    ).subscribe(res => {
      if (!res || !res.Results) return;

      const now = new Date();
      const favoriteTeam = this.getStorageItem('favoriteTeam');
      const timeThreshold = this.notifyTime();
      const checkAll = this.notifyAll();
      const checkFav = this.notifyFavorite();

      if (!checkAll && !checkFav) return;

      res.Results.forEach((m: any) => {
        if (m.MatchStatus !== 1) return; // 1 = Upcoming

        const matchDate = new Date(m.Date);
        const diffMs = matchDate.getTime() - now.getTime();
        const diffMins = diffMs / 60000;

        if (diffMins > 0 && diffMins <= timeThreshold && !this.notifiedMatches.has(m.IdMatch)) {
          let isFavoriteMatch = false;

          if (favoriteTeam && (m.Home?.IdCountry === favoriteTeam || m.Away?.IdCountry === favoriteTeam)) {
            isFavoriteMatch = true;
          }

          const shouldNotify = (isFavoriteMatch && checkFav) || checkAll;

          if (shouldNotify) {
            this.triggerNotification(m, isFavoriteMatch);
            this.notifiedMatches.add(m.IdMatch);
            this.saveNotifiedMatches();
          }
        }
      });
    });
  }

  private saveNotifiedMatches() {
    // Keep only a reasonable amount to avoid blowing up localStorage
    const arr = Array.from(this.notifiedMatches).slice(-100);
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('notifiedMatches', JSON.stringify(arr));
    }
  }

  private triggerNotification(m: any, isFavoriteMatch = false) {
    if (Notification.permission === 'granted') {
      const homeName = m.Home?.TeamName?.[0]?.Description || m.Home?.IdCountry || 'Time 1';
      const awayName = m.Away?.TeamName?.[0]?.Description || m.Away?.IdCountry || 'Time 2';
      
      let title = this.i18n.currentLang() === 'pt' ? 'Partida se aproximando!' : 'Match starting soon!';
      if (isFavoriteMatch) {
        title = this.i18n.currentLang() === 'pt' ? 'Sua Seleção vai jogar!' : 'Your Favorite Team is playing!';
      }

      const body = this.i18n.currentLang() === 'pt' 
        ? `A partida entre ${homeName} x ${awayName} começará em breve.`
        : `The match between ${homeName} x ${awayName} will start soon.`;

      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png'
      });
    }
  }
}
