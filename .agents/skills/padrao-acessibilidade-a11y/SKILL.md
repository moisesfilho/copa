---
name: padrao-acessibilidade-a11y
description: Diretrizes obrigatórias para inclusão de atributos ARIA e tags semânticas para garantir acessibilidade web.
---

Goal:
Garantir que a aplicação possa ser navegada por usuários de teclado e leitores de tela e que a estrutura de UI seja compreendida semanticamente pelo navegador.

Instructions:
1. HTML Semântico: Em vez de `<div>` e `<span>`, use sempre que aplicável tags semânticas (`<nav>`, `<header>`, `<main>`, `<article>`, `<section>`, `<button>`, `<a>`).
2. Botões e Ações: Todo elemento interativo deve ser focável. Elementos clicáveis que não são links devem ser `<button type="button">`. Sempre adicione o atributo `aria-label` se o botão contiver apenas ícones sem texto visual.
3. Navegação por Teclado: Confirme que itens interativos customizados possuam `tabindex="0"`. Em elementos como modais, implemente o comportamento de "Focus Trap" e possibilidade de fechamento pelo teclado (ESC).
4. Feedback Visual: Elementos de interface precisam deixar claro seu estado (focado/ativo/desativado). Use atributos `aria-expanded` para sanfonas/menus, `aria-disabled` e `aria-busy` ou `aria-live="polite"` para indicar carregamento assíncrono.

Constraints:
- Não use `tabindex` maior que 0.
- Não remova os estilos de `:focus` (ou `:focus-visible`) a menos que os substitua por um estilo customizado visível.
