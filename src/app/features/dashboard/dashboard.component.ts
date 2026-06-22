import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { FifaApiService } from '../../core/services/fifa-api.service';
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

  ngOnInit() {
    this.api.getUIResources().subscribe({
      next: (res) => {
        // Formata os resources num dicionário para fácil acesso
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

    this.api.getMatches().subscribe({
      next: (res) => {
        if (res && res.Results) {
          this.matches.set(res.Results);

          // Verifica se há um ID de partida na URL inicial
          const matchId = this.route.snapshot.queryParams['match'];
          if (matchId) {
            const match = res.Results.find((m: any) => m.IdMatch === matchId);
            this.selectedMatch.set(match || null);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar jogos', err);
        this.loading.set(false);
      },
    });

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
