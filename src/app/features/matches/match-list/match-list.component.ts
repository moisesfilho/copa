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
  
  availableStages = signal<string[]>([]);
  availableGroups = signal<string[]>([]);
  
  selectedStage = signal<string>('ALL');
  selectedGroup = signal<string>('ALL');

  ngOnChanges(changes: SimpleChanges) {
    if (changes['matches']) {
      this.extractFilters();
      this.applyFilter();
    }
  }

  private extractFilters() {
    const matches = this.matches || [];
    const stages = new Set<string>();
    const groups = new Set<string>();

    matches.forEach(m => {
      const stageName = m.StageName?.[0]?.Description;
      const groupName = m.GroupName?.[0]?.Description;
      
      if (stageName) stages.add(stageName);
      if (groupName) groups.add(groupName);
    });

    this.availableStages.set(Array.from(stages).sort());
    this.availableGroups.set(Array.from(groups).sort());
  }

  setFilter(filter: 'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING') {
    this.activeFilter.set(filter);
    this.applyFilter();
  }

  setStageFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedStage.set(select.value);
    this.applyFilter();
  }

  setGroupFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedGroup.set(select.value);
    this.applyFilter();
  }

  private applyFilter() {
    const all = this.matches || [];
    let filtered = all;

    const statusFilter = this.activeFilter();
    switch (statusFilter) {
      case 'LIVE':
        filtered = filtered.filter(m => m.MatchStatus === 3);
        break;
      case 'FINISHED':
        filtered = filtered.filter(m => m.MatchStatus === 0);
        break;
      case 'UPCOMING':
        filtered = filtered.filter(m => m.MatchStatus === 1 || (m.MatchStatus === 0 && m.HomeTeamScore === null));
        break;
    }

    const stage = this.selectedStage();
    if (stage !== 'ALL') {
      filtered = filtered.filter(m => m.StageName?.[0]?.Description === stage);
    }

    const group = this.selectedGroup();
    if (group !== 'ALL') {
      filtered = filtered.filter(m => m.GroupName?.[0]?.Description === group);
    }

    // Sort by date
    filtered = [...filtered].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    this.filteredMatches.set(filtered);
  }
}
