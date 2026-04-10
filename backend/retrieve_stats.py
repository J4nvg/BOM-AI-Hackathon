import requests
import json

BASE = "https://api.nkr-cijfers.iknl.nl/api"

def post(path, body):
    r = requests.post(f"{BASE}/{path}?format=json", json=body, timeout=30)
    if not r.ok:
        print(f"  SKIP ({r.status_code}): {path}")
        return None
    return r.json()

def make_body(nav_code, statistiek, kankersoort, jaar="2024", group_by=None):
    return {
        "language": "nl-NL",
        "navigation": {"code": nav_code},
        "groupBy": group_by or [],
        "aggregateBy": [
            {"code": "filter/kankersoort",         "values": [{"code": kankersoort}]},
            {"code": "filter/periode-van-diagnose", "values": [{"code": f"periode/1-jaar/{jaar}"}]},
            {"code": "filter/geslacht",             "values": [{"code": "geslacht/totaal/alle"}]},
            {"code": "filter/leeftijdsgroep",       "values": [{"code": "leeftijdsgroep/totaal/alle"}]},
            {"code": "filter/regio",                "values": [{"code": "regio/totaal/alle"}]},
        ],
        "statistic": {"code": statistiek},
    }

STADIUM_GROUP = [{
    "code": "filter/stadium",
    "values": [
        {"code": "stadium/0"}, {"code": "stadium/i"},
        {"code": "stadium/ii"}, {"code": "stadium/iii"},
        {"code": "stadium/iv"}, {"code": "stadium/x"},
        {"code": "stadium/nvt"},
    ]
}]

# Correct codes discovered from the API
CANCERS = {
    "Borstkanker":     "kankersoort/hoofdgroep/500000",
    "Prostaatkanker":  "kankersoort/hoofdgroep/700000",
    "Dikkedarmkanker": "kankersoort/hoofdgroep/200000",
}

def get_cancer_stats(name, code, start_jaar=2014, end_jaar=2024):
    print(f"Fetching {name} ({start_jaar}-{end_jaar})...")
    entry = {"cancer_name": name, "bron": "NKR (IKNL)"}

    # Incidentie per jaar (for line chart) - uses stadiumverdeling endpoint
    incidentie_chart = []
    for jaar in range(start_jaar, end_jaar + 1):
        resp = post("data", make_body(
            "incidentie/verdeling-per-stadium", "statistiek/verdeling",
            code, jaar=str(jaar), group_by=STADIUM_GROUP
        ))
        if resp and resp.get("data"):
            total = sum(int(d["metaData"][0]["value"]) for d in resp["data"])
            incidentie_chart.append({"year": str(jaar), "incidentie": total})
        else:
            incidentie_chart.append({"year": str(jaar), "incidentie": 0})

    entry["incidentie_chart"] = incidentie_chart

    # Prevalentie per jaar (for line chart)
    prevalentie_chart = []
    for jaar in range(start_jaar, end_jaar + 1):
        resp = post("data", make_body("prevalentie/periode", "statistiek/aantal", code, jaar=str(jaar)))
        if resp and resp.get("data"):
            prevalentie_chart.append({"year": str(jaar), "prevalentie": resp["data"][0].get("value")})
        else:
            prevalentie_chart.append({"year": str(jaar), "prevalentie": 0})

    entry["prevalentie_chart"] = prevalentie_chart

    # Sterfte per jaar (for line chart)
    sterfte_chart = []
    for jaar in range(start_jaar, end_jaar + 1):
        resp = post("data", make_body("sterfte/periode", "statistiek/aantal", code, jaar=str(jaar)))
        if resp and resp.get("data"):
            sterfte_chart.append({"year": str(jaar), "sterfte": resp["data"][0].get("value")})
        else:
            sterfte_chart.append({"year": str(jaar), "sterfte": 0})

    entry["sterfte_chart"] = sterfte_chart

    # Latest stadiumverdeling (2024)
    resp = post("data", make_body(
        "incidentie/verdeling-per-stadium", "statistiek/verdeling",
        code, jaar=str(end_jaar), group_by=STADIUM_GROUP
    ))
    if resp:
        entry["stadiumverdeling"] = {}
        for d in resp["data"]:
            stadium_code = d["filterValues"][0]["code"]
            label = stadium_code.split("/")[-1].upper()
            for g in resp["groupBy"][0]["values"]:
                if g["code"] == stadium_code:
                    label = g["label"]
                    break
            entry["stadiumverdeling"][label] = {
                "percentage": round(d["value"], 1),
                "aantal": int(d["metaData"][0]["value"])
            }

    return entry

if __name__ == "__main__":
    results = []
    for name, code in CANCERS.items():
        stats = get_cancer_stats(name, code)
        results.append(stats)

    with open("data/stats.json", "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nSaved to data/stats.json")
    print(json.dumps(results, indent=2, ensure_ascii=False))