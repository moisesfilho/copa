---
name: padrao-commits-semanticos
description: Diretrizes para geração e avaliação de mensagens de commit baseadas no formato Conventional Commits.
---

Goal:
Manter um histórico no repositório claro e legível, facilitando a geração automática de Changelogs e rastreamento das alterações por domínios da aplicação.

Instructions:
1. Estrutura Padrão: Todo commit deve seguir a sintaxe: `<tipo>([escopo opcional]): <descrição>`.
2. Tipos Permitidos:
   - `feat:` (nova funcionalidade)
   - `fix:` (correção de bug)
   - `chore:` (atualização de tarefas, dependências, scripts de build que não afetam src)
   - `test:` (adição ou correção de testes)
   - `refactor:` (refatoração de código de produção sem alterar comportamento)
   - `docs:` (mudança apenas em documentação)
   - `style:` (formatação, lint, ponto e vírgula, sem alterar comportamento do código)
   - `perf:` (alteração de código visando melhoria de performance)
3. Descrição Curta e Direta: A descrição deve ser no imperativo presente (como uma ordem: "add feature" e não "added feature"). Iniciar sempre com letra minúscula.

Constraints:
- Não termine a primeira linha da mensagem de commit com um ponto final.
- Tente manter a primeira linha com menos de 72 caracteres.
