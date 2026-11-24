import { EmptyState, Button } from '../components/ui/index.jsx'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md pt-16">
      <EmptyState title="Página não encontrada" action={<Button to="/">Voltar ao Dashboard</Button>}>
        O endereço não existe ou o conteúdo foi removido da biblioteca.
      </EmptyState>
    </div>
  )
}
