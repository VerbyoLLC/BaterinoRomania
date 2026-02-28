#!/usr/bin/env node
/**
 * Test R2 connection: uploads a tiny file and prints the URL.
 * Run: node test-r2.cjs
 */
require('dotenv').config()
const { uploadToR2, isR2Configured } = require('./lib/r2.js')

async function main() {
  if (!isR2Configured()) {
    console.error('R2 neconfigurat. Verifică în .env: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL')
    process.exit(1)
  }
  const key = `test/r2-check-${Date.now()}.txt`
  const buffer = Buffer.from('R2 connection test – Baterino API', 'utf8')
  try {
    const url = await uploadToR2(buffer, key, 'text/plain')
    console.log('OK – R2 conectat.')
    console.log('URL:', url)
    console.log('Deschide în browser pentru a verifica.')
  } catch (err) {
    console.error('Eroare R2:', err.message)
    process.exit(1)
  }
}

main()
