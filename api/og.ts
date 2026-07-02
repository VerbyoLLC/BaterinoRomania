import { buildOgHtml, resolveOg } from '../og-data'

export const config = {
  runtime: 'edge',
}

export default function handler(request: Request): Response {
  const url = new URL(request.url)
  const pathParam = url.searchParams.get('path')
  const pathname = pathParam ? decodeURIComponent(pathParam) : '/produse'

  const og = resolveOg(pathname)

  return new Response(buildOgHtml(og), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
      'x-og-middleware': 'hit',
    },
  })
}
