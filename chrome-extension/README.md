# RecruitAI Sourcer — Chrome Extension

Save candidate profiles from LinkedIn, CV Library, Indeed and Reed directly into your RecruitAI database with one click.

## Install (takes 60 seconds)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this `chrome-extension/` folder
5. Click the RecruitAI icon in the toolbar → enter your app URL → Save

## Usage

1. Browse to any candidate profile on LinkedIn / CV Library / Indeed / Reed
2. Click the purple **R** button (bottom-right of the page)
3. Review the auto-extracted data in the panel — edit anything that's wrong
4. Click **Save to RecruitAI**

## Supported sites

| Site | URL pattern |
|---|---|
| LinkedIn | `linkedin.com/in/*` |
| CV Library | `cv-library.co.uk/candidates/*` |
| Indeed | `indeed.com/r/*` |
| Reed | `reed.co.uk/candidates/*` |

## Settings

Open the popup (click extension icon in toolbar):
- **App URL** — your Vercel deployment e.g. `https://recruit-ai.vercel.app`
- **API Key** — set `SCRAPE_API_KEY` in Vercel env vars and paste the same value here

## Notes

- Email is required to prevent duplicate candidates
- LinkedIn scraping reads only what is visible on screen — no hidden data accessed
- Profile data is editable before saving so you can fix anything the auto-extractor missed
