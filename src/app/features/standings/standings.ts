import { Component, OnInit, inject, signal, effect } from '@angular/core';

import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { calculateStandings, TeamStats } from '../../core/utils/standings-calculator';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [],
  templateUrl: './standings.html',
  styleUrls: ['./standings.css'],
})
export class StandingsComponent implements OnInit {
  private api = inject(FifaApiService);
  i18n = inject(I18nService);

  standings = signal<Record<string, TeamStats[]>>({});
  groupNames = signal<string[]>([]);
  loading = signal<boolean>(true);

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

  ngOnInit() {
  }
}
