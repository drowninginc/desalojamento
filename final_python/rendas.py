"""Rents and household income for the website's rents step ("As rendas subiram em toda a cidade").

Source: INE API (json_indicador). Raw responses are cached in data/ine/, so a rerun doesn't
depend on INE being up (it often times out); delete a file to refetch it.
  - 0014698: median rent of new lease contracts (€/m², annual, 2026 methodology), by parish
  - 0012741: median gross declared income minus IRS paid, per tax household (€/year), by municipality

Writes ../web/public/static/data/rents.json, three series of €/m² per year for the chart:
  {city: {"median": the city's median (INE), "high": median of the parish medians with more than
   HIGH_AL % ALs per dwelling, "income": {year: €} | {}}}
INE has no contract counts behind its parish medians here, so "high" is a median of parish
medians, not of contracts.
The AL ratio comes from the website's censosFreguesia.json. INE only publishes current parishes
(nothing below), so Porto's 15 historic parishes are summed into INE's 7: the historic centre
(Cedofeita, Santo Ildefonso, Sé, Miragaia, São Nicolau, Vitória) is a single unit. Lisbon's 24
match one to one.
Prints the numbers quoted in the texts.

Run from final_python/:  python rendas.py
"""
import json
import statistics
import time
import urllib.request
from pathlib import Path

CACHE = Path("data/ine")
WEB = Path("../web/public/static/data")
API = "https://www.ine.pt/ine/json_indicador/pindica.jsp?op=2&lang=PT&varcd="
RENT, INCOME = "0014698", "0012741"
YEARS = range(2020, 2026)
CITIES = {"Lisbon": "1A01106", "Porto": "11A1312"}  # INE geocodes (NUTS 2024)
HIGH_AL = 10  # % ALs per dwelling: Lisbon's absolute-containment ratio
FLAT_M2 = 75  # "a typical 2-bedroom flat" in the text


def fetch(name, query):
    """INE response, from the cache or the API (which is slow and flaky, hence the retries)."""
    path = CACHE / f"{name}.json"
    if not path.exists():
        for attempt in range(3):
            try:
                with urllib.request.urlopen(API + query, timeout=180) as r:
                    path.write_bytes(r.read())
                break
            except OSError as e:
                print(f"INE {query}: {e}, retrying")
                time.sleep(30 * (attempt + 1))
        else:
            return None
    d = json.loads(path.read_text())
    d = d[0] if isinstance(d, list) else d
    return {r["geocod"]: (r["geodsg"], float(r["valor"]))
            for rows in d["Dados"].values() for r in rows if r.get("valor")}


def parish_names(name):
    """'União das freguesias de A, B e C' -> [A, B, C]; any other name -> [name]"""
    if not name.startswith("União das freguesias de "):
        return [name]
    return name.removeprefix("União das freguesias de ").replace(" e ", ", ").split(", ")


allParishes = {}
rents = {y: fetch(f"rent_{y}", f"{RENT}&Dim1=S7A{y}") for y in YEARS}
out = {}
for city, code in CITIES.items():
    # Parishes are the geocodes one level below the municipality
    inePar = {c: name for c, (name, _) in rents[YEARS[-1]].items()
              if c.startswith(code) and len(c) == len(code) + 2}
    censos = json.loads((WEB / city / "censosFreguesia.json").read_text())
    parishes = []
    for c, name in inePar.items():
        # An INE parish is one of the website's, or a union whose name lists several of them
        parts = {n.casefold() for n in parish_names(name)}
        members = [f["properties"] for f in censos["features"]
                   if f["properties"]["freg_name"].casefold() in parts]
        assert members, f"{city}: no AL data for {name}"
        als = sum(m["als"] for m in members)
        dwellings = sum(m["alojamentos"] for m in members)
        parishes.append({
            "name": name.removeprefix("União das freguesias de "),
            "al": round(100 * als / dwellings, 1),
            "rent": {y: rents[y][c][1] for y in YEARS if c in rents[y]},
        })
    used = sorted(n.casefold() for name in inePar.values() for n in parish_names(name))
    assert used == sorted(f["properties"]["freg_name"].casefold() for f in censos["features"]), \
        f"{city}: parishes don't match one to one"

    # Latest year only (INE's default when no period is given); it lags rents by a year or two
    income, r = {}, fetch(f"income_{city}", f"{INCOME}&Dim2={code}")
    if r and code in r:
        d = json.loads((CACHE / f"income_{city}.json").read_text())
        income[int(next(iter((d[0] if isinstance(d, list) else d)["Dados"])))] = r[code][1]
    groups = {"high": [p for p in parishes if p["al"] > HIGH_AL]}
    out[city] = {"median": {y: rents[y][code][1] for y in YEARS},
                 **{g: {y: round(statistics.median(p["rent"][y] for p in ps if y in p["rent"]), 2)
                        for y in YEARS} for g, ps in groups.items()},
                 "income": income}
    print(city, {g: [f"{p['name'][:30]} {p['al']}%" for p in ps] for g, ps in groups.items()})
    allParishes[city] = parishes

(WEB / "rents.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))

# Numbers quoted in the texts
for city, d in out.items():
    rises = sorted((p["rent"][YEARS[-1]] / p["rent"][YEARS[0]] - 1) * 100 for p in allParishes[city])
    for g in ("median", "high"):
        first, last = d[g][YEARS[0]], d[g][YEARS[-1]]
        print(f"{city} {g}: {first} -> {last} €/m² (+{(last / first - 1) * 100:.0f}%)")
    print(f"  single parishes: +{rises[0]:.0f}% to +{rises[-1]:.0f}%")
    last = d["median"][YEARS[-1]]
    print(f"  {FLAT_M2} m² flat: {last * FLAT_M2:.0f} €/month")
    if d["income"]:
        y = max(d["income"])
        rent = d["median"][y] * FLAT_M2 * 12
        print(f"  {y}: median net household income {d['income'][y]:.0f} €/year, "
              f"rent = {100 * rent / d['income'][y]:.0f}% of it")
    else:
        print("  income: not fetched yet (INE down?), rerun later")
