# 09 - Novo Dashboard Personalizado e Rota de Partidas

## Objetivo
Mover a listagem completa de partidas da página inicial (Dashboard) para uma nova rota própria chamada "Partidas". O Dashboard atual será totalmente reformulado para se tornar um painel personalizado e focado no usuário, destacando informações sobre sua seleção favorita.

## Requisitos e Funcionalidades

### 1. Nova Rota e Menu "Partidas"
- Criar um novo componente de rota `MatchesPageComponent`.
- Mover o `MatchListComponent`, a lógica de filtros e controle de URL que estavam no Dashboard para esta nova página.
- Adicionar a rota `/partidas` no `app.routes.ts`.
- Adicionar o novo item "Partidas" na barra lateral de navegação (Sidebar).
- Atualizar a internacionalização (`i18n.service.ts`) para englobar as traduções de menu ("Matches" / "Partidas").

### 2. Reformulação do Dashboard (Página Inicial)
- **Seletor de Seleção Favorita**:
  - Um dropdown/modal permitindo ao usuário escolher uma das 48 seleções participantes.
  - A escolha deverá ser salva no `localStorage` do navegador para persistência.
- **Destaque da Seleção Favorita**:
  - Exibição de cards informativos com dados da seleção escolhida (bandeira, grupo, informações gerais).
  - Um card dedicado para exibir a **Próxima Partida** (ou partida atual) da seleção favorita de forma isolada e em destaque.
- **Classificação do Grupo**:
  - Um widget integrado que exibe a tabela de classificação apenas do grupo ao qual a seleção favorita pertence.
  - A lógica irá extrair automaticamente a classificação da API com base no grupo mapeado da equipe selecionada.
- **Estado Vazio (Empty State)**:
  - Caso nenhuma seleção favorita tenha sido escolhida ainda, a página deve apresentar um convite atrativo centralizado pedindo ao usuário para configurar sua equipe e desbloquear a experiência personalizada.

### 3. Impacto na Arquitetura
- O `DashboardComponent` perderá as responsabilidades de manter e filtrar a lista com todas as partidas (migradas para `MatchesPageComponent`).
- Será preciso criar serviços ou funções *computed* (no Angular v17+ com Signals) que derivem o "Próximo Jogo" a partir da lista geral filtrando pela seleção salva no storage.
- A requisição para buscar as classificações (`getStandings`) será invocada dentro do Dashboard para extrair a porção referente à seleção do usuário.
- O novo layout será desenhado usando um sistema de **Grid/Widgets**, permitindo futuramente a inclusão de painéis independentes (ex: notícias, artilheiro da copa, placar geral).
