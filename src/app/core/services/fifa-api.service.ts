import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FifaApiService {
  private http = inject(HttpClient);
  
  // Endpoint específico para os 500 jogos da Copa de 2026 em português
  private readonly matchesUrl = 'https://api.fifa.com/api/v3/calendar/matches?language=pt&count=500&idSeason=285023';

  // Endpoint para pegar as traduções dinâmicas da tela
  private readonly cxmResourcesUrl = 'https://cxm-api.fifa.com/fifaplusweb/api/resources?locale=pt&identifier=MatchInformation';

  getMatches(): Observable<any> {
    return this.http.get<any>(this.matchesUrl);
  }

  getUIResources(): Observable<any> {
    return this.http.get<any>(this.cxmResourcesUrl);
  }

  getMatchTeamStats(idIfes: string): Observable<any> {
    return this.http.get<any>(`https://fdh-api.fifa.com/v1/stats/match/${idIfes}/teams.json`);
  }

  getMatchPowerRanking(idIfes: string): Observable<any> {
    return this.http.get<any>(`https://fdh-api.fifa.com/v1/powerranking/match/${idIfes}.json`);
  }
}
