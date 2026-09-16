# HTML Live Editor

Editor de HTML com pré-visualização ao vivo, direto no navegador, sem servidor.

> Projeto de portfólio, inspirado no conjunto de funcionalidades de ferramentas como o html.onlineviewer.net. Nenhum código ou recurso visual do site original foi copiado: o editor usa CodeMirror 6 (o site original usa Ace), e toda a interface, estilo e lógica foram escritos do zero.

![Editor com o código de exemplo carregado, mostrando a barra lateral de ferramentas, o editor com numeração de linha e a pré-visualização ao vivo](docs/screenshot.png)

## Por que este projeto existe

Ferramentas desse tipo parecem simples, mas escondem alguns detalhes que valem a pena fazer direito: uma pré-visualização de HTML arbitrário precisa rodar isolada do resto da página (o HTML digitado pode conter `<script>`), abrir uma nova aba com o conteúdo não pode vazar memória com URLs de blob esquecidas, e uma view de "código destacado" só é segura se o conteúdo for escapado antes de virar `innerHTML`. Este repositório resolve os três.

## Funcionalidades

| Botão            | Atalho | O que faz                                                                                           |
| ---------------- | ------ | --------------------------------------------------------------------------------------------------- |
| Preview          | Alt+1  | Abre o HTML renderizado em uma nova aba                                                             |
| Highlight        | Alt+2  | Abre o código com destaque de sintaxe (highlight.js) em uma nova aba, com busca nativa do navegador |
| Format           | Alt+3  | Formata o HTML (js-beautify)                                                                        |
| Expand all       | Alt+4  | Desfaz todo o dobramento de código                                                                  |
| Collapse all     | Alt+5  | Dobra todo bloco dobrável                                                                           |
| Sample           | Alt+6  | Insere um HTML de exemplo                                                                           |
| Clear            | Alt+7  | Limpa o editor                                                                                      |
| Import from file |        | Carrega um arquivo `.html` local no editor                                                          |
| Export to file   |        | Baixa o conteúdo atual como `.html`                                                                 |
| Dark mode        |        | Alterna tema, persistido em `localStorage`                                                          |

O conteúdo do editor também é salvo automaticamente em `localStorage`, então recarregar a página não perde o trabalho.

## Decisões de segurança

- **Pré-visualização isolada:** o iframe da pré-visualização usa `sandbox="allow-scripts allow-forms allow-popups"`, sem `allow-same-origin`. Um script no HTML do usuário roda, mas em uma origem opaca, sem acesso ao DOM da página principal.
- **Abrir em nova aba sem vazar memória:** tanto o Preview quanto o Highlight usam `URL.createObjectURL`, sempre revogado (`URL.revokeObjectURL`) alguns segundos depois de abrir a aba.
- **Highlight sempre escapa antes de destacar:** a view de código destacado passa pelo highlight.js, que escapa o HTML de entrada antes de aplicar as classes de sintaxe. Coberto por teste (`highlightView.test.ts`) verificando que um `<script>` no código de entrada nunca aparece como tag executável na página de saída, só como texto.

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:5173
```

## Testes

```bash
npm test              # Vitest, lógica pura (format, fileIO, highlightView, debounce)
npm run test:coverage
npm run test:e2e      # Playwright, contra a aplicação real rodando
```

## Limitações conhecidas (honestidade > esconder)

- O bundle final inclui o CodeMirror com suporte a HTML (que carrega parsers aninhados de CSS e JS para `<style>`/`<script>`), então fica em torno de 190KB gzipado. O highlight.js é carregado sob demanda (`import()` dinâmico), só quando o botão Highlight é clicado.
- Não há teste automatizado de Expand/Collapse all: a asserção visual de dobramento de código no CodeMirror não tem uma forma limpa de verificar via DOM sem acoplar o teste aos detalhes internos da extensão de fold.

## Licença

MIT. Ver [LICENSE](LICENSE).
