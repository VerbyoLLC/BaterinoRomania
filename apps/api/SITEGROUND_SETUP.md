# Configurare SiteGround pentru trimitere email

## Ce ai nevoie din SiteGround

### 1. Intră în Site Tools

1. Autentifică-te în **SiteGround** (siteground.com)
2. Deschide **Site Tools** pentru domeniul tău

### 2. Creează un cont de email

1. Mergi la **Email** → **Accounts** (sau **Email Accounts**)
2. Creează un cont nou, ex: `noreply@tudomeniu.com` sau `cont@baterino.ro`
3. Notează **parola** setată pentru acest cont

### 3. Găsește setările SMTP

În SiteGround, setările SMTP sunt de obicei:

| Setare | Valoare tipică |
|--------|----------------|
| **Host** | `mail.tudomeniu.com` sau `smtp.tudomeniu.com` |
| **Port** | `587` (TLS) sau `465` (SSL) |
| **Secure** | `false` pentru 587, `true` pentru 465 |

### 4. Completează `.env` în `apps/api`

Adaugă sau actualizează în `apps/api/.env`:

```
SMTP_HOST=mail.baterino.ro
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@baterino.ro
SMTP_PASS=lcm3qs~@Ey+2
MAIL_FROM="Baterino <no-reply@baterino.ro>"
SITE_NAME="Baterino Romania"
```

**Înlocuiește:**
- `tudomeniu.com` cu domeniul tău real
- `parola_contului_email` cu parola contului de email creat
- `noreply@tudomeniu.com` cu adresa de email creată

### 5. Verificare

- Dacă SMTP nu e configurat, codul se va afișa în consolă (pentru development)
- După configurare, repornește API-ul: `cd apps/api && node index.js`
