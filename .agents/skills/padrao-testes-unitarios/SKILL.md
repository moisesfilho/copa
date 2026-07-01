---
name: padrao-testes-unitarios
description: Aplica as diretrizes e padrões de qualidade do projeto (Padrão AAA, princípios F.I.R.S.T e regras de mutação) sempre que criar, refatorar ou avaliar testes unitários.
---

Goal: 
Garantir que todos os testes gerados, refatorados ou sugeridos pela IA sigam o padrão rigoroso de qualidade do projeto, focando em testes de comportamento, cobertura de ramificações e resistência contra testes de mutação.

Instructions:
1. Padrão AAA: Todo teste deve obrigatoriamente ser estruturado e separado visualmente com comentários nas três etapas: `// Arrange` (preparação e mocks), `// Act` (chamada do método) e `// Assert` (validação explícita).
2. Princípios F.I.R.S.T: Escreva testes rápidos (Fast), isolados uns dos outros (Isolated), determinísticos (Repeatable) e com asserções claras que não dependam de leitura de logs (Self-validating).
3. Cobertura Estratégica: Priorize testar todas as ramificações lógicas (if/else/try/catch) em vez de apenas buscar cobertura de linhas.
4. Testes de Mutação: Crie asserções fortes o suficiente. Se um operador do código de produção for invertido (ex: `>` para `<`), o teste gerado deve obrigatoriamente falhar.

Constraints:
- Não crie testes com asserções genéricas (ex: verificar apenas se o retorno "não é nulo").
- Não deixe chamadas externas ou de banco de dados sem os devidos mocks.
- Não misture a execução do método (Act) com a validação (Assert) na mesma linha.
