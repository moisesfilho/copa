import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../core/services/i18n.service';
import { LiveUpdateService } from '../../../core/services/live-update.service';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css']
})
export class MatchCardComponent {
  i18n = inject(I18nService);
  liveService = inject(LiveUpdateService);

  @Input() match!: any;
  @Input() events: any[] = [];
  @Input() uiResources: any;
  @Input() isDashboardMode = false;

  @Output() matchClicked = new EventEmitter<any>();

  get displayMatch() {
    return this.liveService.liveMatchUpdates()[this.match?.IdMatch] || this.match;
  }

  get displayEvents() {
    return this.liveService.liveEventUpdates()[this.match?.IdMatch] || this.events;
  }

  onClick() {
    this.matchClicked.emit(this.displayMatch);
  }

  get homeTeam() {
    return this.displayMatch?.Home?.TeamName?.[0]?.Description || 'TBD';
  }

  get awayTeam() {
    return this.displayMatch?.Away?.TeamName?.[0]?.Description || 'TBD';
  }

  get homeScore() {
    return this.displayMatch?.HomeTeamScore ?? '-';
  }

  get awayScore() {
    return this.displayMatch?.AwayTeamScore ?? '-';
  }

  get isLive() {
    return this.displayMatch?.MatchStatus === 3;
  }
}
