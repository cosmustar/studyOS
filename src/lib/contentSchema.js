// Regras de validação da biblioteca de conteúdo.
// Usado pelo app (ao carregar) e pelo script `npm run validate:content`.
// Função pura: recebe dados, devolve uma lista de problemas. Não depende de React.

export const VALIDATION_STATUSES = {
  pending_review: 'Pendente de revisão',
  validated: 'Validado',
  needs_update: 'Necessita atualização',
  archived: 'Arquivado',
}

export const ORIGINS = {
  official: 'Oficial',
  original: 'Original (inspirado no exame)',
}

export const DIFFICULTIES = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

export const EXAMS = {
  secplus: 'CompTIA Security+',
  'ielts-gt': 'IELTS General Training',
}

const REQUIRED = ['id', 'type', 'title', 'exam', 'domain', 'sourceIds', 'validationStatus', 'origin', 'createdBy', 'difficulty']

/**
 * @param {object} item  item de conteúdo (aula, questão, flashcard, set)
 * @param {object} ctx   { sourceIds:Set, objectiveCodes:Set }
 * @returns {string[]}   lista de problemas (vazia = OK)
 */
export function validateItem(item, ctx) {
  const problems = []
  const where = item?.id ?? '(sem id)'

  for (const field of REQUIRED) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      problems.push(`${where}: campo obrigatório ausente "${field}"`)
    }
  }
  if (item.validationStatus && !(item.validationStatus in VALIDATION_STATUSES)) {
    problems.push(`${where}: status inválido "${item.validationStatus}"`)
  }
  if (item.origin && !(item.origin in ORIGINS)) problems.push(`${where}: origem inválida "${item.origin}"`)
  if (item.difficulty && !(item.difficulty in DIFFICULTIES)) problems.push(`${where}: dificuldade inválida "${item.difficulty}"`)
  if (item.exam && !(item.exam in EXAMS)) problems.push(`${where}: exame desconhecido "${item.exam}"`)

  // Regra: toda fonte citada precisa existir no catálogo (nada de fontes inventadas).
  for (const sid of item.sourceIds ?? []) {
    if (!ctx.sourceIds.has(sid)) problems.push(`${where}: fonte "${sid}" não existe em sources.json`)
  }

  // Regra: código de objetivo precisa existir no documento oficial carregado.
  if (item.exam === 'secplus') {
    if (!item.examVersion) problems.push(`${where}: Security+ exige examVersion`)
    if (!ctx.objectiveCodes.has(item.objectiveCode)) {
      problems.push(`${where}: objetivo "${item.objectiveCode}" não existe em objectives.json`)
    }
  }

  // Regra: conteúdo gerado por IA só pode estar "validated" se um humano revisou.
  if (item.validationStatus === 'validated' && item.createdBy === 'ai' && !item.reviewedBy) {
    problems.push(`${where}: conteúdo de IA marcado como validado sem "reviewedBy"`)
  }
  if (item.validationStatus === 'validated' && !item.lastVerified) {
    problems.push(`${where}: conteúdo validado precisa de "lastVerified"`)
  }

  // Regras específicas de questões de múltipla escolha.
  if (item.type === 'mcq') {
    const ids = (item.options ?? []).map((o) => o.id)
    if (ids.length < 2) problems.push(`${where}: questão com menos de 2 alternativas`)
    if (!ids.includes(item.answer)) problems.push(`${where}: resposta "${item.answer}" não está entre as alternativas`)
    for (const o of item.options ?? []) {
      if (!o.explanation) problems.push(`${where}: alternativa "${o.id}" sem explicação`)
    }
  }
  return problems
}
