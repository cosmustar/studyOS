// Uma questão de múltipla escolha. Reutilizada na prática e no Reading.
// - Sem `revealed`: o usuário escolhe uma alternativa.
// - Com `revealed`: mostra correta/incorreta e a explicação de CADA alternativa.

export default function QuestionCard({ question, selected, onSelect, revealed, number }) {
  return (
    <div>
      <p className="leading-relaxed text-slate-100">
        {number != null && <span className="mr-2 text-slate-500">{number}.</span>}
        {question.stem}
      </p>
      <div className="mt-4 space-y-2" role="radiogroup">
        {question.options.map((o) => {
          const isAnswer = o.id === question.answer
          const isSelected = o.id === selected
          let tone = 'border-navy-600 hover:border-navy-400'
          if (isSelected && !revealed) tone = 'border-mint-400 bg-mint-400/5'
          if (revealed && isAnswer) tone = 'border-mint-400/70 bg-mint-400/10'
          if (revealed && isSelected && !isAnswer) tone = 'border-rose-400/70 bg-rose-400/10'
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={revealed}
              onClick={() => onSelect(o.id)}
              className={`block w-full rounded-lg border p-3 text-left text-sm transition-colors disabled:cursor-default ${tone}`}
            >
              <div className="flex gap-3">
                <span className="font-medium uppercase text-slate-500">{o.id}</span>
                <span className="text-slate-200">{o.text}</span>
                {revealed && isAnswer && <span className="ml-auto text-xs text-mint-300">correta</span>}
                {revealed && isSelected && !isAnswer && <span className="ml-auto text-xs text-rose-300">sua resposta</span>}
              </div>
              {revealed && <p className="mt-2 pl-7 text-xs leading-relaxed text-slate-400">{o.explanation}</p>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
