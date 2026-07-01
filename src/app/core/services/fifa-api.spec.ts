import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FifaApiService } from './fifa-api.service';

describe('FifaApiService', () => {
  let service: FifaApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FifaApiService]
    });
    service = TestBed.inject(FifaApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getMatches with pt by default', () => {
    service.getMatches().subscribe();
    const req = httpMock.expectOne('https://api.fifa.com/api/v3/calendar/matches?language=pt&count=500&idSeason=285023');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getMatches with en-GB when lang is en', () => {
    service.getMatches('en').subscribe();
    const req = httpMock.expectOne('https://api.fifa.com/api/v3/calendar/matches?language=en-GB&count=500&idSeason=285023');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getUIResources with pt by default', () => {
    service.getUIResources().subscribe();
    const req = httpMock.expectOne('https://cxm-api.fifa.com/fifaplusweb/api/resources?locale=pt&identifier=MatchInformation');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getUIResources with en-GB when lang is en', () => {
    service.getUIResources('en').subscribe();
    const req = httpMock.expectOne('https://cxm-api.fifa.com/fifaplusweb/api/resources?locale=en-GB&identifier=MatchInformation');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getMatchTeamStats', () => {
    service.getMatchTeamStats('12345').subscribe();
    const req = httpMock.expectOne('https://fdh-api.fifa.com/v1/stats/match/12345/teams.json');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getMatchPowerRanking', () => {
    service.getMatchPowerRanking('12345').subscribe();
    const req = httpMock.expectOne('https://fdh-api.fifa.com/v1/powerranking/match/12345.json');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getMatchTimeline with pt by default', () => {
    service.getMatchTimeline('COMP1', 'SEAS1', 'STAG1', 'MATCH1').subscribe();
    const req = httpMock.expectOne('https://api.fifa.com/api/v3/timelines/COMP1/SEAS1/STAG1/MATCH1?language=pt');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getMatchTimeline with en-GB when lang is en', () => {
    service.getMatchTimeline('COMP1', 'SEAS1', 'STAG1', 'MATCH1', 'en').subscribe();
    const req = httpMock.expectOne('https://api.fifa.com/api/v3/timelines/COMP1/SEAS1/STAG1/MATCH1?language=en-GB');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
