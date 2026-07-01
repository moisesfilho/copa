---
name: padrao-testes-e2e
description: Aplica diretrizes e boas práticas para a criação de testes End-to-End (E2E) com Playwright.
---

Goal:
Garantir que os testes de ponta-a-ponta sejam robustos, resilientes a mudanças visuais e que foquem na experiência do usuário em vez de implementação interna.

Instructions:
1. Page Object Model (POM): Use sempre o padrão POM para abstrair seletores e ações de página, separando a lógica de teste da estrutura da página.
2. Seletores Resilientes: Prefira seletores de acessibilidade (ex: `getByRole`, `getByLabelText`, `getByPlaceholder`) ou atributos de dados específicos para teste (ex: `getByTestId`). Evite buscar elementos por classes CSS estéticas ou XPath frágeis.
3. Esperas Implícitas e Assertivas (Auto-Retrying): Utilize as asserções embutidas do Playwright (ex: `expect(locator).toBeVisible()`) que já aguardam os elementos. Jamais utilize `waitForTimeout` com tempos fixos.
4. Isolamento: Garanta que cada teste limpe seu próprio estado (ex: banco de dados local ou storage) ou seja independente e não dependa do estado deixado por outro teste.

Constraints:
- Não confie na estrutura HTML exata, use as características funcionais do elemento.
- Não deixe código duplicado de interações de UI solto no arquivo `.spec.ts`. Mova-o para a classe de Page Object.
