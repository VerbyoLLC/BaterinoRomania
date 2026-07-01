const puppeteer = require('puppeteer')

async function check(url) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  const rootLen = await page.$eval('#root', (el) => el.innerHTML.length)
  console.log(JSON.stringify({ url, rootLen, errors }, null, 2))
  await browser.close()
}

const url = process.argv[2] || 'http://localhost:3000/'
check(url).catch((err) => {
  console.error(err)
  process.exit(1)
})
