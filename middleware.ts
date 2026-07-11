import { next } from '@vercel/functions'
import { buildOgHtml, normalizePathname, resolveOg, resolveOgDynamic, STATIC_PAGE_PATHS } from './og-data'

/**
 * Crawlers that either don't execute JavaScript (search, AI/LLM, social-preview bots) or that
 * benefit from skipping the render queue (Googlebot) — served a pre-rendered HTML snapshot with
 * real title/description/body text so indexing doesn't depend on the client-side React bundle.
 * Regular browser traffic always gets the normal SPA shell.
 */
const CRAWLER_UA =
  /googlebot|google-extended|bingbot|duckduckbot|yandexbot|baiduspider|applebot-extended|applebot|amazonbot|bytespider|ia_archiver|diffbot|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-web|anthropic-ai|perplexitybot|perplexity-user|ccbot|facebookexternalhit|meta-externalagent|facebookcatalog|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterestbot|redditbot|skypeuripreview/i

const STATIC_PATH_SET = new Set(STATIC_PAGE_PATHS)

export default async function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  const isProductOrBlog = pathname.startsWith('/produse') || pathname.startsWith('/blog')
  const isStaticPage = STATIC_PATH_SET.has(normalizePathname(pathname))
  if (!isProductOrBlog && !isStaticPage) return next()

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
