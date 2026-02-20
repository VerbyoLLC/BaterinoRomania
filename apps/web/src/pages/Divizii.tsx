import { useParams } from 'react-router-dom'

const DIVIZII: Record<string, string> = {
  rezidential: 'Rezidențial',
  industrial: 'Industrial',
  medical: 'Medical',
  maritim: 'Maritim',
}

export default function Divizii() {
  const { slug } = useParams<{ slug: string }>()
  const title = slug ? DIVIZII[slug] ?? slug : 'Divizii'
  return (
    <div className="max-w-content mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">Divizia {title}.</p>
    </div>
  )
}
