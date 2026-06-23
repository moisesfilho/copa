import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css']
})
export class MatchCardComponent {
  i18n = inject(I18nService);

  @Input() match!: any;
  @Input() events: any[] = [];
  @Input() uiResources: any;
  @Input() isDashboardMode = false;

  @Output() matchClicked = new EventEmitter<any>();

  onClick() {
    this.matchClicked.emit(this.match);
  }

  get homeTeam() {
    return this.match.Home?.TeamName?.[0]?.Description || 'TBD';
  }

  get awayTeam() {
    return this.match.Away?.TeamName?.[0]?.Description || 'TBD';
  }

  get homeScore() {
    return this.match.HomeTeamScore ?? '-';
  }

  get awayScore() {
    return this.match.AwayTeamScore ?? '-';
  }

  get isLive() {
    return this.match.MatchStatus === 3; // Supondo que 3 é "Ao vivo", 0 é não iniciado, etc.
  }
}
