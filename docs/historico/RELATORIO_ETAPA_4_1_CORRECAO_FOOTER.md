# Etapa 4.1 — Correção do footer nas páginas secundárias

## Problema encontrado
No `styles/global.css`, o bloco do footer estava com um comentário CSS quebrado:

```css
SITE FOOTER — novo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.site-footer { ... }
```

Como o comentário não começava com `/*`, o navegador descartava a regra principal `.site-footer { background: ... }`.
Por isso, nas páginas secundárias, o footer aparecia com fundo branco e apenas alguns textos visíveis.

## Correção aplicada
- Corrigido o comentário do footer no `global.css`.
- Adicionado um bloco de reforço no fim do `global.css` para garantir que `.site-footer`, `.ft-top`, `.ft-nav` e `.ft-bottom` mantenham o layout correto nas páginas secundárias.
- Nenhuma mudança no header, que já estava funcionando.

## Status
Header preservado. Footer corrigido para páginas secundárias.
