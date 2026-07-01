import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';

import { FifaApiService } from '../../../core/services/fifa-api.service';
import { I18nService } from '../../../core/services/i18n.service';
import { LiveUpdateService } from '../../../core/services/live-update.service';
import { MatchListComponent } from '../match-list/match-list.component';
import { MatchDetailModalComponent } from '../match-detail-modal/match-detail-modal.component';
import { TeamDetailModalComponent } from '../../teams/team-detail-modal/team-detail-modal.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-matches-page',
  standalone: true,
  imports: [MatchListComponent, MatchDetailModalComponent, TeamDetailModalComponent],
  templateUrl: './matches-page.html',
  styleUrls: ['./matches-page.css']
})
export class MatchesPageComponent implements OnInit {
  private api = inject(FifaApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  i18n = inject(I18nService);
  liveUpdate = inject(LiveUpdateService);

  matches = signal<any[]>([]);
  mergedMatches = computed(() => {
    const liveUpdates = this.liveUpdate.liveMatchUpdates();
    return this.matches().map(m => liveUpdates[m.IdMatch] || m);
  });

  uiResources = signal<any>({});
  loading = signal<boolean>(true);
  selectedMatch = signal<any | null>(null);

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

  constructor() {
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
}
