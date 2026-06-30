import { Component, EventEmitter, Input, Output, OnChanges, OnInit, OnDestroy, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FifaApiService } from '../../../core/services/fifa-api.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-match-detail-modal',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './match-detail-modal.component.html',
  styleUrls: ['./match-detail-modal.component.css']
})
export class MatchDetailModalComponent implements OnChanges, OnInit, OnDestroy {
  private api = inject(FifaApiService);
  i18n = inject(I18nService);
  private pollingInterval: any;

  @Input() match: any = null;
  @Output() closeModal = new EventEmitter<void>();

  teamStats = signal<{ home: any, away: any, inContest?: number } | null>(null);
  regularEvents = signal<any[]>([]);
  extraTimeEvents = signal<any[]>([]);
  shootoutEvents = signal<any[]>([]);
  matchEndEvent = signal<any | null>(null);
  
  homePenaltiesScored = computed(() => {
    return this.shootoutEvents().filter(e => e.IdTeam === this.match?.Home?.IdTeam && !e.isMissedPenalty).length;
  });

  awayPenaltiesScored = computed(() => {
    return this.shootoutEvents().filter(e => e.IdTeam === this.match?.Away?.IdTeam && !e.isMissedPenalty).length;
  });
  
  shootoutRounds = computed(() => {
    const events = this.shootoutEvents();
    if (!events.length) return [];
    const homeId = this.match?.Home?.IdTeam;
    const awayId = this.match?.Away?.IdTeam;

    const homePenalties = events.filter(e => e.IdTeam === homeId);
    const awayPenalties = events.filter(e => e.IdTeam === awayId);

    const maxRounds = Math.max(homePenalties.length, awayPenalties.length);
    const rounds = [];
    for (let i = 0; i < maxRounds; i++) {
      rounds.push({
        round: i + 1,
        home: homePenalties[i] || null,
        away: awayPenalties[i] || null
      });
    }
    return rounds;
  });

  loadingStats = signal<boolean>(false);

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    this.clearPolling();
  }

  private clearPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['match'] && this.match) {
      this.clearPolling();
      const idIfes = this.match.Properties?.IdIFES;
      if (idIfes) {
        this.fetchAdvancedStats(idIfes);
        
        // Polling para partidas ao vivo
        if (this.match.MatchStatus === 3) {
          this.pollingInterval = setInterval(() => {
            this.fetchAdvancedStats(idIfes, true);
          }, 10000);
        }
      }
    }
  }

  private fetchAdvancedStats(idIfes: string, isPolling = false) {
    if (!isPolling) {
      this.loadingStats.set(true);
      this.teamStats.set(null);
      this.regularEvents.set([]);
      this.extraTimeEvents.set([]);
      this.shootoutEvents.set([]);
      this.matchEndEvent.set(null);
    }

    const lang = this.i18n.currentLang();

    forkJoin({
      teams: this.api.getMatchTeamStats(idIfes),
      timeline: this.api.getMatchTimeline(this.match.IdCompetition, this.match.IdSeason, this.match.IdStage, this.match.IdMatch, lang)
    }).subscribe({
      next: (res) => {
        if (res.teams) {
          const homeId = this.match.Home?.IdTeam;
          const awayId = this.match.Away?.IdTeam;
          
          const homeStats = this.parseTeamStats(res.teams[homeId]);
          const awayStats = this.parseTeamStats(res.teams[awayId]);

          let inContest = 0;
          if (homeStats['BallPossession'] !== undefined && awayStats['BallPossession'] !== undefined) {
            const total = homeStats['BallPossession'] + awayStats['BallPossession'];
            if (total < 100) {
              inContest = 100 - total;
            }
          }

          this.teamStats.set({
            home: homeStats,
            away: awayStats,
            inContest: inContest
          });
        }
        
        if (res.timeline && res.timeline.Event) {
          const allEvents = res.timeline.Event.filter((e: any) => {
            const typeDesc = e.TypeLocalized?.[0]?.Description?.toLowerCase() || '';
            const isMatchStateEvent = e.Type === 7 || e.Type === 8 || e.Type === 26 || typeDesc.includes('hidratação') || typeDesc.includes('cooling') || typeDesc.includes('hydration');
            
            // Inclui eventos do Period 11 (Shootout) ou gols/cartões/pênaltis perdidos (Type 33, 60, 66)
            return isMatchStateEvent || e.Period === 11 || e.Type === 0 || e.Type === 34 || e.Type === 41 || e.Type === 65 || e.Type === 66 || e.Type === 33 || e.Type === 60 ||
                   e.Type === 2 || e.Type === 3 || e.Type === 4 ||
                   typeDesc.includes('cartão') || typeDesc.includes('card');
          }).map((e: any) => this.parseTimelineEvent(e, lang));
          
          const regular: any[] = [];
          const extra: any[] = [];
          const shootout: any[] = [];
          let matchEnd = null;
          
          allEvents.forEach((e: any) => {
            if (e.Type === 26) {
               matchEnd = e;
            } else if (e.isShootout) {
               shootout.push(e);
            } else if (e.isExtraTime) {
               extra.push(e);
            } else {
               regular.push(e);
            }
          });
          
          this.regularEvents.set(regular);
          this.extraTimeEvents.set(extra);
          this.shootoutEvents.set(shootout);
          this.matchEndEvent.set(matchEnd);
        }
        
        if (!isPolling) {
          this.loadingStats.set(false);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas avançadas', err);
        if (!isPolling) {
          this.loadingStats.set(false);
        }
      }
    });
  }

  private parseTeamStats(rawStats: any[]): Record<string, any> {
    if (!rawStats) return {};
    const parsed: Record<string, any> = {};
    rawStats.forEach(stat => {
      let key = stat[0];
      let value = stat[1];
      if (key === 'Possession') {
        key = 'BallPossession';
        value = Math.round(value * 100);
      }
      parsed[key] = value;
    });
    return parsed;
  }

  private getNeutralEventName(e: any, lang: string): string {
    if (e.Type === 8 && e.Period === 3) {
      return lang === 'pt' ? 'Início do Intervalo' : 'Half-time Starts';
    }
    if (e.Type === 7 && e.Period === 5) {
      return lang === 'pt' ? 'Término do Intervalo / Reinício da Partida' : 'Half-time Ends / Match Restarts';
    }
    const typeLoc = e.TypeLocalized;
    if (typeLoc && typeLoc.length > 0) {
      return typeLoc[0].Description || 'Evento da partida';
    }
    return 'Evento da partida';
  }

  private getEventDescriptionName(e: any): string {
    const descArray = e.EventDescription;
    if (descArray && descArray.length > 0) {
      const desc = descArray[0].Description;
      const match = desc.match(/^([^(]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
      return desc;
    }
    return 'Jogador';
  }

  private getPlayerName(e: any, isNeutral: boolean, lang: string): string {
    if (isNeutral) {
      return this.getNeutralEventName(e, lang);
    }
    return this.getEventDescriptionName(e);
  }

  private isMissedPenaltyEvent(e: any, typeDesc: string): boolean {
    return e.Type === 66 || e.Type === 33 || e.Type === 60 || 
           (e.Period === 11 && e.Type !== 65 && e.Type !== 41 && e.Type !== 0 && !typeDesc.includes('gol') && !typeDesc.includes('goal'));
  }

  private getCardInfo(e: any, typeDesc: string): { isCard: boolean, cardType: string } {
    if (e.Type === 2 || typeDesc.includes('amarelo') || typeDesc.includes('yellow')) {
       return { isCard: true, cardType: 'yellow' };
    }
    if (e.Type === 3 || e.Type === 4 || typeDesc.includes('vermelho') || typeDesc.includes('red')) {
       return { isCard: true, cardType: 'red' };
    }
    return { isCard: false, cardType: '' };
  }

  private isNeutralEvent(e: any, typeDesc: string): boolean {
    return e.Type === 7 || e.Type === 8 || e.Type === 26 || 
           typeDesc.includes('hidratação') || typeDesc.includes('cooling') || typeDesc.includes('hydration');
  }

  private isShootoutEvent(e: any): boolean {
    return e.Period === 11 || e.Type === 65 || e.Type === 66 || 
           !!(e.MatchMinute && String(e.MatchMinute).toLowerCase().includes('pen'));
  }
  
  private isExtraTimeEvent(e: any): boolean {
    return e.Period === 7 || e.Period === 9;
  }

  private parseTimelineEvent(e: any, lang: string) {
    const typeDesc = e.TypeLocalized?.[0]?.Description?.toLowerCase() || '';
    const isNeutral = this.isNeutralEvent(e, typeDesc);
    
    let realTime = '';
    if (e.Timestamp) {
      realTime = new Date(e.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const playerName = this.getPlayerName(e, isNeutral, lang);
    const isExtraTime = this.isExtraTimeEvent(e);
    const isShootout = this.isShootoutEvent(e);
    
    const isMissedPenalty = this.isMissedPenaltyEvent(e, typeDesc);
    const { isCard, cardType } = this.getCardInfo(e, typeDesc);
    
    return {
      ...e,
      playerName,
      isExtraTime,
      isShootout,
      isMissedPenalty,
      isCard,
      cardType,
      isNeutral,
      realTime
    };
  }

  getFlagEmoji(fifaCode: string): string {
    const fifaToIso: Record<string, string> = {
      ARG: 'AR', AUS: 'AU', BEL: 'BE', BRA: 'BR', CAN: 'CA', CMR: 'CM',
      CRC: 'CR', CRO: 'HR', DEN: 'DK', ECU: 'EC', ENG: 'GB-ENG', ESP: 'ES',
      FRA: 'FR', GER: 'DE', GHA: 'GH', IRN: 'IR', JPN: 'JP', KOR: 'KR',
      KSA: 'SA', MAR: 'MA', MEX: 'MX', NED: 'NL', POL: 'PL', POR: 'PT',
      QAT: 'QA', SEN: 'SN', SRB: 'RS', SUI: 'CH', TUN: 'TN', URU: 'UY',
      USA: 'US', WAL: 'GB-WLS'
    };

    const iso = fifaToIso[fifaCode];
    if (!iso) return `[${fifaCode}]`;
    if (iso.startsWith('GB-')) {
      const codes = iso === 'GB-ENG' ? ['g', 'b', 'e', 'n', 'g'] : ['g', 'b', 'w', 'l', 's'];
      return String.fromCodePoint(
        0x1F3F4,
        ...codes.map(c => 0xE0000 + c.charCodeAt(0)),
        0xE007F
      );
    }
    return String.fromCodePoint(
      ...iso.split('').map(c => 0x1F1E6 - 65 + c.toUpperCase().charCodeAt(0))
    );
  }

  shareMatch() {
    if (!this.match) return;

    const homeCode = this.match.Home?.IdCountry || '';
    const awayCode = this.match.Away?.IdCountry || '';
    
    const homeFlag = this.getFlagEmoji(homeCode);
    const awayFlag = this.getFlagEmoji(awayCode);
    
    const homeName = this.match.Home?.TeamName?.[0]?.Description || homeCode;
    const awayName = this.match.Away?.TeamName?.[0]?.Description || awayCode;
    
    const homeScore = this.match.HomeTeamScore ?? '';
    const awayScore = this.match.AwayTeamScore ?? '';
    
    const title = `Copa: ${homeName} x ${awayName}`;
    const scoreText = (this.match.MatchStatus === 0 || this.match.MatchStatus === 3) 
      ? ` Placar: ${homeScore} - ${awayScore}` 
      : '';
      
    // A aplicação agora usa PathLocationStrategy, então removemos o #/ da URL
    const url = window.location.origin + window.location.pathname + '?match=' + this.match.IdMatch;
    
    const text = `${homeFlag} ${homeName} x ${awayName} ${awayFlag}${scoreText}\nConfira os detalhes da partida direto pelo app: ${url}`;

    if (navigator.share) {
      navigator.share({
        title,
        text
      }).catch(err => console.error('Erro ao compartilhar', err));
    } else {
      navigator.clipboard.writeText(text)
        .then(() => alert('Link da partida copiado para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar link', err));
    }
  }

  onClose() {
    this.closeModal.emit();
  }
}
