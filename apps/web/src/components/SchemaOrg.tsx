import { Helmet } from 'react-helmet-async'

/** Injects one or more JSON-LD <script type="application/ld+json"> blocks via react-helmet-async. */
export default function SchemaOrg({ schema }: { schema: object | object[] }) {
  const schemas = Array.isArray(schema) ? schema : [schema]
  return (
    <Helmet>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  )
}
