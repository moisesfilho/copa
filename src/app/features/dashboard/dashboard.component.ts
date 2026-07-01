import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';

import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { calculateStandings } from '../../core/utils/standings-calculator';
import { LiveUpdateService } from '../../core/services/live-update.service';
import { MatchCardComponent } from '../matches/match-card/match-card.component';
import { MatchDetailModalComponent } from '../matches/match-detail-modal/match-detail-modal.component';
import { TeamDetailModalComponent } from '../teams/team-detail-modal/team-detail-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatchCardComponent, MatchDetailModalComponent, TeamDetailModalComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private api = inject(FifaApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  i18n = inject(I18nService);
  liveUpdate = inject(LiveUpdateService);

  matches = signal<any[]>([]);
  standings = signal<any[]>([]);
  uiResources = signal<any>({});
  loading = signal<boolean>(true);
  selectedMatch = signal<any | null>(null);
  matchEvents = signal<Record<string, any[]>>({});
  isLoadingEvents = signal<boolean>(false);

  favoriteTeam = signal<string | null>(localStorage.getItem('favoriteTeam'));

  selectedTeamId = signal<string | null>(null);
  selectedTeamName = signal<string>('');
  selectedTeamCountryCode = signal<string>('');

  onTeamSelected(event: {teamId: string, teamName: string, flagId: string}) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { teamId: event.teamId },
      queryParamsHandling: 'merge',
    });
  }

  closeTeamDetail() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { teamId: null },
      queryParamsHandling: 'merge',
    });
  }

  mergedMatches = computed(() => {
    const liveUpdates = this.liveUpdate.liveMatchUpdates();
    return this.matches().map(m => liveUpdates[m.IdMatch] || m);
  });

  mergedMatchEvents = computed(() => {
    return { ...this.matchEvents(), ...this.liveUpdate.liveEventUpdates() };
  });

  availableTeams = computed(() => {
    const teamsMap = new Map<string, string>();
    for (const m of this.mergedMatches()) {
      if (m.Home?.IdCountry && m.Home?.TeamName?.[0]?.Description) {
        teamsMap.set(m.Home.IdCountry, m.Home.TeamName[0].Description);
      }
      if (m.Away?.IdCountry && m.Away?.TeamName?.[0]?.Description) {
        teamsMap.set(m.Away.IdCountry, m.Away.TeamName[0].Description);
      }
    }
    return Array.from(teamsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  liveMatches = computed(() => {
    return this.mergedMatches()
      .filter(m => m.MatchStatus === 3)
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
  });

  globalNextMatch = computed(() => {
    const upcoming = this.mergedMatches()
      .filter(m => m.MatchStatus === 1 || (m.MatchStatus === 0 && m.HomeTeamScore === null))
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    
    return upcoming.length > 0 ? upcoming[0] : null;
  });

  nextMatch = computed(() => {
    const team = this.favoriteTeam();
    if (!team) return null;
    
    // Sort matches by date
    const teamMatches = this.mergedMatches()
      .filter(m => m.Home?.IdCountry === team || m.Away?.IdCountry === team)
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    // Find the next upcoming or live match
    const upcoming = teamMatches.find(m => m.MatchStatus === 1 || m.MatchStatus === 3 || (m.MatchStatus === 0 && m.HomeTeamScore === null));
    if (upcoming) return upcoming;
    
    // If no upcoming matches, return the latest finished match
    if (teamMatches.length > 0) {
      return teamMatches[teamMatches.length - 1];
    }
    return null;
  });

  finishedMatches = computed(() => {
    const team = this.favoriteTeam();
    if (!team) return [];

    return this.mergedMatches()
      .filter(m => (m.Home?.IdCountry === team || m.Away?.IdCountry === team) && m.MatchStatus === 0 && m.HomeTeamScore !== null)
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()); // Sort descending (most recent first)
  });

  globalFinishedMatches = computed(() => {
    return this.mergedMatches()
      .filter(m => (m.MatchStatus === 0 && m.HomeTeamScore !== null) || m.MatchStatus === 3);
  });

  topScorers = computed(() => {
    return this.calculateTopScorers(this.mergedMatchEvents(), this.mergedMatches());
  });

  private calculateTopScorers(eventsMap: Record<string, any[]>, matches: any[]) {
    const playerGoals = new Map<string, { name: string, goals: number, teamId: string }>();

    for (const matchId in eventsMap) {
      const match = matches.find(m => m.IdMatch === matchId);
      if (!match) continue;

      const events = eventsMap[matchId] || [];
      this.processMatchGoals(events, match, playerGoals);
    }

    // Sort by goals descending, then by name
    return Array.from(playerGoals.values())
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, 5);
  }

  private processMatchGoals(events: any[], match: any, playerGoals: Map<string, { name: string, goals: number, teamId: string }>) {
    for (const e of events) {
      if (e.isCard || e.Type === 34) continue; // Exclude cards and own goals

      const playerId = e.IdPlayer || e.playerName;
      if (!playerId) continue;

      const teamId = this.determineGoalTeamId(e, match);
      
      if (!playerGoals.has(playerId)) {
        playerGoals.set(playerId, { name: e.playerName, goals: 0, teamId: teamId || '' });
      }
      playerGoals.get(playerId)!.goals += 1;
    }
  }

  private determineGoalTeamId(e: any, match: any): string {
    if (e.IdTeam) {
      if (e.IdTeam === match.Home?.IdTeam) return match.Home?.IdCountry;
      if (e.IdTeam === match.Away?.IdTeam) return match.Away?.IdCountry;
    }
    // Fallback
    return e.TeamName?.[0]?.Description === match.Home?.TeamName?.[0]?.Description ? match.Home?.IdCountry : match.Away?.IdCountry;
  }

  favoriteGroupStandings = computed(() => {
    const team = this.favoriteTeam();
    if (!team) return null;

    const allStandings = calculateStandings(this.mergedMatches());
    // Find which group the favorite team is in
    for (const groupName of Object.keys(allStandings)) {
      const groupTeams = allStandings[groupName];
      // TeamStats flagId uses IdCountry
      if (groupTeams.some(t => t.flagId === team)) {
        return { name: groupName, teams: groupTeams };
      }
    }
    return null;
  });

  constructor() {
    effect(() => {
      const matchesToLoad = this.globalFinishedMatches();
      const lang = this.i18n.currentLang();
      const currentEvents = this.matchEvents();
      
      const missingMatches = matchesToLoad.filter(m => !currentEvents[m.IdMatch]);
      
      if (missingMatches.length > 0) {
        // Initialize locally to prevent multiple requests while fetching
        missingMatches.forEach(m => currentEvents[m.IdMatch] = []);
        
        let pending = missingMatches.length;
        const newEvents: Record<string, any[]> = {};
        
        // Turn on loading state since we are fetching timelines
        this.isLoadingEvents.set(true);

        for (const m of missingMatches) {
          this.fetchTimeline(m, lang, newEvents, () => {
            pending--;
            if (pending === 0) {
              this.matchEvents.update(eventsMap => ({
                ...eventsMap,
                ...newEvents
              }));
              this.isLoadingEvents.set(false);
            }
          });
        }
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const lang = this.i18n.currentLang();
      this.loading.set(true);

      this.api.getUIResources(lang).subscribe({
        next: (res) => {
          const dict: any = {};
          if (res && res.resourceSets && res.resourceSets[0] && res.resourceSets[0].resources) {
            res.resourceSets[0].resources.forEach((r: any) => {
              dict[r.identifier] = r.value;
            });
          }
          this.uiResources.set(dict);
        },
        error: (err) => console.error('Erro ao carregar UI resources', err),
      });

      this.api.getMatches(lang).subscribe({
        next: (res) => {
          if (res && res.Results) {
            this.matches.set(res.Results);

            const matchId = this.route.snapshot.queryParams['match'];
            this.handleMatchSelectionFromUrl(res.Results, matchId, true);

            const teamId = this.route.snapshot.queryParams['teamId'];
            this.handleTeamSelectionFromUrl(res.Results, teamId, true);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar jogos', err);
          this.loading.set(false);
        },
      });
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe({
      next: (params) => {
        const matchId = params['match'];
        const teamId = params['teamId'];
        const currentMatches = this.matches();

        if (currentMatches.length > 0) {
          this.handleMatchSelectionFromUrl(currentMatches, matchId);
          this.handleTeamSelectionFromUrl(currentMatches, teamId);
        }
      },
    });
  }

  private handleMatchSelectionFromUrl(results: any[], matchId: string | undefined, isDataUpdate = false) {
    if (matchId) {
      if (!this.selectedMatch() || this.selectedMatch().IdMatch !== matchId) {
        const match = results.find((m: any) => m.IdMatch === matchId);
        this.selectedMatch.set(match || null);
      } else if (isDataUpdate && this.selectedMatch()) {
        const updatedMatch = results.find((m: any) => m.IdMatch === this.selectedMatch().IdMatch);
        this.selectedMatch.set(updatedMatch || null);
      }
    } else if (this.selectedMatch()) {
      this.selectedMatch.set(null);
    }
  }

  private handleTeamSelectionFromUrl(results: any[], teamId: string | undefined, isDataUpdate = false) {
    if (teamId) {
      if (!this.selectedTeamId() || this.selectedTeamId() !== teamId || isDataUpdate) {
        const matchWithTeam = results.find((m: any) => m.Home?.IdTeam === teamId || m.Away?.IdTeam === teamId);
        if (matchWithTeam) {
          const isHome = matchWithTeam.Home?.IdTeam === teamId;
          const team = isHome ? matchWithTeam.Home : matchWithTeam.Away;
          this.selectedTeamId.set(teamId);
          this.selectedTeamName.set(team.TeamName?.[0]?.Description || team.IdCountry);
          this.selectedTeamCountryCode.set(team.IdCountry);
        }
      }
    } else if (this.selectedTeamId()) {
      this.selectedTeamId.set(null);
    }
  }

  setFavoriteTeam(event: Event) {
    const select = event.target as HTMLSelectElement;
    const team = select.value;
    if (team) {
      this.favoriteTeam.set(team);
      localStorage.setItem('favoriteTeam', team);
    } else {
      this.favoriteTeam.set(null);
      localStorage.removeItem('favoriteTeam');
    }
  }

  onMatchSelected(match: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { match: match.IdMatch },
      queryParamsHandling: 'merge',
    });
  }

  closeModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { match: null },
      queryParamsHandling: 'merge',
    });
  }

  private fetchTimeline(m: any, lang: any, newEvents: Record<string, any[]>, onComplete: () => void) {
    this.api.getMatchTimeline(m.IdCompetition, m.IdSeason, m.IdStage, m.IdMatch, lang).subscribe({
      next: (res) => {
        if (res && res.Event) {
          newEvents[m.IdMatch] = this.parseEvents(res.Event);
        }
      },
      error: err => {
        console.error('Error fetching match timeline', err);
        onComplete();
      },
      complete: onComplete
    });
  }

  private parseEvents(events: any[]) {
    return events.filter((e: any) => {
      const typeDesc = e.TypeLocalized?.[0]?.Description?.toLowerCase() || '';
      return e.Type === 0 || e.Type === 34 || e.Type === 41 || 
             typeDesc.includes('gol!') || typeDesc.includes('goal') ||
             e.Type === 2 || e.Type === 3 || e.Type === 4 ||
             typeDesc.includes('cartão') || typeDesc.includes('card');
    }).map((e: any) => {
      let playerName = this.i18n.t().dashboard.player || 'Jogador';
      if (e.EventDescription && e.EventDescription[0]) {
         const desc = e.EventDescription[0].Description;
         const matchName = desc.match(/^([^(]+)/);
         if (matchName && matchName[1]) {
           playerName = matchName[1].trim();
         } else {
           playerName = desc; // fallback
         }
      }
      
      let isCard = false;
      let cardType = '';
      const typeDesc = e.TypeLocalized?.[0]?.Description?.toLowerCase() || '';
      if (e.Type === 2 || typeDesc.includes('amarelo') || typeDesc.includes('yellow')) {
         isCard = true;
         cardType = 'yellow';
      } else if (e.Type === 3 || e.Type === 4 || typeDesc.includes('vermelho') || typeDesc.includes('red')) {
         isCard = true;
         cardType = 'red';
      }

      return {
        ...e,
        playerName,
        isCard,
        cardType
      };
    });
  }
}
