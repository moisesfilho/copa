# Implementação de Internacionalização (i18n)

Este documento descreve o plano técnico para implementar a internacionalização em tempo real (Runtime i18n) na aplicação, permitindo que o usuário alterne dinamicamente entre Português (padrão) e Inglês sem recarregar a página.

## User Review Required

> [!IMPORTANT]  
> A tradução ocorrerá em duas frentes diferentes: **Traduções Estáticas** (botões, menus, cabeçalhos de tabela) e **Traduções Dinâmicas** (nomes de times, fases, estádios, árbitros que vêm da API da FIFA). Precisamos recarregar os dados da API sempre que o usuário mudar o idioma. Você concorda com essa estratégia de recarregamento dinâmico em segundo plano?

## Open Questions

> [!WARNING]  
> Atualmente, os filtros baseados em continentes ("América do Sul (CONMEBOL)", "Europa (UEFA)") são mapeados internamente usando strings fixas. Ao alternar para o Inglês, devemos exibir "South America (CONMEBOL)" e traduzir o mapeamento interno? 

## Proposed Changes

### 1. Novo Serviço de Internacionalização
#### [NEW] `src/app/core/services/i18n.service.ts`
- Criar um serviço central contendo um `Signal` chamado `currentLang` inicializado com `'pt'`.
- Implementar métodos `toggleLanguage()` e `setLanguage()`.
- Criar um dicionário estático (objeto JSON) dentro do serviço que contém todas as chaves de tradução fixas para PT e EN (ex: *Dashboard, Classificação, Instalar App, Filtros, Status da Partida*).
- Expor um `computed` chamado `t` que sempre retorna as traduções ativas.

### 2. Adaptação do Serviço da API
#### [MODIFY] `src/app/core/services/fifa-api.service.ts`
- Modificar todos os métodos de busca (`getMatches()`, `getUIResources()`) para receberem o parâmetro de idioma dinamicamente (ex: `language=pt` ou `language=en-GB`) baseado no `currentLang` do `I18nService`.

### 3. Modificações na UI e Componentes
#### [MODIFY] `src/app/app.html` e `src/app/app.ts`
- Injetar o `I18nService` no componente principal.
- Substituir os textos fixos ("Dashboard", "Classificação", "Instalar App") pela leitura das chaves do serviço.
- Adicionar um novo botão (Toggle de Idioma) no `sidebar-footer`, ao lado do botão de Dark Mode, permitindo alternar entre `PT / EN`.

#### [MODIFY] `src/app/features/dashboard/dashboard.component.ts` e `src/app/features/standings/standings.ts`
- Refatorar a chamada do `ngOnInit` para usar um `effect()` (ou reagir ao signal de idioma usando `toObservable()`), de modo que **sempre que o idioma mudar**, a chamada à API seja refeita automaticamente para atualizar a lista de partidas, o modal e a tabela de classificação com o novo idioma, sem exigir atualização (F5).

#### [MODIFY] Arquivos de Template `.html` Diversos
- `dashboard.component.html`, `match-list.component.html`, `match-card.component.html`, `match-detail-modal.component.html` e `standings.html`.
- Varrer e substituir todas as strings hardcoded pelos valores dinâmicos do dicionário traduzido.

## Verification Plan

### Manual Verification
1. Ao clicar no botão de "EN" no menu lateral, todos os textos estáticos da aplicação (menus, cabeçalhos, botões) devem ser traduzidos quase imediatamente.
2. Ao mesmo tempo, um "loading" rápido deverá acontecer, indicando que a aplicação está buscando os nomes dos estádios, países e grupos diretamente em Inglês na API oficial da FIFA.
3. Ao recarregar a página, o estado padrão (Português) deve ser restabelecido (ou salvo em `localStorage` para lembrança do usuário no futuro).
