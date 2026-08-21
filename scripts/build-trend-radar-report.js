'use strict';

/**
 * Build Technology Radar report markdown from Researchly radar JSON.
 *
 * Usage:
 *   node scripts/build-trend-radar-report.js <radar.json> \
 *     --themenfeld=Fertighaus \
 *     --analysis-id=<uuid> \
 *     --out=data/trend-radars/trendradar-fertighaus.md
 *
 * radar.json = array of { Quadrant, Trends: [{ Trend, Ring, Beschreibung, Begründung, Quellen }] }
 */

const fs = require('fs');
const path = require('path');

const HARD_CTA = {
  label: 'Kostenlos testen',
  link: 'https://signup.researchly.at/',
};

const DE_MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const args = process.argv.slice(2);
const jsonPath = args.find((a) => !a.startsWith('--'));
const themenfeld = (args.find((a) => a.startsWith('--themenfeld=')) || '').split('=')[1] || 'Thema';
/** Broader sector label for Title/headline, e.g. "Bausektor (Fertighaus und Co.)" */
const brancheLabel =
  (args.find((a) => a.startsWith('--branche=')) || '').split('=')[1] || themenfeld;
const analysisId = (args.find((a) => a.startsWith('--analysis-id=')) || '').split('=')[1] || '';
const outPath =
  (args.find((a) => a.startsWith('--out=')) || '').split('=')[1] ||
  `data/trend-radars/trendradar-${slugify(themenfeld)}.md`;
const dateArg = (args.find((a) => a.startsWith('--date=')) || '').split('=')[1];
const when = dateArg ? new Date(dateArg) : new Date();
const monthYear = `${DE_MONTHS[when.getMonth()]} ${when.getFullYear()}`;
/** Title + Hero.headline: "Trends im/in <Branche> - Trendradar <Monat> <Jahr>" */
const listingTitle = `Trends im ${brancheLabel} - Trendradar ${monthYear}`;

if (!jsonPath) {
  console.error(
    'Usage: node scripts/build-trend-radar-report.js <radar.json> --themenfeld=… [--branche="Bausektor (Fertighaus und Co.)"] --analysis-id=… --out=…'
  );
  process.exit(1);
}

const ringOrder = ['Adopt', 'Trial', 'Assess', 'Hold'];
const qShort = ['Q1', 'Q2', 'Q3', 'Q4'];

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function shortTitle(t, maxWords = 8) {
  return t
    .replace(/[:–—]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join(' ');
}

function sourceLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const map = {
      'fertighaus.de': 'Fertighaus.de',
      'fertighaus.com': 'Fertighaus.com',
      'verbandsbuero.de': 'Verbandsbüro',
      'destatis.de': 'Destatis',
      'statista.com': 'Statista',
      'fertig-haus.net': 'Fertig-Haus.net',
      'wohnglueck.de': 'Wohnglück',
      'biobuilds.com': 'BIOBUILDS',
      'bauunternehmen.org': 'Bauunternehmen.org',
      'hausbaujournal.com': 'Hausbaujournal',
      'scandi.de': 'SCANDI',
      'bauen.com': 'Bauen.com',
      'marles.com': 'Marles',
      'a3bau.at': 'a3bau',
      'streif.de': 'Streif',
      'rundschau-online.de': 'Rundschau',
      'capital.de': 'Capital',
      'faz.net': 'FAZ',
      'hasepost.de': 'Hasepost',
      'bayerische-staatszeitung.de': 'Bayerische Staatszeitung',
      'hurra-wir-bauen.de': 'Hurra wir bauen',
      'fertighauswelt.de': 'Fertighauswelt',
      'tc-mv.tc.de': 'Town & Country',
    };
    for (const [k, v] of Object.entries(map)) {
      if (host.endsWith(k)) return v;
    }
    return host.split('.')[0];
  } catch {
    return 'Quelle';
  }
}

function formatSources(urls) {
  const seen = new Set();
  const parts = [];
  for (const url of urls || []) {
    const label = sourceLabel(url);
    const key = `${label}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(`[${label}](${url})`);
  }
  return parts.join(' · ');
}

function quadrantSummary(name) {
  const map = {
    'Markt & Nachfrage':
      'Marktanteile und Nachfrage verschieben sich klar Richtung Fertigbau — regional ungleich, aber bundesweit etabliert.',
    'Wirtschaftlichkeit & Kosten':
      'Preisvorteile und Segmentierung stärken den Fertigbau, während absolute Kosten und Förderlogik die Conversion weiter prägen.',
    'Bauweise, Technologie & Nachhaltigkeit':
      'Vorfertigung und Bauzeitvorteile sind Standard; Nachhaltigkeit und digitale Planung wachsen, das Einfamilienhaus bleibt Kernsegment.',
    'Industrie, Regulierung & Wettbewerbsstruktur':
      'Qualitätsstandards und etablierte Hersteller prägen den Markt — Typgenehmigungen helfen, Kostenbelastungen bremsen.',
  };
  return map[name] || `Überblick zum Quadranten ${name}.`;
}

function reason(t) {
  return `${(t.Beschreibung || '').trim()} ${(t.Begründung || '').trim()}`.replace(/\s+/g, ' ').trim();
}

const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const quadrants = typeof raw === 'string' ? JSON.parse(raw) : raw;

const all = [];
quadrants.forEach((q, qi) => {
  for (const t of q.Trends || []) all.push({ ...t, qi, qName: q.Quadrant });
});
const byRing = Object.fromEntries(ringOrder.map((r) => [r, all.filter((t) => t.Ring === r)]));
const counts = Object.fromEntries(ringOrder.map((r) => [r, byRing[r].length]));
const total = all.length;
const slug = `trendradar-${slugify(themenfeld)}`;

const intro = `Der Radar bündelt **${total} Trends** in vier Quadranten. ${counts.Adopt} davon sind belastbar genug für unmittelbare Berücksichtigung (**Adopt**), ${counts.Trial} zeigen Dynamik mit offenen Umsetzungsfragen (**Trial**), ${counts.Assess} sind Beobachtungsthemen (**Assess**), ${counts.Hold} sind Warnsignale (**Hold**). Auffällig: Adopt dominiert klar über Marktanteil, Krisenresilienz und Qualitätsstandards — während Hold zwei unterschiedliche Risiken markiert: die starke Einfamilienhaus-Konzentration und regulatorisch-arbeitskostenseitige Mehrbelastungen.`;

let body = '';
body += `# Technology Radar ${themenfeld}\n\n`;
body += `${intro}\n\n`;
body += `> **Ringe in Kurzform:** **Adopt** = jetzt berücksichtigen · **Trial** = erproben, Umsetzung noch offen · **Assess** = beobachten und validieren · **Hold** = Vorsicht, Risikosignal\n`;
body += `> Ausführliche Definitionen und Zuordnungskriterien stehen unten in der [Methodik](#methodik).\n\n`;
body += `---\n\n`;
body += `## Auf einen Blick\n\n`;

for (const ring of ringOrder) {
  const items = byRing[ring];
  body += `**${ring} — ${items.length} Trend${items.length === 1 ? '' : 's'}**\n\n`;
  for (const t of items) {
    body += `- *${qShort[t.qi]}* · ${shortTitle(t.Trend)}\n`;
  }
  body += `\n`;
}

body += `<!-- split -->\n\n`;

quadrants.forEach((q, qi) => {
  body += `## ${qi + 1}. ${q.Quadrant}\n\n`;
  body += `*${quadrantSummary(q.Quadrant)}*\n\n`;
  for (const t of q.Trends || []) {
    body += `### ${t.Trend}\n\n`;
    body += `**${t.Ring}**\n\n`;
    body += `${reason(t)}\n\n`;
    body += `*Quellen:* ${formatSources(t.Quellen)}\n\n`;
  }
  body += `---\n\n`;
});

body += `## Methodik\n\n`;
body += `### Quadranten\n\n`;
body += `| Nr. | Quadrant |\n| --- | --- |\n`;
quadrants.forEach((q, qi) => {
  body += `| ${qi + 1} | ${q.Quadrant} |\n`;
});
body += `\n`;
body += `### Ringe und Zuordnungskriterien\n\n`;
body += `- **Adopt**: Mehrere konsistente Markt-, Wettbewerbs- oder Nutzungssignale; direkte Auswirkung auf Angebot, Investitionen oder Go-to-Market.\n`;
body += `- **Trial**: Deutliche Signale vorhanden, aber Marktausprägung, Standardisierung oder ROI noch nicht vollständig abgesichert.\n`;
body += `- **Assess**: Einzelne, fragmentierte oder indirekte Signale ohne hinreichende Absicherung für unmittelbare Priorisierung.\n`;
body += `- **Hold**: Signale deuten auf Risiken, begrenzte Belastbarkeit oder potenziell negativen Einfluss hin; nur selektiv verfolgen.\n`;

const frontmatter = `---
Title: "${listingTitle}"
slug: "${slug}"
locale: "de-DE"
document_id: ""
analysis_id: "${analysisId}"
SEO:
  metaTitle: "${listingTitle} | Researchly"
  metaDescription: "Signale aus ${themenfeld} in 4 Quadranten und Reifegrade Adopt, Trial, Assess, Hold — als Technology Radar statt endloser Trendliste."
  seo_keyword: "trendradar ${slugify(themenfeld).replace(/-/g, ' ')}"
  INDEX: true
Hero:
  headline: "${listingTitle}"
  subheadline: "Signale aus Markt, Kosten, Bauweise und Industrie — eingeordnet in Adopt, Trial, Assess und Hold."
  bubble: "4 Quadranten. 4 Ringe. Quellen inklusive."
  formLabel: "Branche oder Technologiefeld"
  formPlaceholder: "z. B. Fertighaus, Holzbau, Prefab"
  stats:
    - value: "4"
      label: "Quadranten"
    - value: "4"
      label: "Reifegrade"
    - value: "${total}"
      label: "Trends mit Quellen"
  HardCTA:
    label: "${HARD_CTA.label}"
    link: "${HARD_CTA.link}"
intro_title: "Was dieser Trendradar zeigt"
intro_paragraph: "Ein Technology Radar für ${themenfeld}: Marktnachfrage, Wirtschaftlichkeit, Bauweise und Wettbewerbsstruktur — jeweils mit Ring-Zuordnung und Quellen."
MidCTA:
  ctaDescription: "Erstellen Sie Ihren eigenen Trendradar mit Ihrem Researchly Account, oder registrieren Sie sich und testen Sie kostenlos."
  primaryCTA:
    label: "Trendradar erstellen"
    link: "https://signup.researchly.at/"
FinalCTA:
  ctaTitle: "Eigenen Trendradar erstellen"
  ctaDescription: "Thema eingeben, Signale einsammeln, Radar in Stunden statt Workshops."
  primaryCTA:
    label: "Jetzt starten"
    link: "https://signup.researchly.at/"
FAQ:
  - Question: "Was ist ein Technology Radar?"
    AnswerMD: "Ein Technology Radar ordnet Trends in Quadranten und Reifegrade (Adopt, Trial, Assess, Hold) ein — mit Begründung und Quellen statt einer flachen Liste."
  - Question: "Woher kommen die Signale?"
    AnswerMD: "Aus dem Researchly-Lauf zu ${themenfeld}: Primärquellen und Marktdaten, verdichtet im Technology-Radar-Schritt."
  - Question: "Kann ich das für andere Branchen nutzen?"
    AnswerMD: "Ja. Derselbe Workflow funktioniert für jedes Technologiefeld — nur das Thema ändert sich."
---

`;

const abs = path.resolve(outPath);
fs.mkdirSync(path.dirname(abs), { recursive: true });
fs.writeFileSync(abs, frontmatter + body);
console.log(JSON.stringify({ out: abs, total, counts, bodyChars: body.length }, null, 2));
