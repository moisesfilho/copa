# Team Details Modal (Modal de Detalhe da Seleção)

Criar um novo componente de Modal na aplicação para exibir de forma detalhada o panorama de uma seleção específica no torneio, contendo histórico de partidas, próximas partidas, estatísticas de jogadores (gols, cartões) e padrões táticos utilizados. O modal será aberto ao clicar na bandeira, nome ou sigla da seleção em qualquer lugar da aplicação.

## User Review Required

> [!IMPORTANT]
> Esta feature será implementada como um **Modal** (semelhante ao `MatchDetailModalComponent`), e não como uma rota separada.
> Todos os componentes serão construídos de acordo com o `padrao-componentes-angular` (Standalone, Signals, OnPush e novo Control Flow).

## Open Questions

> [!WARNING]
> **Sobre a API da FIFA:**
> Atualmente nós listamos todas as partidas via `getMatches` e os detalhes via `getMatchTimeline`. Para listar os "Artilheiros" e "Cartões Amarelos" da seleção, você tem algum endpoint específico mapeado (ex: `/teams/{id}/stats`)? 
> 
> Se não houver, meu plano é fazer a agregação manual no front-end: filtrar as partidas já encerradas dessa seleção e consultar as timelines (`getMatchTimeline`) de cada uma para somar os gols e cartões dos jogadores. Isso está de acordo para você?

## Proposed Changes

---

### [Core/Services]

#### [MODIFY] [fifa-api.service.ts](file:///d:/moises/Projetos/copa/src/app/core/services/fifa-api.service.ts)
- Adicionar funções de auxílio para buscar ou filtrar informações de um time específico a partir do cache das partidas da competição ou agregar estatísticas.

---

### [Feature: Team Detail Modal]

#### [NEW] `src/app/features/teams/team-detail-modal/team-detail-modal.component.ts` (e arquivos `.html`, `.scss`, `.spec.ts`)
- O componente principal (Standalone) do novo Modal.
- Será responsável por receber o `id` da seleção via `@Input` ou mecanismo de dialog data, e buscar os dados.
- Estrutura visual sugerida:
  - **Cabeçalho:** Bandeira, Nome da Seleção e botão de fechar (X).
  - **Próximos Jogos & Histórico:** Lista compacta de resultados passados e agenda futura.
  - **Táticas:** Apresentação da formação mais utilizada ou da última utilizada (ex: 4-3-3).
  - **Destaques:** Ranking de Artilheiros e Ranking de Cartões (Amarelos/Vermelhos) obtidos.

---

### [Integração com telas existentes]

#### [MODIFY] Diversos Componentes (`StandingsComponent`, `MatchCardComponent`, etc.)
- Modificar as exibições de bandeiras, nomes ou siglas das seleções nas tabelas de classificação e listas de partidas para que ajam como botões/links interativos.
- Ao clicar, o `TeamDetailModalComponent` deve ser aberto passando a seleção alvo.

## Verification Plan

### Automated Tests
- Criarei testes unitários com Vitest para o `TeamDetailModalComponent` com cobertura próxima de 100%, garantindo que siga as regras do `padrao-testes-unitarios` (Padrão AAA, cobertura de ramificações lógicas).
- Usarei mocks da API da FIFA para simular a resposta de partidas de um time.
- Verificarei se o Modal abre e fecha corretamente simulando os eventos de clique.

### Manual Verification
- Ao navegar na interface (pela Classificação ou lista de jogos), clicar na bandeira, nome ou sigla de um time deve abrir o Modal corretamente:
  - Nenhuma tela em branco.
  - O histórico de jogos carregado para o time escolhido.
  - O Modal deve poder ser fechado tanto via clique fora, quanto via tecla ESC ou botão fechar, seguindo as diretrizes de acessibilidade.
