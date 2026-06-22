import { Component, Input, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchCardComponent } from '../match-card/match-card.component';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, MatchCardComponent],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css']
})
export class MatchListComponent implements OnChanges {
  @Input() matches: any[] = [];
  @Input() uiResources: any = {};

  filteredMatches = signal<any[]>([]);
  activeFilter = signal<'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING'>('ALL');

  ngOnChanges(changes: SimpleChanges) {
    if (changes['matches']) {
      this.applyFilter(this.activeFilter());
    }
  }

  setFilter(filter: 'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING') {
    this.activeFilter.set(filter);
    this.applyFilter(filter);
  }

  private applyFilter(filter: 'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING') {
    const all = this.matches || [];
    let filtered = all;

    switch (filter) {
      case 'LIVE':
        filtered = all.filter(m => m.MatchStatus === 3);
        break;
      case 'FINISHED':
        filtered = all.filter(m => m.MatchStatus === 0);
        break;
      case 'UPCOMING':
        filtered = all.filter(m => m.MatchStatus === 1 || (m.MatchStatus === 0 && m.HomeTeamScore === null));
        break;
    }

    // Sort by date
    filtered = [...filtered].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    this.filteredMatches.set(filtered);
  }
}
