import { buildOgHtml, resolveOg } from './og-data'

/** Social / link-preview crawlers only — Googlebot intentionally excluded (executes JS). */
const CRAWLER_UA =
  /facebookexternalhit|meta-externalagent|facebookcatalog|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterestbot|redditbot|skypeuripreview|applebot/i

export default function middleware(request: Request): Response | undefined {
  const ua = request.headers.get('user-agent') ?? ''
  if (!CRAWLER_UA.test(ua)) return undefined

  const { pathname } = new URL(request.url)
  const og = resolveOg(pathname)

  console.log('[og-middleware] hit', { pathname, ua: ua.slice(0, 120) })

  return new Response(buildOgHtml(og), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
      'x-og-middleware': 'hit',
    },
  })
}

export const config = {
  matcher: ['/produse/:path*'],
}
