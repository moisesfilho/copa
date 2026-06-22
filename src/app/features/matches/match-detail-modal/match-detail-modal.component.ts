import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
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
export class MatchDetailModalComponent implements OnChanges {
  private api = inject(FifaApiService);

  @Input() match: any = null;
  @Output() close = new EventEmitter<void>();

  teamStats = signal<{ home: any, away: any } | null>(null);
  powerRanking = signal<any[]>([]);
  loadingStats = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['match'] && this.match) {
      const idIfes = this.match.Properties?.IdIFES;
      if (idIfes) {
        this.fetchAdvancedStats(idIfes);
      }
    }
  }

  private fetchAdvancedStats(idIfes: string) {
    this.loadingStats.set(true);
    this.teamStats.set(null);
    this.powerRanking.set([]);

    forkJoin({
      teams: this.api.getMatchTeamStats(idIfes),
      power: this.api.getMatchPowerRanking(idIfes)
    }).subscribe({
      next: (res) => {
        if (res.teams) {
          const homeId = this.match.Home?.IdTeam;
          const awayId = this.match.Away?.IdTeam;
          
          this.teamStats.set({
            home: this.parseTeamStats(res.teams[homeId]),
            away: this.parseTeamStats(res.teams[awayId])
          });
        }
        if (res.power && res.power.outfieldPlayers) {
          // Sort by some internal metric or just take top 10
          this.powerRanking.set(res.power.outfieldPlayers.slice(0, 5));
        }
        this.loadingStats.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas avançadas', err);
        this.loadingStats.set(false);
      }
    });
  }

  private parseTeamStats(rawStats: any[]): Record<string, any> {
    if (!rawStats) return {};
    const parsed: Record<string, any> = {};
    rawStats.forEach(stat => {
      parsed[stat[0]] = stat[1]; // ['BallPossession', 45, true] -> { BallPossession: 45 }
    });
    return parsed;
  }

  onClose() {
    this.close.emit();
  }
}
