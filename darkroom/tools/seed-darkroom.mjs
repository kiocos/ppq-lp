// Darkroom capture seed: the uniform conversations plus one whose prompt matches what the hero video types
import { conversations as base } from '../../uniform/tools/seed-data.mjs';
import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync('/tmp/ppq-models.json', 'utf8')).data.chatModels;
const SONNET = catalog.find((m) => m.id === 'anthropic/claude-sonnet-5.5');

export const PROMPT = 'My landlord wants to raise the rent 18% at renewal. Draft a short, polite reply asking to keep it under 6%.';

const created = new Date(Date.UTC(2026, 10, 13, 19, 40)).toISOString();
export const rent = {
  id: 'c-rent', name: 'Reply to rent increase', model: SONNET, temperature: 1, folderId: null, prompt: '', dataSource: null,
  created_at: created, updated_at: created,
  messages: [
    { id: 'm-dr-0001-4a1e-9c2b-5f00ppq1', role: 'user', content: PROMPT },
    {
      id: 'm-dr-0002-4a1e-9c2b-5f00ppq2', role: 'assistant', servedByEnclave: true,
      queryCost: { model_id: SONNET.id, input_count: 312, output_count: 214, price_in_usd: 0.0041 },
      content: `Here's a draft you can adjust:

> Hi Daniel,
>
> Thanks for sending the renewal terms. I'd like to stay, and I hope we can find a number that works for both of us.
>
> An 18% increase is more than I can take on this year. I've paid on time every month for three years, so I'd like to ask whether you'd consider keeping it under 6%.
>
> I'm also happy to sign a longer lease if that helps. Could we talk this week?
>
> Best,
> Sam

It opens with your wish to stay, asks for one concrete number, and offers something in return.`,
    },
  ],
};

// Replace the uniform landlord thread with this one so the sidebar stays the same length
export const conversations = [base[0], rent, ...base.slice(2)];
