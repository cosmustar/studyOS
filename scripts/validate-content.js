// Valida a biblioteca pelo terminal: `npm run validate:content`
// Usa as MESMAS regras do app (src/lib/contentSchema.js). Sai com código 1 se houver problemas.
import { readFileSync } from 'node:fs'
import { validateItem } from '../src/lib/contentSchema.js'

const read = (p) => JSON.parse(readFileSync(new URL(`../src/content/${p}`, import.meta.url), 'utf8'))
const withDefaults = (f) => f.items.map((i) => ({ ...f.defaults, ...i }))

const sources = read('sources.json').sources
const objectives = read('secplus/objectives.json')
const reading = read('ielts/reading.json').sets

const items = [
  ...read('secplus/lessons.json').lessons,
  ...withDefaults(read('secplus/questions.json')),
  ...withDefaults(read('secplus/flashcards.json')),
  ...reading,
  ...reading.flatMap((set) => set.questions.map((q) => {
    const { questions, passage, ...meta } = set
    return { ...meta, ...q, type: 'mcq', title: q.stem }
  })),
]

const ctx = {
  sourceIds: new Set(sources.map((s) => s.id)),
  objectiveCodes: new Set(objectives.domains.flatMap((d) => d.objectives.map((o) => o.code))),
}

const ids = new Map()
const problems = items.flatMap((i) => validateItem(i, ctx))
for (const i of items) {
  if (ids.has(i.id)) problems.push(`${i.id}: id duplicado`)
  ids.set(i.id, true)
}

const byStatus = items.reduce((m, i) => ({ ...m, [i.validationStatus]: (m[i.validationStatus] ?? 0) + 1 }), {})
console.log(`Itens: ${items.length}`, byStatus)
if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n- ` + problems.join('\n- '))
  process.exit(1)
}
console.log('Biblioteca OK — nenhuma regra violada.')
