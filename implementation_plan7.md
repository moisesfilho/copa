# Adicionar Suporte PWA (Progressive Web App)

O objetivo é transformar a aplicação Angular atual em um PWA, permitindo que os usuários a instalem como um aplicativo em seus celulares e computadores (adicionando um atalho à tela inicial).

## Proposed Changes

1. **Execução do comando do Angular CLI**:
   Vou rodar o comando `npx ng add @angular/pwa --project copa` no terminal.
   Isso fará com que o Angular automaticamente:
   - Adicione o pacote `@angular/service-worker`
   - Crie o arquivo `manifest.webmanifest` (configurações do ícone, cor e nome do PWA)
   - Crie o `ngsw-config.json` (configuração de cache offline do Service Worker)
   - Atualize o `angular.json` para registrar os novos assets.
   - Atualize o `app.config.ts` (ou `main.ts`) para registrar o Service Worker.
   - Adicione ícones genéricos do Angular na pasta `public/icons` (que podem ser substituídos futuramente pela sua logo).

2. **Ajuste de Tema**:
   Atualizar o arquivo `manifest.webmanifest` para garantir que as cores de tema (theme_color e background_color) combinem com o visual do Dashboard que criamos.

> [!WARNING]
> **Necessidade de Reiniciar o Servidor**:
> Como essa alteração mexe nas configurações raiz do Angular (`angular.json`), será necessário **parar o servidor atual** (`npm start`) e **iniciá-lo novamente** para que as alterações surtam efeito. Além disso, os Service Workers do Angular só operam ativamente 100% (com cache offline e banner de instalação) quando você roda o build de produção ou configura o servidor dev localmente.

## User Review Required
Você está de acordo com a instalação automática das configurações padrão de PWA do Angular? Podemos prosseguir com a execução do comando?
