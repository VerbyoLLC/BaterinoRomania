import { next } from '@vercel/functions'
import {
  buildOgHtml,
  normalizePathname,
  notFoundOg,
  resolveOg,
  resolveOgDynamic,
  STATIC_PAGE_PATHS,
} from './og-data'

/**
 * Crawlers that either don't execute JavaScript (search, AI/LLM, social-preview bots) or that
 * benefit from skipping the render queue (Googlebot) — served a pre-rendered HTML snapshot with
 * real title/description/body text so indexing doesn't depend on the client-side React bundle.
 * Regular browser traffic always gets the normal SPA shell.
 */
const CRAWLER_UA =
  /googlebot|google-extended|bingbot|duckduckbot|yandexbot|baiduspider|applebot-extended|applebot|amazonbot|bytespider|ia_archiver|diffbot|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-web|anthropic-ai|perplexitybot|perplexity-user|ccbot|facebookexternalhit|meta-externalagent|facebookcatalog|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterestbot|redditbot|skypeuripreview/i

const STATIC_PATH_SET = new Set(STATIC_PAGE_PATHS)

const PRIVATE_PREFIXES = [
  '/admin',
  '/client',
  '/partner',
  '/sales-agent',
  '/login',
  '/signup',
  '/reset-password',
  '/comanda',
  '/cos',
  '/api',
]

const ASSET_EXT =
  /\.(js|css|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|eot|txt|xml|json|webmanifest|mp4|webm)$/i

function isPrivatePath(path: string): boolean {
  return PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
}

function isCrawlerContentPath(path: string): boolean {
  if (STATIC_PATH_SET.has(path)) return true
  if (path === '/blog' || path.startsWith('/blog/')) return true
  if (path === '/produse' || path.startsWith('/produse/')) return true
  if (path.startsWith('/companii-instalatori-fotovoltaice/')) return true
  if (path.startsWith('/companii/')) return true
  return false
}

export default async function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  const path = normalizePathname(pathname)

  // Let static files and API pass through unchanged.
  if (ASSET_EXT.test(path) || path.startsWith('/assets/')) return next()

  const ua = request.headers.get('user-agent') ?? ''
  if (!CRAWLER_UA.test(ua)) return next()

  if (isPrivatePath(path)) {
    const og = {
      ...notFoundOg(path),
      title: 'Zonă privată',
      description: 'Această pagină nu este destinată indexării în motoarele de căutare.',
      notFound: false,
      noIndex: true,
    }
    return new Response(buildOgHtml(og), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex, nofollow',
        'x-og-middleware': 'private',
      },
    })
  }

  if (!isCrawlerContentPath(path)) {
    const og = notFoundOg(path)
    return new Response(buildOgHtml(og), {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
        'x-robots-tag': 'noindex, nofollow',
        'x-og-middleware': 'not-found',
      },
    })
  }

  let og
  try {
    og = await resolveOgDynamic(pathname)
  } catch {
    og = resolveOg(pathname)
  }

  const status = og.notFound ? 404 : 200
  return new Response(buildOgHtml(og), {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': og.notFound
        ? 'public, max-age=300'
        : 'public, max-age=3600, s-maxage=3600',
      ...(og.notFound || og.noIndex ? { 'x-robots-tag': 'noindex, nofollow' } : {}),
      'x-og-middleware': og.notFound ? 'not-found' : 'hit',
    },
  })
}

export const config = {
  runtime: 'edge',
}
