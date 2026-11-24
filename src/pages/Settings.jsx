// Ajustes pessoais + backup (exportar/importar) + reset.
import { useRef, useState } from 'react'
import { useStudy } from '../state/StudyContext.jsx'
import { validateState } from '../lib/storage.js'
import { Card, PageHeader, Button } from '../components/ui/index.jsx'

export default function Settings() {
  const { state, updateSettings, replaceState, resetAll } = useStudy()
  const [message, setMessage] = useState(null)
  const fileRef = useRef(null)

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studyos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ ok: true, text: 'Backup exportado.' })
  }

  const importBackup = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const errors = validateState(data)
      if (errors.length) return setMessage({ ok: false, text: `Arquivo rejeitado: ${errors.join(' ')}` })
      const n = data.activities.length
      if (!window.confirm(`Substituir seu progresso atual por este backup (${n} sessões)? Recomendo exportar um backup antes.`)) return
      replaceState(data)
      setMessage({ ok: true, text: `Backup importado: ${n} sessões, ${Object.keys(data.questions).length} questões.` })
    } catch (err) {
      setMessage({ ok: false, text: `Não foi possível ler o arquivo: ${err.message}` })
    }
  }

  const reset = () => {
    if (window.prompt('Isso apaga TODO o seu progresso. Digite APAGAR para confirmar.') === 'APAGAR') {
      resetAll()
      setMessage({ ok: true, text: 'Progresso apagado.' })
    }
  }

  return (
    <div className="animate-in mx-auto max-w-2xl space-y-6">
      <PageHeader title="Dados e ajustes" />
      {message && (
        <div className={`rounded-lg border p-3 text-sm ${message.ok ? 'border-mint-500/30 bg-mint-500/10 text-mint-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`}>{message.text}</div>
      )}

      <Card title="Perfil">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Como quer ser chamado(a)
            <input value={state.settings.name} onChange={(e) => updateSettings({ name: e.target.value })} className="rounded-lg border border-navy-600 bg-navy-850 px-3 py-2 text-sm text-slate-200" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Meta diária (minutos)
            <input type="number" min={5} max={600} step={5} value={state.settings.dailyGoalMinutes}
              onChange={(e) => updateSettings({ dailyGoalMinutes: Math.min(600, Math.max(5, Number(e.target.value) || 5)) })}
              className="rounded-lg border border-navy-600 bg-navy-850 px-3 py-2 text-sm text-slate-200" />
          </label>
        </div>
      </Card>

      <Card title="Backup">
        <p className="mb-4 text-sm text-slate-400">
          Seu progresso fica salvo apenas neste navegador (localStorage). Limpar os dados do navegador apaga o progresso —
          exporte um backup regularmente.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportBackup}>Exportar backup (.json)</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>Importar backup</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importBackup} />
        </div>
      </Card>

      <Card title="Zona de perigo">
        <Button variant="danger" onClick={reset}>Apagar todo o progresso</Button>
      </Card>
    </div>
  )
}
