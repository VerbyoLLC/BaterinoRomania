require('dotenv/config')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../generated/prisma')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const IMG = (f) => `/images/programe%20reduceri/${f}`
const CTA = '/login'

const programsByLocale = {
  ro: [
    {
      photo: IMG('tva-cum-era.jpg'),
      programLabel: 'PROGRAMUL TVA-UL DE 9%',
      title: '12% REDUCERE LA ORICE PRODUS',
      descriereScurta: 'Beneficiezi de 12% reducere din prețul fără TVA, la orice produs.',
      description: 'Eliminarea TVA-ului de 9% a generat scumpiri în lanț, inclusiv în piața bateriilor.\n\nNoi am ales să protejăm clienții, nu marja de profit: **beneficiezi de 12% reducere din prețul fără TVA, la orice produs.**',
      ctaLabel: 'CREEAZĂ CONT',
      ctaTo: CTA,
      termsLabel: 'Termeni și Condiții Reducere',
      durataProgram: 'Permanent',
      discountPercent: 12,
    },
    {
      photo: IMG('energie-pentru-parinti.jpg'),
      programLabel: 'PROGRAMUL ENERGIE PENTRU PĂRINȚI',
      title: '20% REDUCERE PENTRU PENSIONARI',
      descriereScurta: '20% reducere din prețul fără TVA la orice produs Baterino pentru pensionari.',
      description: 'Pentru că fiecare leu din pensie contează pentru seniorii noștri, am creat un program dedicat lor.\n\n**Beneficiezi de 20% reducere din prețul fără TVA la orice produs Baterino**, dacă faci dovada pensionării și ești beneficiarul produsului.',
      ctaLabel: 'CREEAZĂ CONT',
      ctaTo: CTA,
      termsLabel: 'Termeni și Condiții Reducere',
      topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
      stiaiCaTitle: 'Știai că?',
      stiaiCaText: 'La Baterino, pensionarii au prioritate zero la suport tehnic. Pentru că știm că nu au răbdare atunci când ceva nu funcționează.',
      durataProgram: 'Permanent',
      discountPercent: 20,
    },
    {
      photo: IMG('prietenie-cu-energie.jpg'),
      programLabel: "PROGRAMUL ȘTIU DE LA VECINU'",
      title: '5% REDUCERE PENTRU PRIETENI ȘI VECINI',
      descriereScurta: 'Primești 5% reducere cu un cod oferit de un client Baterino.',
      description: "Mereu îi sunai pe vecinu' să îți dea borma șina. Acum sună-l să îți dea un cod de reducere Baterino.\n\n**Primești 5% reducere** atunci când folosești un cod oferit de un client Baterino. Codul este disponibil în contul fiecărui client și poate fi oferit unui client nou, la prima comandă.",
      ctaLabel: 'CREEAZĂ CONT',
      ctaTo: CTA,
      termsLabel: 'Termeni și Condiții Reducere',
      topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
      stiaiCaTitle: 'Știai că?',
      stiaiCaText: "Dacă chiar nu găsești niciun prieten care să fie deja client, îl poți adăuga pe Baterino ca prieten pe Facebook, Instagram sau LinkedIn și să îi ceri lui un cod de reducere.",
      durataProgram: 'Permanent',
      discountPercent: 5,
    },
    {
      photo: IMG('viata-la-tara-campanie-baterino.jpg'),
      programLabel: 'PROGRAMUL VIAȚA LA ȚARĂ',
      title: '7% REDUCERE DACĂ LOCUIEȘTI LA ȚARĂ',
      descriereScurta: '7% reducere din prețul fără TVA dacă locuiești într-o comună sau sat.',
      description: 'Viața la țară înseamnă tradiție și grijă pentru casă. Suntem alături de cei care investesc în siguranța și confortul gospodăriei lor.\n\n**Beneficiezi de 7% reducere din prețul fără TVA** dacă factura este emisă pe numele beneficiarului final, iar în buletinul acestuia este trecut domiciliul într-o comună sau sat.',
      ctaLabel: 'CREEAZĂ CONT',
      ctaTo: CTA,
      termsLabel: 'Termeni și Condiții Reducere',
      durataProgram: 'Permanent',
      discountPercent: 7,
    },
  ],
  en: [
    {
      photo: IMG('tva-cum-era.jpg'),
      programLabel: 'THE 9% VAT PROGRAMME',
      title: '12% DISCOUNT ON ANY PRODUCT',
      description: 'The removal of the 9% VAT generated a chain of price increases, including in the battery market.\n\nWe chose to protect our clients, not our profit margin: you benefit from a 12% discount off the VAT-exclusive price on any product.',
      ctaLabel: 'CREATE ACCOUNT',
      ctaTo: CTA,
      termsLabel: 'Discount Terms & Conditions',
      durataProgram: 'Permanent',
      discountPercent: 12,
    },
    {
      photo: IMG('energie-pentru-parinti.jpg'),
      programLabel: 'ENERGY FOR PARENTS PROGRAMME',
      title: '20% DISCOUNT FOR PENSIONERS',
      description: 'Because every penny of a pension counts for our seniors, we created a dedicated programme for them.\n\nYou benefit from a 20% discount off the VAT-exclusive price on any Baterino product, if you provide proof of retirement and you are the product beneficiary.',
      ctaLabel: 'CREATE ACCOUNT',
      ctaTo: CTA,
      termsLabel: 'Discount Terms & Conditions',
      topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
      stiaiCaTitle: 'Did you know?',
      stiaiCaText: "At Baterino, pensioners get priority zero technical support. Because we know they have no patience when something isn't working.",
      durataProgram: 'Permanent',
      discountPercent: 20,
    },
    {
      photo: IMG('prietenie-cu-energie.jpg'),
      programLabel: 'I HEARD IT FROM THE NEIGHBOUR',
      title: '5% DISCOUNT FOR FRIENDS & NEIGHBOURS',
      description: "You used to call your neighbour for a hand. Now call them for a Baterino discount code.\n\nGet 5% off when you use a code shared by a Baterino client. The code is available in every client's account and can be given to a new customer on their first order.",
      ctaLabel: 'CREATE ACCOUNT',
      ctaTo: CTA,
      termsLabel: 'Discount Terms & Conditions',
      topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
      stiaiCaTitle: 'Did you know?',
      stiaiCaText: "If you can't find a friend who is already a Baterino client, you can add Baterino as a friend on Facebook, Instagram or LinkedIn and ask for a discount code.",
      durataProgram: 'Permanent',
      discountPercent: 5,
    },
    {
      photo: IMG('viata-la-tara-campanie-baterino.jpg'),
      programLabel: 'RURAL LIFE PROGRAMME',
      title: '7% DISCOUNT IF YOU LIVE IN A VILLAGE',
      description: 'Rural life means tradition and care for home. We support those who invest in the safety and comfort of their household.\n\nYou benefit from a 7% discount off the VAT-exclusive price if the invoice is issued in the name of the end beneficiary whose registered address is in a commune or village.',
      ctaLabel: 'CREATE ACCOUNT',
      ctaTo: CTA,
      termsLabel: 'Discount Terms & Conditions',
      durataProgram: 'Permanent',
      discountPercent: 7,
    },
  ],
  zh: [
    {
      photo: IMG('tva-cum-era.jpg'),
      programLabel: '9%增值税计划',
      title: '所有产品享12%折扣',
      description: '取消9%增值税导致了包括电池市场在内的一系列价格上涨。\n\n我们选择保护客户而非利润率：任何产品均可享受不含税价格12%的折扣。',
      ctaLabel: '注册账户',
      ctaTo: CTA,
      termsLabel: '折扣条款与条件',
      durataProgram: 'Permanent',
      discountPercent: 12,
    },
    {
      photo: IMG('energie-pentru-parinti.jpg'),
      programLabel: '父母能源计划',
      title: '退休人员享20%折扣',
      description: '因为养老金的每一分钱对我们的老人都很宝贵，我们为他们创建了专属计划。\n\n提供退休证明并作为产品受益人，即可享受任何Baterino产品不含税价格20%的折扣。',
      ctaLabel: '注册账户',
      ctaTo: CTA,
      termsLabel: '折扣条款与条件',
      topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
      stiaiCaTitle: '您知道吗？',
      stiaiCaText: '在Baterino，退休人员享有零优先级技术支持。因为我们知道当出现问题时，他们没有耐心等待。',
      durataProgram: 'Permanent',
      discountPercent: 20,
    },
    {
      photo: IMG('prietenie-cu-energie.jpg'),
      programLabel: '邻居推荐计划',
      title: '朋友与邻居享5%折扣',
      description: '您以前总是找邻居帮忙。现在让他们给您一个Baterino折扣码。\n\n使用Baterino客户分享的折扣码可享受5%优惠。每位客户账户中均有折扣码，可在新客户首次下单时赠送。',
      ctaLabel: '注册账户',
      ctaTo: CTA,
      termsLabel: '折扣条款与条件',
      topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
      stiaiCaTitle: '您知道吗？',
      stiaiCaText: '如果您找不到已是Baterino客户的朋友，可以在Facebook、Instagram或LinkedIn上添加Baterino为好友，向他们索取折扣码。',
      durataProgram: 'Permanent',
      discountPercent: 5,
    },
    {
      photo: IMG('viata-la-tara-campanie-baterino.jpg'),
      programLabel: '乡村生活计划',
      title: '乡村居民享7%折扣',
      description: '乡村生活意味着传统与对家园的关爱。我们支持那些为家庭安全与舒适投资的人。\n\n如果发票以最终受益人名义开具，且其注册地址位于乡镇或村庄，则可享受不含税价格7%的折扣。',
      ctaLabel: '注册账户',
      ctaTo: CTA,
      termsLabel: '折扣条款与条件',
      durataProgram: 'Permanent',
      discountPercent: 7,
    },
  ],
}

async function main() {
  await prisma.reducereProgram.deleteMany({})
  console.log('Cleared existing ReducereProgram rows')

  for (const [locale, programs] of Object.entries(programsByLocale)) {
    for (let i = 0; i < programs.length; i++) {
      const p = programs[i]
      await prisma.reducereProgram.create({
        data: {
          locale,
          photo: p.photo,
          programLabel: p.programLabel,
          title: p.title,
          descriereScurta: p.descriereScurta ?? null,
          description: p.description,
          ctaLabel: p.ctaLabel,
          ctaTo: p.ctaTo,
          termsLabel: p.termsLabel,
          topIcon: p.topIcon ?? null,
          stiaiCaTitle: p.stiaiCaTitle ?? null,
          stiaiCaText: p.stiaiCaText ?? null,
          durataProgram: p.durataProgram ?? null,
          discountPercent: p.discountPercent ?? null,
          sortOrder: i,
        },
      })
    }
  }

  console.log(`Seeded ${Object.keys(programsByLocale).length * 4} ReducereProgram rows (ro, en, zh × 4 programs each)`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
