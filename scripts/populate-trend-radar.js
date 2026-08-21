'use strict';

/**
 * Populate a Trend Radar in Strapi via REST (not MCP).
 *
 * Input: markdown file with YAML frontmatter + body markdown.
 *
 * Required auth (first match wins):
 *   STRAPI_TOKEN env
 *   .env in cwd / repo root (STRAPI_TOKEN=…)
 *   ~/.cursor/mcp.json → mcpServers.strapi-mcp.headers.Authorization
 *
 * Optional env:
 *   STRAPI_URL  (default https://ingenious-miracle-474136bd13.strapiapp.com)
 *
 * Usage:
 *   node scripts/populate-trend-radar.js path/to/radar.md
 *   node scripts/populate-trend-radar.js path/to/radar.md --dry-run
 *   node scripts/populate-trend-radar.js path/to/radar.md --publish
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const YAML = require('yaml');

const DEFAULT_STRAPI_URL = 'https://ingenious-miracle-474136bd13.strapiapp.com';
const DEFAULT_LOCALE = 'de-DE';

const POPULATE = [
  'populate[SEO][fields][0]=metaTitle',
  'populate[SEO][fields][1]=metaDescription',
  'populate[SEO][fields][2]=seo_keyword',
  'populate[SEO][fields][3]=INDEX',
  'populate[Hero][populate][stats]=*',
  'populate[Hero][populate][HardCTA]=*',
  'populate[Hero][populate][SoftCTA]=*',
  'populate[FAQ]=*',
  'populate[MidCTA][populate][primaryCTA]=*',
  'populate[MidCTA][populate][secondaryCTA]=*',
  'populate[FinalCTA][populate][primaryCTA]=*',
  'populate[FinalCTA][populate][secondaryCTA]=*',
].join('&');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const shouldPublish = args.includes('--publish');
const mdPath = args.find((arg) => !arg.startsWith('--'));

function usage(message) {
  if (message) console.error(message);
  console.error(`
Usage:
  node scripts/populate-trend-radar.js <radar.md> [--dry-run] [--publish]

Markdown must have YAML frontmatter (Title, slug, SEO, Hero) and a markdown body.
Split the report with \`<!-- split -->\` into \`body\` (before mid CTA) and \`body_after\`
(after mid CTA). Optional: intro_title, intro_paragraph, MidCTA, FAQ, FinalCTA.
`);
  process.exit(1);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function stripBearer(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  return trimmed.toLowerCase().startsWith('bearer ') ? trimmed.slice(7).trim() : trimmed;
}

function resolveToken() {
  const fromEnv = stripBearer(process.env.STRAPI_TOKEN);
  if (fromEnv) return fromEnv;

  const mcpPath = path.join(os.homedir(), '.cursor', 'mcp.json');
  if (fs.existsSync(mcpPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
      const auth =
        config?.mcpServers?.['strapi-mcp']?.headers?.Authorization ||
        config?.mcpServers?.['user-strapi-mcp']?.headers?.Authorization ||
        '';
      return stripBearer(auth);
    } catch {
      // ignore
    }
  }
  return null;
}

function parseMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  if (!raw.startsWith('---')) {
    throw new Error('Missing YAML frontmatter (file must start with ---)');
  }
  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    throw new Error('Unclosed YAML frontmatter');
  }
  const frontmatter = YAML.parse(raw.slice(3, end).trim()) || {};
  const rest = raw.slice(end + 4).replace(/^\n/, '').trim();
  return { frontmatter, ...splitBody(rest) };
}

const SPLIT_MARKER = '<!-- split -->';
const DEFAULT_MID_CTA = {
  ctaDescription:
    'Erstellen Sie Ihren eigenen Trendradar mit Ihrem Researchly Account, oder registrieren Sie sich und testen Sie kostenlos.',
  primaryCTA: {
    label: 'Trendradar erstellen',
    link: 'https://signup.researchly.at/',
  },
};

function splitBody(markdown) {
  if (!markdown) return { body: '', body_after: '' };
  if (markdown.includes(SPLIT_MARKER)) {
    const [before, ...after] = markdown.split(SPLIT_MARKER);
    return { body: before.trim(), body_after: after.join(SPLIT_MARKER).trim() };
  }
  const auto = markdown.match(/^(.*?)\n---\n+(?=##\s+1\.)/s);
  if (auto) {
    return { body: auto[1].trim(), body_after: markdown.slice(auto[0].length).trim() };
  }
  const tech = markdown.match(/^(.*?)\n+(?=##\s+Technology Radar)/s);
  if (tech) {
    return { body: tech[1].trim(), body_after: markdown.slice(tech[0].length).trim() };
  }
  return { body: markdown.trim(), body_after: '' };
}

function normalizeStats(stats) {
  if (!stats) return undefined;
  if (!Array.isArray(stats)) throw new Error('Hero.stats must be an array');
  return stats.map((stat, i) => {
    if (!stat?.value || !stat?.label) {
      throw new Error(`Hero.stats[${i}] needs value and label`);
    }
    return { value: String(stat.value), label: String(stat.label) };
  });
}

function normalizeCtaButton(btn, label) {
  if (!btn) return undefined;
  if (typeof btn !== 'object') throw new Error(`${label} must be an object`);
  if (!btn.label) throw new Error(`${label}.label is required when ${label} is set`);
  return {
    label: String(btn.label),
    link: btn.link != null ? String(btn.link) : undefined,
  };
}

function normalizeSoftCtas(items) {
  if (!items) return undefined;
  if (!Array.isArray(items)) throw new Error('Hero.SoftCTA must be an array');
  return items.map((item, i) => normalizeCtaButton(item, `Hero.SoftCTA[${i}]`));
}

function normalizeFaq(items) {
  if (!items) return undefined;
  if (!Array.isArray(items)) throw new Error('FAQ must be an array');
  return items.map((item, i) => {
    if (!item?.Question) throw new Error(`FAQ[${i}].Question is required`);
    const entry = { Question: String(item.Question) };
    if (item.AnswerMD != null) entry.AnswerMD = String(item.AnswerMD);
    // Answer (blocks) is omitted — set AnswerMD only from markdown
    return entry;
  });
}

function normalizeFinalCta(cta) {
  if (!cta) return undefined;
  const out = {
    ctaTitle: cta.ctaTitle || undefined,
    ctaDescription: cta.ctaDescription || undefined,
    primaryCTA: normalizeCtaButton(cta.primaryCTA, 'FinalCTA.primaryCTA'),
    secondaryCTA: normalizeCtaButton(cta.secondaryCTA, 'FinalCTA.secondaryCTA'),
  };
  if (!out.ctaTitle) delete out.ctaTitle;
  if (!out.ctaDescription) delete out.ctaDescription;
  if (!out.primaryCTA) delete out.primaryCTA;
  if (!out.secondaryCTA) delete out.secondaryCTA;
  if (out.primaryCTA && out.primaryCTA.link === undefined) delete out.primaryCTA.link;
  if (out.secondaryCTA && out.secondaryCTA.link === undefined) delete out.secondaryCTA.link;
  return Object.keys(out).length ? out : undefined;
}

function buildPayload(frontmatter, bodyMarkdown, bodyAfterMarkdown) {
  const Title = frontmatter.Title || frontmatter.title;
  const slug = frontmatter.slug;
  const SEO = frontmatter.SEO || frontmatter.seo;
  const Hero = frontmatter.Hero || frontmatter.hero;

  if (!Title) throw new Error('Frontmatter.Title is required');
  if (!slug) throw new Error('Frontmatter.slug is required');
  if (!SEO?.metaTitle || !SEO?.metaDescription) {
    throw new Error('Frontmatter.SEO.metaTitle and metaDescription are required');
  }
  if (!Hero?.headline || !Hero?.subheadline) {
    throw new Error('Frontmatter.Hero.headline and subheadline are required');
  }
  if (!Hero?.bubble) {
    throw new Error('Frontmatter.Hero.bubble is required (shared.hero-section)');
  }
  if (!bodyMarkdown) {
    throw new Error('Markdown body after frontmatter is required (maps to body)');
  }

  const data = {
    Title,
    slug,
    SEO: {
      metaTitle: SEO.metaTitle,
      metaDescription: SEO.metaDescription,
      seo_keyword: SEO.seo_keyword || SEO.keyword || undefined,
      INDEX: SEO.INDEX !== undefined ? Boolean(SEO.INDEX) : true,
    },
    Hero: {
      headline: Hero.headline,
      subheadline: Hero.subheadline,
      bubble: Hero.bubble,
      formLabel: Hero.formLabel || undefined,
      formPlaceholder: Hero.formPlaceholder || undefined,
      stats: normalizeStats(Hero.stats),
      HardCTA: normalizeCtaButton(Hero.HardCTA, 'Hero.HardCTA'),
      SoftCTA: normalizeSoftCtas(Hero.SoftCTA),
    },
    intro_title: frontmatter.intro_title || undefined,
    intro_paragraph: frontmatter.intro_paragraph || undefined,
    body: bodyMarkdown,
    MidCTA: normalizeFinalCta(frontmatter.MidCTA || frontmatter.midCTA || DEFAULT_MID_CTA),
    body_after: bodyAfterMarkdown || undefined,
    FAQ: normalizeFaq(frontmatter.FAQ || frontmatter.faq),
    FinalCTA: normalizeFinalCta(frontmatter.FinalCTA || frontmatter.finalCTA),
  };

  // Drop undefined nested keys Strapi may reject
  if (!data.SEO.seo_keyword) delete data.SEO.seo_keyword;
  if (!data.Hero.formLabel) delete data.Hero.formLabel;
  if (!data.Hero.formPlaceholder) delete data.Hero.formPlaceholder;
  if (!data.Hero.stats) delete data.Hero.stats;
  if (!data.Hero.HardCTA) delete data.Hero.HardCTA;
  if (!data.Hero.SoftCTA) delete data.Hero.SoftCTA;
  else {
    data.Hero.SoftCTA = data.Hero.SoftCTA.map((btn) => {
      if (btn.link === undefined) {
        const { link, ...rest } = btn;
        return rest;
      }
      return btn;
    });
  }
  if (data.Hero.HardCTA && data.Hero.HardCTA.link === undefined) {
    delete data.Hero.HardCTA.link;
  }
  if (!data.intro_title) delete data.intro_title;
  if (!data.intro_paragraph) delete data.intro_paragraph;
  if (!data.body_after) delete data.body_after;
  if (!data.MidCTA) delete data.MidCTA;
  if (!data.FAQ) delete data.FAQ;
  if (!data.FinalCTA) delete data.FinalCTA;

  // intro_image / Hero.image: upload in admin — do not invent media IDs
  return data;
}

function writeDocumentId(filePath, documentId) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fmEnd = raw.indexOf('\n---', 3);
  const fmBlock = raw.slice(0, fmEnd + 1);
  if (/^document_id:\s*/m.test(fmBlock)) {
    const updated = raw.replace(/^document_id:\s*.*$/m, `document_id: "${documentId}"`);
    fs.writeFileSync(filePath, updated);
    return;
  }
  const updated = raw.replace(/^---\n/, `---\ndocument_id: "${documentId}"\n`);
  fs.writeFileSync(filePath, updated);
}

async function api(strapiUrl, token, method, apiPath, body) {
  const res = await fetch(`${strapiUrl}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
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
    const err = new Error(`${method} ${apiPath} → ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function findBySlug(strapiUrl, token, slug, locale) {
  const qs = new URLSearchParams({
    'filters[slug][$eq]': slug,
    locale,
    'pagination[pageSize]': '1',
  });
  const result = await api(strapiUrl, token, 'GET', `/api/trend-radars?${qs}`);
  return result?.data?.[0] || null;
}

async function main() {
  if (!mdPath) usage('Missing markdown path.');

  const absPath = path.resolve(mdPath);
  if (!fs.existsSync(absPath)) usage(`File not found: ${absPath}`);

  loadEnvFile(path.join(process.cwd(), '.env'));
  loadEnvFile(path.join(__dirname, '..', '.env'));
  loadEnvFile(path.join(os.homedir(), 'repos', 'blogging', '.env'));

  const strapiUrl = (process.env.STRAPI_URL || DEFAULT_STRAPI_URL).replace(/\/$/, '');
  const token = resolveToken();

  const { frontmatter, body, body_after } = parseMarkdownFile(absPath);
  const locale = frontmatter.locale || DEFAULT_LOCALE;
  const data = buildPayload(frontmatter, body, body_after);

  console.log(`File:   ${absPath}`);
  console.log(`Strapi: ${strapiUrl}`);
  console.log(`Locale: ${locale}`);
  console.log(`Slug:   ${data.slug}`);
  console.log(
    `Mode:   ${dryRun ? 'dry-run' : shouldPublish ? 'create/update + publish' : 'create/update (draft ok)'}`
  );
  console.log(`Body:   ${data.body.length} chars`);
  console.log(`After:  ${data.body_after?.length ?? 0} chars`);
  console.log(`FAQ:    ${data.FAQ?.length ?? 0}`);
  console.log(`Intro:  ${data.intro_title || '(none)'}`);

  if (dryRun) {
    console.log('\nPayload preview:');
    console.log(JSON.stringify({ data }, null, 2));
    return;
  }

  if (!token) {
    usage('STRAPI_TOKEN is required (env, .env, or strapi-mcp Authorization in ~/.cursor/mcp.json).');
  }

  const existing =
    (frontmatter.document_id && { documentId: frontmatter.document_id }) ||
    (await findBySlug(strapiUrl, token, data.slug, locale));

  let documentId;
  const statusQuery = shouldPublish ? '&status=published' : '';

  if (existing?.documentId) {
    documentId = existing.documentId;
    console.log(`Updating documentId=${documentId}${shouldPublish ? ' + publish' : ''}`);
    await api(
      strapiUrl,
      token,
      'PUT',
      `/api/trend-radars/${documentId}?locale=${locale}${statusQuery}`,
      { data }
    );
  } else {
    console.log(`Creating new entry${shouldPublish ? ' + publish' : ''}…`);
    const created = await api(
      strapiUrl,
      token,
      'POST',
      `/api/trend-radars?locale=${locale}${statusQuery}`,
      { data }
    );
    documentId = created?.data?.documentId;
    console.log(`Created documentId=${documentId}`);
  }

  if (documentId) {
    writeDocumentId(absPath, documentId);
  }

  if (shouldPublish && documentId) {
    const published = await api(
      strapiUrl,
      token,
      'GET',
      `/api/trend-radars/${documentId}?locale=${locale}&status=published`
    );
    if (!published?.data?.publishedAt) {
      await api(
        strapiUrl,
        token,
        'PUT',
        `/api/trend-radars/${documentId}?locale=${locale}&status=published`,
        { data }
      );
    }
    console.log('Published.');
  }

  const verifyQs = new URLSearchParams({
    'filters[slug][$eq]': data.slug,
    locale,
  });
  const verified = await api(
    strapiUrl,
    token,
    'GET',
    `/api/trend-radars?${verifyQs}&${POPULATE}`
  );
  const entry = verified?.data?.[0];
  console.log('\nVerify:');
  console.log(
    JSON.stringify(
      {
        documentId: entry?.documentId,
        Title: entry?.Title,
        slug: entry?.slug,
        heroHeadline: entry?.Hero?.headline,
        intro_title: entry?.intro_title,
        bodyChars: entry?.body?.length ?? 0,
        bodyAfterChars: entry?.body_after?.length ?? 0,
        faqCount: entry?.FAQ?.length ?? 0,
        hasMidCTA: Boolean(entry?.MidCTA),
        hasFinalCTA: Boolean(entry?.FinalCTA),
        admin: `${strapiUrl}/admin/content-manager/collection-types/api::trend-radar.trend-radar/${entry?.documentId}`,
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
      '\nCheck API token permissions for trend-radar: find, findOne, create, update, publish.'
    );
  }
  process.exit(1);
});
