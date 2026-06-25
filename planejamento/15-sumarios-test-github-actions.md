# Plano de Otimização dos Testes no GitHub Actions (Test Summaries)

O GitHub Actions nativamente apenas "cospe" os logs no console da Action, dificultando muito a leitura individual do que passou e do que falhou. Para contornar isso e gerarmos sumários bonitos e precisos, podemos integrar um sistema de Relatórios (Test Reporters) que captura arquivos padronizados (`JUnit XML`) e cria Dashboards visuais em cada execução.

## Modificações Propostas

### 1. `playwright.config.ts` e `package.json`
- Vamos instruir os nossos comandos de teste a gerarem **tanto o console habitual quanto o arquivo `.xml` do JUnit**.
- Para o Angular (Vitest): `npm test -- --watch=false --reporters=junit --output-file=test-results/junit-unit.xml`.
- Para o Playwright: `PLAYWRIGHT_JUNIT_OUTPUT_NAME=test-results/junit-e2e.xml npx playwright test --reporter=html,junit`.

### 2. `.github/workflows/deploy.yml`
- Inserir a Action `dorny/test-reporter@v1` após o job de testes unitários e o job E2E.
- O *test-reporter* interceptará os arquivos `test-results/*.xml` e criará uma anotação gráfica chamada **"Test Report"** dentro do GitHub, listando teste por teste, seu status (Pass/Fail) e a duração.
- Também farei a injeção da permissão `checks: write` na action, que é estritamente necessária para que o GitHub permita a criação das tabelas de resumo.

## User Review Required

> [!NOTE]
> Essa alteração vai adicionar duas novas visualizações nas suas abas de "Checks" no GitHub, permitindo que você clique num sumário visual sem precisar ler os logs puros.
>
> Aguardo sua aprovação para instalar esses sumários na esteira CI!
