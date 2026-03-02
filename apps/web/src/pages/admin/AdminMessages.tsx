export default function AdminMessages() {
  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Messages
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Solicitări primite prin formularul de contact.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <p className="text-gray-500 text-sm font-['Inter']">
          Lista mesajelor va fi afișată aici după implementarea API-ului de inquiries.
        </p>
      </div>
    </div>
  )
}
