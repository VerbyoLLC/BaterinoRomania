# Railway + Prisma + R2 – Checklist deploy

Când clonezi repo-ul și vrei să deployezi pe Railway, urmează pașii de mai jos.

---

## 1. Railway – Proiect și servicii

- [ ] Creează proiect Railway → **Deploy from GitHub** → selectează repo-ul
- [ ] Setează **Root Directory** la `apps/api` (Settings → General)
- [ ] Adaugă **PostgreSQL**: **+ New** → **Database** → **PostgreSQL**
- [ ] Railway setează automat `DATABASE_URL` pe serviciul API

---

## 2. Variabile de mediu (Settings → Variables)

### Obligatorii (fără ele API-ul nu pornește corect)

| Variabilă | Unde o obții | Exemplu |
|-----------|---------------|---------|
| `DATABASE_URL` | Auto-setat de Railway când adaugi Postgres | `postgres://...` |
| `JWT_SECRET` | Generează: `openssl rand -hex 32` | string 64 caractere |

### Obligatorii pentru funcționalitate completă

| Variabilă | Unde o obții | Exemplu |
|-----------|---------------|---------|
| `FRONTEND_URL` | URL-ul unde e deployed frontend-ul (linkuri în emailuri). Dacă site-ul e pe Vercel, folosește URL-ul Vercel (ex. `https://baterino-xxx.vercel.app`) până când baterino.ro e configurat | `https://baterino.vercel.app` sau `https://baterino.ro` |
| `R2_ENDPOINT` | Cloudflare R2 → bucket → Settings | `https://xxx.eu.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | R2 → Manage R2 API Tokens → Create | |
| `R2_SECRET_ACCESS_KEY` | La crearea token-ului R2 | |
| `R2_BUCKET` | Numele bucket-ului R2 | `baterinoromania` |
| `R2_PUBLIC_URL` | Domeniul public R2 (custom domain sau r2.dev) | `https://media.baterino.ro` |

### Opționale (emailuri – cod verificare, reset parolă)

**Railway Free/Hobby blochează SMTP.** Folosește **Resend** (API HTTP):

| Variabilă | Unde o obții |
|-----------|---------------|
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys → Create |
| `RESEND_FROM` | `Baterino <onboarding@resend.dev>` (test) sau `Baterino <no-reply@baterino.ro>` (după verificare domeniu) |
| `SITE_NAME` | Baterino Romania |

**Alternativ:** SMTP (doar Railway Pro sau local):

| Variabilă | Unde o obții |
|-----------|---------------|
| `SMTP_HOST` | ex. SiteGround: `mail.baterino.ro` |
| `SMTP_PORT` | `587` (TLS) sau `465` (SSL) |
| `SMTP_USER` | Utilizator SMTP |
| `SMTP_PASS` | Parolă SMTP |
| `MAIL_FROM` | `Baterino <noreply@baterino.ro>` |

---

## 3. Cloudflare R2 – Setup

1. **Bucket**: Creează bucket în [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. **API Token**: R2 → **Manage R2 API Tokens** → **Create API token** (permisiuni: Object Read & Write)
3. **Endpoint**: În detaliile bucket-ului sau în API token – ex. `https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com`
4. **Public access**:
   - **R2.dev**: Bucket → Settings → Public access → Enable R2.dev subdomain → folosește URL-ul generat ca `R2_PUBLIC_URL`
   - **Custom domain**: Adaugă `media.baterino.ro` (sau alt subdomeniu) și configurează CNAME în DNS

---

## 4. Vercel (frontend) – variabile obligatorii

Dacă frontend-ul e pe Vercel, setează în **Vercel → Project → Settings → Environment Variables**:

| Variabilă | Valoare |
|-----------|---------|
| `VITE_API_URL` | URL-ul API-ului Railway, ex. `https://baterinoromania-production.up.railway.app/api` |

Fără această variabilă, frontend-ul va încerca `/api` pe domeniul Vercel (inexistent) și va afișa „API indisponibil”.

**Important pentru reset parolă**: Proiectul include `apps/web/vercel.json` cu rewrites SPA – fără el, link-urile directe (ex. `/reset-password?token=...`) ar returna 404 pe Vercel.

---

## 5. După deploy

- [ ] **Generate Domain**: Settings → Networking → **Generate Domain**
- [ ] Verifică healthcheck: `https://<domeniu-railway>/health` → `{"ok":true}`
- [ ] Creează admin: rulează local `node apps/api/create-admin.cjs` cu `DATABASE_URL` de producție (sau adaugă script în Railway)

---

## 6. Template .env (pentru referință locală)

Copiază `apps/api/.env.example` în `apps/api/.env` și completează valorile. **Nu comite .env** – e în `.gitignore`.
