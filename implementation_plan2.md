# Implementação de Menu Lateral e Tabela de Classificação (FIFA Standings)

Este documento detalha o plano técnico para atender a sua solicitação de reestruturação do layout com um menu lateral e a criação da nova página de Classificação, seguindo à risca as complexas regras de desempate da FIFA.

## User Review Required

> [!IMPORTANT]
> **Dados de Fair Play (Cartões):**
> A regra de desempate da FIFA envolve Fair Play (Cartões Amarelos/Vermelhos). O endpoint principal de calendário de jogos que estamos usando (`/calendar/matches`) traz os placares finais, mas não traz os eventos da partida (quem tomou cartão). Para calcular o Fair Play real, precisaríamos fazer chamadas adicionais para o endpoint de cada partida específica (`/timeline` ou `/events`), o que multiplicaria muito o tráfego se calcularmos todos os jogos.
> **Minha proposta:** Construirei a função de ordenação já contemplando o cálculo de Fair Play (subtraindo pontos na ordenação), porém, por enquanto, assumiremos que os times estão empatados nesse quesito (valor igual a 0), até integrarmos uma API de eventos de partida no futuro, se você desejar. Você aprova essa abordagem?

## Proposed Changes

---

### App Layout & Routing (Core)

Para implementar o menu lateral ocultável, precisamos tirar o "Header" estático da página do Dashboard e criar um componente global estrutural (App Shell).

#### [MODIFY] src/app/app.html
- Mudar a estrutura para incluir um `<nav>` lateral e uma área `<main>` de conteúdo onde ficará o `<router-outlet>`.
- Adicionar um botão de hambúrguer visível em telas menores para abrir/fechar o menu.

#### [MODIFY] src/app/app.ts
- Adicionar a lógica de abrir e fechar o menu lateral via `signal<boolean>`.

#### [MODIFY] src/app/app.routes.ts
- Adicionar a rota para a página de classificação: `{ path: 'classificacao', component: StandingsComponent }`.

---

### Dashboard (Features)

#### [MODIFY] src/app/features/dashboard/dashboard.component.html & .ts
- Remover o botão de troca de tema (`theme-toggle`) daqui e passá-lo para a nova barra/menu global.

---

### Standings / Classificação (Nova Feature)

#### [NEW] src/app/features/standings/standings.component.ts (e html/css)
- Nova página responsável por listar as tabelas de classificação de cada grupo.
- Irá consumir o `FifaApiService.getMatches()`.
- Lógica de Agrupamento: Irá iterar sobre todos os jogos, filtrando apenas as fases de grupos (`Group A`, `Group B`, etc.).
- Lógica de Pontuação e Ordenação (Seguindo seu prompt):
  1. **Pontos**: Vitória (+3), Empate (+1), Derrota (0).
  2. **Saldo de Gols (GD)**: Gols Marcados - Gols Sofridos em todas as partidas do grupo.
  3. **Gols Marcados (GF)**: Total de gols a favor em todas as partidas do grupo.
  4. **Confronto Direto**: Se houver empate entre N times, isola-se apenas os resultados dos jogos disputados entre essas equipes empatadas e calcula-se novamente os Pontos, GD e GF apenas nesse minigrupo.
  5. **Fair Play**: Lógica programada (por enquanto zerada por falta de dados).
  6. **Sorteio**: Caso final.

#### [NEW] src/app/core/utils/standings-calculator.ts
- Um arquivo puro de lógica TypeScript contendo as funções matemáticas avançadas descritas acima para desempate múltiplo. Separar essa lógica do Componente deixará o código mais limpo e testável.

## Verification Plan

### Testes Manuais
- Redimensionar a tela para o modo mobile e verificar se o menu sanduíche funciona corretamente e empurra/sobrepõe o layout.
- Navegar entre "Dashboard" e "Classificação" sem travamentos.
- Inspecionar a tabela de classificação para garantir que os Pontos, Saldo de Gols e Gols Pró batem com os resultados reais dos jogos já preenchidos pela API no Dashboard.
