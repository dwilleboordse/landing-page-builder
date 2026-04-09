# Page Builder

One-shot landing page generator for eCommerce brands. Creates advertorials, listicles, and comparison pages using awareness-level-driven structures.

## Features

- **3 page types**: Advertorial, Listicle, Comparison
- **5 awareness levels**: Unaware → Most Aware (auto-structures the page)
- **2 style modes**: Editorial (native article) or Branded (client colors/logo)
- **Brief intake**: Brand info, winning angles, proof elements, objections
- **File upload**: Paste or upload product docs for context
- **Live preview**: Desktop / Tablet / Mobile breakpoints
- **Export**: Download clean HTML or copy to clipboard
- **Session history**: Re-view past generations

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/landing-page-builder.git
cd landing-page-builder
npm install
```

### 2. Add your Anthropic API key

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your key:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

### Option A: One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/landing-page-builder&env=ANTHROPIC_API_KEY&envDescription=Your%20Anthropic%20API%20key&project-name=landing-page-builder)

### Option B: Manual deploy

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add environment variable: `ANTHROPIC_API_KEY` = your key
5. Deploy

### Option C: Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, then add env var:
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # Server-side Anthropic API proxy
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── LandingPageGenerator.tsx   # Main UI component
├── next.config.js
├── package.json
└── tsconfig.json
```

## How It Works

1. Fill out the brief (brand, offer, audience, angles, proof, objections)
2. Select page type, awareness level, and style mode
3. Hit Generate — the server calls Claude with a prompt engineered for your specific awareness level + page type combination
4. Preview the full HTML page in desktop/tablet/mobile
5. Export or copy the HTML to send to clients

The awareness level automatically determines page structure based on Eugene Schwartz's framework:

- **Unaware** → Lead with emotion and story, delay product reveal
- **Problem Aware** → Name and agitate the problem, bridge to solution
- **Solution Aware** → Lead with mechanism and differentiation
- **Product Aware** → Stack proof and hit the offer
- **Most Aware** → Pure offer page with urgency
