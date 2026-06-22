import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FifaApiService } from '../../core/services/fifa-api.service';
import { MatchListComponent } from '../matches/match-list/match-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatchListComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private api = inject(FifaApiService);
  
  matches = signal<any[]>([]);
  uiResources = signal<any>({});
  loading = signal<boolean>(true);
  isDarkMode = signal<boolean>(true);

  ngOnInit() {
    // Check initial theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.setTheme(false);
    } else {
      this.setTheme(true);
    }
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
      error: (err) => console.error('Erro ao carregar UI resources', err)
    });

    this.api.getMatches().subscribe({
      next: (res) => {
        if (res && res.Results) {
          this.matches.set(res.Results);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar jogos', err);
        this.loading.set(false);
      }
    });
  }

  toggleTheme() {
    this.setTheme(!this.isDarkMode());
  }

  private setTheme(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }
}
