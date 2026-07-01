import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchesPageComponent } from './matches-page';
import { FifaApiService } from '../../../core/services/fifa-api.service';
import { I18nService } from '../../../core/services/i18n.service';
import { LiveUpdateService } from '../../../core/services/live-update.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('MatchesPageComponent', () => {
  let component: MatchesPageComponent;
  let fixture: ComponentFixture<MatchesPageComponent>;
  let apiSpy: any;
  let routerSpy: any;
  let liveUpdateSpy: any;

  beforeEach(async () => {
    apiSpy = {
      getUIResources: vi.fn().mockReturnValue(of({ resourceSets: [{ resources: [{ identifier: 'TITLE', value: 'Partidas' }] }] })),
      getMatches: vi.fn().mockReturnValue(of({ Results: [{ IdMatch: '1' }, { IdMatch: '2' }] }))
    };
    liveUpdateSpy = {
      liveMatchUpdates: signal({ '1': { IdMatch: '1', Score: '1-0' } })
    };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MatchesPageComponent],
      providers: [
        { provide: FifaApiService, useValue: apiSpy },
        I18nService,
        { provide: LiveUpdateService, useValue: liveUpdateSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { match: '1' } }, queryParams: of({ match: '1' }) } },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesPageComponent);
    component = fixture.componentInstance;
  });

  it('should create and load data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(apiSpy.getUIResources).toHaveBeenCalled();
    expect(apiSpy.getMatches).toHaveBeenCalled();
    expect(component.uiResources()).toEqual({ 'TITLE': 'Partidas' });
    expect(component.matches()).toHaveLength(2);
    expect(component.selectedMatch()).toBeTruthy();
    expect(component.selectedMatch().IdMatch).toBe('1');
    expect(component.loading()).toBe(false);
  });

  it('should handle API error gracefully', () => {
    apiSpy.getMatches.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.matches()).toHaveLength(0);
  });

  it('should select match on route param change', () => {
    fixture.detectChanges(); // Init
    
    // Test that the effect handled snapshot match selection
    expect(component.selectedMatch().IdMatch).toBe('1');
    
    // Call ngOnInit explicitly which subscribes to queryParams (mocked to yield {match: '1'})
    component.ngOnInit();
    expect(component.selectedMatch().IdMatch).toBe('1');
  });

  it('should unselect match if route param is missing', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MatchesPageComponent],
      providers: [
        { provide: FifaApiService, useValue: apiSpy },
        I18nService,
        { provide: LiveUpdateService, useValue: liveUpdateSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesPageComponent);
    component = fixture.componentInstance;
    
    // Suppose it was previously selected
    component.selectedMatch.set({ IdMatch: '1' });
    
    fixture.detectChanges(); // triggers ngOnInit which clears it
    expect(component.selectedMatch()).toBeNull();
  });

  it('should navigate when match is selected', () => {
    component.onMatchSelected({ IdMatch: '3' });
    expect(routerSpy.navigate).toHaveBeenCalled();
    expect(routerSpy.navigate.mock.calls[0][1].queryParams).toEqual({ match: '3' });
  });

  it('should navigate to close modal', () => {
    component.closeModal();
    expect(routerSpy.navigate).toHaveBeenCalled();
    expect(routerSpy.navigate.mock.calls[0][1].queryParams).toEqual({ match: null });
  });

  it('should compute merged matches with live updates', () => {
    fixture.detectChanges();
    const merged = component.mergedMatches();
    expect(merged).toHaveLength(2);
    expect(merged[0].Score).toBe('1-0'); // Got live update
    expect(merged[1].Score).toBeUndefined(); // Did not get live update
  });
});

