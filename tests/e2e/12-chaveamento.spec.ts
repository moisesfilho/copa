import { test, expect } from '@playwright/test';

test.describe('Tela de Chaveamento (Bracket)', () => {
  test('deve navegar para a tela de chaveamento e renderizar o layout base', async ({ page }) => {
    await page.goto('/');

    // Abre o menu se estiver no mobile (se o botão existir e estiver visível)
    const menuBtn = page.locator('.menu-btn');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
    }

    // Clica no link do Chaveamento
    const bracketLink = page.locator('nav.sidebar-nav a[href="/chaveamento"]');
    await bracketLink.click();

    // Verifica a URL
    await expect(page).toHaveURL(/.*\/chaveamento/);

    // Verifica o cabeçalho
    const headerTitle = page.locator('.page-header h1');
    await expect(headerTitle).toBeVisible();
    await expect(headerTitle).toContainText('Chaveamento'); // Em PT

    // Verifica se carregou ou exibiu a estrutura do chaveamento
    // Ele começa em loading, mas após a API responder deve mostrar `.bracket-board` ou `.empty-state`
    const bracketBoard = page.locator('.bracket-board');
    const emptyState = page.locator('.empty-state');
    
    await expect(bracketBoard.or(emptyState)).toBeVisible({ timeout: 15000 });
  });
});
