import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchesPageComponent } from './matches-page';
import { FifaApiService } from '../../../core/services/fifa-api.service';
import { I18nService } from '../../../core/services/i18n.service';
import { LiveUpdateService } from '../../../core/services/live-update.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('MatchesPageComponent', () => {
  let component: MatchesPageComponent;
  let fixture: ComponentFixture<MatchesPageComponent>;

  beforeEach(async () => {
    const mockFifaApi = {
      getUIResources: () => of({}),
      getMatches: () => of({})
    };
    const mockLiveUpdate = {
      liveMatchUpdates: signal({})
    };
    const mockRoute = {
      snapshot: { queryParams: {} },
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [MatchesPageComponent],
      providers: [
        { provide: FifaApiService, useValue: mockFifaApi },
        I18nService,
        { provide: LiveUpdateService, useValue: mockLiveUpdate },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
