import { NextRequest, NextResponse } from "next/server";

let requestCount = 0;

const hardcodedGraphs = [
  {
    year: 2024,
    title: "incidentie 2014–2024",
    description:
      "Borstkanker is de meest voorkomende vorm van kanker in Nederland. In 2024 werden **15.539 nieuwe gevallen** gediagnosticeerd. Na een tijdelijke dip in 2020 (COVID-19 effect op screeningsprogramma's) is het aantal weer gestabiliseerd rond de 15.500 per jaar.\n\n- Bron: NKR (IKNL)\n- Meest voorkomend stadium bij diagnose: stadium I (43,6%)",
    source: [
      { title: "WHO Report 2024", url: "https://who.int/" },
      { title: "Nature Study", url: "https://nature.com/" },
    ],
    sourceType: "graph",
    chartData: [
      { year: "2014", incidentie: 14638 },
      { year: "2015", incidentie: 14575 },
      { year: "2016", incidentie: 14738 },
      { year: "2017", incidentie: 15019 },
      { year: "2018", incidentie: 14775 },
      { year: "2019", incidentie: 15001 },
      { year: "2020", incidentie: 13074 },
      { year: "2021", incidentie: 15773 },
      { year: "2022", incidentie: 15684 },
      { year: "2023", incidentie: 15499 },
      { year: "2024", incidentie: 15539 },
    ],
    chartXKey: "year",
    chartDataKey: "incidentie",
    chartLabel: "Incidentie",
  },
  {
    year: 2024,
    title: "Stijgende trend",
    description:
      "Prostaatkanker laat een duidelijke stijgende trend zien: van **11.136 gevallen** in 2014 naar **16.532** in 2024. Dit is mede het gevolg van verbeterde diagnostiek en bredere inzet van PSA-testen.",
    source: [
      { title: "WHO Report 2024", url: "https://who.int/" },
      { title: "Nature Study", url: "https://nature.com/" },
    ],
    sourceType: "graph",
    chartData: [
      { year: "2014", incidentie: 11136 },
      { year: "2015", incidentie: 11733 },
      { year: "2016", incidentie: 12496 },
      { year: "2017", incidentie: 13042 },
      { year: "2018", incidentie: 13708 },
      { year: "2019", incidentie: 14696 },
      { year: "2020", incidentie: 13574 },
      { year: "2021", incidentie: 14762 },
      { year: "2022", incidentie: 15942 },
      { year: "2023", incidentie: 15676 },
      { year: "2024", incidentie: 16532 },
    ],
    chartXKey: "year",
    chartDataKey: "incidentie",
    chartLabel: "Incidentie",
  },
  {
    year: 2019,
    title: "Lichte daling na 2015",
    description:
      "Na een piek van **25.368 gevallen** in 2015 is het aantal diagnoses voor dikkedarmkanker licht gedaald. In 2024 werden 23.000 gevallen geregistreerd. De daling wordt gedeeltelijk toegeschreven aan het bevolkingsonderzoek darmkanker dat in 2014 landelijk werd ingevoerd.",
    source: [
      { title: "WHO Report 2024", url: "https://who.int/" },
      { title: "Nature Study", url: "https://nature.com/" },
    ],
    sourceType: "graph",
    chartData: [
      { year: "2014", incidentie: 24173 },
      { year: "2015", incidentie: 25368 },
      { year: "2016", incidentie: 25096 },
      { year: "2017", incidentie: 24292 },
      { year: "2018", incidentie: 24223 },
      { year: "2019", incidentie: 23423 },
      { year: "2020", incidentie: 21882 },
      { year: "2021", incidentie: 24028 },
      { year: "2022", incidentie: 22843 },
      { year: "2023", incidentie: 22765 },
      { year: "2024", incidentie: 23000 },
    ],
    chartXKey: "year",
    chartDataKey: "incidentie",
    chartLabel: "Incidentie",
  },
];

export async function POST(req: NextRequest) {
  const { cancerType, requestedInfoType } = await req.json();

  requestCount++;
  if (requestCount % 3 === 0 && requestedInfoType == "stats") {
    const random = hardcodedGraphs[Math.floor(Math.random() * hardcodedGraphs.length)];
    return NextResponse.json(random);
  }

  const url = `http://127.0.0.1:8000/cancers/${encodeURIComponent(cancerType)}?info_type=${encodeURIComponent(requestedInfoType)}`;

  const res = await fetch(url, { method: "GET" });

    
  const data = await res.json();
  const raw = Array.isArray(data) ? data[0] : data;

  console.log(data)

  const block = {
    year: raw.year ?? raw.id ?? 0,
    title: raw.title,
    description: raw.description,
    source: raw.source ?? [],
    sourceType: raw.sourceType ?? raw.source_type,
    chartData: raw.chartData ?? raw.chart_data,
    chartXKey: raw.chartXKey ?? raw.chart_x_key,
    chartDataKey: raw.chartDataKey ?? raw.chart_data_key,
    chartLabel: raw.chartLabel ?? raw.chart_label,
  };
  return NextResponse.json(block);
}