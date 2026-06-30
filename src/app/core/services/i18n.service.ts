import { Injectable, signal, computed } from '@angular/core';

export type Language = 'pt' | 'en';

export interface Translations {
  menu: any;
  filters: any;
  matches: any;
  dashboard: any;
  standings: any;
  match: any;
  about: any;
  settings: any;
  bracket: any;
  continents: { [key: string]: string };
}

const TRANSLATIONS: Record<Language, Translations> = {
  pt: {
    menu: {
      title: 'Copados 2026',
      dashboard: 'Dashboard',
      matches: 'Partidas',
      standings: 'Classificação',
      about: 'Sobre',
      settings: 'Configurações',
      bracket: 'Chaveamento',
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
      noMatches: 'Nenhuma partida encontrada para os filtros selecionados.',
      sortOldest: 'Mais Antigos',
      sortNewest: 'Mais Recentes',
      sortTitleOldest: 'Do mais antigo para o mais recente',
      sortTitleNewest: 'Do mais recente para o mais antigo',
      definedOnly: 'Apenas Definidas',
      definedShowAll: 'Mostrar Indefinidas',
      definedTitleOnly: 'Mostrar todas as partidas',
      definedTitleAll: 'Ocultar partidas sem seleções definidas'
    },
    matches: {
      title: 'Partidas da Copa',
      subtitle: 'Acompanhe os resultados, horários e locais de todos os confrontos.'
    },
    dashboard: {
      title: 'Copados 2026',
      subtitle: 'Acompanhe de perto as estatísticas do torneio e os jogos em destaque.',
      total: 'Total de Jogos',
      finished: 'Encerrados',
      percent: 'Concluídos (%)',
      loading: 'Carregando dados da FIFA...',
      favTeamLabel: 'Seleção Favorita:',
      favTeamPlaceholder: '-- Escolha uma seleção --',
      liveNow: 'Ao Vivo Agora',
      nextMatchGlobal: 'Próxima Partida (Geral)',
      nextMatchFav: 'Próxima Partida (Sua Seleção)',
      noMatchScheduled: 'Nenhuma partida programada.',
      noMatchFoundFor: 'Nenhuma partida encontrada para',
      groupStandings: 'Classificação do Grupo',
      noGroupDataFor: 'Não há dados de fase de grupos para',
      topScorers: 'Artilheiros',
      loadingData: 'Carregando dados...',
      noGoals: 'Nenhum gol registrado.',
      fromYourFav: 'Da sua seleção favorita',
      finishedMatches: 'Partidas Encerradas',
      loadingMatchDetails: 'Carregando detalhes das partidas...',
      noFinishedMatchesFor: 'Nenhuma partida encerrada encontrada para',
      welcomeTitle: 'Bem-vindo(a) à Copa de 2026!',
      welcomeDesc: 'Para uma experiência personalizada, escolha sua seleção favorita no menu superior e acompanhe de perto todos os jogos e a classificação do grupo dela.',
      details: 'Detalhes ➔',
      player: 'Jogador'
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
    settings: {
      title: 'Configurações',
      description: 'Personalize sua experiência no Copados 2026.',
      notifications: 'Notificações de Partidas (Push)',
      notifyAll: 'Todas as Partidas',
      notifyAllDesc: 'Receber um alerta antes de qualquer partida começar.',
      notifyFavorite: 'Minha Seleção Favorita',
      notifyFavoriteDesc: 'Receber um alerta apenas quando a seleção que você escolheu for jogar.',
      notifyTime: 'Antecedência do Alerta',
      notifyTimeDesc: 'Quantos minutos antes do jogo você deseja ser avisado.',
      minutes: 'minutos'
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
    about: {
      title: 'Copados 2026',
      description: 'Bem-vindo ao **Copados 2026**, uma aplicação moderna desenvolvida para você acompanhar de perto todas as emoções, partidas e resultados da Copa do Mundo.',
      featuresTitle: '✨ Principais Funcionalidades',
      features: [
        '**Chaveamento (Mata-mata)**: Árvore completa das fases eliminatórias com suporte a cruzamentos em tempo real.',
        '**Detalhes da Partida**: Estatísticas avançadas, posse de bola, escalações, eventos e equipe de arbitragem.',
        '**Notificações Push**: Alertas configuráveis para não perder nenhum jogo da sua seleção ou do torneio.',
        '**Filtros Inteligentes**: Navegue pelas partidas buscando por fase, grupo ou país.',
        '**Acompanhamento Ao Vivo**: Atualizações de placares, gols e cartões em tempo real.',
        '**Seleção Favorita**: Escolha o seu país do coração e tenha o painel principal focado nas estatísticas da sua seleção.',
        '**Lista de Artilheiros**: Fique de olho nos jogadores que mais balançaram a rede.',
        '**Classificação dos Grupos**: Acompanhe o desempenho das seleções na fase de grupos.',
        '**Internacionalização**: Suporte nativo para Português e Inglês.',
        '**Dark Mode**: Opção de tema claro e escuro.'
      ],
      mobileTitle: '📱 Experiência Mobile & Instalação',
      mobile: [
        '**100% Responsivo**: Layout que se adapta perfeitamente em todas as telas.',
        '**PWA (Instalável)**: Instale o aplicativo diretamente no seu celular ou desktop.'
      ],
      dataTitle: '📊 Dados Oficiais',
      dataDesc: 'Todos os resultados e eventos são consumidos diretamente e **oficialmente pela API pública da FIFA**.',
      developerTitle: '👨‍💻 Desenvolvedor',
      developerDesc: 'Desenvolvido com dedicação por **Moisés Filho**, Líder e Gestor em Tecnologia da Informação com mais de 19 anos de experiência, sendo 15 anos focados em liderança de times, arquitetura de software e cultura DevOps/SRE.',
      developerLink: 'Ver currículo'
    },
    continents: {
      'África (CAF)': 'África (CAF)',
      'América do Sul (CONMEBOL)': 'América do Sul (CONMEBOL)',
      'América do Norte/Central (CONCACAF)': 'América do Norte/Central (CONCACAF)',
      'Ásia (AFC)': 'Ásia (AFC)',
      'Oceania (OFC)': 'Oceania (OFC)',
      'Europa (UEFA)': 'Europa (UEFA)'
    },
    bracket: {
      title: 'Chaveamento',
      subtitle: 'Acompanhe as fases eliminatórias da Copa do Mundo.',
      roundOf32: 'Dezesseis-avos de Final',
      roundOf16: 'Oitavas de Final',
      quarterFinals: 'Quartas de Final',
      semiFinals: 'Semifinal',
      thirdPlace: 'Disputa do 3º Lugar',
      final: 'Final',
      tbd: 'A Definir'
    }
  },
  en: {
    menu: {
      title: 'Copados 2026',
      dashboard: 'Dashboard',
      matches: 'Matches',
      standings: 'Standings',
      about: 'About',
      settings: 'Settings',
      bracket: 'Bracket',
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
      noMatches: 'No matches found for the selected filters.',
      sortOldest: 'Oldest First',
      sortNewest: 'Newest First',
      sortTitleOldest: 'From oldest to newest',
      sortTitleNewest: 'From newest to oldest',
      definedOnly: 'Defined Only',
      definedShowAll: 'Show Undefined',
      definedTitleOnly: 'Show all matches',
      definedTitleAll: 'Hide matches with undefined teams'
    },
    matches: {
      title: 'World Cup Matches',
      subtitle: 'Follow the results, schedules, and venues of all matchups.'
    },
    dashboard: {
      title: 'Copados 2026',
      subtitle: 'Closely follow the tournament stats and featured matches.',
      total: 'Total Matches',
      finished: 'Finished',
      percent: 'Completed (%)',
      loading: 'Loading FIFA data...',
      favTeamLabel: 'Favorite Team:',
      favTeamPlaceholder: '-- Choose a team --',
      liveNow: 'Live Now',
      nextMatchGlobal: 'Next Match (Global)',
      nextMatchFav: 'Next Match (Your Team)',
      noMatchScheduled: 'No match scheduled.',
      noMatchFoundFor: 'No match found for',
      groupStandings: 'Group Standings',
      noGroupDataFor: 'No group stage data for',
      topScorers: 'Top Scorers',
      loadingData: 'Loading data...',
      noGoals: 'No goals recorded.',
      fromYourFav: 'From your favorite team',
      finishedMatches: 'Finished Matches',
      loadingMatchDetails: 'Loading match details...',
      noFinishedMatchesFor: 'No finished match found for',
      welcomeTitle: 'Welcome to the 2026 World Cup!',
      welcomeDesc: 'For a personalized experience, choose your favorite team in the top menu and closely follow all their matches and group standings.',
      details: 'Details ➔',
      player: 'Player'
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
    settings: {
      title: 'Settings',
      description: 'Personalize your experience in Copados 2026.',
      notifications: 'Match Notifications (Push)',
      notifyAll: 'All Matches',
      notifyAllDesc: 'Receive an alert before any match starts.',
      notifyFavorite: 'My Favorite Team',
      notifyFavoriteDesc: 'Receive an alert only when your chosen team is about to play.',
      notifyTime: 'Alert Lead Time',
      notifyTimeDesc: 'How many minutes before the game you want to be notified.',
      minutes: 'minutes'
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
    about: {
      title: 'Copados 2026',
      description: 'Welcome to **Copados 2026**, a modern application developed for you to closely follow all the emotions, matches, and results of the World Cup.',
      featuresTitle: '✨ Main Features',
      features: [
        '**Bracket View**: Complete knockout stage tree with real-time matchup projections.',
        '**Match Details**: Advanced statistics, ball possession, lineups, events, and referee team.',
        '**Push Notifications**: Configurable alerts so you never miss a match from your team or the tournament.',
        '**Smart Filters**: Navigate through matches by searching by stage, group, or country.',
        '**Live Tracking**: Real-time updates of scores, goals, and cards.',
        '**Favorite Team**: Choose your favorite country and have the main panel focused on its statistics.',
        '**Top Scorers**: Keep an eye on the players who have scored the most goals.',
        '**Group Standings**: Track team performance in the group stage.',
        '**Internationalization**: Native support for English and Portuguese.',
        '**Dark Mode**: Light and dark theme options.'
      ],
      mobileTitle: '📱 Mobile Experience & Installation',
      mobile: [
        '**100% Responsive**: Layout that adapts perfectly on all screens.',
        '**PWA (Installable)**: Install the application directly on your phone or desktop.'
      ],
      dataTitle: '📊 Official Data',
      dataDesc: 'All results and events are consumed directly and **officially from the public FIFA API**.',
      developerTitle: '👨‍💻 Developer',
      developerDesc: 'Developed with dedication by **Moisés Filho**, an IT Leader and Manager with over 19 years of experience, including 15 years focused on team leadership, software architecture, and DevOps/SRE culture.',
      developerLink: 'View resume'
    },
    continents: {
      'África (CAF)': 'Africa (CAF)',
      'América do Sul (CONMEBOL)': 'South America (CONMEBOL)',
      'América do Norte/Central (CONCACAF)': 'North/Central America (CONCACAF)',
      'Ásia (AFC)': 'Asia (AFC)',
      'Oceania (OFC)': 'Oceania (OFC)',
      'Europa (UEFA)': 'Europe (UEFA)'
    },
    bracket: {
      title: 'Bracket',
      subtitle: 'Follow the World Cup knockout stages.',
      roundOf32: 'Round of 32',
      roundOf16: 'Round of 16',
      quarterFinals: 'Quarter-finals',
      semiFinals: 'Semi-finals',
      thirdPlace: 'Play-off for third place',
      final: 'Final',
      tbd: 'TBD'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentLang = signal<Language>(
    (typeof localStorage !== 'undefined' && localStorage ? localStorage.getItem('language') as Language : null) || 'pt'
  );

  t = computed(() => TRANSLATIONS[this.currentLang()]);

  toggleLanguage() {
    this.currentLang.update(lang => {
      const newLang = lang === 'pt' ? 'en' : 'pt';
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.setItem('language', newLang);
      }
      return newLang;
    });
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('language', lang);
    }
  }
}
