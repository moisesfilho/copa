import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Language } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class FifaApiService {
  private http = inject(HttpClient);
  
  getMatches(lang: Language = 'pt'): Observable<any> {
    const apiLang = lang === 'en' ? 'en-GB' : 'pt';
    return this.http.get<any>(`https://api.fifa.com/api/v3/calendar/matches?language=${apiLang}&count=500&idSeason=285023`);
  }

  getUIResources(lang: Language = 'pt'): Observable<any> {
    const apiLang = lang === 'en' ? 'en-GB' : 'pt';
    return this.http.get<any>(`https://cxm-api.fifa.com/fifaplusweb/api/resources?locale=${apiLang}&identifier=MatchInformation`);
  }

  getMatchTeamStats(idIfes: string): Observable<any> {
    return this.http.get<any>(`https://fdh-api.fifa.com/v1/stats/match/${idIfes}/teams.json`);
  }

  getMatchPowerRanking(idIfes: string): Observable<any> {
    return this.http.get<any>(`https://fdh-api.fifa.com/v1/powerranking/match/${idIfes}.json`);
  }

  getMatchTimeline(idComp: string, idSeason: string, idStage: string, idMatch: string, lang: Language = 'pt'): Observable<any> {
    const apiLang = lang === 'en' ? 'en-GB' : 'pt';
    return this.http.get<any>(`https://api.fifa.com/api/v3/timelines/${idComp}/${idSeason}/${idStage}/${idMatch}?language=${apiLang}`);
  }
}
