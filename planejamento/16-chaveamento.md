# Implementação da Tela de Chaveamento (Mata-mata)

Criaremos uma nova tela (rota) para exibir o chaveamento da fase eliminatória da Copa do Mundo, apresentando todas as partidas que não fazem parte da fase de grupos. Também garantiremos a qualidade dessa nova funcionalidade com testes unitários e testes ponta-a-ponta (E2E).

## Revisão do Usuário Necessária

Por favor, revise o design proposto e a estrutura para a tela de Chaveamento. Utilizaremos um layout de chaveamento no formato de árvore padrão (Dezesseis-avos de final → Final), construído com CSS Grid/Flexbox para garantir um visual responsivo e premium.

> [!IMPORTANT]
> Como isso depende de dados reais da API da FIFA, algumas partidas da fase eliminatória podem não ter suas seleções definidas ainda. Vamos tratar esses casos de forma elegante (ex: "1A vs 2B") para garantir que o chaveamento seja renderizado corretamente sem quebrar a interface.

## Mudanças Propostas

---

### Roteamento e Navegação
Vamos adicionar uma nova rota e um link de navegação para a tela de Chaveamento.

#### [MODIFY] [app.routes.ts](file:///d:/moises/Projetos/copa/src/app/app.routes.ts)
- Adicionar uma nova rota `{ path: 'chaveamento', loadComponent: ... }` apontando para o novo componente `BracketComponent`.

#### [MODIFY] [app.html](file:///d:/moises/Projetos/copa/src/app/app.html)
- Adicionar um link no menu de navegação lateral (sidebar) apontando para `/chaveamento` com um ícone apropriado (ex: 🔀).

---

### Internacionalização (i18n)
Precisamos adicionar as chaves de tradução para o novo item de menu e o título da tela.

#### [MODIFY] [i18n.service.ts](file:///d:/moises/Projetos/copa/src/app/core/services/i18n.service.ts)
- Adicionar `bracket: 'Chaveamento'` (PT) e `bracket: 'Bracket'` (EN) dentro do objeto `menu`.
- Adicionar um novo objeto `bracket` para traduções específicas desta tela (título, subtítulo e as fases como 'Oitavas de final', 'Quartas de final', etc).

---

### Funcionalidade de Chaveamento
Vamos criar um novo módulo de feature para o Chaveamento das Eliminatórias.

#### [NEW] [bracket.component.ts](file:///d:/moises/Projetos/copa/src/app/features/bracket/bracket.component.ts)
- Criar um componente Angular standalone.
- Injetar o `FifaApiService` e buscar todas as partidas.
- Filtrar as partidas que pertencem à Fase de Grupos (ex: remover as partidas que possuam `GroupName` ou que o nome da fase não seja eliminatória).
- Agrupar as partidas restantes por sua respectiva fase eliminatória (Dezesseis-avos, Oitavas, Quartas, Semifinais, Disputa de 3º lugar, Final).
- Gerenciar o estado (carregamento, partidas, recursos de UI) utilizando Angular signals.

#### [NEW] [bracket.component.html](file:///d:/moises/Projetos/copa/src/app/features/bracket/bracket.component.html)
- Construir um layout responsivo para visualizar o chaveamento.
- No desktop (telas maiores), utilizar a estrutura tradicional de campeonato, com as linhas horizontais conectando desde os Dezesseis-avos de final até a Final no centro, ou um fluxo da esquerda para a direita.
- No mobile (telas menores), exibir as fases como seções verticais roláveis ou uma visualização deslizante na horizontal para manter a legibilidade.
- Reutilizar ou adaptar o design do `app-match-card` existente dentro dos nós do chaveamento para manter um visual consistente e premium.

#### [NEW] [bracket.component.css](file:///d:/moises/Projetos/copa/src/app/features/bracket/bracket.component.css)
- Adicionar estilos customizados (Flexbox/Grid) para a árvore do torneio.
- Implementar as linhas de conexão (utilizando pseudo-elementos como `::before` e `::after`) e adotar uma estilização moderna (glassmorphism, micro-animações suaves de hover) para garantir uma qualidade estética muito alta.

---

### Testes (Unitários e E2E)
Garantiremos a estabilidade da nova funcionalidade adicionando testes.

#### [NEW] [bracket.component.spec.ts](file:///d:/moises/Projetos/copa/src/app/features/bracket/bracket.component.spec.ts)
- Adicionar testes unitários para o `BracketComponent`.
- Mockar a `FifaApiService` para fornecer dados de partidas das fases eliminatórias.
- Testar a correta renderização e agrupamento dos dados (ex: confirmar se as partidas das Oitavas e Quartas de final são filtradas adequadamente da resposta da API).

#### [NEW] [bracket.spec.ts](file:///d:/moises/Projetos/copa/tests/bracket.spec.ts)
- Adicionar testes End-to-End (E2E) com Playwright.
- Validar o fluxo do usuário: abrir o menu, clicar em "Chaveamento", confirmar o redirecionamento para a nova rota e checar se o layout principal da árvore/tabela do torneio é carregado corretamente e visível na tela.

## Plano de Verificação

### Testes Automatizados
- Executar `npm run test` (Karma/Jasmine) para verificar a aprovação do `bracket.component.spec.ts`.
- Executar `npx playwright test` para rodar a suíte E2E e assegurar a navegação para `/chaveamento`.

### Testes Manuais
- Iniciar o servidor de desenvolvimento do Angular (`npm run dev` / `ng serve`).
- Verificar se o novo item do menu aparece e funciona em ambos os idiomas (PT e EN).
- Garantir que apenas os jogos da fase eliminatória estão visíveis.
- Checar o layout no desktop (árvore horizontal) e no mobile (pilha vertical ou rolagem) para confirmar a responsividade e a estética premium da aplicação.
