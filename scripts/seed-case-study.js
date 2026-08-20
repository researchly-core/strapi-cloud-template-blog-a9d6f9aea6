'use strict';

/**
 * Seed the first Case Study entry (de-DE) from the content-type spec.
 *
 * Required env:
 *   STRAPI_TOKEN   API token with create/update (and publish if --publish) on case-studies
 *
 * Optional env:
 *   STRAPI_URL     defaults to https://ingenious-miracle-474136bd13.strapiapp.com
 *
 * Usage:
 *   node scripts/seed-case-study.js
 *   node scripts/seed-case-study.js --dry-run
 *   node scripts/seed-case-study.js --publish
 *
 * Permissions (Users & Permissions / API token):
 *   case-study: find, findOne, create, update, publish
 * Public role typically needs find + findOne for Webstudio.
 */

const STRAPI_URL = (process.env.STRAPI_URL || 'https://ingenious-miracle-474136bd13.strapiapp.com').replace(
  /\/$/,
  ''
);
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const LOCALE = 'de-DE';
const SLUG = 'zielmarkt-reduktion-industriekonzern';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const shouldPublish = args.includes('--publish');

const SEED = {
  Title: 'Zielmarkt-Reduktion Industriekonzern',
  slug: SLUG,
  SEO: {
    metaTitle: 'Case Study: 14 Zielmärkte auf 3 reduziert | Researchly',
    metaDescription:
      'Markteintrittsanalyse für ein neues Produktsegment — Marktgröße, Wettbewerb und Regulatorik je Zielmarkt, mit Quellen.',
    seo_keyword: 'case study markteintritt',
    INDEX: false,
  },
  Hero: {
    kicker: 'Case Study',
    headline: 'Wie ein börsennotierter Industriekonzern 14 Zielmärkte auf 3 reduziert hat',
    subheadline:
      'Markteintrittsanalyse für ein neues Produktsegment — Marktgröße, Wettbewerbsdichte und regulatorische Hürden je Zielmarkt, mit Quellen.',
    tags: [
      { label: 'Industriegüter' },
      { label: 'Markteintritt' },
      { label: 'Corporate Strategy' },
    ],
    client_label: '[ Kundenlogo ] — oder anonymisiert bis Freigabe vorliegt',
    stats: [
      { value: '3 Tage', label: 'statt 6 Wochen Desk Research' },
      { value: '240', label: 'Quellen, alle belegt' },
      { value: '14 → 3', label: 'Zielmärkte reduziert' },
    ],
  },
  body_sections: [
    {
      title: 'Ausgangslage',
      body:
        '50 Wettbewerber, 12 Segmente, mehrere Regionen. Es gab kein systematisches Monitoring. Vor dem monatlichen Strategy Review wurden die Daten per Hand zusammengesucht.\n\nRelevante Signale lagen verteilt in News, Patenten, Geschäftsberichten und LinkedIn. An unterschiedlichen Stellen, und von niemandem zusammen gelesen.',
    },
    {
      title: 'Warum das schwer ist',
      body:
        'Namensambiguität: Mehrere Unternehmen tragen denselben Namen, plus eigene Gesellschaften in verschiedenen Ländern. Relevanz ist unternehmensspezifisch und lässt sich nicht im Voraus festlegen. Und Zahlen aus Geschäftsberichten zu ziehen, ist tatsächlich schwer.',
    },
    {
      title: 'Vorgehen',
      body:
        'NER für genau diese Ambiguität. Ein Classifier auf ihren Kategorien. Mehrere Verfeinerungsrunden mit ihrem Team. Quellen integriert, nicht einzeln überwacht.',
    },
    {
      title: 'Ergebnis',
      body:
        'Alle zwei Wochen: rund 10.000 Datenpunkte, verdichtet in einen Report mit etwa 20 belegten Aussagen. Dazwischen fährt das Team in der App Ad-hoc-Deep-Dives. Der monatliche Strategy Review beginnt jetzt mit Daten, nicht mit dem Einsammeln.',
    },
    {
      title: 'Wirkung',
      body:
        'Weniger Überraschungen. Kein manuelles Zusammensuchen mehr. Entscheidungen auf aktueller Evidenz, nicht auf dem Stand von vor vier Wochen.',
    },
    {
      title: 'Übertragbarkeit',
      body:
        'Das Muster sitzt, wo Competitive Sets fragmentiert sind, Firmennamen häufig vorkommen und das Geschäft über mehrere Regionen läuft.',
    },
  ],
};

const POPULATE =
  'populate[SEO]=*&populate[Hero][populate][stats]=*&populate[Hero][populate][tags]=*&populate[Hero][populate][image]=*&populate[Hero][populate][client_logo]=*&populate[body_sections]=*&populate[articles][populate]=*';

function usage(message) {
  if (message) console.error(message);
  console.error(`
Usage:
  STRAPI_TOKEN=xxx node scripts/seed-case-study.js [--dry-run] [--publish]
`);
  process.exit(1);
}

async function api(method, path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function findExisting() {
  const qs = new URLSearchParams({
    'filters[slug][$eq]': SLUG,
    locale: LOCALE,
    'pagination[pageSize]': '1',
  });
  const result = await api('GET', `/api/case-studies?${qs}`);
  return result?.data?.[0] || null;
}

async function main() {
  if (!STRAPI_TOKEN && !dryRun) {
    usage('STRAPI_TOKEN is required (unless --dry-run).');
  }

  console.log(`Strapi: ${STRAPI_URL}`);
  console.log(`Locale: ${LOCALE}`);
  console.log(`Slug:   ${SLUG}`);
  console.log(`Mode:   ${dryRun ? 'dry-run' : shouldPublish ? 'create/update + publish' : 'create/update (draft ok)'}`);

  if (dryRun) {
    console.log('\nPayload preview:');
    console.log(JSON.stringify({ data: SEED }, null, 2));
    return;
  }

  const existing = await findExisting();
  let documentId;

  if (existing) {
    documentId = existing.documentId;
    console.log(`Updating existing documentId=${documentId}`);
    await api('PUT', `/api/case-studies/${documentId}?locale=${LOCALE}`, { data: SEED });
  } else {
    console.log('Creating new entry…');
    const created = await api('POST', `/api/case-studies?locale=${LOCALE}`, { data: SEED });
    documentId = created?.data?.documentId;
    console.log(`Created documentId=${documentId}`);
  }

  if (shouldPublish && documentId) {
    await api('POST', `/api/case-studies/${documentId}/actions/publish?locale=${LOCALE}`);
    console.log('Published.');
  }

  const verifyQs = new URLSearchParams({
    'filters[slug][$eq]': SLUG,
    locale: LOCALE,
  });
  const verified = await api('GET', `/api/case-studies?${verifyQs}&${POPULATE}`);
  const entry = verified?.data?.[0];
  console.log('\nVerify:');
  console.log(
    JSON.stringify(
      {
        documentId: entry?.documentId,
        Title: entry?.Title,
        slug: entry?.slug,
        heroHeadline: entry?.Hero?.headline,
        tagCount: entry?.Hero?.tags?.length,
        statCount: entry?.Hero?.stats?.length,
        sectionCount: entry?.body_sections?.length,
        sectionTitles: entry?.body_sections?.map((s) => s.title),
        seoMetaTitle: entry?.SEO?.metaTitle,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  if (err.status === 403 || err.status === 401) {
    console.error(
      '\nCheck API token permissions for case-study: find, findOne, create, update, publish.'
    );
  }
  if (err.status === 404) {
    console.error(
      '\nContent type not found yet — deploy this schema to Strapi Cloud, then re-run.'
    );
  }
  process.exit(1);
});
