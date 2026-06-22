# Dashboard da Copa do Mundo - Plano de Implementação (Atualizado)

Este documento descreve o plano técnico para construir uma aplicação web moderna com a versão mais recente do Angular para exibir dados e estatísticas da Copa do Mundo.

> [!TIP]
> **APIs da FIFA Operacionais**
> O nosso teste mostrou que podemos usar diretamente as APIs da FIFA em duas frentes com CORS liberado:
> 1. `https://cxm-api.fifa.com/fifaplusweb/api/...` para recuperar rótulos e metadados.
> 2. `https://api.fifa.com/api/v3/...` para recuperar dados reais de partidas, estádios e times (os testes com este endpoint retornaram a listagem de jogos com sucesso).

## Proposta de Implementação

A aplicação será construída com as seguintes tecnologias e arquitetura:

1. **Framework:** Angular (Versão estável mais recente via `@angular/cli`) configurado em modo standalone.
2. **Estilização:** CSS Vanilla, com foco em uma UI premium (Glassmorphism, Dark Mode elegante, tipografia moderna como *Inter* ou *Outfit*, e animações fluídas).
3. **Gerenciamento de Estado:** Sinais (Signals) do Angular moderno.

### Componentes Planejados

*   **`DashboardComponent`:** Tela inicial contendo as listagens.
*   **`MatchesComponent`:** Lista de partidas, exibindo times (casa e visitante), placar, data, estádio e status do jogo (Ao vivo/Encerrado).
*   **`MatchCardComponent`:** Um componente visual e reutilizável que representa um único jogo, utilizando animações sutis ao passar o mouse.

### Serviços de API

*   **`FifaApiService`:** Serviço responsável por fazer as chamadas HTTP. Métodos planejados:
    *   `getMatches()`: Consume o endpoint `https://api.fifa.com/api/v3/calendar/matches` para listar o calendário de jogos.
    *   `getUIResources()`: Consume o endpoint `https://cxm-api.fifa.com/fifaplusweb/api/resources?locale=pt&identifier=MatchInformation` para traduzir a interface (opcional, para exibir rótulos traduzidos dinamicamente como "Ao Vivo", "Local", etc).

## Plano de Execução

1. Inicializar o projeto na pasta atual executando o comando CLI do Angular sem configurações interativas (`npx -y @angular/cli@latest new copa --directory . --defaults`).
2. Configurar os estilos globais (`styles.css`) implementando o Design System focado em Glassmorphism e Dark Mode premium.
3. Criar os componentes (`Dashboard`, `Matches`, `MatchCard`).
4. Criar o serviço `FifaApiService` integrando com os endpoints oficiais da API v3 identificados.
5. Fazer o binding dos dados nos componentes usando Signals e rodar testes visuais.

## Plano de Verificação

### Testes Manuais
1. Rodar o servidor de desenvolvimento (`npm run start`).
2. Verificar se a interface reflete um design premium, responsivo e com animações.
3. Garantir que os dados da API v3 da FIFA estão populando a tela de jogos adequadamente (Países, Placar, Estádio).

---
> [!IMPORTANT]
> **Tudo Certo?**
> Por favor, revise o plano atualizado com as APIs funcionais da FIFA. Se estiver de acordo, é só confirmar para que eu possa iniciar o setup do projeto Angular!
