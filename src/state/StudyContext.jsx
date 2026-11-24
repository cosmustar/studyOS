// Estado global do progresso, compartilhado por todas as páginas via React Context.
// Qualquer componente chama `useStudy()` para ler o progresso ou registrar atividades.
// Cada mudança é salva automaticamente no localStorage.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createEmptyState, loadState, saveState } from '../lib/storage.js'
import { applyAnswer } from '../lib/progress.js'

const StudyContext = createContext(null)
const MAX_SESSION_SEC = 3 * 60 * 60 // evita contar uma aba esquecida aberta como horas de estudo

export function StudyProvider({ children }) {
  const [{ state: initial, warning: initialWarning }] = useState(loadState)
  const [state, setState] = useState(initial)
  const [warning, setWarning] = useState(initialWarning)

  useEffect(() => {
    const error = saveState(state)
    if (error) setWarning(error)
  }, [state])

  const recordAnswer = useCallback((questionId, isCorrect, selected) => {
    setState((s) => applyAnswer(s, questionId, isCorrect, selected))
  }, [])

  /** Registra uma sessão concluída. startedAt: Date; demais campos descrevem a atividade. */
  const logActivity = useCallback(({ startedAt, ...rest }) => {
    const endedAt = new Date()
    const durationSec = Math.min(Math.round((endedAt - startedAt) / 1000), MAX_SESSION_SEC)
    if (durationSec < 5) return // aberturas acidentais não contam
    const activity = {
      id: `${endedAt.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSec,
      ...rest,
    }
    setState((s) => ({ ...s, activities: [...s.activities, activity] }))
  }, [])

  const completeLesson = useCallback((lessonId) => {
    setState((s) => ({ ...s, lessons: { ...s.lessons, [lessonId]: { completedAt: new Date().toISOString() } } }))
  }, [])

  const setLastLocation = useCallback((path, label) => {
    setState((s) => ({ ...s, lastLocation: { path, label, at: new Date().toISOString() } }))
  }, [])

  const updateSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const replaceState = useCallback((next) => setState(next), [])
  const resetAll = useCallback(() => setState(createEmptyState()), [])

  const value = useMemo(
    () => ({ state, warning, dismissWarning: () => setWarning(null), recordAnswer, logActivity, completeLesson, setLastLocation, updateSettings, replaceState, resetAll }),
    [state, warning, recordAnswer, logActivity, completeLesson, setLastLocation, updateSettings, replaceState, resetAll],
  )
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudy precisa estar dentro de <StudyProvider>')
  return ctx
}
