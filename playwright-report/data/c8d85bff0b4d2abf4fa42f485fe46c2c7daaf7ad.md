# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 11-notificacoes-push.spec.ts >> 11 - Notificacoes Push >> should toggle push notifications in settings
- Location: tests\e2e\11-notificacoes-push.spec.ts:12:7

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - heading "🏆 Copados 2026" [level=2] [ref=e6]
    - navigation [ref=e7]:
      - link "📊 Dashboard" [ref=e8] [cursor=pointer]:
        - /url: /
        - generic [ref=e9]: 📊
        - text: Dashboard
      - link "⚽ Partidas" [ref=e10] [cursor=pointer]:
        - /url: /partidas
        - generic [ref=e11]: ⚽
        - text: Partidas
      - link "📈 Classificação" [ref=e12] [cursor=pointer]:
        - /url: /classificacao
        - generic [ref=e13]: 📈
        - text: Classificação
      - link "⚙️ Configurações" [ref=e14] [cursor=pointer]:
        - /url: /configuracoes
        - generic [ref=e15]: ⚙️
        - text: Configurações
      - link "ℹ️ Sobre" [ref=e16] [cursor=pointer]:
        - /url: /sobre
        - generic [ref=e17]: ℹ️
        - text: Sobre
    - generic [ref=e19]:
      - generic [ref=e20]:
        - button "PT" [ref=e21] [cursor=pointer]
        - button "EN" [ref=e22] [cursor=pointer]
      - button "Alternar tema" [ref=e23] [cursor=pointer]:
        - img [ref=e25]
  - main [ref=e29]:
    - generic [ref=e31]:
      - generic [ref=e32]:
        - heading "Configurações" [level=1] [ref=e33]
        - paragraph [ref=e34]: Personalize sua experiência no Copados 2026.
      - generic [ref=e36]:
        - heading "Notificações de Partidas (Push)" [level=3] [ref=e37]
        - generic [ref=e38]:
          - generic [ref=e39]:
            - heading "Todas as Partidas" [level=4] [ref=e40]
            - paragraph [ref=e41]: Receber um alerta antes de qualquer partida começar.
          - generic [ref=e42]:
            - checkbox [active]
        - generic [ref=e44]:
          - generic [ref=e45]:
            - heading "Minha Seleção Favorita" [level=4] [ref=e46]
            - paragraph [ref=e47]: Receber um alerta apenas quando a seleção que você escolheu for jogar.
          - generic [ref=e48]:
            - checkbox
        - generic:
          - generic:
            - heading "Antecedência do Alerta" [level=4]
            - paragraph: Quantos minutos antes do jogo você deseja ser avisado.
          - combobox [disabled]:
            - option "5 minutos"
            - option "10 minutos"
            - option "15 minutos" [selected]
            - option "30 minutos"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as matchesMock from './fixtures/matches.json';
  3  | import * as resourcesMock from './fixtures/ui-resources.json';
  4  | 
  5  | test.describe('11 - Notificacoes Push', () => {
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
  8  |     await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
  9  |     await page.goto('/configuracoes');
  10 |   });
  11 | 
  12 |   test('should toggle push notifications in settings', async ({ page }) => {
  13 |     const settingItem = page.locator('.setting-item').first();
  14 |     const checkbox = settingItem.locator('input[type="checkbox"]');
  15 |     const slider = settingItem.locator('.slider');
  16 |     
  17 |     // In Chromium, Push might be denied by default, but we can just test if the switch triggers
  18 |     const isChecked = await checkbox.isChecked();
  19 |     // Click the visual slider instead of the hidden checkbox
  20 |     await slider.click({ force: true });
  21 |     
> 22 |     expect(await checkbox.isChecked()).not.toBe(isChecked);
     |                                            ^ Error: expect(received).not.toBe(expected) // Object.is equality
  23 |   });
  24 | });
  25 | 
```