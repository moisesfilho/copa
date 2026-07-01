---
name: padrao-versionamento
description: Define a política customizada de versionamento semântico da aplicação (Major.Minor.Patch)
---

Goal:
Garantir que a versão da aplicação siga a estratégia comercial (Major fixo/manual) e incremente os números menores de forma consistente de acordo com as entregas.

Instructions:
1. Formato: O projeto usa o formato MAJOR.MINOR.PATCH (ex: 1.2.0).
2. Major (X.0.0): Representa o primeiro dígito (da esquerda). Esse número **só deve ser alterado manualmente** pois é controlado por estratégias comerciais. Não incremente o Major automaticamente sob nenhuma circunstância.
3. Minor (0.X.0): Representa o segundo dígito (do meio). Deve ser incrementado sempre que uma **nova funcionalidade** for desenvolvida (equivalente a commits do tipo `feat:`). Lembre-se: ao incrementar o Minor, o número Patch deve voltar para zero (ex: de `1.2.5` para `1.3.0`).
4. Patch (0.0.X): Representa o terceiro dígito (da direita). Deve ser incrementado sempre que uma **correção de bug** (`fix:`), uma **melhoria** (`refactor:`, `perf:`) ou outra alteração menor (`chore:`, `style:`) for aplicada (ex: de `1.2.0` para `1.2.1`).
5. Onde Atualizar: A versão da aplicação reside primariamente no arquivo `package.json` (no campo `version`).

Constraints:
- Nunca atualize o Major automaticamente, mesmo se identificar "Breaking Changes".
- Siga sempre a ordem cronológica e lógica descrita acima quando sugerir atualizações na versão da aplicação durante as conversas.
