---
name: padrao-componentes-angular
description: Define a arquitetura moderna para novos componentes e serviços em Angular, priorizando a API de Signals e componentes Standalone.
---

Goal:
Manter a consistência na criação de novos componentes e refatorações no ecossistema Angular (versão atual/moderna), otimizando performance, verbosidade e tipagem.

Instructions:
1. Standalone Components: Sempre crie componentes com a flag `standalone: true`. Não declare novos componentes em módulos (`NgModule`).
2. Change Detection: Por padrão, sempre defina `changeDetection: ChangeDetectionStrategy.OnPush` no `@Component`.
3. Reatividade com Signals: Priorize a utilização de `signal`, `computed` e `effect` em vez de criar cadeias complexas com RxJS (`BehaviorSubject`), mantendo o código síncrono onde possível.
4. Novo Control Flow do Angular: Utilize a sintaxe de templates nova: `@if`, `@else`, `@for` (sempre com `track`), `@switch` em vez das diretivas estruturais antigas (`*ngIf`, `*ngFor`).
5. Tipagem Estrita: Todo `@Input()` e métodos devem ter seus tipos estritamente declarados. Considere utilizar as novas Signals baseadas em inputs: `input()`, `input.required()`.

Constraints:
- Não injete dependências através de construtor (onde fizer sentido a legibilidade), considere a função `inject()`.
- Evite vazar inscrições do RxJS. Se precisar assinar um observable local, use o operador `takeUntilDestroyed()`.
