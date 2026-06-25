# Implementação de Testes End-to-End (E2E)

Este documento descreve o plano para automatizar as validações manuais presentes nos arquivos de planejamento, transformando-as em testes E2E contínuos.

## User Review Required

> [!IMPORTANT]
> **Escolha do Framework E2E**
> O projeto Angular atual possui o Vitest configurado para testes unitários, mas não possui nenhum framework E2E instalado (como Cypress ou Playwright). 
> **Minha proposta** é utilizar o **Playwright**, por ser atualmente a ferramenta mais moderna, rápida e confiável para testes E2E, além de ter excelente suporte a interceptação de APIs (fundamental para testarmos dados da FIFA de forma determinística). Você aprova o uso do Playwright?

## Open Questions

> [!WARNING]
> **Mock da API vs API Real**
> Em testes E2E, bater na API oficial da FIFA (`api.fifa.com`) pode causar instabilidades nos testes caso a API deles caia, mude os dados ou demore a responder. Devo interceptar (mockar) as respostas da API da FIFA durante a execução dos testes E2E usando fixtures locais, ou você prefere que os testes consumam a API real? (Recomendo fortemente o uso de mocks para garantir que os testes rodem de forma previsível e contínua no CI/CD).

## Proposed Changes

### 1. Configuração do Playwright (Setup)

- Executar `npm init playwright@latest` para instalar e configurar as dependências base do framework.
- Atualizar o `package.json` adicionando scripts como `"e2e": "playwright test"`.
- Criar o arquivo `playwright.config.ts` apontando para o servidor de desenvolvimento do Angular (`http://localhost:4200`).

### 2. Suítes de Testes (Baseadas no Planejamento)

Criaremos os arquivos de testes na pasta `tests/e2e/` do Playwright:

#### `tests/e2e/01-dashboard.spec.ts`
- **Dashboard e Menu (Planejamento 01 e 02):**
  - Navegar entre "Dashboard" e "Classificação" sem travamentos.
  - Redimensionar tela para viewport mobile e verificar se o menu sanduíche abre/fecha corretamente.
  - Verificar se a lista de partidas carrega os cards e se as estatísticas da classificação batem.

#### `tests/e2e/02-match-modal.spec.ts`
- **Modal e Estatísticas (Planejamento 03 e 04):**
  - Clicar em um card de jogo e verificar se o modal sobreposto é renderizado sem alterar o scroll da página principal.
  - Validar a presença de barra de loading enquanto os dados detalhados (Estatísticas Avançadas) são carregados.
  - Verificar barras de posse de bola e se o modal fecha ao clicar no (X) ou no fundo.

#### `tests/e2e/03-url-sync.spec.ts`
- **Filtros e Rota Direta (Planejamento 05 e 06):**
  - Clicar nos botões de filtro e verificar se a URL é atualizada para `?status=LIVE` etc.
  - Navegar diretamente para uma URL com `?match=ID_DO_JOGO` e verificar se a aplicação abre automaticamente o modal daquela partida logo na carga inicial.

#### `tests/e2e/04-i18n.spec.ts`
- **Internacionalização (Planejamento 08):**
  - Clicar na alteração de idioma para "EN".
  - Verificar se os textos estáticos são traduzidos instantaneamente.
  - Recarregar a página e garantir que o idioma selecionado foi persistido.

#### `tests/e2e/05-services.spec.ts`
- **Live Update e Push (Planejamento 10 e 11):**
  - Interagir com a página de "Configurações" habilitando os *toggles* de notificação e testar se eles persistem (emulação de LocalStorage e permissões do browser).
  - Validar se o sistema realiza os *polls* de Live Update a cada 10 segundos chamando a API (interceptando requisições de rede).

## Verification Plan

### Automated Tests
- Executaremos o comando `npm run e2e` gerado para rodar a suite completa no modo *headless*.
- Validaremos se todos os arquivos `.spec.ts` descritos acima passam corretamente utilizando o trace viewer do Playwright para certificar que a interface está se comportando visualmente conforme o esperado.

### Manual Verification
- O usuário apenas precisará revisar o relatório final gerado pelo Playwright contendo os passos executados.
