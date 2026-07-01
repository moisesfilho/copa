---
name: padrao-code-review
description: Atua como um linter avançado para revisão de PRs ou avaliação de código.
---

Goal:
Garantir qualidade de código, segurança e prevenção de bugs clássicos de aplicações Web e Angular antes do commit/merge.

Instructions:
1. Vazamentos de Memória: Inspecione se todas as inscrições manuais (`subscribe`) em observáveis contínuos são devidamente canceladas usando `takeUntilDestroyed` ou no ciclo `ngOnDestroy`.
2. SonarJS/Lint Compliance: Observe regras clássicas de clean code: funções menores, pouca profundidade de aninhamento (evitar if dentro de if), e remoção de código comentado/morto ou imports não usados.
3. Tratamento de Erros: Verifique se as chamadas de API possuem tratamento de falhas e feedbacks amigáveis para o usuário da interface, e nunca 'engula' erros com blocos `catch` vazios sem logar no serviço adequado.
4. CSS/SCSS Isolado: Confirme se os estilos evitam vazamento, não abusando do `::ng-deep` a não ser quando estritamente necessário (ex: componentes de UI libraries de terceiros).

Constraints:
- Não assuma que o código está correto só porque ele executa; force a legibilidade.
- Critique falhas de arquitetura e lógica repetitiva.
