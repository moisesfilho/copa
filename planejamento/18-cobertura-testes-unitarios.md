# Meta: 100% de Cobertura nos Testes Unitários

Este plano detalha a estratégia para atingir (ou chegar muito perto de) 100% de cobertura nos testes unitários do projeto, atacando as áreas que atualmente possuem cobertura zero ou muito baixa.

## Estratégia Geral

Para alcançar 100% de cobertura, focaremos na injeção de dependências (usando os mocks adequados) e na validação das regras de negócio sem envolver o DOM de forma complexa quando não necessário. Usaremos a estrutura do `vitest` e do `@angular/core/testing`.

## Componentes e Serviços a Serem Testados

### 1. Serviços Principais (Core Services)
Atualmente a maioria dos serviços está com cobertura quase zerada.

#### [NEW] `src/app/core/services/fifa-api.service.spec.ts`
- **O que será testado:** 
  - Comportamento de inicialização.
  - Funções `getMatches`, `getMatchEvents`, `getStandings`.
  - Tratamento de parâmetros dinâmicos de linguagem (`pt-BR`, `en-GB`, etc).
  - Mock da função `fetch` global.

#### [NEW] `src/app/core/services/i18n.service.spec.ts`
- **O que será testado:** 
  - Lógica de alternância de idiomas (`toggleLang`).
  - Atualização do signal `currentLang` e persistência no `localStorage`.
  - Tradução de estágios (`translateStage`) retornando a tradução correta para 'Group', 'Round of 16', 'Final', etc., tanto em português quanto inglês.

#### [NEW] `src/app/core/services/live-update.service.spec.ts`
- **O que será testado:** 
  - Inicialização do `setInterval` ao chamar `startPolling()`.
  - Limpeza do intervalo em `stopPolling()`.
  - Processamento correto da fila de promessas de API para atualizar `liveMatchUpdates` e `liveEventUpdates`.

#### [NEW] `src/app/core/services/notification.service.spec.ts`
- **O que será testado:** 
  - Manipulação do Service Worker e das permissões de `Notification`.
  - Mock do objeto global `Notification` para testar os fluxos de permissão (granted/denied).
  - Teste da lógica do `checkPermission` e `requestPermission`.

### 2. Utilitários (Utils)

#### [NEW] `src/app/core/utils/advanced-stats-calculator.spec.ts`
- **O que será testado:** 
  - Geração dos dados de posse de bola (Ball Possession).
  - Cálculos de eficácia de ataque, intensidade e disciplina baseados em dados reais ou mockados da estrutura de eventos da partida.

### 3. Componentes de Interface

#### [MODIFY] `src/app/features/matches/match-detail-modal/match-detail-modal.component.spec.ts`
A cobertura do modal está em 0.59%. É o componente mais crítico no momento.
- **O que será testado:** 
  - Testar a inicialização (ngOnChanges e ngOnInit) ao receber o objeto `match`.
  - Comportamento da aba Timeline vs Advanced Stats.
  - Testar formatação de eventos (gols, cartões).
  - Teste de chamadas à API (mockada) quando o `IdIFES` é detectado.
  - Verificação se o evento `closeModal` é emitido corretamente.

#### [MODIFY] `src/app/features/matches/match-card/match-card.component.spec.ts`
- **O que será testado:** 
  - Lógica de propriedades calculadas (getters para pênaltis, extra-time, placares).
  - Evento `matchClicked.emit()`
  - Comportamento no `isDashboardMode` (abreviações).

#### [MODIFY] `src/app/features/bracket/bracket.component.spec.ts`
A cobertura do chaveamento já tem testes, mas parou em ~68%.
- **O que será testado:** 
  - Testar as funções de projeção e a árvore de posicionamento (`matchOrderScore`), além dos fluxos de `openMatchDetails` e `closeMatchDetails`.

## Plano de Verificação

1. **Rodar os Testes Constantemente:** Durante a criação, rodaremos os testes isolados e em suíte via `npm run test` para garantir que passam.
2. **Avaliação da Cobertura:** Após adicionar os testes de cada bloco, rodaremos o comando `npm run test -- --coverage` para aferir se os números chegam à métrica alvo (100%).
3. **Resiliência e Ausência de Side-Effects:** Certificar que nenhum teste vazará estado ou intervalo assíncrono para os demais (lidando bem com timers no Jest/Vitest).

> [!WARNING]
> Alcançar exatamente `100.00%` pode exigir mocks extremamente minuciosos de APIs nativas como LocalStorage, ServiceWorkers e Timers. O foco será chegar nos 100%, mas pequenas frações decimais (ex: 99.5%) podem ser aceitáveis caso exijam hacks pesados contra o ciclo de vida do Angular.

## Dúvidas em Aberto

Alguma área da aplicação precisa ser evitada neste ciclo ou posso prosseguir testando todos os itens listados acima?
