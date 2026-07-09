import { next } from '@vercel/functions'
import { buildOgHtml, resolveOg, resolveOgDynamic } from './og-data'

/** Social / link-preview crawlers only — Googlebot intentionally excluded (executes JS). */
const CRAWLER_UA =
  /facebookexternalhit|meta-externalagent|facebookcatalog|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterestbot|redditbot|skypeuripreview|applebot/i

export default async function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  if (!pathname.startsWith('/produse') && !pathname.startsWith('/blog')) return next()

  const ua = request.headers.get('user-agent') ?? ''
  if (!CRAWLER_UA.test(ua)) return next()

  let og
  try {
    og = await resolveOgDynamic(pathname)
  } catch {
    og = resolveOg(pathname)
  }

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
  runtime: 'edge',
}
