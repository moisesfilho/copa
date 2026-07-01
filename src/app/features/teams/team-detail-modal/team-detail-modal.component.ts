import { Component, EventEmitter, Input, Output, OnChanges, OnInit, OnDestroy, SimpleChanges, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TeamStatsService, TeamStats } from '../../../core/services/team-stats.service';

@Component({
  selector: 'app-team-detail-modal',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './team-detail-modal.component.html',
  styleUrls: ['./team-detail-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamDetailModalComponent implements OnChanges, OnInit, OnDestroy {
  private statsService = inject(TeamStatsService);

  @Input() teamId: string | null = null;
  @Input() teamName = '';
  @Input() teamCountryCode = '';
  
  @Output() closeModal = new EventEmitter<void>();

  loading = signal<boolean>(false);
  stats = signal<TeamStats | null>(null);

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener to close modal for accessibility
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.onClose();
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['teamId'] && this.teamId) {
      this.loadTeamStats(this.teamId);
    }
  }

  private loadTeamStats(id: string) {
    this.loading.set(true);
    this.stats.set(null);

    this.statsService.getTeamAggregateStats(id).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas do time', err);
        this.loading.set(false);
      }
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  isWin(match: any): boolean {
    if (!this.teamId) return false;
    const isHome = match.Home?.IdTeam === this.teamId;
    if (match.HomeTeamScore === match.AwayTeamScore) {
      if (match.HomeTeamPenaltyScore !== null && match.AwayTeamPenaltyScore !== null) {
        return isHome ? match.HomeTeamPenaltyScore > match.AwayTeamPenaltyScore : match.AwayTeamPenaltyScore > match.HomeTeamPenaltyScore;
      }
      return false;
    }
    return isHome ? match.HomeTeamScore > match.AwayTeamScore : match.AwayTeamScore > match.HomeTeamScore;
  }

  isLoss(match: any): boolean {
    if (!this.teamId) return false;
    const isHome = match.Home?.IdTeam === this.teamId;
    if (match.HomeTeamScore === match.AwayTeamScore) {
      if (match.HomeTeamPenaltyScore !== null && match.AwayTeamPenaltyScore !== null) {
        return isHome ? match.HomeTeamPenaltyScore < match.AwayTeamPenaltyScore : match.AwayTeamPenaltyScore < match.HomeTeamPenaltyScore;
      }
      return false;
    }
    return isHome ? match.HomeTeamScore < match.AwayTeamScore : match.AwayTeamScore < match.HomeTeamScore;
  }

  isDraw(match: any): boolean {
    if (match.HomeTeamPenaltyScore !== null && match.AwayTeamPenaltyScore !== null) {
      return false;
    }
    return match.HomeTeamScore === match.AwayTeamScore;
  }

  async shareTeam() {
    const text = `Confira as estatísticas e histórico da seleção ${this.teamName} na Copa do Mundo da FIFA!`;
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?teamId=${this.teamId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Estatísticas: ${this.teamName}`,
          text: text,
          url: url
        });
      } catch (err) {
        console.error('Erro ao compartilhar', err);
      }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).then(() => {
        alert('Informações copiadas para a área de transferência!');
      });
    }
  }
}
