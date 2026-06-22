# Rota Direta para Detalhes da Partida

O objetivo é mapear a abertura do modal de detalhes da partida para a URL, de modo que seja possível compartilhar o link direto de uma partida específica (ex: `/?match=12345`). O modal se abrirá automaticamente caso esse parâmetro esteja presente.

## User Review Required
Nenhum impacto visual negativo; os detalhes continuarão abrindo como um Modal por cima do Dashboard, a única diferença é que a URL mudará.

## Proposed Changes

### [features/dashboard/dashboard.component.ts]

#### [MODIFY] [dashboard.component.ts](file:///d:/moises/Projetos/copa/src/app/features/dashboard/dashboard.component.ts)
- **Imports**: Importar `ActivatedRoute` e `Router` do `@angular/router`. Importar `effect` do `@angular/core`.
- **Injeção**: Injetar as dependências `route` e `router` no construtor ou via `inject()`.
- **Lógica de Estado (ngOnInit e Observables)**:
  - Assinar o `this.route.queryParams` para escutar mudanças no parâmetro `match`.
  - Como a lista de partidas (`matches()`) vem da API, precisamos garantir que o modal só abra **depois** que a API carregar.
  - O código atualizará o `selectedMatch` baseando-se no `matchId` vindo da URL comparado com a lista carregada `matches()`.
- **onMatchSelected**:
  - Quando o usuário clicar no card, não altera o `selectedMatch` diretamente. Em vez disso, chama o `Router` para adicionar `?match=ID` à URL (mantendo os filtros existentes).
- **closeModal**:
  - Ao fechar o modal, usa o `Router` para remover `?match=null` da URL.

## Verification Plan

### Manual Verification
- Clicar numa partida e ver o modal abrir, verificando se a URL ganha o parâmetro `?match=ID`.
- Fechar o modal e ver o parâmetro sumir.
- Recarregar a página (F5) tendo o parâmetro de partida na URL e confirmar se o sistema carrega os dados da FIFA e, em seguida, abre automaticamente o modal sobreposto.
