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
  @Input() forceAbbreviations = false;

  @Output() matchClicked = new EventEmitter<any>();
  @Output() teamClicked = new EventEmitter<{teamId: string, teamName: string, flagId: string}>();

  get displayMatch() {
    return this.liveService.liveMatchUpdates()[this.match?.IdMatch] || this.match;
  }

  get displayEvents() {
    return this.liveService.liveEventUpdates()[this.match?.IdMatch] || this.events;
  }

  onClick() {
    this.matchClicked.emit(this.displayMatch);
  }

  onTeamClick(event: Event, teamId: string, teamName: string, flagId: string) {
    event.stopPropagation();
    this.teamClicked.emit({teamId, teamName, flagId});
  }

  get homeTeamFull() {
    return this.displayMatch?.Home?.TeamName?.[0]?.Description || 'TBD';
  }

  get homeTeamAbbr() {
    return this.displayMatch?.Home?.Abbreviation || this.homeTeamFull;
  }

  get awayTeamFull() {
    return this.displayMatch?.Away?.TeamName?.[0]?.Description || 'TBD';
  }

  get awayTeamAbbr() {
    return this.displayMatch?.Away?.Abbreviation || this.awayTeamFull;
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

  get homePenaltyScore() {
    return this.displayMatch?.HomeTeamPenaltyScore;
  }

  get awayPenaltyScore() {
    return this.displayMatch?.AwayTeamPenaltyScore;
  }

  get hasPenalties() {
    return this.homePenaltyScore != null && this.awayPenaltyScore != null;
  }

  get isExtraTime() {
    // Period 7 or 9 indicates extra time
    return !this.hasPenalties && (this.displayMatch?.Period === 7 || this.displayMatch?.Period === 9);
  }
}
