import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StandingsComponent } from './standings';
import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';

describe('StandingsComponent', () => {
  let component: StandingsComponent;
  let fixture: ComponentFixture<StandingsComponent>;
  let apiSpy: any;

  beforeEach(async () => {
    apiSpy = {
      getMatches: vi.fn().mockReturnValue(of({ Results: [
        {
          IdMatch: '1',
          MatchStatus: 0,
          HomeTeamScore: 2,
          AwayTeamScore: 1,
          StageName: [{ Description: 'Group Stage' }],
          GroupName: [{ Description: 'Group A' }],
          Home: { IdTeam: 'T1', TeamName: [{ Description: 'Brazil' }] },
          Away: { IdTeam: 'T2', TeamName: [{ Description: 'Serbia' }] }
        }
      ] }))
    };

    await TestBed.configureTestingModule({
      imports: [StandingsComponent],
      providers: [
        { provide: FifaApiService, useValue: apiSpy },
        I18nService,
        { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParams: {} } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StandingsComponent);
    component = fixture.componentInstance;
  });

  it('should create and calculate standings', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(apiSpy.getMatches).toHaveBeenCalled();
    expect(component.groupNames()).toEqual(['Group A']);
    expect(component.standings()['Group A']).toHaveLength(2);
    expect(component.standings()['Group A'][0].name).toBe('Brazil'); // Winner
    expect(component.standings()['Group A'][1].name).toBe('Serbia');
    expect(component.loading()).toBe(false);
  });

  it('should handle API error gracefully', () => {
    apiSpy.getMatches.mockReturnValue(throwError(() => new Error('API error')));
    fixture.detectChanges();
    
    expect(component.loading()).toBe(false);
    expect(component.groupNames()).toEqual([]);
  });
});
