import { TestBed } from '@angular/core/testing';

import { FifaApi } from './fifa-api';

describe('FifaApi', () => {
  let service: FifaApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FifaApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
