# Otimização do Workflow (GitHub Actions)

A estrutura atual possui jobs paralelos (`lint`, `test`, `e2e`) que acabam repetindo instalações (`npm ci`) e não aproveitam artefatos entre si. Além disso, o Playwright baixa os navegadores do zero a cada execução, e o build de produção aguarda todos os testes passarem.

## Proposed Changes

Para otimizar o tempo total e os recursos do GitHub Actions, proponho a seguinte estratégia:

1. **Estratégias de Cache Avançadas**:
   - **Cache do `node_modules`**: Utilizar a action `actions/cache@v4` para armazenar a pasta `node_modules` gerada, usando o hash do `package-lock.json` como chave. Assim, os jobs subsequentes farão apenas o download do cache (que leva 1-2s) em vez de rodar o `npm ci`.
   - **Cache do Playwright**: Armazenar a pasta `~/.cache/ms-playwright` vinculando a chave à versão do pacote `@playwright/test`. Isso economiza cerca de 1 a 2 minutos por execução, evitando o download repetido dos navegadores pesados.

2. **Reorganização de Ordem (Pipeline Stages)**:
   - **Stage 1: `setup`**
     - Faz checkout do código, instala dependências e salva no cache.
   - **Stage 2: Verificações Rápidas (`lint`, `test`, `build`)**
     - Rodam em paralelo dependendo do `setup`.
     - O job de `build` já será feito aqui, otimizando o tempo.
   - **Stage 3: Verificações Pesadas (`e2e`)**
     - Depende de `setup`. Podemos configurar o E2E para aguardar o lint/test, ou rodar em paralelo. **Recomendação**: Rodar E2E em paralelo com o build, pois ele consome mais tempo. *(Isso reduz o tempo máximo do pipeline).*
   - **Stage 4: `deploy`**
     - Aguarda o sucesso de *todos* os jobs (`lint`, `test`, `build`, `e2e`) e então publica.

### Fluxo Sugerido:
```mermaid
graph TD
    A[setup (Cache npm & Playwright)] --> B[lint]
    A --> C[test]
    A --> D[build]
    A --> E[e2e]
    B --> F[deploy]
    C --> F
    D --> F
    E --> F
```

#### [MODIFY] `.github/workflows/deploy.yml`
- Inserir o job `setup` focado em dependências e cache.
- Configurar `actions/cache@v4` para NPM e Playwright em todos os jobs.
- Ajustar os `needs:` para otimizar o paralelismo.

## User Review Required

> [!IMPORTANT]
> - O Playwright está configurado nativamente para levantar o servidor via `npm run start`. Se preferir, podemos fazer o `e2e` rodar *contra* a pasta `dist` gerada no job de `build` (o que testa a versão de produção e é mais rápido). Para isso, o `e2e` precisaria rodar *após* o `build`. Deseja manter o paralelismo rodando em modo dev, ou prefere colocar o E2E aguardando o Build para rodar em produção?
> - **Sugestão atual no plano**: manter em paralelo, usando a versão dev do app no E2E (conforme sua config no `playwright.config.ts`), focando apenas no cache pesado do navegador.

## Verification Plan

- Realizar commit do novo `deploy.yml`.
- Acompanhar localmente via CLI a criação e os checks sintáticos.
- Quando subir para o GitHub, o primeiro run fará o `cache miss` (salvando os arquivos), e a partir do próximo *commit* veremos um ganho de performance expressivo (Cache Hit).
