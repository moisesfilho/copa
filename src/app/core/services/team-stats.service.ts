import { Injectable, inject } from '@angular/core';
import { FifaApiService } from './fifa-api.service';
import { I18nService } from './i18n.service';
import { Observable, forkJoin, map, switchMap, of, catchError } from 'rxjs';

export interface TeamStats {
  allMatches: any[];
  upcomingMatches: any[];
  pastMatches: any[];
  scorers: { name: string, goals: number }[];
  yellowCards: { name: string, count: number }[];
  redCards: { name: string, count: number }[];
  tactics: { matchId: string, opponent: string, tactic: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamStatsService {
  private api = inject(FifaApiService);
  private i18n = inject(I18nService);

  getTeamAggregateStats(teamId: string): Observable<TeamStats> {
    return this.api.getMatches(this.i18n.currentLang()).pipe(
      map((res: any) => res.Results || []),
      map((matches: any[]) => matches.filter(m => m.Home?.IdTeam === teamId || m.Away?.IdTeam === teamId)),
      switchMap(matches => {
        const pastMatches = matches.filter(m => m.MatchStatus === 0 || m.MatchStatus === 3);
        const upcomingMatches = matches.filter(m => m.MatchStatus === 1);

        if (pastMatches.length === 0) {
          return of({
            allMatches: matches,
            upcomingMatches,
            pastMatches,
            scorers: [],
            yellowCards: [],
            redCards: [],
            tactics: []
          } as TeamStats);
        }

        const statsObs = pastMatches.map(m => {
          const idIfes = m.Properties?.IdIFES;
          if (!idIfes) return of({ match: m, timeline: null, teams: null });
          return forkJoin({
            timeline: this.api.getMatchTimeline(m.IdCompetition, m.IdSeason, m.IdStage, m.IdMatch, this.i18n.currentLang()).pipe(catchError(() => of(null))),
            teams: this.api.getMatchTeamStats(idIfes).pipe(catchError(() => of(null)))
          }).pipe(
            map(res => ({ match: m, timeline: res.timeline, teams: res.teams }))
          );
        });

        return forkJoin(statsObs).pipe(
          map(results => this.aggregateStats(teamId, matches, upcomingMatches, pastMatches, results))
        );
      })
    );
  }

  private aggregateStats(teamId: string, allMatches: any[], upcomingMatches: any[], pastMatches: any[], results: any[]): TeamStats {
    const scorersMap = new Map<string, number>();
    const yellowMap = new Map<string, number>();
    const redMap = new Map<string, number>();
    const tactics: { matchId: string, opponent: string, tactic: string }[] = [];

    const getStageLevel = (stageName: string) => {
      if (!stageName) return 1;
      const sName = stageName.toLowerCase();
      if (sName.includes('semi') || sName.includes('third') || sName.includes('terceiro') || sName.includes('bronze') || (sName.includes('final') && !sName.includes('quarter') && !sName.includes('quarta') && !sName.includes('oitava'))) {
        return 2;
      }
      return 1;
    };

    let maxStageLevel = 1;
    allMatches.forEach(m => {
      const level = getStageLevel(m.StageName?.[0]?.Description);
      if (level > maxStageLevel) maxStageLevel = level;
    });

    results.forEach(res => {
      const match = res.match;
      const isHome = match.Home?.IdTeam === teamId;
      const opponentName = isHome ? match.Away?.TeamName?.[0]?.Description : match.Home?.TeamName?.[0]?.Description;
      const matchLevel = getStageLevel(match.StageName?.[0]?.Description);

      // Extract Tactics if available
      const tactic = isHome ? match.Home?.Tactics : match.Away?.Tactics;
      if (tactic) {
        tactics.push({
          matchId: match.IdMatch,
          opponent: opponentName || 'Desconhecido',
          tactic: tactic
        });
      }

      // Extract Timeline events
      if (res.timeline && res.timeline.Event) {
        res.timeline.Event.forEach((e: any) => {
          if (e.IdTeam !== teamId) return; // Only count our team's events

          const playerName = this.getPlayerName(e);
          if (!playerName) return;

          const typeDesc = e.TypeLocalized?.[0]?.Description?.toLowerCase() || '';
          
          // Goals (Type 0 = Goal, 34 = Penalty, 41 = Own Goal (but usually attributed to opposing team))
          if (e.Type === 0 || typeDesc.includes('gol!') || typeDesc === 'goal' || typeDesc === 'gol') {
            // Ignore shootout goals for top scorers
            if (e.Period !== 11) {
              scorersMap.set(playerName, (scorersMap.get(playerName) || 0) + 1);
            }
          }

          // Cards
          if (e.Type === 2 || typeDesc.includes('amarelo') || typeDesc.includes('yellow')) {
            // Yellow cards from level 1 (up to quarter-finals) are wiped if team reached level 2 (semi-finals)
            if (!(maxStageLevel === 2 && matchLevel === 1)) {
              yellowMap.set(playerName, (yellowMap.get(playerName) || 0) + 1);
            }
          } else if (e.Type === 3 || e.Type === 4 || typeDesc.includes('vermelho') || typeDesc.includes('red')) {
            redMap.set(playerName, (redMap.get(playerName) || 0) + 1);
          }
        });
      }
    });

    const sortMap = (map: Map<string, number>) => {
      return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      allMatches,
      upcomingMatches,
      pastMatches,
      scorers: Array.from(scorersMap.entries()).map(([name, goals]) => ({ name, goals })).sort((a, b) => b.goals - a.goals).slice(0, 10),
      yellowCards: sortMap(yellowMap),
      redCards: sortMap(redMap),
      tactics
    };
  }

  private getPlayerName(e: any): string {
    const descArray = e.EventDescription;
    if (descArray && descArray.length > 0) {
      const desc = descArray[0].Description;
      const match = desc.match(/^([^(]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
      return desc;
    }
    return '';
  }
}
