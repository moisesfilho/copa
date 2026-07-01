import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamDetailModalComponent } from './team-detail-modal.component';
import { TeamStatsService } from '../../../core/services/team-stats.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TeamDetailModalComponent', () => {
  let component: TeamDetailModalComponent;
  let fixture: ComponentFixture<TeamDetailModalComponent>;
  let statsServiceSpy: any;

  beforeEach(async () => {
    statsServiceSpy = {
      getTeamAggregateStats: vi.fn().mockReturnValue(of({
        allMatches: [],
        upcomingMatches: [{ IdMatch: '1', Date: new Date().toISOString(), Home: { IdCountry: 'BRA' }, Away: { IdCountry: 'ARG' } }],
        pastMatches: [{ IdMatch: '2', Date: new Date().toISOString(), Home: { IdCountry: 'BRA' }, Away: { IdCountry: 'ARG' }, HomeTeamScore: 2, AwayTeamScore: 0 }],
        scorers: [{ name: 'Neymar', goals: 3 }],
        yellowCards: [{ name: 'Casemiro', count: 1 }],
        redCards: [],
        tactics: [{ matchId: '2', opponent: 'Argentina', tactic: '4-3-3' }]
      }))
    };

    await TestBed.configureTestingModule({
      imports: [TeamDetailModalComponent],
      providers: [
        { provide: TeamStatsService, useValue: statsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamDetailModalComponent);
    component = fixture.componentInstance;
    component.teamId = 'BRA';
    component.teamName = 'Brasil';
    component.teamCountryCode = 'BRA';
    
    // For trigger change detection properly on OnPush we can set input and trigger ngOnChanges
    component.ngOnChanges({
      teamId: {
        previousValue: null,
        currentValue: 'BRA',
        firstChange: true,
        isFirstChange: () => true
      }
    } as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getTeamAggregateStats when teamId changes', () => {
    expect(statsServiceSpy.getTeamAggregateStats).toHaveBeenCalledWith('BRA');
    expect(component.stats()).toBeTruthy();
  });

  it('should handle error from getTeamAggregateStats', () => {
    statsServiceSpy.getTeamAggregateStats.mockReturnValue(throwError(() => new Error('API Error')));
    
    component.ngOnChanges({
      teamId: {
        previousValue: 'BRA',
        currentValue: 'ARG',
        firstChange: false,
        isFirstChange: () => false
      }
    } as any);
    
    expect(component.loading()).toBeFalsy();
    expect(component.stats()).toBeNull();
  });

  it('should emit closeModal when close button is clicked', () => {
    const closeSpy = vi.spyOn(component.closeModal, 'emit');
    const closeBtn = fixture.debugElement.query(By.css('.close-btn'));
    closeBtn.triggerEventHandler('click', null);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should display scorers', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Neymar');
    expect(textContent).toContain('3');
  });
});
