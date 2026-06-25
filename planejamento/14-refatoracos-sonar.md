# Refatoração Guiada pelo SonarJS

A integração com o SonarJS funcionou perfeitamente e encontrou **10 violações críticas** de "Code Smells", Complexidade Ciclomática e Segurança (*ReDoS - Vulnerabilidades de Regex*). Como nossa pipeline do ESLint roda com "tolerância zero", essas violações derrubaram a *Action* de linting.

## Problemas Encontrados

1. **`dashboard.component.ts`**:
   - **Cognitive Complexity**: O sinal `topScorers` chegou a **36 pontos de complexidade** (o limite do Sonar é 15). Ele aninha loops e lógicas condicionais complexas para encontrar artilheiros, times de origem e validações de nome.
   - **Nested Functions**: A busca de timelines de gols (`this.api.getMatchTimeline().subscribe(...)`) tem funções aninhadas em 5 níveis (Observable > Callback > Array Filter > Array Map).
   - **Vulnerabilidade de Regex (ReDoS)**: O regex `/^(.*?)\s*\(/` usado para extrair o nome do jogador tem desempenho *super-linear*, podendo travar o navegador (Catastrophic Backtracking) se receber uma string formatada de forma maliciosa.

2. **`live-update.service.ts`**:
   - **Nested Functions** e a exata mesma **Vulnerabilidade de Regex** descrita acima. (Isso também indica código duplicado).

3. **`match-detail-modal.component.ts`**:
   - Sofre da mesma **Vulnerabilidade de Regex** para extrair nomes de jogadores no modal.

4. **`notification.service.ts`**:
   - **Duplicated Branches**: Em uma instrução `if/else`, dois blocos estão fazendo literalmente a mesma coisa (linhas 88 e 90), o que configura redundância desnecessária.

---

## Proposed Changes

### Componentes Abstratos & Core
Irei extrair a lógica massiva de formatação de nome (Regex) e Eventos da API que está repetida em 3 arquivos (`dashboard`, `live-update`, `match-detail`) para uma classe utilitária limpa ou helper function.

#### [MODIFY] `src/app/core/services/live-update.service.ts`
- Substituição do Regex `/^(.*?)\s*\(/` por `/^([^(]+)/` seguido de um `.trim()`. Isso remove a dependência do motor de backtracking (`.*?`) do JavaScript e roda em $O(N)$ puro.
- Extração dos métodos de `.filter()` e `.map()` para métodos da classe.

#### [MODIFY] `src/app/features/dashboard/dashboard.component.ts`
- **Refatoração do `topScorers`**: Quebrar os loops aninhados extraindo a consolidação de "Eventos -> Gols" para uma função pura privada, zerando a complexidade do Computed Signal.
- Correção do Regex da mesma forma que os serviços.
- Isolamento do corpo dos *Callbacks* do `subscribe` do RxJS.

#### [MODIFY] `src/app/features/matches/match-detail-modal/match-detail-modal.component.ts`
- Correção isolada do Regex de extração.

#### [MODIFY] `src/app/core/services/notification.service.ts`
- Remoção ou unificação das ramificações if/else redundantes (`no-duplicated-branches`).

## User Review Required

> [!WARNING]
> Vou precisar realizar **Refatorações Arquiteturais** nestes componentes (extrair lógicas, quebrar funções enormes). Isso não mudará o comportamento da tela, mas afetará drasticamente a montagem do código.
>
> Aguardo o seu "De Acordo" (botão **Proceed** ou aceite no chat) para eu começar a quebrar essa complexidade!
