import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { calculateStandings, TeamStats } from '../../core/utils/standings-calculator';
import { TeamDetailModalComponent } from '../teams/team-detail-modal/team-detail-modal.component';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [TeamDetailModalComponent],
  templateUrl: './standings.html',
  styleUrls: ['./standings.css'],
})
export class StandingsComponent implements OnInit {
  private api = inject(FifaApiService);
  i18n = inject(I18nService);

  standings = signal<Record<string, TeamStats[]>>({});
  groupNames = signal<string[]>([]);
  loading = signal<boolean>(true);

  selectedTeamId = signal<string | null>(null);
  selectedTeamName = signal<string>('');
  selectedTeamCountryCode = signal<string>('');

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  openTeamDetail(teamId: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { teamId },
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

  ngOnInit() {
    this.route.queryParams.subscribe({
      next: (params) => {
        const teamId = params['teamId'];
        if (teamId) {
          const allTeams = Object.values(this.standings()).flat();
          if (allTeams.length > 0) {
            const teamInfo = allTeams.find(t => t.id === teamId);
            if (teamInfo) {
              this.selectedTeamId.set(teamId);
              this.selectedTeamName.set(teamInfo.name);
              this.selectedTeamCountryCode.set(teamInfo.flagId);
            }
          }
        } else if (!teamId && this.selectedTeamId()) {
          this.selectedTeamId.set(null);
        }
      }
    });
  }

  constructor() {
    effect(() => {
      const lang = this.i18n.currentLang();
      this.loading.set(true);
      
      this.api.getMatches(lang).subscribe({
        next: (res) => {
          if (res && res.Results) {
            const calculated = calculateStandings(res.Results);
            this.standings.set(calculated);
            this.groupNames.set(Object.keys(calculated));
            
            // Check query param
            const teamId = this.route.snapshot.queryParams['teamId'];
            if (teamId && !this.selectedTeamId()) {
              const allTeams = Object.values(calculated).flat();
              const teamInfo = allTeams.find(t => t.id === teamId);
              if (teamInfo) {
                this.selectedTeamId.set(teamId);
                this.selectedTeamName.set(teamInfo.name);
                this.selectedTeamCountryCode.set(teamInfo.flagId);
              }
            }
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar dados para classificação', err);
          this.loading.set(false);
        },
      });
    });
  }
}
