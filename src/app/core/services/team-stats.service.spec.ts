import { TestBed } from '@angular/core/testing';
import { TeamStatsService } from './team-stats.service';
import { FifaApiService } from './fifa-api.service';
import { I18nService } from './i18n.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TeamStatsService', () => {
  let service: TeamStatsService;
  let apiSpy: any;
  let i18nSpy: any;

  beforeEach(() => {
    apiSpy = {
      getMatches: vi.fn(),
      getMatchTimeline: vi.fn(),
      getMatchTeamStats: vi.fn()
    };
    i18nSpy = {
      currentLang: vi.fn().mockReturnValue('pt')
    };

    TestBed.configureTestingModule({
      providers: [
        TeamStatsService,
        { provide: FifaApiService, useValue: apiSpy },
        { provide: I18nService, useValue: i18nSpy }
      ]
    });
    service = TestBed.inject(TeamStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get team aggregate stats when no past matches exist', async () => {
    const mockMatches = {
      Results: [
        { IdMatch: '1', MatchStatus: 1, Home: { IdTeam: 'BRA' }, Away: { IdTeam: 'ARG' } }
      ]
    };
    apiSpy.getMatches.mockReturnValue(of(mockMatches));

    const stats = await new Promise<any>((resolve) => {
      service.getTeamAggregateStats('BRA').subscribe(resolve);
    });
    
    expect(stats.allMatches).toHaveLength(1);
    expect(stats.upcomingMatches).toHaveLength(1);
    expect(stats.pastMatches).toHaveLength(0);
    expect(stats.scorers).toEqual([]);
  });

  it('should get team aggregate stats with past matches and events', async () => {
    const mockMatches = {
      Results: [
        { 
          IdMatch: '1', MatchStatus: 0, 
          IdCompetition: 'C1', IdSeason: 'S1', IdStage: 'ST1',
          Properties: { IdIFES: 'IFES1' },
          Home: { IdTeam: 'BRA', TeamName: [{ Description: 'Brasil' }], Tactics: '4-3-3' }, 
          Away: { IdTeam: 'ARG', TeamName: [{ Description: 'Argentina' }] } 
        }
      ]
    };
    const mockTimeline = {
      Event: [
        { IdTeam: 'BRA', Type: 0, EventDescription: [{ Description: 'Neymar (Assist: X)' }], TypeLocalized: [{ Description: 'Gol' }] },
        { IdTeam: 'BRA', Type: 2, EventDescription: [{ Description: 'Casemiro' }], TypeLocalized: [{ Description: 'Cartão Amarelo' }] },
        { IdTeam: 'BRA', Type: 3, EventDescription: [{ Description: 'Silva' }], TypeLocalized: [{ Description: 'Cartão Vermelho' }] },
      ]
    };
    const mockTeamStats = {
      'BRA': [
        ['Tactics', '4-3-3']
      ]
    };

    apiSpy.getMatches.mockReturnValue(of(mockMatches));
    apiSpy.getMatchTimeline.mockReturnValue(of(mockTimeline));
    apiSpy.getMatchTeamStats.mockReturnValue(of(mockTeamStats));

    const stats = await new Promise<any>((resolve) => {
      service.getTeamAggregateStats('BRA').subscribe(resolve);
    });

    expect(stats.pastMatches).toHaveLength(1);
    expect(stats.scorers).toEqual([{ name: 'Neymar', goals: 1 }]);
    expect(stats.yellowCards).toEqual([{ name: 'Casemiro', count: 1 }]);
    expect(stats.redCards).toEqual([{ name: 'Silva', count: 1 }]);
    expect(stats.tactics).toEqual([{ matchId: '1', opponent: 'Argentina', tactic: '4-3-3' }]);
  });
});
