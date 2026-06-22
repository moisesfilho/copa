import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FifaApiService } from '../../core/services/fifa-api.service';
import { calculateStandings, TeamStats } from '../../core/utils/standings-calculator';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings.html',
  styleUrls: ['./standings.css']
})
export class StandingsComponent implements OnInit {
  private api = inject(FifaApiService);
  
  standings = signal<Record<string, TeamStats[]>>({});
  groupNames = signal<string[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.api.getMatches().subscribe({
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
      }
    });
  }
}
