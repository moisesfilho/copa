import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MatchDetailModalComponent } from './match-detail-modal.component';
import { FifaApiService } from '../../../core/services/fifa-api.service';
import { I18nService } from '../../../core/services/i18n.service';
import { of, throwError } from 'rxjs';
import { SimpleChange } from '@angular/core';

describe('MatchDetailModalComponent', () => {
  let component: MatchDetailModalComponent;
  let fixture: ComponentFixture<MatchDetailModalComponent>;
  let apiSpy: any;
  let i18nSpy: any;
  
  beforeEach(async () => {
    apiSpy = {
      getMatchTeamStats: vitest.fn().mockReturnValue(of({})),
      getMatchTimeline: vitest.fn().mockReturnValue(of({ Event: [] }))
    };

    i18nSpy = {
      currentLang: vitest.fn().mockReturnValue('pt'),
      t: vitest.fn().mockReturnValue({ dashboard: { player: 'Jogador' }, match: { loadingDetails: 'Carregando...', noInfo: 'Não disponível', live: 'AO VIVO', penalty: 'Pênaltis' } }),
      translateStage: vitest.fn().mockReturnValue('Mocked Stage')
    };

    await TestBed.configureTestingModule({
      imports: [MatchDetailModalComponent],
      providers: [
        { provide: FifaApiService, useValue: apiSpy },
        { provide: I18nService, useValue: i18nSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MatchDetailModalComponent);
    component = fixture.componentInstance;
    
    // Mock navigator share and clipboard
    Object.assign(navigator, {
      share: vitest.fn().mockResolvedValue(true),
      clipboard: {
        writeText: vitest.fn().mockResolvedValue(true)
      }
    });
    
    window.alert = vitest.fn();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should create and set body overflow', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    
    component.ngOnDestroy();
    expect(document.body.style.overflow).toBe('');
  });

  it('should fetch stats on changes when match is provided', () => {
    component.match = { Properties: { IdIFES: '123' }, IdCompetition: 'C1', IdSeason: 'S1', IdStage: 'ST1', IdMatch: 'M1' };
    
    component.ngOnChanges({
      match: new SimpleChange(null, component.match, true)
    });
    
    expect(apiSpy.getMatchTeamStats).toHaveBeenCalledWith('123');
    expect(apiSpy.getMatchTimeline).toHaveBeenCalledWith('C1', 'S1', 'ST1', 'M1', 'pt');
  });

  it('should poll if match is live', () => {
    vi.useFakeTimers();
    component.match = { MatchStatus: 3, Properties: { IdIFES: '123' } };
    
    component.ngOnChanges({
      match: new SimpleChange(null, component.match, true)
    });
    
    vi.advanceTimersByTime(10000);
    expect(apiSpy.getMatchTeamStats).toHaveBeenCalledTimes(2); // 1 initial + 1 poll
    
    component.ngOnDestroy();
    vi.useRealTimers();
  });

  it('should parse team stats and timelines properly', () => {
    component.match = {
      Home: { IdTeam: 'T1', IdCountry: 'BRA', TeamName: [{ Description: 'Brazil' }] },
      Away: { IdTeam: 'T2', IdCountry: 'ARG', TeamName: [{ Description: 'Argentina' }] },
      Properties: { IdIFES: '123' }
    };
    
    const mockTeams = {
      'T1': [['Possession', 0.6], ['Shots', 10]],
      'T2': [['Possession', 0.4], ['Shots', 5]]
    };
    
    const mockTimeline = {
      Event: [
        { Type: 0, EventDescription: [{ Description: 'Pele' }], Timestamp: '2026-06-11T16:00:00Z' }, // Goal regular
        { Type: 0, Period: 7, EventDescription: [{ Description: 'Ronaldo' }] }, // Extra time goal
        { Type: 65, Period: 11, IdTeam: 'T1', isMissedPenalty: false }, // Shootout scored T1
        { Type: 66, Period: 11, IdTeam: 'T2', TypeLocalized: [{ Description: 'missed' }] }, // Shootout missed T2
        { Type: 26 } // Match end
      ]
    };
    
    apiSpy.getMatchTeamStats.mockReturnValue(of(mockTeams));
    apiSpy.getMatchTimeline.mockReturnValue(of(mockTimeline));
    
    expect(component.shootoutRounds()).toHaveLength(0); // Test empty array line 38

    component.ngOnChanges({ match: new SimpleChange(null, component.match, true) });
    fixture.detectChanges();
    
    expect(component.teamStats()).toEqual({
      home: { BallPossession: 60, Shots: 10 },
      away: { BallPossession: 40, Shots: 5 },
      inContest: 0
    });
    
    expect(component.regularEvents()).toHaveLength(1);
    expect(component.extraTimeEvents()).toHaveLength(1);
    expect(component.shootoutEvents()).toHaveLength(2);
    expect(component.matchEndEvent()).toBeTruthy();
    
    expect(component.homePenaltiesScored()).toBe(1);
    expect(component.awayPenaltiesScored()).toBe(0);
    expect(component.shootoutRounds()).toHaveLength(1);
  });
  
  it('should handle error when fetching stats', () => {
    component.match = { Properties: { IdIFES: '123' } };
    apiSpy.getMatchTeamStats.mockReturnValue(throwError(() => new Error('Error')));
    console.error = vitest.fn();
    
    component.ngOnChanges({ match: new SimpleChange(null, component.match, true) });
    
    expect(console.error).toHaveBeenCalled();
    expect(component.loadingStats()).toBe(false);
  });
  
  it('should emit closeModal when onClose is called', () => {
    const spy = vitest.spyOn(component.closeModal, 'emit');
    component.onClose();
    expect(spy).toHaveBeenCalled();
  });
  
  it('should get correct flag emoji', () => {
    expect(component.getFlagEmoji('BRA')).toBe('🇧🇷');
    expect(component.getFlagEmoji('ENG')).toBe('🏴󠁧󠁢󠁥󠁮󠁧󠁿');
    expect(component.getFlagEmoji('UNK')).toBe('[UNK]');
  });
  
  it('should share match using navigator.share if available', async () => {
    component.match = {
      IdMatch: 'M1',
      Home: { IdCountry: 'BRA', TeamName: [{ Description: 'Brazil' }] },
      Away: { IdCountry: 'ARG', TeamName: [{ Description: 'Argentina' }] },
      HomeTeamScore: 2,
      AwayTeamScore: 1,
      MatchStatus: 0 // Finished
    };
    
    await component.shareMatch();
    
    expect(navigator.share).toHaveBeenCalled();
    const shareCall = (navigator.share as any).mock.calls[0][0];
    expect(shareCall.title).toBe('Copa: Brazil x Argentina');
    expect(shareCall.text).toContain('Placar: 2 - 1');
    expect(shareCall.text).toContain('🇧🇷');
  });

  it('should fallback to clipboard if navigator.share is not available', async () => {
    const originalShare = navigator.share;
    (navigator as any).share = undefined; // simulate unsupported
    
    component.match = { IdMatch: 'M1' };
    
    await component.shareMatch();
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Link da partida copiado para a área de transferência!');
    
    (navigator as any).share = originalShare;
  });

  it('should handle error when navigator.share fails', async () => {
    component.match = { IdMatch: 'M1' };
    (navigator as any).share = vitest.fn().mockRejectedValue(new Error('Share failed'));
    console.error = vitest.fn();
    
    await component.shareMatch();
    
    // allow microtasks to flush
    await Promise.resolve();
    expect(console.error).toHaveBeenCalledWith('Erro ao compartilhar', expect.any(Error));
  });

  it('should handle error when clipboard.writeText fails', async () => {
    const originalShare = navigator.share;
    (navigator as any).share = undefined; // simulate unsupported
    (navigator as any).clipboard.writeText = vitest.fn().mockRejectedValue(new Error('Clipboard failed'));
    console.error = vitest.fn();
    
    component.match = { IdMatch: 'M1' };
    await component.shareMatch();
    
    // allow microtasks to flush
    await Promise.resolve();
    expect(console.error).toHaveBeenCalledWith('Erro ao copiar link', expect.any(Error));
    
    (navigator as any).share = originalShare;
  });
});
