# Sistema de Alertas via Push Notification

O objetivo deste plano é criar um mecanismo de notificações (Push API / Local Notifications) para alertar o usuário sobre partidas que estão prestes a começar, permitindo customizar o tipo de alerta e a antecedência.

## Open Questions

- Como a aplicação não possui servidor backend, o disparo do Web Push exige que a aba do app esteja ativa ou o PWA rodando em segundo plano (dependente do SO). Isso atende ao requisito ou o objetivo era integrar algo como o Firebase Cloud Messaging para push real offline?
- O link para a tela de configurações deverá ficar na barra lateral inferior ou junto aos itens principais do menu?

## Proposed Changes

### 1. `src/app/core/services/notification.service.ts`
- **[NEW]** Criação do serviço de notificações.
- Implementará o método para requisitar permissão `Notification.requestPermission()`.
- Gerenciará o salvamento das configurações no `localStorage`:
  - `notifyAll`: boolean (padrão: false)
  - `notifyFavorite`: boolean (padrão: false)
  - `notifyTime`: number (5, 10, 15, ou 30)
- Terá um mecanismo de polling para checar a lista de partidas futuras com base no calendário.
- Caso falte o tempo configurado (ex: 15 min) para o início da partida, dispara `new Notification(...)`.
- Manterá um registro de `notifiedMatchIds` em memória ou storage para não notificar a mesma partida duas vezes.

### 2. `src/app/features/settings/`
- **[NEW]** `settings.component.ts`
- **[NEW]** `settings.component.html`
- **[NEW]** `settings.component.css`
- Componente para a nova página de configurações.
- Conterá a interface com switches/toggles para ativar: "Notificar Todas as Partidas" e "Notificar Partidas da Minha Seleção".
- Select/Radio buttons para a antecedência (5, 10, 15, 30 min).
- O ato de "Ligar" qualquer notificação invoca o pedido de permissão do navegador.

### 3. `src/app/app.routes.ts`
- **[MODIFY]** Inclusão da rota `path: 'configuracoes'` apontando para o `SettingsComponent`.

### 4. `src/app/app.html` e Traduções
- **[MODIFY]** Inserção do ícone/botão de Configurações na barra lateral (Sidebar).
- **[MODIFY]** Atualização do `i18n.service.ts` com as strings do novo painel.

### 5. `src/app/app.ts`
- **[MODIFY]** Injeção do `NotificationService` no Root para que ele desperte e inicie o monitoramento assim que o usuário acessa o dashboard.

## Verification Plan

1. Iniciar o app e verificar no menu se o link "Configurações" existe e roteia corretamente.
2. Interagir com os Toggles (devem salvar no `localStorage` e pedir permissão do Browser).
3. Testar a emissão do alerta inserindo um *mock* temporário ou alterando o relógio do sistema para coincidir com os "15 minutos antes" de uma partida de teste da API.
4. Validar se o alerta respeita o filtro de seleção favorita.
