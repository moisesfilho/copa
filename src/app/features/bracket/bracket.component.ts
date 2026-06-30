import { Component, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { MatchCardComponent } from '../matches/match-card/match-card.component';
import { LiveUpdateService } from '../../core/services/live-update.service';

interface KnockoutStage {
  id: string;
  name: string;
  matches: any[];
}

@Component({
  selector: 'app-bracket',
  standalone: true,
  imports: [CommonModule, MatchCardComponent],
  templateUrl: './bracket.component.html',
  styleUrls: ['./bracket.component.css']
})
export class BracketComponent implements OnInit, OnDestroy {
  private api = inject(FifaApiService);
  public i18n = inject(I18nService);
  private liveUpdate = inject(LiveUpdateService);

  loading = signal<boolean>(true);
  allMatches = signal<any[]>([]);

  knockoutMatches = computed(() => {
    const liveUpdates = this.liveUpdate.liveMatchUpdates();
    const allMatchesList = this.allMatches().map(m => {
       return liveUpdates[m.IdMatch] || m;
    });

    const matchByNumber = new Map<number, any>();
    allMatchesList.forEach(m => {
      if (m.MatchNumber) {
        matchByNumber.set(m.MatchNumber, m);
      }
    });

    return allMatchesList.filter(m => {
      const hasGroup = m.GroupName && m.GroupName.length > 0;
      const stageName = m.StageName?.[0]?.Description?.toLowerCase() || '';
      const isGroupStage = stageName.includes('group');
      return !hasGroup && !isGroupStage;
    }).map(m => {
      const clonedMatch = { ...m };
      
      if (!clonedMatch.Home?.IdCountry && clonedMatch.PlaceHolderA) {
        const projectedHome = this.getProjectedTeam(clonedMatch.PlaceHolderA, matchByNumber);
        if (projectedHome) clonedMatch.Home = projectedHome;
      }
      
      if (!clonedMatch.Away?.IdCountry && clonedMatch.PlaceHolderB) {
        const projectedAway = this.getProjectedTeam(clonedMatch.PlaceHolderB, matchByNumber);
        if (projectedAway) clonedMatch.Away = projectedAway;
      }

      return clonedMatch;
    });
  });

  stages = computed<KnockoutStage[]>(() => {
    const matches = this.knockoutMatches();
    const stageMap = new Map<string, any[]>();
    
    matches.forEach(m => {
      const stageName = m.StageName?.[0]?.Description || this.i18n.t().bracket.tbd;
      if (!stageMap.has(stageName)) {
        stageMap.set(stageName, []);
      }
      stageMap.get(stageName)!.push(m);
    });

    // Sort matches in each stage by date
    stageMap.forEach(matchList => {
      matchList.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    });

    // Try to order stages logically (Round of 32 -> Round of 16 -> Quarter -> Semi -> Final)
    // The exact names from API might vary, so we'll do our best with keywords
    const orderedStages: KnockoutStage[] = [];
    
    const remainingStages = Array.from(stageMap.keys());
    
    const findAndAddStage = (keys: string[]) => {
      for (let i = remainingStages.length - 1; i >= 0; i--) {
        const sName = remainingStages[i].toLowerCase();
        if (keys.some(k => sName.includes(k))) {
          orderedStages.push({
            id: remainingStages[i],
            name: this.translateStage(remainingStages[i]),
            matches: stageMap.get(remainingStages[i])!
          });
          remainingStages.splice(i, 1);
        }
      }
    };

    // 16-avos de final (Round of 32)
    findAndAddStage(['32', '1ª', '2ª', 'segundas', 'second', '16-avos', 'dezesseis', '16th']);
    // Oitavas de final (Round of 16) - be careful not to match '16-avos'
    // Since 16-avos is caught above and removed, '16' here is safe for 'Round of 16'
    findAndAddStage(['16', 'oitava', 'eighth']);
    // Quartas de final (Quarterfinals)
    findAndAddStage(['quarter', 'quarta']);
    // Semifinais (Semifinals)
    findAndAddStage(['semi']);
    
    // Decisão de terceiro lugar (Third place)
    findAndAddStage(['third', 'terceiro', 'terc', 'bronze']);
    
    // Final
    findAndAddStage(['final', 'ouro', 'gold']);
    
    // Anything else
    remainingStages.forEach(s => {
      orderedStages.push({
        id: s,
        name: this.translateStage(s),
        matches: stageMap.get(s)!
      });
    });

    return orderedStages;
  });

  constructor() {
    effect(() => {
      const lang = this.i18n.currentLang();
      this.loadMatches(lang);
    });
  }

  ngOnInit() {
    this.liveUpdate.startPolling();
  }

  ngOnDestroy() {
    this.liveUpdate.stopPolling();
  }

  private getProjectedTeam(placeholder: string, matchByNumber: Map<number, any>): any | null {
    if (!placeholder) return null;
    const isWinner = placeholder.startsWith('W');
    const isLoser = placeholder.startsWith('L');
    if (!isWinner && !isLoser) return null;
    
    const matchNum = parseInt(placeholder.substring(1), 10);
    if (isNaN(matchNum)) return null;

    const sourceMatch = matchByNumber.get(matchNum);
    if (!sourceMatch) return null;

    // Only project if match is Live (Status === 3)
    if (sourceMatch.MatchStatus !== 3) return null;

    const homeScore = sourceMatch.HomeTeamScore ?? 0;
    const awayScore = sourceMatch.AwayTeamScore ?? 0;

    if (homeScore === awayScore) return null; // Tied, no projection

    const winningTeam = homeScore > awayScore ? sourceMatch.Home : sourceMatch.Away;
    const losingTeam = homeScore < awayScore ? sourceMatch.Home : sourceMatch.Away;

    if (isWinner) {
      return winningTeam ? { ...winningTeam, isProjected: true } : null;
    } else {
      return losingTeam ? { ...losingTeam, isProjected: true } : null;
    }
  }

  private loadMatches(lang: string) {
    this.loading.set(true);
    this.api.getMatches(lang as any).subscribe({
      next: (res) => {
        if (res && res.Results) {
          this.allMatches.set(res.Results);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading matches for bracket', err);
        this.loading.set(false);
      }
    });
  }
  
  private translateStage(originalName: string): string {
    const sName = originalName.toLowerCase();
    const t = this.i18n.t().bracket;
    if (sName.includes('32') || sName.includes('1ª') || sName.includes('2ª') || sName.includes('segundas') || sName.includes('16-avos') || sName.includes('dezesseis') || sName.includes('16th')) return t.roundOf32;
    if (sName.includes('16') || sName.includes('oitava') || sName.includes('eighth')) return t.roundOf16;
    if (sName.includes('quarter') || sName.includes('quarta')) return t.quarterFinals;
    if (sName.includes('semi')) return t.semiFinals;
    if (sName.includes('third') || sName.includes('terceiro') || sName.includes('terc') || sName.includes('bronze')) return t.thirdPlace;
    if (sName.includes('final') || sName.includes('ouro') || sName.includes('gold')) return t.final;
    return originalName;
  }
}
