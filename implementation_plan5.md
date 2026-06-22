# Sincronização de Filtros com a URL

O objetivo é transformar o estado local dos filtros (status, fase, grupo, continente, seleção) em parâmetros de URL (`queryParams`), permitindo que a página seja favoritada ou compartilhada mantendo a pesquisa ativa.

## Open Questions
- Nenhum. A implementação utilizará o `ActivatedRoute` padrão do Angular.

## Proposed Changes

### [features/matches/match-list]

#### [MODIFY] [match-list.component.ts](file:///d:/moises/Projetos/copa/src/app/features/matches/match-list/match-list.component.ts)
- **Imports:** Adicionar `ActivatedRoute` e `Router` de `@angular/router`. Também importar `OnInit`.
- **Injeção:** Injetar `router` e `route` no construtor.
- **ngOnInit:** Se inscrever em `this.route.queryParams`. Quando houver mudanças:
  - Atualizar os *signals* (`activeFilter`, `selectedStage`, `selectedGroup`, `selectedTeam`, `selectedContinent`) com os valores da URL. (Usar `'ALL'` como fallback caso o parâmetro não exista).
  - Chamar `this.applyFilter()`.
- **Setters dos Filtros:** Modificar os métodos `setStatusFilter`, `setStageFilter`, `setGroupFilter`, etc.
  - Ao invés de mudar diretamente os *signals*, usar o `this.router.navigate([], { relativeTo: this.route, queryParams: { ... }, queryParamsHandling: 'merge' })`.
  - A mudança na URL vai triggar a subscription no `ngOnInit`, que por sua vez altera os *signals* e filtra a lista real, fechando o ciclo reativo de forma limpa.

## Verification Plan

### Manual Verification
- Clicar nos filtros de Dashboard.
- Observar a URL mudando de `http://localhost:4200/` para `http://localhost:4200/?status=LIVE&stage=Final`, etc.
- Atualizar a página no navegador (F5) para checar se a página carrega respeitando os filtros que estão na URL.
