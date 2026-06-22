import { Injectable, signal, computed } from '@angular/core';

export type Language = 'pt' | 'en';

export interface Translations {
  menu: any;
  filters: any;
  dashboard: any;
  standings: any;
  match: any;
  continents: { [key: string]: string };
}

const TRANSLATIONS: Record<Language, Translations> = {
  pt: {
    menu: {
      title: 'Copa 2026',
      dashboard: 'Dashboard',
      standings: 'Classificação',
      install: '📲 Instalar App'
    },
    filters: {
      title: 'Filtros',
      all: 'Todos',
      live: 'Ao Vivo',
      finished: 'Encerrados',
      upcoming: 'Próximos',
      stage: 'Fase',
      group: 'Grupo',
      team: 'Seleção',
      continent: 'Continente',
      clear: 'Limpar',
      filteredMatches: 'Partidas Filtradas',
      noMatches: 'Nenhuma partida encontrada para os filtros selecionados.'
    },
    dashboard: {
      title: 'Copa do Mundo 2026',
      total: 'Total de Jogos',
      finished: 'Encerrados',
      percent: 'Concluídos (%)',
      loading: 'Carregando dados da FIFA...'
    },
    standings: {
      title: 'Classificação',
      subtitle: 'Acompanhe a tabela detalhada com os critérios de desempate oficiais da FIFA.',
      loading: 'Calculando tabelas e saldos de gols...',
      emptyTitle: 'Nenhuma tabela gerada',
      emptyDesc: 'Não há dados de fase de grupos disponíveis no momento.',
      team: 'Seleção',
      pts: 'PTS',
      p: 'J',
      w: 'V',
      d: 'E',
      l: 'D',
      gf: 'GP',
      ga: 'GC',
      gd: 'SG'
    },
    match: {
      live: 'AO VIVO',
      finished: 'FIM',
      tactics: 'Formação',
      attendance: 'Público',
      referee: 'Árbitro',
      weather: 'Clima',
      noInfo: 'Não disponível',
      loadingDetails: 'Carregando detalhes da partida...',
      goals: 'Gols da Partida',
      penalty: 'Pênalti',
      ownGoal: 'Gol contra',
      stadium: 'Estádio',
      date: 'Data e Hora',
      localTime: 'Local',
      officials: 'Equipe de Arbitragem',
      stats: 'Estatísticas da Partida',
      possession: 'Posse de Bola',
      inContest: 'em disputa',
      attempts: 'Finalizações',
      passes: 'Passes Certos',
      corners: 'Escanteios',
      yellowCards: 'Cartões Amarelos'
    },
    continents: {
      'África (CAF)': 'África (CAF)',
      'América do Sul (CONMEBOL)': 'América do Sul (CONMEBOL)',
      'América do Norte/Central (CONCACAF)': 'América do Norte/Central (CONCACAF)',
      'Ásia (AFC)': 'Ásia (AFC)',
      'Oceania (OFC)': 'Oceania (OFC)',
      'Europa (UEFA)': 'Europa (UEFA)'
    }
  },
  en: {
    menu: {
      title: 'World Cup 2026',
      dashboard: 'Dashboard',
      standings: 'Standings',
      install: '📲 Install App'
    },
    filters: {
      title: 'Filters',
      all: 'All',
      live: 'Live',
      finished: 'Finished',
      upcoming: 'Upcoming',
      stage: 'Stage',
      group: 'Group',
      team: 'Team',
      continent: 'Continent',
      clear: 'Clear',
      filteredMatches: 'Filtered Matches',
      noMatches: 'No matches found for the selected filters.'
    },
    dashboard: {
      title: 'World Cup 2026',
      total: 'Total Matches',
      finished: 'Finished',
      percent: 'Completed (%)',
      loading: 'Loading FIFA data...'
    },
    standings: {
      title: 'Standings',
      subtitle: 'Follow the detailed table with official FIFA tiebreaker criteria.',
      loading: 'Calculating tables and goal differences...',
      emptyTitle: 'No tables generated',
      emptyDesc: 'There is no group stage data available at the moment.',
      team: 'Team',
      pts: 'PTS',
      p: 'P',
      w: 'W',
      d: 'D',
      l: 'L',
      gf: 'GF',
      ga: 'GA',
      gd: 'GD'
    },
    match: {
      live: 'LIVE',
      finished: 'FT',
      tactics: 'Formation',
      attendance: 'Attendance',
      referee: 'Referee',
      weather: 'Weather',
      noInfo: 'Not available',
      loadingDetails: 'Loading match details...',
      goals: 'Match Goals',
      penalty: 'Penalty',
      ownGoal: 'Own Goal',
      stadium: 'Stadium',
      date: 'Date & Time',
      localTime: 'Local',
      officials: 'Match Officials',
      stats: 'Match Statistics',
      possession: 'Ball Possession',
      inContest: 'in contest',
      attempts: 'Attempts at Goal',
      passes: 'Completed Passes',
      corners: 'Corners',
      yellowCards: 'Yellow Cards'
    },
    continents: {
      'África (CAF)': 'Africa (CAF)',
      'América do Sul (CONMEBOL)': 'South America (CONMEBOL)',
      'América do Norte/Central (CONCACAF)': 'North/Central America (CONCACAF)',
      'Ásia (AFC)': 'Asia (AFC)',
      'Oceania (OFC)': 'Oceania (OFC)',
      'Europa (UEFA)': 'Europe (UEFA)'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentLang = signal<Language>('pt');
  
  t = computed(() => TRANSLATIONS[this.currentLang()]);

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'pt' ? 'en' : 'pt');
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }
}
