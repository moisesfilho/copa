import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchListComponent } from './match-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { SimpleChange } from '@angular/core';

describe('MatchListComponent', () => {
  let component: MatchListComponent;
  let fixture: ComponentFixture<MatchListComponent>;
  let routerSpy: any;

  beforeEach(async () => {
    routerSpy = { navigate: vitest.fn() };

    await TestBed.configureTestingModule({
      imports: [MatchListComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { 
          provide: ActivatedRoute, 
          useValue: { 
            queryParams: of({ status: 'LIVE', stage: 'Final', group: 'A', team: 'Brazil', continent: 'América do Sul (CONMEBOL)', defined: 'true' }),
            snapshot: { queryParams: {} }
          }
        },
        I18nService
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MatchListComponent);
    component = fixture.componentInstance;
  });

  it('should create and load filters from queryParams', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.activeFilter()).toBe('LIVE');
    expect(component.selectedStage()).toBe('Final');
    expect(component.selectedGroup()).toBe('A');
    expect(component.selectedTeam()).toBe('Brazil');
    expect(component.selectedContinent()).toBe('América do Sul (CONMEBOL)');
    expect(component.onlyDefinedTeams()).toBe(true);
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should extract available filters from matches', () => {
    component.matches = [
      {
        StageName: [{ Description: 'Group Stage' }],
        GroupName: [{ Description: 'Group A' }],
        Home: { TeamName: [{ Description: 'Brazil' }] },
        Away: { TeamName: [{ Description: 'Argentina' }] }
      },
      {
        StageName: [{ Description: 'Final' }],
        Home: { TeamName: [{ Description: 'France' }] },
        Away: { TeamName: [{ Description: 'England' }] }
      }
    ];

    component.ngOnChanges({
      matches: new SimpleChange(null, component.matches, true)
    });

    expect(component.availableStages()).toContain('Group Stage');
    expect(component.availableStages()).toContain('Final');
    expect(component.availableGroups()).toContain('Group A');
    expect(component.availableTeams()).toContain('Brazil');
    expect(component.availableTeams()).toContain('France');
    expect(component.availableContinents()).toContain('América do Sul (CONMEBOL)');
    expect(component.availableContinents()).toContain('Europa (UEFA)');
  });

  it('should apply filters correctly', () => {
    component.matches = [
      { IdMatch: '1', MatchStatus: 3, StageName: [{ Description: 'Final' }], Date: '2026-07-19T16:00:00Z' }, // Live, Final
      { IdMatch: '2', MatchStatus: 0, StageName: [{ Description: 'Semi' }], Date: '2026-07-15T16:00:00Z' }, // Finished, Semi
      { IdMatch: '3', MatchStatus: 1, GroupName: [{ Description: 'A' }], Home: { TeamName: [{ Description: 'Brazil' }] }, Away: { TeamName: [{ Description: 'Serbia' }] }, Date: '2026-06-15T16:00:00Z' } // Upcoming, Group A, Brazil
    ];

    // Test LIVE filter
    component.activeFilter.set('LIVE');
    component['applyFilter']();
    expect(component.filteredMatches()).toHaveLength(1);
    expect(component.filteredMatches()[0].IdMatch).toBe('1');

    // Test FINISHED filter
    component.activeFilter.set('FINISHED');
    component['applyFilter']();
    expect(component.filteredMatches()).toHaveLength(1);
    expect(component.filteredMatches()[0].IdMatch).toBe('2');

    // Test UPCOMING filter
    component.activeFilter.set('UPCOMING');
    component['applyFilter']();
    expect(component.filteredMatches()).toHaveLength(1);
    expect(component.filteredMatches()[0].IdMatch).toBe('3');

    // Reset status filter
    component.activeFilter.set('ALL');

    // Test Group filter
    component.selectedGroup.set('A');
    component['applyFilter']();
    expect(component.filteredMatches()).toHaveLength(1);
    expect(component.filteredMatches()[0].IdMatch).toBe('3');
    component.selectedGroup.set('ALL');

    // Test Team filter
    component.selectedTeam.set('Brazil');
    component['applyFilter']();
    expect(component.filteredMatches()).toHaveLength(1);
    expect(component.filteredMatches()[0].IdMatch).toBe('3');
    component.selectedTeam.set('ALL');

    // Test Continent filter
    component.selectedContinent.set('América do Sul (CONMEBOL)');
    component['applyFilter']();
    expect(component.filteredMatches()).toHaveLength(1);
    expect(component.filteredMatches()[0].IdMatch).toBe('3');
    component.selectedContinent.set('ALL');

    // Test sort order DESC
    component.sortOrder.set('DESC');
    component['applyFilter']();
    expect(component.filteredMatches()[0].IdMatch).toBe('1'); // Newest first
    expect(component.filteredMatches()[2].IdMatch).toBe('3'); // Oldest last
  });

  it('should filter only defined teams', () => {
    component.matches = [
      { IdMatch: '1', Home: { TeamName: [{ Description: 'Brazil' }] }, Away: { TeamName: [{ Description: 'Serbia' }] }, Date: '2026-06-15T16:00:00Z' }, // Defined via mapping
      { IdMatch: '2', Home: { TeamName: [{ Description: 'UnknownTeam' }] }, Away: { TeamName: [{ Description: 'AnotherUnknown' }] }, Date: '2026-06-16T16:00:00Z' }, // Undefined
      { IdMatch: '3', Home: { IdCountry: 'BRA' }, Away: { IdCountry: 'ARG' }, Date: '2026-06-17T16:00:00Z' } // Defined via IdCountry
    ];

    component.onlyDefinedTeams.set(true);
    component['applyFilter']();
    
    expect(component.filteredMatches()).toHaveLength(2);
    expect(component.filteredMatches().some(m => m.IdMatch === '1')).toBe(true);
    expect(component.filteredMatches().some(m => m.IdMatch === '3')).toBe(true);
    expect(component.filteredMatches().some(m => m.IdMatch === '2')).toBe(false);
  });

  it('should handle sorting toggle', () => {
    component.sortOrder.set('ASC');
    component.toggleSortOrder();
    expect(component.sortOrder()).toBe('DESC');
    component.toggleSortOrder();
    expect(component.sortOrder()).toBe('ASC');
  });

  it('should emit matchClick', () => {
    const spy = vitest.spyOn(component.matchClicked, 'emit');
    component.onMatchClick({ IdMatch: '1' });
    expect(spy).toHaveBeenCalledWith({ IdMatch: '1' });
  });

  it('should clear filters via router', () => {
    component.clearFilters();
    expect(routerSpy.navigate).toHaveBeenCalled();
    const args = routerSpy.navigate.mock.calls[0];
    expect(args[1].queryParams).toEqual({ match: null });
  });

  it('should update filter via selects and trigger template bindings', () => {
    const eventMock = { target: { value: 'NEW_VAL' } } as any;
    
    component.setFilter('LIVE');
    expect(routerSpy.navigate).toHaveBeenCalled();
    
    component.setStatusFilter(eventMock);
    component.setStageFilter(eventMock);
    component.setGroupFilter(eventMock);
    component.setTeamFilter(eventMock);
    component.setContinentFilter(eventMock);
    component.toggleDefinedTeams();
    
    expect(routerSpy.navigate).toHaveBeenCalledTimes(7);

    // Cover HTML bindings
    component.availableStages.set(['Final']);
    component.availableGroups.set(['A']);
    component.availableTeams.set(['Brazil']);
    component.availableContinents.set(['América do Sul (CONMEBOL)']);
    fixture.detectChanges();

    const selects = fixture.nativeElement.querySelectorAll('select.filter-select');
    if (selects.length >= 5) {
      selects[0].dispatchEvent(new Event('change')); // status
      selects[1].dispatchEvent(new Event('change')); // stage
      selects[2].dispatchEvent(new Event('change')); // group
      selects[3].dispatchEvent(new Event('change')); // team
      selects[4].dispatchEvent(new Event('change')); // continent
    }
    
    const toggleBtn = fixture.nativeElement.querySelector('.defined-teams-toggle');
    if (toggleBtn) {
      toggleBtn.click();
    }
  });
});
