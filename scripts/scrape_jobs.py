#!/usr/bin/env python3
"""
JobSpy scraper → RecruitAI importer

Usage:
  python scripts/scrape_jobs.py --query "sales manager" --location "London, UK" --results 50
  python scripts/scrape_jobs.py --query "software engineer" --location "Manchester" --sites linkedin indeed --results 30 --endpoint http://localhost:3000/api/jobs/import

Install deps:
  pip install python-jobspy requests
"""

import argparse
import json
import math
import sys
from datetime import datetime

import requests
from jobspy import scrape_jobs

# ── Field mappers ─────────────────────────────────────────────────────────────

SITE_TO_SOURCE = {
    "linkedin":   "LINKEDIN",
    "indeed":     "INDEED",
    "glassdoor":  "GLASSDOOR",
    "zip_recruiter": "OTHER",
    "google":     "OTHER",
}

JOB_TYPE_MAP = {
    "fulltime":   "FULL_TIME",
    "full_time":  "FULL_TIME",
    "full-time":  "FULL_TIME",
    "parttime":   "PART_TIME",
    "part_time":  "PART_TIME",
    "part-time":  "PART_TIME",
    "contract":   "CONTRACT",
    "contractor": "CONTRACT",
    "temporary":  "CONTRACT",
    "internship": "INTERNSHIP",
    "intern":     "INTERNSHIP",
    "freelance":  "FREELANCE",
}

INTERVAL_MAP = {
    "yearly":  "ANNUAL",
    "annual":  "ANNUAL",
    "monthly": "MONTHLY",
    "daily":   "DAILY",
    "hourly":  "HOURLY",
}

LEVEL_MAP = {
    "internship":       "INTERN",
    "entry level":      "JUNIOR",
    "junior":           "JUNIOR",
    "associate":        "JUNIOR",
    "mid-senior level": "MID",
    "mid level":        "MID",
    "senior":           "SENIOR",
    "lead":             "LEAD",
    "manager":          "MANAGER",
    "director":         "DIRECTOR",
    "vp":               "VP",
    "vice president":   "VP",
    "executive":        "C_SUITE",
    "c-suite":          "C_SUITE",
}


def clean(val, default=None):
    """Return default if val is None, NaN, or empty string."""
    if val is None:
        return default
    try:
        if math.isnan(float(val)):
            return default
    except (TypeError, ValueError):
        pass
    if isinstance(val, str) and val.strip() == "":
        return default
    return val


def map_job(row, default_location: str) -> dict:
    site = str(clean(row.get("site"), "other")).lower()
    job_type = str(clean(row.get("job_type"), "")).lower()
    interval = str(clean(row.get("interval"), "")).lower()
    level = str(clean(row.get("job_level"), "")).lower()
    is_remote = clean(row.get("is_remote"), False)

    # work_mode
    if is_remote:
        work_mode = "REMOTE"
    else:
        work_mode = "HYBRID"   # safe default — better than ONSITE

    # posted_date
    pd = clean(row.get("date_posted"))
    if pd:
        try:
            posted_date = datetime.fromisoformat(str(pd)).isoformat()
        except Exception:
            posted_date = datetime.utcnow().isoformat()
    else:
        posted_date = datetime.utcnow().isoformat()

    # location
    loc = row.get("location") or {}
    if isinstance(loc, str):
        city = loc
        country = "United Kingdom"
        region = "Other"
    else:
        city    = clean(loc.get("city"),    default_location.split(",")[0].strip())
        country = clean(loc.get("country"), "United Kingdom")
        region  = clean(loc.get("state"),   "Other")

    return {
        "external_id":       str(clean(row.get("id"), "")),
        "source":            SITE_TO_SOURCE.get(site, "OTHER"),
        "source_url":        clean(row.get("job_url")),
        "title":             clean(row.get("title"), "Untitled Role"),
        "company_name":      clean(row.get("company"), "Unknown Company"),
        "company_industry":  clean(row.get("company_industry"), "Other"),
        "company_url":       clean(row.get("company_url")),
        "description":       clean(row.get("description"), "No description provided."),
        "employment_type":   JOB_TYPE_MAP.get(job_type, "FULL_TIME"),
        "work_mode":         work_mode,
        "seniority_level":   LEVEL_MAP.get(level, "MID"),
        "location_city":     city,
        "location_country":  country,
        "region":            region or "Other",
        "salary_min":        clean(row.get("min_amount")),
        "salary_max":        clean(row.get("max_amount")),
        "salary_currency":   clean(row.get("currency"), "GBP"),
        "salary_period":     INTERVAL_MAP.get(interval, "ANNUAL"),
        "posted_date":       posted_date,
        "visa_sponsorship":  False,
        "equity_offered":    False,
    }


def main():
    parser = argparse.ArgumentParser(description="Scrape jobs with JobSpy and import into RecruitAI")
    parser.add_argument("--query",    required=True, help='Search term e.g. "sales manager"')
    parser.add_argument("--location", default="London, UK", help="Location to search")
    parser.add_argument("--sites",    nargs="+", default=["indeed", "linkedin"],
                        choices=["indeed", "linkedin", "glassdoor", "zip_recruiter", "google"],
                        help="Job boards to scrape")
    parser.add_argument("--results",  type=int, default=50, help="Max results per site")
    parser.add_argument("--hours",    type=int, default=168, help="Max age of posting in hours (default 7 days)")
    parser.add_argument("--country",  default="UK", help="Country for Indeed (e.g. UK, USA, canada)")
    parser.add_argument("--output",   default=None, help="Write JSON to this file instead of stdout")
    parser.add_argument("--endpoint", default=None, help="POST results to this API endpoint e.g. http://localhost:3000/api/jobs/import")
    args = parser.parse_args()

    print(f"[JobSpy] Scraping: '{args.query}' in '{args.location}' from {args.sites}", file=sys.stderr)

    df = scrape_jobs(
        site_name=args.sites,
        search_term=args.query,
        location=args.location,
        results_wanted=args.results,
        hours_old=args.hours,
        country_indeed=args.country,
    )

    if df.empty:
        print("[JobSpy] No results returned.", file=sys.stderr)
        sys.exit(0)

    print(f"[JobSpy] Got {len(df)} jobs. Mapping fields...", file=sys.stderr)

    jobs = []
    for _, row in df.iterrows():
        try:
            jobs.append(map_job(row.to_dict(), args.location))
        except Exception as e:
            print(f"[JobSpy] Skipped row: {e}", file=sys.stderr)

    payload = {"jobs": jobs}

    if args.endpoint:
        print(f"[JobSpy] POSTing {len(jobs)} jobs to {args.endpoint}...", file=sys.stderr)
        resp = requests.post(args.endpoint, json=payload, timeout=30)
        resp.raise_for_status()
        print(json.dumps(resp.json(), indent=2))
    elif args.output:
        with open(args.output, "w") as f:
            json.dump(payload, f, indent=2)
        print(f"[JobSpy] Wrote {len(jobs)} jobs to {args.output}", file=sys.stderr)
    else:
        print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
