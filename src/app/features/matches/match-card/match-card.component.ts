import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css']
})
export class MatchCardComponent {
  @Input() match: any;
  @Input() uiResources: any;

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
