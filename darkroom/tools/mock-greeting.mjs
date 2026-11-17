// Pin the new-chat greeting to one entry of the app's own list (constants/chat-greetings.ts) instead of a random pick
export const GREETING = { title: 'Question everything.', description: 'Including what the AI tells you.' };
export async function mockGreeting(ctx) {
  await ctx.addInitScript((g) => {
    const fix = () => {
      for (const h of document.querySelectorAll('h1.text-balance')) {
        const p = h.nextElementSibling;
        if (!p || p.tagName !== 'P') continue;
        if (h.textContent !== g.title) h.textContent = g.title;
        if (p.textContent !== g.description) p.textContent = g.description;
      }
    };
    new MutationObserver(fix).observe(document, { childList: true, subtree: true, characterData: true });
  }, GREETING);
}
