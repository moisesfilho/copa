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

    // Build bracket tree scoring for visual alignment
    const matchOrderScore = new Map<number, number>();
    const matchByNumber = new Map<number, any>();
    matches.forEach(m => {
      if (m.MatchNumber) matchByNumber.set(m.MatchNumber, m);
    });

    const assignOrder = (match: any, center: number, width: number) => {
      if (!match || !match.MatchNumber) return;
      if (matchOrderScore.has(match.MatchNumber)) return; // Already visited

      matchOrderScore.set(match.MatchNumber, center);
      
      const phA = match.PlaceHolderA;
      const phB = match.PlaceHolderB;
      let sourceA: any = null;
      let sourceB: any = null;

      if (phA && phA.startsWith('W')) {
        sourceA = matchByNumber.get(parseInt(phA.substring(1), 10));
      }
      if (phB && phB.startsWith('W')) {
        sourceB = matchByNumber.get(parseInt(phB.substring(1), 10));
      }

      const children = [];
      if (sourceA) children.push(sourceA);
      if (sourceB) children.push(sourceB);

      // Sort children by date to ensure the earliest match stays at the top of the bracket pair
      children.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

      if (children.length === 2) {
        assignOrder(children[0], center - width / 2, width / 2);
        assignOrder(children[1], center + width / 2, width / 2);
      } else if (children.length === 1) {
        assignOrder(children[0], center, width / 2);
      }
    };

    // Find all roots (matches that are not referenced by any PlaceHolder)
    const placeholderSet = new Set<string>();
    matches.forEach(m => {
      if (m.PlaceHolderA) placeholderSet.add(m.PlaceHolderA);
      if (m.PlaceHolderB) placeholderSet.add(m.PlaceHolderB);
    });

    const rootMatches = matches.filter(m => {
      if (!m.MatchNumber) return false;
      return !placeholderSet.has(`W${m.MatchNumber}`) && !placeholderSet.has(`L${m.MatchNumber}`);
    });

    // Find the final match to serve as the absolute center root
    const finalMatch = rootMatches.find(m => {
      const sName = (m.StageName?.[0]?.Description || '').toLowerCase();
      return (sName.includes('final') || sName.includes('ouro') || sName.includes('gold')) 
             && !sName.includes('quarter') && !sName.includes('quarta') 
             && !sName.includes('semi') && !sName.includes('16') 
             && !sName.includes('32') && !sName.includes('third') && !sName.includes('terceiro');
    });

    if (finalMatch) {
      assignOrder(finalMatch, 0, 1000000);
    }

    // Any other roots that weren't assigned (e.g. missing Final, third-place match, partial mock data)
    let rootFallback = 2000000;
    rootMatches.forEach(root => {
      if (root.MatchNumber && !matchOrderScore.has(root.MatchNumber)) {
        assignOrder(root, rootFallback, 1000000);
        rootFallback += 2000000;
      }
    });

    // Any completely disconnected or malformed matches
    let fallbackScore = rootFallback + 2000000;
    matches.forEach(m => {
      if (m.MatchNumber && !matchOrderScore.has(m.MatchNumber)) {
        matchOrderScore.set(m.MatchNumber, fallbackScore);
        fallbackScore += 2000000;
      }
    });

    // Sort matches in each stage by tree-score to preserve exact visual bracket tree alignment. Fallback to Date.
    stageMap.forEach(matchList => {
      matchList.sort((a, b) => {
        const scoreA = matchOrderScore.get(a.MatchNumber);
        const scoreB = matchOrderScore.get(b.MatchNumber);
        
        if (scoreA !== undefined && scoreB !== undefined) {
          return scoreA - scoreB;
        }
        if (a.MatchNumber && b.MatchNumber) {
          return a.MatchNumber - b.MatchNumber;
        }
        return new Date(a.Date).getTime() - new Date(b.Date).getTime();
      });
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
    return this.i18n.translateStage(originalName);
  }
}
