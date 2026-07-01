import { TestBed } from '@angular/core/testing';
import { LiveUpdateService } from './live-update.service';
import { FifaApiService } from './fifa-api.service';
import { I18nService } from './i18n.service';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('LiveUpdateService', () => {
  let service: LiveUpdateService;
  let apiSpy: any;
  let i18nSpy: any;

  beforeEach(() => {
    vi.useFakeTimers();
    apiSpy = {
      getMatches: vi.fn().mockReturnValue(of({ Results: [] })),
      getMatchTimeline: vi.fn().mockReturnValue(of({ Event: [] }))
    };

    i18nSpy = {
      currentLang: vi.fn().mockReturnValue('pt'),
      t: vi.fn().mockReturnValue({ dashboard: { player: 'Jogador' } })
    };

    TestBed.configureTestingModule({
      providers: [
        LiveUpdateService,
        { provide: FifaApiService, useValue: apiSpy },
        { provide: I18nService, useValue: i18nSpy }
      ]
    });
    service = TestBed.inject(LiveUpdateService);
  });

  afterEach(() => {
    service.stopPolling();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start polling and fetch matches', () => {
    const liveMatch = { MatchStatus: 3, IdMatch: 'M1', IdCompetition: 'C1', IdSeason: 'S1', IdStage: 'ST1' };
    apiSpy.getMatches.mockReturnValue(of({ Results: [liveMatch, { MatchStatus: 1 }] }));
    
    service.startPolling();
    vi.advanceTimersByTime(1);
    
    expect(apiSpy.getMatches).toHaveBeenCalledWith('pt');
    expect(service.liveMatchUpdates()['M1']).toEqual(liveMatch);
    expect(apiSpy.getMatchTimeline).toHaveBeenCalledWith('C1', 'S1', 'ST1', 'M1', 'pt');
    
    service.stopPolling();
  });

  it('should handle error when fetching matches', () => {
    apiSpy.getMatches.mockReturnValue(throwError(() => new Error('API Error')));
    console.error = vi.fn(); // suppress console.error in test
    
    service.startPolling();
    vi.advanceTimersByTime(1);
    
    expect(apiSpy.getMatches).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    
    service.stopPolling();
  });

  it('should parse timeline events correctly', () => {
    const liveMatch = { MatchStatus: 3, IdMatch: 'M1', IdCompetition: 'C1', IdSeason: 'S1', IdStage: 'ST1' };
    apiSpy.getMatches.mockReturnValue(of({ Results: [liveMatch] }));
    
    const events = [
      { Type: 0, EventDescription: [{ Description: 'Pele (Assist)' }] }, // Goal
      { Type: 2, TypeLocalized: [{ Description: 'Yellow Card' }], EventDescription: [{ Description: 'Ronaldo' }] }, // Yellow card
      { Type: 4, TypeLocalized: [{ Description: 'Red Card' }], EventDescription: [{ Description: 'Zidane' }] }, // Red card
      { Type: 99, TypeLocalized: [{ Description: 'Substitution' }] } // Ignore
    ];
    apiSpy.getMatchTimeline.mockReturnValue(of({ Event: events }));
    
    service.startPolling();
    vi.advanceTimersByTime(1);
    
    const parsed = service.liveEventUpdates()['M1'];
    expect(parsed).toBeDefined();
    expect(parsed).toHaveLength(3);
    
    expect(parsed[0].playerName).toBe('Pele');
    expect(parsed[0].isCard).toBe(false);
    
    expect(parsed[1].playerName).toBe('Ronaldo');
    expect(parsed[1].isCard).toBe(true);
    expect(parsed[1].cardType).toBe('yellow');
    
    expect(parsed[2].playerName).toBe('Zidane');
    expect(parsed[2].isCard).toBe(true);
    expect(parsed[2].cardType).toBe('red');
    
    service.stopPolling();
  });

  it('should not start multiple intervals', () => {
    service.startPolling();
    service.startPolling();
    vi.advanceTimersByTime(10000);
    
    expect(apiSpy.getMatches).toHaveBeenCalledTimes(2); // 0s and 10s tick
    service.stopPolling();
  });

  it('should handle error when fetching timeline', () => {
    const liveMatch = { MatchStatus: 3, IdMatch: 'M1', IdCompetition: 'C1', IdSeason: 'S1', IdStage: 'ST1' };
    apiSpy.getMatches.mockReturnValue(of({ Results: [liveMatch] }));
    apiSpy.getMatchTimeline.mockReturnValue(throwError(() => new Error('Timeline Error')));
    console.error = vi.fn(); // suppress console.error in test
    
    service.startPolling();
    vi.advanceTimersByTime(1);
    
    expect(console.error).toHaveBeenCalledWith('Erro ao atualizar timeline', expect.any(Error));
    service.stopPolling();
  });

  it('should use fallback when event description does not match regex', () => {
    const liveMatch = { MatchStatus: 3, IdMatch: 'M1', IdCompetition: 'C1', IdSeason: 'S1', IdStage: 'ST1' };
    apiSpy.getMatches.mockReturnValue(of({ Results: [liveMatch] }));
    
    // Description starting with '(' fails the regex ^([^(]+)
    const events = [
      { Type: 0, EventDescription: [{ Description: '(Own Goal) Player' }] }
    ];
    apiSpy.getMatchTimeline.mockReturnValue(of({ Event: events }));
    
    service.startPolling();
    vi.advanceTimersByTime(1);
    
    const parsed = service.liveEventUpdates()['M1'];
    expect(parsed[0].playerName).toBe('(Own Goal) Player');
    service.stopPolling();
  });
});

