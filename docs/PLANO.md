# StudyOS: plano técnico

## 1. Fontes oficiais confirmadas (acessadas em 2026-11-23)

| Fato | Fonte |
|---|---|
| Security+ **V8 (SY0-801)** é a versão recomendada; lançada em 17/11/2026 | comptia.org/en-us/certifications/security/v8/ |
| V7 (SY0-701) é aposentada em 11/06/2027 (inglês) e em 13/08/2027 (outros idiomas) | comptia.org/en-us/certifications/security/v7/ |
| SY0-801: máx. 90 questões, 90 min, aprovação 750 (escala 100–900) | Página V8 + PDF de objetivos |
| Domínios: 1.0 (16%), 2.0 (24%), 3.0 (19%), 4.0 (27%), 5.0 (14%); 28 objetivos | PDF "SY0-801 V8 Exam Objectives, Document Version 2.0" |
| Formato do IELTS GT (Listening, Reading, Writing, Speaking) e critérios de Writing/Speaking | Páginas de formato em ielts.org |

Limitações:
- As páginas de formato do British Council e do IDP não foram consultadas; usei somente ielts.org.
- Todas as fontes estão com status `pending_review` até você confirmá-las.

## 2. Arquitetura

```
 JSON (content/) ──► content/index.js ──► páginas (pages/)  ◄── StudyContext ◄──► localStorage
   conteúdo           carrega + valida      UI                  progresso         persistência
                                                                     │
                                                              lib/progress.js (lógica pura)
```

- **SPA estática** com React e Vite. O build gera arquivos HTML/JS/CSS que rodam em qualquer lugar, inclusive offline.
- **HashRouter**: as URLs têm o formato `/#/secplus`, o que funciona em qualquer hospedagem estática sem configurar o servidor.
- **Context em vez de Redux**: o volume de estado é pequeno, então não é preciso adicionar mais uma biblioteca.
- **Sem biblioteca de gráficos por enquanto**: as barras da semana são feitas com CSS. Uma biblioteca de gráficos (por exemplo, Recharts) só entra na Fase 3 (Analytics), se for realmente necessária.
- **IA (Fase 5)**: a chave da API nunca fica no frontend. O plano é ter um backend próprio (por exemplo, Node/Express ou uma função serverless) que recebe a pergunta, busca trechos com status `validated` na biblioteca e chama o modelo. Quando não encontra evidência suficiente, a resposta diz isso.

## 3. Modelo de dados

### Item de conteúdo (aula, questão, flashcard, reading set)
| Campo | Exemplo | Observação |
|---|---|---|
| `id` | `sp-q-4.5-001` | único |
| `type` | `lesson` \| `mcq` \| `flashcard` \| `reading_set` | categoria |
| `title` | | |
| `exam` / `examVersion` | `secplus` / `SY0-801` | a versão é obrigatória na Security+ |
| `domain` / `objectiveCode` | `4.0` / `4.5` | o código precisa existir em `objectives.json` |
| `sourceIds` / `sourceUrl` | `["comptia-sy0-801-objectives"]` | a fonte precisa existir em `sources.json` |
| `lastVerified` | `null` ou `2026-12-01` | data da revisão humana |
| `validationStatus` | `pending_review` \| `validated` \| `needs_update` \| `archived` | |
| `origin` | `official` \| `original` | separa material oficial de exercício autoral |
| `createdBy` / `reviewedBy` | `ai` / `null` | |
| `difficulty` | `easy` \| `medium` \| `hard` | |
| `needsConfirmation` | lista de textos | pontos sinalizados para conferir |

Questões `mcq` têm, além disso, `stem`, `options[{id, text, explanation}]` e `answer`. Todas as alternativas trazem uma explicação, inclusive as incorretas.

### Fonte (`sources.json`)
`id, title, publisher, official, url, checkedAt, checkedBy, status, notes`

### Progresso (localStorage)
```js
{
  schemaVersion: 1,
  settings: { name, dailyGoalMinutes },
  activities: [{ id, kind, exam, label, startedAt, endedAt, durationSec, correct?, total? }],
  questions: { [id]: { attempts, correct, box, lastAnsweredAt, lastCorrect, nextReviewAt, history[≤20] } },
  lessons: { [id]: { completedAt } },
  lastLocation: { path, label, at }
}
```

## 4. Regras de validação (aplicadas por código)

`lib/contentSchema.js` roda tanto no app quanto em `npm run validate:content`. Ele rejeita:
- fonte que não está no catálogo, o que impede referências inventadas;
- código de objetivo inexistente no documento oficial;
- conteúdo `createdBy: "ai"` marcado como `validated` sem `reviewedBy`;
- conteúdo `validated` sem `lastVerified`;
- questão cuja resposta não está entre as alternativas, ou alternativa sem explicação.

Na interface, todo item mostra o status, a origem (oficial ou original), o selo "Gerado por IA" e um aviso de revisão pendente, além das suas fontes.

## 5. Estratégia de conteúdo

1. **Estrutura oficial primeiro.** Domínios, objetivos e formato do exame vêm de fontes oficiais, com URL e data de acesso.
2. **Conteúdo original escrito por IA** a partir dos objetivos. Ele entra como `pending_review` e com o selo "Gerado por IA", e nunca copia material protegido.
3. **Revisão humana.** Você compara o item com o material oficial e, na Fase 4, aprova pelo painel Admin. Até lá, a aprovação é feita editando o JSON: `validationStatus`, `reviewedBy` e `lastVerified`.
4. **Expansão em lotes pequenos**, objetivo por objetivo, priorizando o IAM (4.5) e os domínios de maior peso (4.0 com 27% e 2.0 com 24%).
5. **Revalidação.** Quando a CompTIA publicar uma nova versão dos objetivos, os itens afetados passam para `needs_update`.

## 6. Roadmap

| Fase | Entregas | Status |
|---|---|---|
| 1. Planejamento | Requisitos, arquitetura, modelo de dados, fontes oficiais | ✅ concluída |
| 2a. MVP: base | Layout, navegação, dashboard real, trilha Security+, aulas, prática com correção, IELTS Reading com cronômetro, biblioteca, persistência, backup | ✅ **esta entrega** |
| 2b. MVP: IELTS | Writing (editor, contador, cronômetro, histórico), Speaking (3 partes, cronômetros), Listening (precisa de áudio próprio ou licenciado) | planejado |
| 3. Aprendizagem | Flashcards com animação, simulados, registro de simulados externos, Analytics com gráficos | planejado |
| 4. Gestão | Painel Admin (editar, aprovar, rejeitar, cadastrar fontes) | planejado |
| 5. Evolução | Backend, banco de dados, autenticação, IA com RAG sobre conteúdo validado, hospedagem | planejado |

### Persistência do Admin (Fase 4): limitação de um app estático
Um site estático **não consegue gravar** nos arquivos JSON do projeto. Opções:
- (a) as edições ficam no localStorage, como uma camada sobre o JSON, e um botão "Exportar biblioteca" gera um JSON para substituir o arquivo em `src/content/`;
- (b) um pequeno servidor local (Node) grava os arquivos diretamente.

A recomendação é começar com (a) e migrar para um banco de dados na Fase 5.

## 7. O que funciona hoje
- Dashboard calculado a partir do seu histórico: meta diária, semana, streak, tempo total, revisões vencidas, assuntos fracos, últimas atividades e botão "Continuar".
- Trilha da Security+ com os 5 domínios e 28 objetivos oficiais, 2 aulas (1.1 e 4.5) e 11 questões de cenário.
- Revisão espaçada por caixas, com intervalos de 0, 1, 3, 7, 16 e 35 dias.
- Detecção de assunto fraco: 3 ou mais respostas e acerto abaixo de 70%.
- IELTS: formato oficial com fontes e 1 Reading Section 1 original (7 questões T/F/NG) com cronômetro.
- Biblioteca com filtros, metadados de rastreabilidade e catálogo de fontes.
- Exportação e importação de backup com validação; reset com confirmação.

**Ainda não existe:** a interface de flashcards (os 6 flashcards existem só como dados), simulados, Writing, Speaking, Listening, Analytics e o painel Admin.
