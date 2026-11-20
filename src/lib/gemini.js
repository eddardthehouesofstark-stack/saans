/**
 * Gemini co-pilot transport. The model only proposes actions; every number
 * shown next to them still comes from `lib/air.js`.
 *
 * The key is sent as an `x-goog-api-key` header rather than a query string so
 * it never lands in browser history, proxy logs or referrers.
 */
const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const SYSTEM_INSTRUCTION =
  'You are Saans, an air-quality co-pilot. Given location, current PM2.5, and the user’s routine, return ONLY JSON: {"actions":[{"action":str,"pm25_avoided":num,"cigarettes_saved":num}],"net_budget":str,"source_note":str}. Use 22 µg/m³ PM2.5 = 1 cigarette/day. Be concrete, local, family-safe.';

export const FALLBACK_PLAN = {
  actions: [
    {
      action: 'Move the sunrise jog indoors or before 6 am, windows shut.',
      pm25_avoided: 110,
      cigarettes_saved: 0.7,
    },
    {
      action: 'Take the metro instead of the e-rickshaw for the 8:15 commute.',
      pm25_avoided: 85,
      cigarettes_saved: 0.7,
    },
    {
      action: 'Run the kitchen exhaust and cook with lids on tonight.',
      pm25_avoided: 65,
      cigarettes_saved: 0.3,
    },
  ],
  net_budget: '11.3',
  source_note: 'Example plan using 22 µg/m³ = 1 cigarette/day. The ledger prices every action.',
};

export function buildContext({ place, pm25, budget, net, appliedSwaps = [], question }) {
  return [
    `Location: ${place}.`,
    `Current PM2.5: ${pm25} µg/m³.`,
    `Daily budget: ${budget.toFixed(1)} cigarettes.`,
    `Net after applied swaps: ${net.toFixed(1)} cigarettes.`,
    `Applied swaps: ${appliedSwaps.length ? appliedSwaps.join('; ') : 'none'}.`,
    'Household: two adults and two children (ages 5 and 8).',
    `User asks: ${question}`,
  ].join(' ');
}

/** Accepts fenced or chatty JSON and returns only the shape the UI can trust. */
export function parsePlan(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;

  let data;
  try {
    data = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(data.actions)) return null;

  const actions = data.actions
    .filter((item) => item && typeof item.action === 'string')
    .slice(0, 5)
    .map((item) => ({
      action: item.action,
      pm25_avoided: Number(item.pm25_avoided),
      cigarettes_saved: Number(item.cigarettes_saved),
    }));
  if (!actions.length) return null;

  return {
    actions,
    net_budget: data.net_budget != null ? String(data.net_budget) : null,
    source_note: data.source_note ? String(data.source_note) : null,
  };
}

export async function requestPlan({ apiKey, context, signal }) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts: [{ text: context }] }],
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    }),
    signal,
  });

  if (!response.ok) throw new Error(`Gemini responded ${response.status}`);

  const data = await response.json();
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part?.text ?? '')
    .join('');
  const plan = parsePlan(text);
  if (!plan) throw new Error('Gemini reply was not the expected JSON');
  return plan;
}
