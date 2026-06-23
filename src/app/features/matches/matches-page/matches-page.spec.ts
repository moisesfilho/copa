import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesPage } from './matches-page';

describe('MatchesPage', () => {
  let component: MatchesPage;
  let fixture: ComponentFixture<MatchesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
