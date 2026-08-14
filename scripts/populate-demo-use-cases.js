'use strict';

/**
 * Populate demo_use_cases on an agentic-workflow-template.
 *
 * Usage:
 *   node scripts/populate-demo-use-cases.js <documentId> [payload.json] [--publish]
 *
 * Defaults to scripts/data/tam-sam-som-demo-use-cases.json when no payload path is given.
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
const DEFAULT_PAYLOAD = path.join(__dirname, 'data', 'tam-sam-som-demo-use-cases.json');

const args = process.argv.slice(2);
const publish = args.includes('--publish');
const positional = args.filter((arg) => !arg.startsWith('--'));
const documentId = positional[0];
const payloadPath = positional[1] || DEFAULT_PAYLOAD;

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
    const message = json?.error?.message || JSON.stringify(json?.error) || response.statusText;
    throw new Error(`${method} ${url.pathname} failed (${response.status}): ${message}`);
  }

  return json;
}

async function main() {
  if (!documentId) {
    console.error(
      'Usage: node scripts/populate-demo-use-cases.js <documentId> [payload.json] [--publish]'
    );
    process.exit(1);
  }

  if (!fs.existsSync(payloadPath)) {
    throw new Error(`Payload file not found: ${payloadPath}`);
  }

  const data = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  if (!Array.isArray(data.demo_use_cases)) {
    throw new Error('Payload must include a demo_use_cases array');
  }

  const updated = await strapiRequest(`/api/agentic-workflow-templates/${documentId}`, {
    method: 'PUT',
    locale: DEFAULT_LOCALE,
    body: { data },
  });

  console.log(`Updated ${documentId} (${DEFAULT_LOCALE})`);
  console.log(
    JSON.stringify(
      {
        use_cases_heading: updated.data?.use_cases_heading,
        demo_use_cases: updated.data?.demo_use_cases,
      },
      null,
      2
    )
  );

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
