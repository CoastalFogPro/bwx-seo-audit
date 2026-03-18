# BAYWORX SEO Audit Tool

Internal tool for generating comprehensive SEO audit reports for prospective clients. Powered by Claude AI.

## How It Works

1. Enter a prospect's website URL
2. Claude searches for and analyzes the site's SEO
3. Generates a branded report with scores, issues, landing page funnel pitch, and BAYWORX service upsells
4. Download the report as a branded HTML file to send to the client

## Architecture

```
Browser (React/Vite)  →  /api/claude (Netlify Function)  →  Anthropic API
                              ↑
                    API key lives here (server-side only)
```

The API key is **never exposed** to the browser. The Netlify Function acts as a secure proxy.

## Deploy to Netlify

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/bayworx-seo-audit.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repo
4. Build settings should auto-detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click "Deploy"

### 3. Add your API key

1. Go to **Site settings** → **Environment variables**
2. Add a new variable:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
3. Trigger a redeploy

That's it — your team can now use the tool at your Netlify URL.

## Local Development

```bash
npm install
npm install -g netlify-cli   # if you don't have it

# Create .env file with your API key
cp .env.example .env
# Edit .env and add your real key

# Run with Netlify Functions locally
netlify dev
```

This starts Vite + Netlify Functions together. The app will be at `http://localhost:8888`.

## Cost

Each audit runs ~2 parallel Claude Sonnet API calls with web search. Estimated cost: **$0.02–0.08 per audit** depending on the site complexity.

## Project Structure

```
bayworx-seo-audit/
├── index.html              # Entry HTML
├── netlify.toml            # Netlify build config
├── package.json
├── vite.config.js
├── .env.example            # Example env vars
├── netlify/
│   └── functions/
│       └── claude-proxy.mjs  # Serverless API proxy (holds the key)
└── src/
    ├── main.jsx            # React entry
    └── App.jsx             # Main audit tool component
```
