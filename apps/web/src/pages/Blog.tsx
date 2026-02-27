import SEO from '../components/SEO'

export default function Blog() {
  return (
    <>
      <SEO
        title="Blog – Baterino România"
        description="Știri și articole despre baterii LiFePO4, sisteme fotovoltaice și stocare energetică."
      />
      <div className="max-w-content mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-gray-600">Articole și știri despre Baterino și energie durabilă.</p>
      </div>
    </>
  )
}
