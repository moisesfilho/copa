import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BracketComponent } from './bracket.component';
import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { LiveUpdateService } from '../../core/services/live-update.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('BracketComponent', () => {
  let component: BracketComponent;
  let fixture: ComponentFixture<BracketComponent>;
  let mockFifaApiService: any;
  let mockI18nService: any;
  let mockLiveUpdateService: any;

  beforeEach(async () => {
    mockFifaApiService = {
      getMatches: vi.fn().mockReturnValue(of({
        Results: [
          // Group stage match (should be filtered out)
          { IdMatch: '1', GroupName: [{ Description: 'Group A' }], StageName: [{ Description: 'First Stage' }], Date: '2026-06-11T16:00:00Z' },
          // Group stage match by name
          { IdMatch: '2', GroupName: [], StageName: [{ Description: 'Group Stage' }], Date: '2026-06-12T16:00:00Z' },
          // Knockout matches
          { IdMatch: '3', GroupName: [], StageName: [{ Description: 'Round of 16' }], Date: '2026-06-27T16:00:00Z' },
          { IdMatch: '4', GroupName: [], StageName: [{ Description: 'Quarter-finals' }], Date: '2026-07-03T16:00:00Z' },
          { IdMatch: '5', GroupName: null, StageName: [{ Description: 'Final' }], Date: '2026-07-19T16:00:00Z' }
        ]
      }))
    };

    mockI18nService = {
      currentLang: vi.fn().mockReturnValue('pt'),
      t: vi.fn().mockReturnValue({
        bracket: {
          title: 'Chaveamento',
          subtitle: 'Acompanhe as fases eliminatórias.',
          roundOf32: 'Dezesseis-avos de Final',
          roundOf16: 'Oitavas de Final',
          quarterFinals: 'Quartas de Final',
          semiFinals: 'Semifinal',
          thirdPlace: 'Disputa do 3º Lugar',
          final: 'Final',
          tbd: 'A Definir'
        },
        dashboard: { loading: 'Carregando' },
        match: {
          noInfo: 'Não disponível',
          live: 'AO VIVO',
          finished: 'FIM'
        }
      })
    };

    mockLiveUpdateService = {
      liveMatchUpdates: vi.fn().mockReturnValue({}),
      liveEventUpdates: vi.fn().mockReturnValue({})
    };

    await TestBed.configureTestingModule({
      imports: [BracketComponent],
      providers: [
        { provide: FifaApiService, useValue: mockFifaApiService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: LiveUpdateService, useValue: mockLiveUpdateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BracketComponent);
    component = fixture.componentInstance;
    // We need to trigger the signal effect by letting angular run its cycle
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter out group stage matches', () => {
    const knockoutMatches = component.knockoutMatches();
    expect(knockoutMatches).toHaveLength(3);
    // Should not contain match '1' or '2'
    expect(knockoutMatches.some(m => m.IdMatch === '1')).toBeFalsy();
    expect(knockoutMatches.some(m => m.IdMatch === '2')).toBeFalsy();
  });

  it('should group matches by stages and translate them correctly', () => {
    const stages = component.stages();
    expect(stages).toHaveLength(3);
    
    // Order is expected to be Round of 16 -> Quarter -> Final based on grouping logic
    expect(stages[0].name).toBe('Oitavas de Final');
    expect(stages[0].matches).toHaveLength(1);
    expect(stages[0].matches[0].IdMatch).toBe('3');

    expect(stages[1].name).toBe('Quartas de Final');
    expect(stages[2].name).toBe('Final');
  });
});
