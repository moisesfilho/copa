# Project Live Match Winners on Bracket View

## Goal
Analisar as partidas em andamento e projetar o vencedor (quem tem maior saldo de gols) para as próximas partidas eliminatórias que aguardam o resultado (utilizando os campos `PlaceHolderA` e `PlaceHolderB`).

## Proposed Changes

### `src/app/features/bracket/bracket.component.ts`
- Implementar as interfaces `OnInit` e `OnDestroy` para gerenciar o polling de partidas ao vivo, garantindo que o placar na tela de chaveamento se atualize dinamicamente.
- `ngOnInit`: Chamar `this.liveUpdate.startPolling()`.
- `ngOnDestroy`: Chamar `this.liveUpdate.stopPolling()`.
- Criar a função auxiliar `getProjectedTeam(placeholder, matchByNumber)` que parseia o `placeholder` (ex: "W73"), encontra a partida base e determina o vencedor se ela estiver ao vivo (`MatchStatus === 3`) e sem empate.
- Atualizar a computed property `knockoutMatches` para mesclar as atualizações de `liveMatchUpdates` nas partidas atuais, mapear todas pelo seu `MatchNumber` e, se `Home` ou `Away` não existirem, checar o `placeholder` para injetar o time projetado na partida seguinte.

### `src/app/features/bracket/bracket.component.css`
- (Opcional) Poderíamos adicionar uma classe ou indicador visual para projeções, mas como o usuário pediu apenas que "deve ser exibida como adversária do Brasil", o preenchimento dos dados do time (bandeira, nome) é suficiente para o card da partida. Não prevejo alterações de CSS além do necessário.

## Verification Plan
1. Atualizar o arquivo mock no Spec para verificar se a projeção funciona corretamente quando simulamos uma partida ao vivo.
2. Aguardar a aprovação e depois aplicar o código e comitar.
