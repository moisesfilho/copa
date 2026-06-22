# Detalhes da Partida (Match Detail Modal)

A pedido do usuário, implementaremos uma funcionalidade para exibir todos os detalhes ricos de uma partida (estádio, público, clima, árbitros, táticas, etc.) ao clicar no card de um jogo.

## User Review Required

> [!IMPORTANT]
> A implementação propõe o uso de um **Modal flutuante (Overlay)** em vez de uma nova página de navegação (`/partida/:id`).
> Um Modal preserva a experiência fluida do dashboard, permitindo que o usuário visualize os detalhes sem perder o contexto dos filtros e rolagens já aplicados. Você concorda com essa abordagem?

## Proposed Changes

### Componentes

#### [NEW] `src/app/features/matches/match-detail-modal/match-detail-modal.component.ts`
Componente standalone que receberá o objeto da partida selecionada via `@Input()`.
Conterá um `@Output() close` para fechar o modal.

#### [NEW] `src/app/features/matches/match-detail-modal/match-detail-modal.component.html`
Layout Glassmorphism com as seguintes informações detalhadas da API:
- Estádio e Cidade
- Data e Hora local
- Público presente (Attendance)
- Equipe de Arbitragem (Officials)
- Táticas escaladas de ambas seleções (ex: 4-3-3)
- Clima (se disponível)

#### [NEW] `src/app/features/matches/match-detail-modal/match-detail-modal.component.css`
Estilização do overlay em z-index alto, cobrindo a tela toda com um fundo esfumaçado (backdrop-filter) e uma janela de detalhes centralizada e responsiva.

### Modificações

#### [MODIFY] `src/app/features/matches/match-card/match-card.component.ts` & `.html`
- Adicionar evento de clique no card para emitir a partida atual (`@Output() matchClicked = new EventEmitter<any>()`).
- Adicionar estilo de cursor interativo (`cursor: pointer` e hover-state).

#### [MODIFY] `src/app/features/matches/match-list/match-list.component.ts` & `.html`
- Repassar o evento `matchClicked` do card para cima (para o Dashboard).

#### [MODIFY] `src/app/features/dashboard/dashboard.component.ts` & `.html`
- Criar estado `selectedMatch = signal<any | null>(null)`.
- Adicionar a tag `<app-match-detail-modal>` renderizada condicionalmente (`@if (selectedMatch())`).
- Função para escutar os cliques e atualizar o `selectedMatch`.

## Verification Plan

### Manual Verification
1. O usuário abrirá a aplicação em tela cheia e dispositivo móvel.
2. Ao clicar em um card, a interface não deve pular (scroll lock).
3. O modal deve exibir as táticas, estádio e árbitros.
4. Ao clicar no botão de fechar (X) ou fora da área do modal (overlay), o modal deverá fechar suavemente.
