# Estatísticas Avançadas da Partida

A pedido do usuário, vamos integrar as APIs avançadas de dados estatísticos (FDH API) para enriquecer o Modal de Detalhes da Partida com informações profundas de jogo.

## User Review Required

> [!IMPORTANT]
> A API de estatísticas requer um ID específico (`IdIFES`), que vem embutido na propriedade `Properties.IdIFES` do jogo.
> Iremos processar as estatísticas puras (como matrizes de dados) para extrair os "Highlights" do jogo (Posse de Bola, Finalizações, Passes e etc). Você aprova a criação de abas ou seções dentro do Modal para separar essas estatísticas dos dados gerais?

## Open Questions

> [!TIP]
> A API `players.json` retorna as métricas de cada jogador individualmente. Você quer que a gente construa uma tabela com os "Top Jogadores" da partida (baseado no Power Ranking) ou prefere focar nas estatísticas coletivas das Seleções (`teams.json`) num primeiro momento?
> *No plano abaixo, incluiremos o coletivo das Seleções e um destaque dos top jogadores do Power Ranking.*

## Proposed Changes

### Serviços

#### [MODIFY] `src/app/core/services/fifa-api.service.ts`
Adicionar os novos endpoints de chamadas HTTP para o domínio `fdh-api.fifa.com`:
- `getMatchTeamStats(idIfes: string)` -> `/v1/stats/match/{id}/teams.json`
- `getMatchPowerRanking(idIfes: string)` -> `/v1/powerranking/match/{id}.json`
- *Nota:* Não usaremos o `players.json` bruto inicialmente se o `powerranking` já nos fornecer os jogadores em destaque formatados, para não sobrecarregar a memória, a não ser que seja necessário.

### Componentes

#### [MODIFY] `src/app/features/matches/match-detail-modal/match-detail-modal.component.ts`
- Implementar `ngOnChanges` para escutar quando o `@Input() match` for atribuído.
- Fazer a chamada simultânea (usando `forkJoin` ou RxJS) para buscar os dados avançados caso `match.Properties?.IdIFES` exista.
- Criar funções de "parser" para converter o retorno bruto `[["BallPossession", 45, true], ...]` num dicionário fácil do Angular renderizar: `{ posse: 45, finalizacoes: 3, passes: 300 }`.

#### [MODIFY] `src/app/features/matches/match-detail-modal/match-detail-modal.component.html`
- Adicionar uma nova seção no final do body chamada "Estatísticas do Jogo".
- Criar barras de progresso comparativas (ex: Posse de bola `Brasil 60% ---------- 40% Argentina`).
- Mostrar Top Jogadores baseados no Power Ranking (se disponível).

#### [MODIFY] `src/app/features/matches/match-detail-modal/match-detail-modal.component.css`
- Estilizar as barras de estatísticas e as listas de jogadores em destaque.

## Verification Plan

### Automated Tests
Não aplicável no momento (sem suíte de testes E2E).

### Manual Verification
1. Abrir a aplicação e clicar num jogo já encerrado (Status 0).
2. O modal deverá exibir um loading sutil na seção inferior enquanto busca os dados da FDH API.
3. Barras de progresso de posse de bola e chutes a gol devem estar renderizadas comparando a cor de casa e de fora.
