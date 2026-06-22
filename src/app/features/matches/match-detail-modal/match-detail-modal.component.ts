import { Component, EventEmitter, Input, Output, OnChanges, OnInit, OnDestroy, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FifaApiService } from '../../../core/services/fifa-api.service';

@Component({
  selector: 'app-match-detail-modal',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './match-detail-modal.component.html',
  styleUrls: ['./match-detail-modal.component.css']
})
export class MatchDetailModalComponent implements OnChanges, OnInit, OnDestroy {
  private api = inject(FifaApiService);
  private pollingInterval: any;

  @Input() match: any = null;
  @Output() close = new EventEmitter<void>();

  teamStats = signal<{ home: any, away: any, inContest?: number } | null>(null);
  goals = signal<any[]>([]);
  loadingStats = signal<boolean>(false);

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    this.clearPolling();
  }

  private clearPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['match'] && this.match) {
      this.clearPolling();
      const idIfes = this.match.Properties?.IdIFES;
      if (idIfes) {
        this.fetchAdvancedStats(idIfes);
        
        // Polling para partidas ao vivo
        if (this.match.MatchStatus === 3) {
          this.pollingInterval = setInterval(() => {
            this.fetchAdvancedStats(idIfes, true);
          }, 10000);
        }
      }
    }
  }

  private fetchAdvancedStats(idIfes: string, isPolling = false) {
    if (!isPolling) {
      this.loadingStats.set(true);
      this.teamStats.set(null);
      this.goals.set([]);
    }

    forkJoin({
      teams: this.api.getMatchTeamStats(idIfes),
      timeline: this.api.getMatchTimeline(this.match.IdCompetition, this.match.IdSeason, this.match.IdStage, this.match.IdMatch)
    }).subscribe({
      next: (res) => {
        if (res.teams) {
          const homeId = this.match.Home?.IdTeam;
          const awayId = this.match.Away?.IdTeam;
          
          const homeStats = this.parseTeamStats(res.teams[homeId]);
          const awayStats = this.parseTeamStats(res.teams[awayId]);

          let inContest = 0;
          if (homeStats['BallPossession'] !== undefined && awayStats['BallPossession'] !== undefined) {
            const total = homeStats['BallPossession'] + awayStats['BallPossession'];
            if (total < 100) {
              inContest = 100 - total;
            }
          }

          this.teamStats.set({
            home: homeStats,
            away: awayStats,
            inContest: inContest
          });
        }
        
        if (res.timeline && res.timeline.Event) {
          const matchGoals = res.timeline.Event.filter((e: any) => 
            e.Type === 0 || e.Type === 34 || e.Type === 41 || 
            (e.TypeLocalized && e.TypeLocalized[0]?.Description?.toLowerCase().includes('gol!'))
          ).map((e: any) => {
            let playerName = 'Jogador';
            if (e.EventDescription && e.EventDescription[0]) {
               const desc = e.EventDescription[0].Description;
               const match = desc.match(/^(.*?)\s*\(/);
               if (match && match[1]) {
                 playerName = match[1];
               } else {
                 playerName = desc; // fallback se não achar o parêntese
               }
            }
            return {
              ...e,
              playerName
            };
          });
          
          this.goals.set(matchGoals);
        }
        
        if (!isPolling) {
          this.loadingStats.set(false);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas avançadas', err);
        if (!isPolling) {
          this.loadingStats.set(false);
        }
      }
    });
  }

  private parseTeamStats(rawStats: any[]): Record<string, any> {
    if (!rawStats) return {};
    const parsed: Record<string, any> = {};
    rawStats.forEach(stat => {
      let key = stat[0];
      let value = stat[1];
      if (key === 'Possession') {
        key = 'BallPossession';
        value = Math.round(value * 100);
      }
      parsed[key] = value;
    });
    return parsed;
  }

  onClose() {
    this.close.emit();
  }
}
