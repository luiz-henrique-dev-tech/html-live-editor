export interface Template {
  id: string;
  label: string;
  folder: string;
  tags: string[];
  content: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'landing-hero',
    label: 'Landing page: seção hero',
    folder: 'Marketing',
    tags: ['responsivo', 'flexbox'],
    content: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Hero</title>
<style>
  body { margin: 0; font-family: sans-serif; }
  .hero { display: flex; align-items: center; justify-content: center; flex-direction: column; height: 100vh; text-align: center; background: #111; color: #fff; }
  .hero h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
  .hero p { color: #aaa; margin-bottom: 1.5rem; }
  .hero button { padding: 0.75rem 1.5rem; border-radius: 999px; border: none; background: #fff; color: #111; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
<section class="hero">
  <h1>Título de impacto</h1>
  <p>Uma frase curta explicando o produto.</p>
  <button>Começar agora</button>
</section>
</body>
</html>
`,
  },
  {
    id: 'contact-form',
    label: 'Formulário de contato',
    folder: 'Formulários',
    tags: ['formulário', 'validação'],
    content: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Contato</title>
<style>
  body { font-family: sans-serif; max-width: 420px; margin: 3rem auto; }
  label { display: block; font-size: 0.85rem; margin-bottom: 0.25rem; }
  input, textarea { width: 100%; padding: 0.5rem; margin-bottom: 1rem; box-sizing: border-box; }
  button { padding: 0.6rem 1.2rem; }
</style>
</head>
<body>
<form>
  <label for="name">Nome</label>
  <input id="name" name="name" required>
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>
  <label for="message">Mensagem</label>
  <textarea id="message" name="message" rows="4" required></textarea>
  <button type="submit">Enviar</button>
</form>
</body>
</html>
`,
  },
  {
    id: 'data-table',
    label: 'Tabela de dados',
    folder: 'Componentes',
    tags: ['tabela'],
    content: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Tabela</title>
<style>
  table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
  th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f4f4f4; }
</style>
</head>
<body>
<table>
  <thead>
    <tr><th>Nome</th><th>Cargo</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>Ana</td><td>Engenheira</td><td>Ativo</td></tr>
    <tr><td>Bruno</td><td>Designer</td><td>Ativo</td></tr>
  </tbody>
</table>
</body>
</html>
`,
  },
  {
    id: 'product-card',
    label: 'Card de produto',
    folder: 'Componentes',
    tags: ['card', 'flexbox'],
    content: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Card de produto</title>
<style>
  body { font-family: sans-serif; display: flex; justify-content: center; padding: 2rem; background: #fafafa; }
  .card { width: 260px; border-radius: 16px; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden; }
  .card img { width: 100%; height: 160px; object-fit: cover; background: #ddd; }
  .card-body { padding: 1rem; }
  .price { font-weight: 700; }
</style>
</head>
<body>
<div class="card">
  <img alt="Produto">
  <div class="card-body">
    <h3>Nome do produto</h3>
    <p class="price">R$ 99,90</p>
  </div>
</div>
</body>
</html>
`,
  },
  {
    id: 'email-newsletter',
    label: 'E-mail HTML: newsletter',
    folder: 'E-mail',
    tags: ['e-mail', 'tabela'],
    content: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Newsletter</title>
</head>
<body style="margin:0; background:#f4f4f4; font-family: Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding: 24px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;">
    <tr><td style="padding: 24px; font-size: 20px; font-weight: bold;">Novidades do mês</td></tr>
    <tr><td style="padding: 0 24px 24px; color:#555;">Corpo do e-mail vai aqui.</td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
`,
  },
];

export const listFolders = (): string[] => [...new Set(TEMPLATES.map((template) => template.folder))].sort();

export const listTags = (): string[] => [...new Set(TEMPLATES.flatMap((template) => template.tags))].sort();

export const filterTemplates = (folder: string | null, tags: string[]): Template[] =>
  TEMPLATES.filter((template) => {
    const matchesFolder = !folder || template.folder === folder;
    const matchesTags = tags.length === 0 || tags.every((tag) => template.tags.includes(tag));
    return matchesFolder && matchesTags;
  });
