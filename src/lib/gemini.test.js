import { afterEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_PLAN, buildContext, parsePlan, requestPlan } from './gemini.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildContext', () => {
  it('states the location, dose and routine the model needs', () => {
    const context = buildContext({
      place: 'New Delhi, IN',
      pm25: 81.3,
      budget: 3.7,
      net: 3.5,
      appliedSwaps: ['Sunrise jog → Indoor HIIT'],
      question: 'What should I change?',
    });
    expect(context).toContain('Location: New Delhi, IN.');
    expect(context).toContain('Current PM2.5: 81.3 µg/m³.');
    expect(context).toContain('Daily budget: 3.7 cigarettes.');
    expect(context).toContain('Indoor HIIT');
    expect(context).toContain('User asks: What should I change?');
  });

  it('marks an empty swap list as none', () => {
    const context = buildContext({
      place: 'Delhi',
      pm25: 100,
      budget: 4.5,
      net: 4.5,
      question: 'Hi',
    });
    expect(context).toContain('Applied swaps: none.');
  });
});

describe('parsePlan', () => {
  it('unwraps fenced JSON and normalises the action fields', () => {
    const plan = parsePlan(
      '```json\n{"actions":[{"action":"Close windows","pm25_avoided":"40","cigarettes_saved":"0.4"}],"net_budget":"3.3"}\n```'
    );
    expect(plan.actions).toEqual([
      { action: 'Close windows', pm25_avoided: 40, cigarettes_saved: 0.4 },
    ]);
    expect(plan.net_budget).toBe('3.3');
    expect(plan.source_note).toBeNull();
  });

  it('caps the list at five actions', () => {
    const actions = Array.from({ length: 9 }, (_, i) => ({ action: `Action ${i}` }));
    expect(parsePlan(JSON.stringify({ actions })).actions).toHaveLength(5);
  });

  it('rejects replies without a usable action list', () => {
    expect(parsePlan('')).toBeNull();
    expect(parsePlan('not json')).toBeNull();
    expect(parsePlan('{"actions":[]}')).toBeNull();
    expect(parsePlan('{"actions":[{"nope":true}]}')).toBeNull();
  });
});

describe('requestPlan', () => {
  it('sends the key as a header, never in the URL', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"actions":[{"action":"Stay in"}]}' }] } }],
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const plan = await requestPlan({ apiKey: 'test-key', context: 'ctx' });
    const [url, options] = fetchMock.mock.calls[0];

    expect(url).not.toContain('test-key');
    expect(options.headers['x-goog-api-key']).toBe('test-key');
    expect(JSON.parse(options.body).contents[0].parts[0].text).toBe('ctx');
    expect(plan.actions[0].action).toBe('Stay in');
  });

  it('throws when Gemini answers with prose instead of a plan', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: 'sorry' }] } }] }),
      }))
    );
    await expect(requestPlan({ apiKey: 'k', context: 'c' })).rejects.toThrow();
  });

  it('ships a fallback plan shaped like a real reply', () => {
    expect(Array.isArray(FALLBACK_PLAN.actions)).toBe(true);
    expect(FALLBACK_PLAN.actions.length).toBeGreaterThan(0);
  });
});
