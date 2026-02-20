import { useParams } from 'react-router-dom'

const PAGES: Record<string, string> = {
  viziune: 'Viziune',
  promisiune: 'Promisiune',
  contact: 'Contact',
}

export default function Companie() {
  const { slug } = useParams<{ slug: string }>()
  const title = slug ? PAGES[slug] ?? slug : 'Companie'
  return (
    <div className="max-w-content mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">Companie – {title}.</p>
    </div>
  )
}
