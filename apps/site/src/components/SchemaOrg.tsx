/** Injects one or more JSON-LD <script type="application/ld+json"> blocks (Server Component). */
export default function SchemaOrg({ schema }: { schema: object | object[] }) {
  const schemas = Array.isArray(schema) ? schema : [schema]
  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
    </>
  )
}
