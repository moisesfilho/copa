# Live Match Update Service

O objetivo deste plano é criar um mecanismo para consultar a API da FIFA a cada 10 segundos, detectando partidas ao vivo e atualizando os placares e eventos em tempo real, sem necessidade de recarregar a página.

## Open Questions

Nenhuma no momento. O plano abaixo garante que a interface reflita imediatamente as mudanças de placar e status do jogo (tempo, gols, etc).

## Proposed Changes

### 1. `src/app/core/services/live-update.service.ts`

- **[NEW]** Criação do serviço `LiveUpdateService`.
- Utiliza `timer(0, 10000)` do RxJS para realizar o *polling* a cada 10 segundos.
- Busca o calendário de partidas e filtra aquelas com `MatchStatus === 3` (Ao Vivo).
- Para cada partida ao vivo, busca a respectiva linha do tempo (`getMatchTimeline`) para extrair gols e cartões atualizados.
- Armazena os dados mais recentes em dois Signals globais: `liveMatchUpdates` (dados da partida, placares e tempo) e `liveEventUpdates` (lista de gols/cartões).

### 2. `src/app/app.ts`

- **[MODIFY]** `app.ts`
- Injetar o `LiveUpdateService` e invocar o método `startPolling()` no `ngOnInit()` para que a verificação rode silenciosamente em background durante toda a navegação do usuário.

### 3. `src/app/features/matches/match-card/match-card.component.ts`

- **[MODIFY]** `match-card.component.ts`
- Injetar o `LiveUpdateService`.
- Atualizar os métodos (getters) como `homeScore`, `awayScore`, e `isLive` para verificar primeiro se existe uma versão atualizada daquela partida no `LiveUpdateService.liveMatchUpdates()`. Se existir, usar o placar novo; caso contrário, usar o original (`@Input() match`).
- Fazer a mesma interceptação para o `@Input() events`, garantindo que os gols apareçam no card ao vivo instantaneamente quando a API detectar.

### 4. `src/app/features/dashboard/dashboard.component.ts`

- **[MODIFY]** `dashboard.component.ts`
- Ocultar/Exibir cards dependendo do novo estado. A lista de `liveMatches()` atualmente depende do array fixo. Iremos ajustar a lógica para que as partidas que *entrarem* no estado ao vivo pelo `LiveUpdateService` também apareçam dinamicamente no painel de "Ao Vivo Agora".

## Verification Plan

- Após implementar, a aplicação fará requisições a cada 10 segundos para buscar os placares.
- Qualquer alteração na resposta (ex: um gol) refletirá no componente `<app-match-card>` instantaneamente.
- Verificarei no Network tab do navegador se o polling está rodando a cada 10 segundos.
