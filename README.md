# AI Shopping Assistant (Flowise + OpenRouter)

## Project title
AI Shopping Assistant

## Short description
This project is a modern frontend for a Flowise chatflow that recommends top 3 products based on user category and budget. It follows a 5-step structure: Welcome -> Category -> Budget -> Recommendation -> End.

## Build in Flowise (required)
Create one chatflow with these logical nodes:

1. **Welcome Node**: "Hi, I can help you shop smarter."
2. **Ask Category**: "Which category are you shopping for? (phone, laptop, shoes, etc.)"
3. **Ask Budget**: "What is your budget range?"
4. **LLM Node (OpenRouter)**:
   - Provider: OpenAI compatible endpoint via OpenRouter
   - Model example: `openai/gpt-4o-mini` or any allowed model on your OpenRouter account
   - Prompt template:

```txt
You are a shopping assistant.
User category: {{category}}
User budget: {{budget}}

Recommend 3 products that fit the category and budget.
For each product include:
1) Product name
2) Approx price
3) Why it matches the budget and user need
Keep response concise and practical.
```

5. **Response Node**: return final answer to user

## Connect frontend with Flowise
Edit `app.js`:

- Replace `FLOWISE_CHATFLOW_ID`
- Replace `FLOWISE_API_HOST`
- (Optional) Replace `FLOWISE_EMBED_SCRIPT_URL` if your Flowise docs specify a different URL

## Local run
You can open `index.html` directly, or run a simple static server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to Vercel
1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy from this folder:

```bash
vercel
```

3. Follow prompts and share the generated URL.

## Submission checklist
- Project title: **AI Shopping Assistant**
- Flowise link: your public/shared chatflow URL
- Short description: use text above
- Screenshot: capture the running assistant page
