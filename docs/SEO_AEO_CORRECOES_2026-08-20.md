# Correções SEO/AEO — 20/08/2026

Este pacote aplica correções técnicas e semânticas sem alterar a estrutura visual principal do site.

## Alterações aplicadas

- Padronização de URLs absolutas, canonical, Open Graph, Schema, sitemap e robots para `https://www.dbsoftwares.com.br`.
- Remoção do `SearchAction` que apontava para uma busca interna inexistente.
- Reforço do Schema `Organization` com telefone, e-mail, endereço, LinkedIn, área de atendimento e tópicos de especialidade. O `legalName` anterior foi removido porque a razão social oficial não está documentada no código e não deve ser inventada.
- Inclusão de `WebSite` e `WebPage` conectados ao `Organization` por `@id`.
- Reposicionamento semântico da home para explicitar automação de processos, RPA, hyperautomação e agentes de IA, preservando o conceito de governança técnica.
- Modelagem de DB Board, DB Hyper e DB NOC como `Service`, removendo `InStock`, que não representava corretamente a oferta consultiva B2B.
- Reforço dos Schemas dos cases com cliente, tópicos e relacionamento com a organização DB Softwares, sem inventar datas de publicação.
- Correção dos links quebrados de Política de Privacidade e Termos de Uso em DB Board.
- Redirects permanentes no `vercel.json` para URLs históricas do Wix e para o arquivo duplicado de perfis de serviço.
- Arquivo duplicado de perfis marcado como `noindex, follow` como proteção adicional.
- Atualização de `lastmod` no sitemap para 2026-08-20.
- Padronização do nome da marca como `DB Softwares` em todo o HTML.

## Importante após publicar

1. Fazer deploy na Vercel.
2. Confirmar que o domínio principal continua sendo `www.dbsoftwares.com.br`.
3. Enviar novamente `https://www.dbsoftwares.com.br/sitemap.xml` no Google Search Console.
4. Solicitar indexação da home, Sobre, Capacidades, DB Hyper, DB Board, DB NOC e dos dois cases.
5. Validar a home e páginas principais no Rich Results Test / Schema Markup Validator.
6. O ganho de Brand Recognition e Share of Voice depende também de menções e fontes externas; não é resolvido apenas por código.
