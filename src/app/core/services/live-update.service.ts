import { Injectable, inject, signal } from '@angular/core';
import { FifaApiService } from './fifa-api.service';
import { I18nService } from './i18n.service';
import { Subscription, timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LiveUpdateService {
  private api = inject(FifaApiService);
  private i18n = inject(I18nService);

  // Armazena as atualizações das partidas que estão ao vivo
  liveMatchUpdates = signal<Record<string, any>>({});
  // Armazena a timeline das partidas ao vivo (gols, cartões)
  liveEventUpdates = signal<Record<string, any[]>>({});

  private pollSubscription?: Subscription;

  startPolling() {
    if (this.pollSubscription) return;

    // Roda a cada 10 segundos
    this.pollSubscription = timer(0, 10000).pipe(
      switchMap(() => this.api.getMatches(this.i18n.currentLang()).pipe(
        catchError(err => {
          console.error('Erro ao buscar atualizações de partidas', err);
          return of(null);
        })
      ))
    ).subscribe(res => {
      if (res && res.Results) {
        const liveMatches = res.Results.filter((m: any) => m.MatchStatus === 3);
        const updates: Record<string, any> = {};
        
        liveMatches.forEach((m: any) => {
          updates[m.IdMatch] = m;
          this.fetchTimelineForMatch(m);
        });

        this.liveMatchUpdates.set(updates);
      }
    });
  }

  stopPolling() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  private fetchTimelineForMatch(m: any) {
    // Buscar timeline de cada partida ao vivo para atualizar gols
    this.api.getMatchTimeline(m.IdCompetition, m.IdSeason, m.IdStage, m.IdMatch, this.i18n.currentLang()).subscribe({
      next: (timelineRes) => {
         if (timelineRes && timelineRes.Event) {
           const parsedEvents = this.parseEvents(timelineRes.Event);
           this.liveEventUpdates.update(current => ({ ...current, [m.IdMatch]: parsedEvents }));
         }
      },
      error: (err) => console.error('Erro ao atualizar timeline', err)
    });
  }

  private parseEvents(events: any[]) {
    return events.filter((e: any) => {
      const typeDesc = e.TypeLocalized?.[0]?.Description?.toLowerCase() || '';
      return e.Type === 0 || e.Type === 34 || e.Type === 41 || 
             typeDesc.includes('gol!') || typeDesc.includes('goal') ||
             e.Type === 2 || e.Type === 3 || e.Type === 4 ||
             typeDesc.includes('cartão') || typeDesc.includes('card');
    }).map((e: any) => {
      let playerName = this.i18n.t().dashboard.player || 'Jogador';
      if (e.EventDescription && e.EventDescription[0]) {
         const desc = e.EventDescription[0].Description;
         // O(n) regex to prevent catastrophic backtracking
         const matchName = desc.match(/^([^(]+)/);
         if (matchName && matchName[1]) {
           playerName = matchName[1].trim();
         } else {
           playerName = desc; // fallback
         }
      }
      
      let isCard = false;
      let cardType = '';
      const typeDesc = e.TypeLocalized?.[0]?.Description?.toLowerCase() || '';
      if (e.Type === 2 || typeDesc.includes('amarelo') || typeDesc.includes('yellow')) {
         isCard = true;
         cardType = 'yellow';
      } else if (e.Type === 3 || e.Type === 4 || typeDesc.includes('vermelho') || typeDesc.includes('red')) {
         isCard = true;
         cardType = 'red';
      }

      return {
        ...e,
        playerName,
        isCard,
        cardType
      };
    });
  }
}
