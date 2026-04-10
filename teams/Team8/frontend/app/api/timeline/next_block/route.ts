import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { cancerType, requestedInfoType } = await req.json();

  const url = `http://127.0.0.1:8000/cancers/${encodeURIComponent(cancerType)}?info_type=${encodeURIComponent(requestedInfoType)}`;

  const res = await fetch(url, { method: "GET" });

    
  const data = await res.json();
  const raw = Array.isArray(data) ? data[0] : data;
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