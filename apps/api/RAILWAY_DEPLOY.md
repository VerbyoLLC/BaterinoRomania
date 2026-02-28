# Deploy API pe Railway

> **Checklist complet**: vezi [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) pentru pașii detaliați și sursele valorilor.

## 1. Creare proiect Railway

1. Mergi la [railway.app](https://railway.app) și conectează-te cu GitHub
2. **New Project** → **Deploy from GitHub repo** → selectează repository-ul Baterino Romania
3. În setările serviciului, setează **Root Directory** la `apps/api`

## 2. Adaugă PostgreSQL

1. În proiectul Railway: **+ New** → **Database** → **PostgreSQL**
2. Railway va crea automat variabila `DATABASE_URL` și o va lega de serviciul tău

## 3. Variabile de mediu

În **Variables** pentru serviciul API, adaugă:

| Variabilă | Descriere | Exemplu |
|-----------|-----------|---------|
| `DATABASE_URL` | Conectare PostgreSQL (auto-setat dacă ai adăugat DB) | `postgres://...` |
| `JWT_SECRET` | Secret pentru JWT (obligatoriu în producție) | string lung, aleatoriu |
| `FRONTEND_URL` | URL frontend (pentru linkuri în emailuri) | `https://baterino.ro` |
| `SMTP_HOST` | Host SMTP pentru emailuri | ex. `smtp.example.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilizator SMTP | |
| `SMTP_PASS` | Parolă SMTP | |
| `MAIL_FROM` | Adresa expeditor | `Baterino <noreply@tudomeniu.com>` |
| `SITE_NAME` | Nume site | `Baterino Romania` |
| `R2_ENDPOINT` | Cloudflare R2 endpoint | `https://xxx.eu.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | R2 API key | |
| `R2_SECRET_ACCESS_KEY` | R2 API secret | |
| `R2_BUCKET` | Nume bucket R2 | `baterinoromania` |
| `R2_PUBLIC_URL` | URL public pentru fișiere | `https://media.baterino.ro` |

## 4. Deploy

- La fiecare push, Railway construiește imaginea Docker din `Dockerfile`:
  1. **Build**: `prisma generate` (generează clientul)
  2. **Pre-deploy**: `prisma migrate deploy` (rulează migrările înainte de start)
  3. **Runtime**: `node index.js` (pornire rapidă, healthcheck trece mai ușor)

## 5. Domeniu și URL

1. În **Settings** → **Networking** → **Generate Domain** pentru a obține un URL public
2. Actualizează `FRONTEND_URL` în variabile dacă frontend-ul folosește alt domeniu

## 6. Verificare

- Healthcheck: `https://<your-app>.railway.app/health` → `{"ok":true}`
- API base: `https://<your-app>.railway.app/api/...`

## Troubleshooting

- **Healthcheck failed**: Verifică **Deployments** → **View Logs** pentru erori la pornire. Asigură-te că `DATABASE_URL` e setat.
- **Migrări eșuate** (pre-deploy): Verifică logs-urile deploy-ului. `DATABASE_URL` trebuie să fie corect și Postgres activ.
- **"prisma: command not found"**: `prisma` trebuie în `dependencies` (nu devDependencies).
