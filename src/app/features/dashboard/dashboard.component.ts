import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';

import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { MatchListComponent } from '../matches/match-list/match-list.component';
import { MatchDetailModalComponent } from '../matches/match-detail-modal/match-detail-modal.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatchListComponent, MatchDetailModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private api = inject(FifaApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  i18n = inject(I18nService);

  matches = signal<any[]>([]);
  uiResources = signal<any>({});
  loading = signal<boolean>(true);
  isDarkMode = signal<boolean>(true);
  selectedMatch = signal<any | null>(null);

  completedMatches = computed(() => this.matches().filter((m) => m.MatchStatus === 0).length);
  completedPercentage = computed(() => {
    const total = this.matches().length;
    if (total === 0) return '0%';
    return ((this.completedMatches() / total) * 100).toFixed(1) + '%';
  });

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
            if (matchId && !this.selectedMatch()) {
              const match = res.Results.find((m: any) => m.IdMatch === matchId);
              this.selectedMatch.set(match || null);
            } else if (this.selectedMatch()) {
              // Update selected match with new language data
              const updatedMatch = res.Results.find((m: any) => m.IdMatch === this.selectedMatch().IdMatch);
              this.selectedMatch.set(updatedMatch || null);
            }
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

    // Escuta mudanças na URL enquanto o app estiver rodando
    this.route.queryParams.subscribe({
      next: (params) => {
        const matchId = params['match'];
        const currentMatches = this.matches();

        if (matchId && currentMatches.length > 0) {
          const match = currentMatches.find((m) => m.IdMatch === matchId);
          if (match) this.selectedMatch.set(match);
        } else if (!matchId && this.selectedMatch()) {
          this.selectedMatch.set(null);
        }
      },
    });
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
