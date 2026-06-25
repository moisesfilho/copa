import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StandingsComponent } from './standings';
import { FifaApiService } from '../../core/services/fifa-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { of } from 'rxjs';

describe('StandingsComponent', () => {
  let component: StandingsComponent;
  let fixture: ComponentFixture<StandingsComponent>;

  beforeEach(async () => {
    const mockFifaApi = {
      getMatches: () => of({})
    };
    await TestBed.configureTestingModule({
      imports: [StandingsComponent],
      providers: [
        { provide: FifaApiService, useValue: mockFifaApi },
        I18nService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StandingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
