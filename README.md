# StudyOS

Plataforma pessoal de estudos para **IELTS General Training** e **CompTIA Security+ (SY0-801)**.
Roda localmente, sem servidor, sem conta e sem API paga.

## Como executar

Pré-requisito: Node.js 20+ (verifique com `node -v`).

```bash
cd ~/studyOS
npm install            # instala as dependências (só na primeira vez)
npm run dev            # inicia em http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | Gera a versão otimizada em `dist/` |
| `npm run preview` | Serve o conteúdo de `dist/` para testar o build |
| `npm run validate:content` | Confere a biblioteca: fontes, códigos de objetivo, respostas e regras de validação |

## Estrutura

```
studyOS/
├── index.html                  Página HTML única; o React é montado em <div id="root">
├── vite.config.js              Configuração do Vite (React + Tailwind)
├── scripts/
│   └── validate-content.js     Validação da biblioteca pelo terminal
├── docs/PLANO.md               Arquitetura, modelo de dados, estratégia de conteúdo e roadmap
└── src/
    ├── main.jsx                Ponto de entrada
    ├── App.jsx                 Rotas (URL → página)
    ├── index.css               Tailwind + cores da marca (azul-marinho, menta)
    ├── content/                BIBLIOTECA (dados, não código)
    │   ├── sources.json        Catálogo de fontes (URL, data de acesso, status)
    │   ├── index.js            Carrega e valida os JSON; único ponto de acesso ao conteúdo
    │   ├── secplus/            objectives.json (oficial), lessons, questions, flashcards
    │   └── ielts/              skills.json (formato oficial), reading.json (exercícios originais)
    ├── lib/                    Lógica pura, sem React (fácil de testar)
    │   ├── contentSchema.js    Regras de validação do conteúdo
    │   ├── storage.js          Salvar/carregar progresso no localStorage + validação de backup
    │   ├── progress.js         Revisão espaçada, streak, tempo, desempenho por assunto
    │   └── dates.js            Datas no fuso local e formatação
    ├── state/StudyContext.jsx  Estado global do progresso (React Context)
    ├── components/             Peças visuais reutilizáveis (layout, cards, badges, questão)
    └── pages/                  Uma página por rota
```

**Regra de ouro:** conteúdo fica em `content/` (JSON), lógica em `lib/` (JS puro), aparência em `components/` e `pages/`.
Assim, trocar JSON por um banco de dados no futuro mexe apenas em `content/index.js` e `lib/storage.js`.

## Onde ficam os seus dados

- O **conteúdo** (aulas, questões) vem dos arquivos JSON, embutidos no app durante o build.
- O **progresso** (respostas, tempo, aulas concluídas) fica no `localStorage` do navegador, na chave `studyos.progress`.
  - Fica restrito ao navegador e à porta em que você estudou (`localhost:5173`). Outro navegador começa vazio.
  - Limpar os dados de navegação apaga o progresso. **Exporte um backup** em *Dados e ajustes*.
  - Se os dados salvos estiverem corrompidos, o app guarda uma cópia (`studyos.progress.corrupt.<data>`) antes de recomeçar.

## Status

Veja a seção "O que funciona hoje" em [docs/PLANO.md](docs/PLANO.md).
