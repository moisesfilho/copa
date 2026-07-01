import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchCardComponent } from './match-card.component';
import { I18nService } from '../../../core/services/i18n.service';
import { LiveUpdateService } from '../../../core/services/live-update.service';
import { signal } from '@angular/core';

describe('MatchCardComponent', () => {
  let component: MatchCardComponent;
  let fixture: ComponentFixture<MatchCardComponent>;
  let liveSpy: any;

  beforeEach(async () => {
    liveSpy = {
      liveMatchUpdates: signal({}),
      liveEventUpdates: signal({})
    };

    await TestBed.configureTestingModule({
      imports: [MatchCardComponent],
      providers: [
        I18nService,
        { provide: LiveUpdateService, useValue: liveSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MatchCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display team names', () => {
    component.match = {
      IdMatch: '1',
      Home: { TeamName: [{ Description: 'Brazil' }], Abbreviation: 'BRA' },
      Away: { TeamName: [{ Description: 'Argentina' }], Abbreviation: 'ARG' }
    };
    expect(component.homeTeam).toBe('Brazil');
    expect(component.awayTeam).toBe('Argentina');
  });

  it('should use abbreviations in dashboard mode', () => {
    component.match = {
      IdMatch: '1',
      Home: { TeamName: [{ Description: 'Brazil' }], Abbreviation: 'BRA' },
      Away: { TeamName: [{ Description: 'Argentina' }], Abbreviation: 'ARG' }
    };
    component.isDashboardMode = true;
    expect(component.homeTeam).toBe('BRA');
    expect(component.awayTeam).toBe('ARG');
  });

  it('should return TBD if team is missing', () => {
    component.match = { IdMatch: '1' };
    expect(component.homeTeam).toBe('TBD');
    expect(component.awayTeam).toBe('TBD');
  });

  it('should get scores or fallback to dash', () => {
    component.match = { IdMatch: '1', HomeTeamScore: 2, AwayTeamScore: 0 };
    expect(component.homeScore).toBe(2);
    expect(component.awayScore).toBe(0);

    component.match = { IdMatch: '2' }; // No score
    expect(component.homeScore).toBe('-');
    expect(component.awayScore).toBe('-');
  });

  it('should detect live status', () => {
    component.match = { IdMatch: '1', MatchStatus: 3 };
    expect(component.isLive).toBe(true);
    
    component.match = { IdMatch: '1', MatchStatus: 1 };
    expect(component.isLive).toBe(false);
  });

  it('should handle penalties', () => {
    component.match = { IdMatch: '1', HomeTeamPenaltyScore: 4, AwayTeamPenaltyScore: 5 };
    expect(component.hasPenalties).toBe(true);
    expect(component.homePenaltyScore).toBe(4);
    expect(component.awayPenaltyScore).toBe(5);
  });

  it('should detect extra time', () => {
    component.match = { IdMatch: '1', Period: 7 }; // Extra time first half
    expect(component.isExtraTime).toBe(true);

    component.match = { IdMatch: '1', Period: 3, HomeTeamPenaltyScore: 1, AwayTeamPenaltyScore: 1 }; // Has penalties
    expect(component.isExtraTime).toBe(false); // Should return false if has penalties
  });

  it('should prioritize live match updates', () => {
    component.match = { IdMatch: '1', HomeTeamScore: 0, AwayTeamScore: 0 };
    
    liveSpy.liveMatchUpdates.set({
      '1': { IdMatch: '1', HomeTeamScore: 1, AwayTeamScore: 1 }
    });
    
    expect(component.homeScore).toBe(1);
    expect(component.awayScore).toBe(1);
  });

  it('should emit matchClicked event', () => {
    const spy = vitest.spyOn(component.matchClicked, 'emit');
    component.match = { IdMatch: '1' };
    component.onClick();
    
    expect(spy).toHaveBeenCalledWith(component.match);
  });

  it('should render live events when match is live and events are present', () => {
    component.match = { IdMatch: '1', MatchStatus: 3, Home: { IdTeam: 'T1' }, Away: { IdTeam: 'T2' } };
    
    const mockEvents = [
      { IdTeam: 'T1', playerName: 'Pele', MatchMinute: "12'", isCard: false },
      { IdTeam: 'T2', playerName: 'Maradona', MatchMinute: "45'", isCard: true, cardType: 'yellow' },
      { IdTeam: 'T2', playerName: 'Messi', MatchMinute: "90'", isCard: true, cardType: 'red' }
    ];
    
    liveSpy.liveEventUpdates.set({ '1': mockEvents });
    expect(component.displayEvents).toEqual(mockEvents);
    
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.live-events-container')).toBeTruthy();
    expect(compiled.querySelectorAll('.match-event-item')).toHaveLength(3);
  });

  it('should render officials in dashboard mode', () => {
    component.match = { 
      IdMatch: '1', 
      Officials: [
        { IdCountry: 'BRA', Name: [{ Description: 'Referee Name' }], TypeLocalized: [{ Description: 'Referee' }] }
      ] 
    };
    component.isDashboardMode = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.officials-section')).toBeTruthy();
    expect(compiled.textContent).toContain('Referee Name');
  });
});
