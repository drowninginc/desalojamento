"""Lisbon's 2026 cleanup vs Airbnb: did the cancelled licences stop hosting tourists?

The council finished cancelling ~6,800 registrations without liability insurance on 1 Feb 2026.
Cancelled = Lisbon NrRNAL in the Aug 2025 register (data/rnal/rnal_aug2025.csv) that is gone from
the cleaned one (../limpeza_lisboa/Alojamento_Local.csv, Nov 2026).
Airbnb = Inside Airbnb Lisbon snapshots, Lisbon municipality only:
  before: data/airbnb/lisboa_listings.csv (Mar 2025)
  after:  ../novo_listings/listings.csv.gz (Sep 2026, 7 months after the cancellations)
A listing's licence is the AL number in its `license` field ("56539/AL", "AL15255", "23108 - AL"...);
bare numbers without "AL" are left out rather than risk false matches. "Hosting" = at least one
review in the 90 days before the snapshot.
Both register files are full RNAL exports (all 278 mainland concelhos; Azores and Madeira keep
their own registers). NrRNAL is unique nationwide and no cancelled Lisbon number reappears in any
concelho of the Nov 2026 export (asserted below).

Prints the numbers for the texts. Run from final_python/:  python fantasmas.py
"""
import re

import pandas as pd

AL_NR = re.compile(r"(\d{1,6})\s*[-/]?\s*AL\b|\bAL\s*[-/]?\s*(\d{1,6})(?!\d)", re.I)


def register(path):
    """Lisbon's NrRNAL and every NrRNAL in the country"""
    df = pd.read_csv(path, usecols=["NrRNAL", "Concelho"], low_memory=False)
    return set(df[df.Concelho == "Lisboa"].NrRNAL), set(df.NrRNAL)


def al_number(licence):
    m = AL_NR.search(licence) if isinstance(licence, str) else None
    return int(m.group(1) or m.group(2)) if m else None


def listings(path):
    df = pd.read_csv(path, low_memory=False)
    df = df[df.neighbourhood_group_cleansed == "Lisboa"].copy()
    df["nr"] = df.license.map(al_number)
    scraped = pd.to_datetime(df.last_scraped).min()
    df["hosting"] = pd.to_datetime(df.last_review) >= scraped - pd.Timedelta(days=90)
    return df


before, _ = register("data/rnal/rnal_aug2025.csv")
after, national_after = register("../limpeza_lisboa/Alojamento_Local.csv")
cancelled = before - after
assert not cancelled & national_after, "a cancelled Lisbon number is still registered elsewhere"
mar, sep = listings("data/airbnb/lisboa_listings.csv"), listings("../novo_listings/listings.csv.gz")

# Self-check of the parser on the formats seen in the data
assert [al_number(s) for s in ["56539/AL.", "AL15255", "AL/6125", "23108 - AL", "19438AL",
                               "44076-AL", "19710/2015", "Exempt", None]] == \
    [56539, 15255, 6125, 23108, 19438, 44076, None, None, None]

print(f"Register: {len(before)} -> {len(after)} ({len(after) - len(before):+}), "
      f"{len(cancelled)} cancelled, {len(after - before)} new")
for name, df in (("Mar 2025", mar), ("Sep 2026", sep)):
    c = df[df.nr.isin(cancelled)]
    print(f"{name}: {len(df)} listings; {len(c)} show a cancelled licence "
          f"({c.nr.nunique()} distinct, {c.nr.nunique() / len(cancelled):.0%} of the cancelled), "
          f"{c.hosting.sum()} hosting")

was = mar[mar.nr.isin(cancelled)].set_index("id")
now = sep.set_index("id")
kept = was.index.intersection(now.index)
same = now.loc[kept, "nr"].isin(cancelled)
print(f"Of the {len(was)} Mar 2025 listings with a licence later cancelled: {len(kept)} still on "
      f"Airbnb in Sep 2026, {same.sum()} still showing the cancelled number, "
      f"{(same & now.loc[kept, 'hosting']).sum()} of them hosting")
fresh = sep[sep.nr.isin(cancelled) & ~sep.id.isin(mar.id)]
print(f"New listings since Mar 2025 showing a cancelled licence: {len(fresh)} ({fresh.hosting.sum()} hosting)")
