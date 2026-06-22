import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';

import { MatchCardComponent } from '../match-card/match-card.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [MatchCardComponent],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css'],
})
export class MatchListComponent implements OnChanges, OnInit {
  @Input() matches: any[] = [];
  @Input() uiResources: any = {};
  @Output() matchClicked = new EventEmitter<any>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  onMatchClick(match: any) {
    this.matchClicked.emit(match);
  }

  // Continent Mapping for 2026 World Cup teams (mock or official data)
  private continentMap: { [key: string]: string } = {
    Algeria: 'África (CAF)',
    'Cabo Verde': 'África (CAF)',
    'Congo DR': 'África (CAF)',
    "Côte d'Ivoire": 'África (CAF)',
    Egypt: 'África (CAF)',
    Ghana: 'África (CAF)',
    Morocco: 'África (CAF)',
    Senegal: 'África (CAF)',
    'South Africa': 'África (CAF)',
    Tunisia: 'África (CAF)',
    Argentina: 'América do Sul (CONMEBOL)',
    Brazil: 'América do Sul (CONMEBOL)',
    Colombia: 'América do Sul (CONMEBOL)',
    Ecuador: 'América do Sul (CONMEBOL)',
    Paraguay: 'América do Sul (CONMEBOL)',
    Uruguay: 'América do Sul (CONMEBOL)',
    Canada: 'América do Norte/Central (CONCACAF)',
    Curaçao: 'América do Norte/Central (CONCACAF)',
    Haiti: 'América do Norte/Central (CONCACAF)',
    Mexico: 'América do Norte/Central (CONCACAF)',
    Panama: 'América do Norte/Central (CONCACAF)',
    USA: 'América do Norte/Central (CONCACAF)',
    Australia: 'Ásia (AFC)',
    'IR Iran': 'Ásia (AFC)',
    Iraq: 'Ásia (AFC)',
    Japan: 'Ásia (AFC)',
    Jordan: 'Ásia (AFC)',
    'Korea Republic': 'Ásia (AFC)',
    Qatar: 'Ásia (AFC)',
    'Saudi Arabia': 'Ásia (AFC)',
    Uzbekistan: 'Ásia (AFC)',
    'New Zealand': 'Oceania (OFC)',
    Austria: 'Europa (UEFA)',
    Belgium: 'Europa (UEFA)',
    'Bosnia and Herzegovina': 'Europa (UEFA)',
    Croatia: 'Europa (UEFA)',
    Czechia: 'Europa (UEFA)',
    England: 'Europa (UEFA)',
    France: 'Europa (UEFA)',
    Germany: 'Europa (UEFA)',
    Netherlands: 'Europa (UEFA)',
    Norway: 'Europa (UEFA)',
    Portugal: 'Europa (UEFA)',
    Scotland: 'Europa (UEFA)',
    Spain: 'Europa (UEFA)',
    Sweden: 'Europa (UEFA)',
    Switzerland: 'Europa (UEFA)',
    Türkiye: 'Europa (UEFA)',
  };

  filteredMatches = signal<any[]>([]);
  activeFilter = signal<'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING'>('ALL');

  availableStages = signal<string[]>([]);
  availableGroups = signal<string[]>([]);
  availableTeams = signal<string[]>([]);
  availableContinents = signal<string[]>([]);

  selectedStage = signal<string>('ALL');
  selectedGroup = signal<string>('ALL');
  selectedTeam = signal<string>('ALL');
  selectedContinent = signal<string>('ALL');

  hasActiveFilters = computed(() => {
    return (
      this.activeFilter() !== 'ALL' ||
      this.selectedStage() !== 'ALL' ||
      this.selectedGroup() !== 'ALL' ||
      this.selectedTeam() !== 'ALL' ||
      this.selectedContinent() !== 'ALL'
    );
  });

  ngOnInit() {
    this.route.queryParams.subscribe({
      next: (params) => {
        this.activeFilter.set((params['status'] as any) || 'ALL');
        this.selectedStage.set(params['stage'] || 'ALL');
        this.selectedGroup.set(params['group'] || 'ALL');
        this.selectedTeam.set(params['team'] || 'ALL');
        this.selectedContinent.set(params['continent'] || 'ALL');
        this.applyFilter();
      },
    });
  }

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
    const teams = new Set<string>();
    const continents = new Set<string>();

    matches.forEach((m) => {
      const stageName = m.StageName?.[0]?.Description;
      const groupName = m.GroupName?.[0]?.Description;
      const homeTeam = m.Home?.TeamName?.[0]?.Description;
      const awayTeam = m.Away?.TeamName?.[0]?.Description;

      if (stageName) stages.add(stageName);
      if (groupName) groups.add(groupName);

      if (homeTeam) {
        teams.add(homeTeam);
        if (this.continentMap[homeTeam]) continents.add(this.continentMap[homeTeam]);
      }
      if (awayTeam) {
        teams.add(awayTeam);
        if (this.continentMap[awayTeam]) continents.add(this.continentMap[awayTeam]);
      }
    });

    this.availableStages.set(Array.from(stages).sort());
    this.availableGroups.set(Array.from(groups).sort());
    this.availableTeams.set(Array.from(teams).sort());
    this.availableContinents.set(Array.from(continents).sort());
  }

  private updateURLParams(params: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  setFilter(filter: 'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING') {
    this.updateURLParams({ status: filter === 'ALL' ? null : filter });
  }

  setStatusFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.updateURLParams({ status: select.value === 'ALL' ? null : select.value });
  }

  setStageFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.updateURLParams({ stage: select.value === 'ALL' ? null : select.value });
  }

  setGroupFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.updateURLParams({ group: select.value === 'ALL' ? null : select.value });
  }

  setTeamFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.updateURLParams({ team: select.value === 'ALL' ? null : select.value });
  }

  setContinentFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.updateURLParams({ continent: select.value === 'ALL' ? null : select.value });
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  private applyFilter() {
    const all = this.matches || [];
    let filtered = all;

    const statusFilter = this.activeFilter();
    switch (statusFilter) {
      case 'LIVE':
        filtered = filtered.filter((m) => m.MatchStatus === 3);
        break;
      case 'FINISHED':
        filtered = filtered.filter((m) => m.MatchStatus === 0);
        break;
      case 'UPCOMING':
        filtered = filtered.filter(
          (m) => m.MatchStatus === 1 || (m.MatchStatus === 0 && m.HomeTeamScore === null),
        );
        break;
    }

    const stage = this.selectedStage();
    if (stage !== 'ALL') {
      filtered = filtered.filter((m) => m.StageName?.[0]?.Description === stage);
    }

    const group = this.selectedGroup();
    if (group !== 'ALL') {
      filtered = filtered.filter((m) => m.GroupName?.[0]?.Description === group);
    }

    const team = this.selectedTeam();
    if (team !== 'ALL') {
      filtered = filtered.filter(
        (m) =>
          m.Home?.TeamName?.[0]?.Description === team ||
          m.Away?.TeamName?.[0]?.Description === team,
      );
    }

    const continent = this.selectedContinent();
    if (continent !== 'ALL') {
      filtered = filtered.filter((m) => {
        const home = m.Home?.TeamName?.[0]?.Description;
        const away = m.Away?.TeamName?.[0]?.Description;
        return (
          (home && this.continentMap[home] === continent) ||
          (away && this.continentMap[away] === continent)
        );
      });
    }

    // Sort by date
    filtered = [...filtered].sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
    );
    this.filteredMatches.set(filtered);
  }
}
