# CognitoByte

AI automation agency website built with Next.js, MongoDB, and Groq.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (see `.env.example` or below) with:

```env
# MONGODB
MONGODB_URL=your-mongodb-connection-string

# GROQ (AI Chatbot) — from console.groq.com > API Keys
GROQ_API_KEY=gsk_...

# AUTH
JWT_SECRET=your-random-secret-here

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. Seed the database with initial content:

```bash
node scripts/transform-to-mongo.mjs
```

4. Run locally:

```bash
npm run dev
```

Then visit http://localhost:3000.

## Managing Content

Content (services, projects, pricing, blog posts) is stored in MongoDB. Seed data lives in `src/data/` and fallbacks load from there if the database is unreachable.

## File Structure Reference

```
cognitobyte/
├── src/
│   ├── app/                    ← All pages + API routes
│   │   ├── page.tsx            ← Homepage
│   │   ├── services/           ← Services pages
│   │   ├── projects/           ← Portfolio pages
│   │   ├── pricing/            ← Pricing page
│   │   ├── about/              ← About page
│   │   ├── contact/            ← Contact page + form
│   │   ├── blog/               ← Blog pages
│   │   └── api/                ← Backend routes
│   ├── components/             ← layout/, sections/, chatbot/
│   ├── data/                   ← Seed JSON fallback data
│   └── lib/                    ← MongoDB client, models, helpers
├── scripts/                    ← Data migration scripts
├── knowledge.txt               ← Chatbot knowledge source
└── .env                        ← Environment variables
```

## Troubleshooting

**Content not loading:**
→ Make sure `MONGODB_URL` is set in `.env` and the database is reachable

**Chatbot not responding:**
→ Check `GROQ_API_KEY` is valid at console.groq.com

**Images not showing:**
→ Check Cloudinary credentials and that image URLs are set in the database

## Need Help?

Contact us at thesoftstriker@gmail.com
