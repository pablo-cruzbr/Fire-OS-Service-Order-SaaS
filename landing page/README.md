# Fire OS — Landing page

Página de apresentação do Fire OS. É um app Next.js independente do sistema (`Frontend/`): tem suas próprias dependências e é publicado separadamente. Os botões "Entrar", "Acessar o portal" e "Área do usuário" levam ao sistema pelo endereço definido em `NEXT_PUBLIC_APP_URL`.

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:3001
```

Sem `.env`, os links apontam para `http://localhost:3000`, onde roda o `Frontend` em desenvolvimento.

## Deploy na Vercel

1. Na Vercel, **Add New → Project** e importe este repositório.
2. Em **Root Directory**, escolha `Landing`. A Vercel detecta o Next.js sozinha; não precisa mudar os comandos de build.
3. Em **Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_APP_URL` | Endereço do sistema publicado, sem barra no final. Ex.: `https://fire-os-frontend.vercel.app` |

4. **Deploy.**

Se mudar `NEXT_PUBLIC_APP_URL` depois, faça um novo deploy: o valor entra no build.

## O que tem aqui

- `src/app/page.tsx`: a landing.
- `src/features/landing/`: carrossel e vitrine de segmentos.
- `src/components/`: cópias do `Logo`, `Button`, `Badge` e `ThemeToggle` do Frontend, e `src/app/globals.css` com os mesmos tokens de cor. Se a identidade visual mudar no Frontend, atualize aqui também.
- `public/segments/`: fotos dos segmentos (CC0, créditos em `CREDITS.md`).
