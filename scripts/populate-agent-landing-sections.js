'use strict';

/**
 * Populate Manus-style landing page sections on an agentic-workflow-template.
 *
 * Usage:
 *   node scripts/populate-agent-landing-sections.js <documentId> [--publish]
 *
 * Auth: STRAPI_TOKEN env var, or Authorization header from ~/.cursor/mcp.json (strapi-mcp).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const STRAPI_URL = (process.env.STRAPI_URL || 'https://ingenious-miracle-474136bd13.strapiapp.com').replace(
  /\/$/,
  ''
);
const DEFAULT_LOCALE = 'de-DE';

const args = process.argv.slice(2);
const publish = args.includes('--publish');
const documentId = args.find((arg) => !arg.startsWith('--'));

function resolveToken() {
  if (process.env.STRAPI_TOKEN) {
    return process.env.STRAPI_TOKEN;
  }

  const mcpPath = path.join(os.homedir(), '.cursor', 'mcp.json');
  if (!fs.existsSync(mcpPath)) {
    return null;
  }

  const config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  const auth = config?.mcpServers?.['strapi-mcp']?.headers?.Authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : auth || null;
}

function landingSections(agentName) {
  return {
    use_cases_heading: `Anwendungsfälle für ${agentName}`,
    capabilities: {
      heading: 'Wofür Sie Researchly nutzen können',
      items: [
        {
          title: `${agentName} in Minuten`,
          description:
            'Erstellen Sie vollständige Analysen mit priorisierten Handlungsempfehlungen — strukturiert nach MECE-Prinzip und bereit für Ihr nächstes Strategy-Meeting.',
        },
        {
          title: 'Investment Due Diligence',
          description:
            'Bewerten Sie Portfoliounternehmen und Deal-Kandidaten systematisch auf Basis aktueller Datenquellen.',
        },
        {
          title: 'Strategische Entscheidungen vorbereiten',
          description:
            'Nutzen Sie strukturierte Frameworks und konkrete Handlungsempfehlungen als Entscheidungsgrundlage.',
        },
        {
          title: 'Wettbewerbsposition bewerten',
          description:
            'Vergleichen Sie die eigene Position im Marktumfeld und identifizieren Sie Chancen und Bedrohungen.',
        },
      ],
    },
    audience: {
      heading: `Wie Strategieteams Researchly für ${agentName} nutzen`,
      items: [
        {
          title: 'Private Equity & Venture Capital',
          description:
            'Analysten und Associates nutzen den Agent für schnelle Due-Diligence-Screenings und Investment-Memos.',
        },
        {
          title: 'Strategieberatung',
          description:
            'Berater erstellen erste Hypothesen und Frameworks für Kundenprojekte in Minuten statt Stunden.',
        },
        {
          title: 'Corporate Strategy Teams',
          description:
            'Strategieteams bewerten Geschäftseinheiten, Produkte und Markteintritte mit konsistenten Analysen.',
        },
        {
          title: 'Produktmanagement',
          description:
            'Product Manager identifizieren Marktchancen und Risiken für Roadmap- und Go-to-Market-Entscheidungen.',
        },
      ],
    },
    transforms: {
      heading: `Wie Researchly Ihre ${agentName} verändert`,
      rows: [
        {
          title: 'Von manueller Recherche zu datenbasierter Analyse',
          description:
            'Statt stundenlang Quellen zu durchforsten, recherchiert Researchly automatisch relevante Kontextinformationen.',
        },
        {
          title: 'Von subjektiven Einschätzungen zu strukturierten Ergebnissen',
          description:
            'Der Agent arbeitet nach MECE-Prinzip und liefert hypothesengetriebene Ergebnisse wie ein Senior Strategy Consultant.',
        },
        {
          title: 'Von Stunden Aufwand zu Ergebnissen in Minuten',
          description:
            'Was manuell Stunden dauert, erhalten Sie in Minuten — inklusive Priorisierung und Handlungsempfehlungen.',
        },
      ],
    },
  };
}

async function strapiRequest(pathname, { method = 'GET', body, locale } = {}) {
  const token = resolveToken();
  if (!token) {
    throw new Error('Missing STRAPI_TOKEN (env) or strapi-mcp Authorization in ~/.cursor/mcp.json');
  }

  const url = new URL(`${STRAPI_URL}${pathname}`);
  if (locale) {
    url.searchParams.set('locale', locale);
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: { message: text } };
  }

  if (!response.ok) {
    const message = json?.error?.message || response.statusText;
    throw new Error(`${method} ${url.pathname} failed (${response.status}): ${message}`);
  }

  return json;
}

async function main() {
  if (!documentId) {
    console.error('Usage: node scripts/populate-agent-landing-sections.js <documentId> [--publish]');
    process.exit(1);
  }

  const existing = await strapiRequest(
    `/api/agentic-workflow-templates/${documentId}?locale=${DEFAULT_LOCALE}`,
    { locale: DEFAULT_LOCALE }
  );

  const agentName = (existing?.data?.Title || 'SWOT-Analysen').trim();
  const data = landingSections(agentName);

  const updated = await strapiRequest(`/api/agentic-workflow-templates/${documentId}`, {
    method: 'PUT',
    locale: DEFAULT_LOCALE,
    body: { data },
  });

  console.log(`Updated ${documentId} (${DEFAULT_LOCALE}) — ${agentName}`);
  console.log(JSON.stringify({
    use_cases_heading: updated.data?.use_cases_heading,
    capabilities: updated.data?.capabilities,
    audience: updated.data?.audience,
    transforms: updated.data?.transforms,
  }, null, 2));

  if (publish) {
    await strapiRequest(`/api/agentic-workflow-templates/${documentId}/actions/publish`, {
      method: 'POST',
      locale: DEFAULT_LOCALE,
    });
    console.log('Published.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
