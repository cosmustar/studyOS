// Persistência local (localStorage).
// Tudo que é "progresso do usuário" fica sob UMA chave, com número de versão,
// para facilitar backup, importação e futuras migrações de formato.

export const STORAGE_KEY = 'studyos.progress'
export const SCHEMA_VERSION = 1

export function createEmptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    settings: { name: '', dailyGoalMinutes: 60 },
    activities: [], // sessões de estudo concluídas (tempo + resultado)
    questions: {}, // progresso por questão (tentativas, acertos, revisão espaçada)
    lessons: {}, // aulas concluídas
    lastLocation: null, // { path, label, at } — para "continuar de onde parei"
  }
}

/** Verifica se um objeto tem o formato esperado. Usado no load e na importação. */
export function validateState(data) {
  const errors = []
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return ['O arquivo não contém um objeto JSON.']
  if (data.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion esperado ${SCHEMA_VERSION}, recebido ${data.schemaVersion}.`)
  if (!Array.isArray(data.activities)) errors.push('"activities" deve ser uma lista.')
  for (const key of ['questions', 'lessons', 'settings']) {
    if (typeof data[key] !== 'object' || data[key] === null || Array.isArray(data[key])) errors.push(`"${key}" deve ser um objeto.`)
  }
  if (Array.isArray(data.activities)) {
    const bad = data.activities.find((a) => typeof a?.startedAt !== 'string' || typeof a?.durationSec !== 'number')
    if (bad) errors.push('Há atividades sem "startedAt" ou "durationSec" válidos.')
  }
  if (data.questions && typeof data.questions === 'object') {
    const bad = Object.values(data.questions).find((q) => typeof q?.attempts !== 'number' || typeof q?.correct !== 'number')
    if (bad) errors.push('Há registros de questões sem "attempts"/"correct" numéricos.')
  }
  return errors
}

/** Lê o estado salvo. Nunca lança erro: devolve { state, warning }. */
export function loadState() {
  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { state: createEmptyState(), warning: 'O navegador bloqueou o armazenamento local. Seu progresso não será salvo.' }
  }
  if (!raw) return { state: createEmptyState(), warning: null }

  try {
    const data = JSON.parse(raw)
    const errors = validateState(data)
    if (errors.length) throw new Error(errors.join(' '))
    // Mescla com o estado vazio para preencher campos novos que não existiam antes.
    const empty = createEmptyState()
    return { state: { ...empty, ...data, settings: { ...empty.settings, ...data.settings } }, warning: null }
  } catch (err) {
    // Não apagamos nada: guardamos uma cópia do dado corrompido antes de recomeçar.
    const backupKey = `${STORAGE_KEY}.corrupt.${Date.now()}`
    try { localStorage.setItem(backupKey, raw) } catch { /* sem espaço: ignora */ }
    return {
      state: createEmptyState(),
      warning: `Os dados salvos estavam inválidos (${err.message}). Uma cópia foi preservada em "${backupKey}".`,
    }
  }
}

/** Salva o estado. Devolve uma mensagem de erro ou null. */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return null
  } catch (err) {
    return `Não foi possível salvar o progresso: ${err.message}`
  }
}
