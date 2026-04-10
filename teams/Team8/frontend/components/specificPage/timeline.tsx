"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Button } from "../ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/* ── Public types ── */

export type SourceType = "Historical" | "experts" | "graph";

export interface SourceLink {
  title: string;
  url: string;
}

function capitalizeFirstLetter(val:string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface TimelineBlock {
  year: number;
  title: string;
  description: string;
  source: SourceLink[];
  sourceType?: SourceType;
  chartData?: ChartDataPoint[];
  chartXKey?: string;
  chartDataKey?: string;
  chartLabel?: string;
}

export interface TimelineProps {
  blocks: TimelineBlock[];
  fetchNextEndpoint: string;
  cancerType: string;
  initialInfoType?: string;
}

/* ── Internals ── */

interface BlockState {
  data: TimelineBlock;
  showSource: boolean;
  requestedType?: string;
}

function Connector({ visible }: { visible: boolean }) {
  return (
    <div
      className={`flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)] overflow-hidden ${
        visible ? "h-[90px]  opacity-100" : "h-0 opacity-0"
      }`}
    >
      <svg
        width="2"
        height="70"
        className="overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tl-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#11b5e9" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#11b5e9" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <line
          x1="1" y1="0" x2="1" y2="58"
          stroke="url(#tl-line-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M1 58 L6 50 L1 52 L-4 50 Z"
          fill="#11b5e9"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

function InlineLineChart({
  data,
  xKey,
  dataKey,
  label,
}: {
  data: ChartDataPoint[];
  xKey: string;
  dataKey: string;
  label: string;
}) {
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label,
      color: "#11b5e9",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="mt-4 h-50 w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) => String(v)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line
          dataKey={dataKey}
          type="linear"
          stroke={`var(--color-${dataKey})`}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

function Card({
  block,
  index,
  isLast,
  loading,
  onNext,
  showSource,
  onToggleSource,
  requestedType,
}: {
  block: TimelineBlock;
  index: number;
  isLast: boolean;
  loading: boolean;
  onNext: (type: string) => void;
  showSource: boolean;
  onToggleSource: () => void;
  requestedType?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const side = index % 2 === 0 ? "left" : "right";

  const isGraph =
    block.sourceType === "graph" &&
    block.chartData &&
    block.chartXKey &&
    block.chartDataKey;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex w-full max-w-[720px] mx-auto transition-all duration-[650ms] ease-[cubic-bezier(.4,0,.2,1)] ${
        side === "left" ? "justify-start" : "justify-end"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0)"
          : `translateY(36px) translateX(${side === "left" ? "-24px" : "24px"})`,
      }}
    >
      <div className="relative w-full max-w-[540px] rounded-[14px] border px-7 pb-[22px] pt-7 shadow-[0_4px_28px_rgba(0,0,0,.22)]">
        {/* Year pill */}
        <div
          className={`absolute -top-[15px] rounded-full px-3.5 py-[3px] text-[13px] font-extrabold tracking-[1.5px] text-white ${
            side === "left" ? "left-[22px]" : "right-[22px]"
          }`}
          style={{ backgroundColor: "#11b5e9" }}
        >
          {requestedType?capitalizeFirstLetter(requestedType): block.sourceType ?? "Information"}
        </div>

        <h2 className="mt-2 mb-2.5 text-[21px] font-bold leading-tight">
          {block.title}
        </h2>

        <div className="m-0 text-[15px] leading-[1.7] prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="pl-1">{children}</li>,
            }}
          >
            {block.description}
          </ReactMarkdown>
        </div>

        {/* Inline chart for graph type */}
        {isGraph && (
          <InlineLineChart
            data={block.chartData!}
            xKey={block.chartXKey!}
            dataKey={block.chartDataKey!}
            label={block.chartLabel ?? block.chartDataKey!}
          />
        )}

        {/* Source panel */}
        {showSource && block.source && block.source.length > 0 && (
          <div className="mt-3.5 rounded-[10px] border px-3.5 py-3 text-xs space-y-1.5">
            <span className="opacity-50">📖 Sources</span>
            <ul className="list-none pl-0 space-y-1">
              {block.source.map((src, i) => (
                <li key={i}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#11b5e9] underline underline-offset-2 hover:brightness-125 transition-colors"
                  >
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-[18px] flex flex-wrap gap-2">
          {block.source && block.source.length > 0 && (
            <Button
              onClick={onToggleSource}
              variant={"outline"}
              className="cursor-pointer rounded-[7px] bg-transparent px-3.5 py-1.5 text-xs transition-all duration-200"
            >
              {showSource ? "Hide Source" : "Source"}
            </Button>
          )}

          {isLast && !loading && (
            <Button
              onClick={() => onNext("stats")}
              className="cursor-pointer rounded-[7px] border px-[18px] py-[9px] font-mono text-[13px] font-bold transition-all duration-200 hover:brightness-125"
              style={{
                borderColor: "rgba(17,181,233,0.3)",
                backgroundColor: "rgba(17,181,233,0.1)",
                color: "#11b5e9",
              }}
            >
              Stats
            </Button>

          )}
          {isLast && !loading && (
            <Button
              onClick={() => onNext("facts")}
              className="cursor-pointer rounded-[7px] border px-[18px] py-[9px] font-mono text-[13px] font-bold transition-all duration-200 hover:brightness-125"
              style={{
                borderColor: "rgba(17,181,233,0.3)",
                backgroundColor: "rgba(17,181,233,0.1)",
                color: "#11b5e9",
              }}
            >
              Facts
            </Button>

          )}
          {isLast && !loading && (
            <Button
              onClick={() => onNext("advice")}
              className="cursor-pointer rounded-[7px] border px-[18px] py-[9px] font-mono text-[13px] font-bold transition-all duration-200 hover:brightness-125"
              style={{
                borderColor: "rgba(17,181,233,0.3)",
                backgroundColor: "rgba(17,181,233,0.1)",
                color: "#11b5e9",
              }}
            >
              Advise
            </Button>

          )}
          {isLast && !loading && (
            <Button
              onClick={() => onNext("expertise")}
              className="cursor-pointer rounded-[7px] border px-[18px] py-[9px] font-mono text-[13px] font-bold transition-all duration-200 hover:brightness-125"
              style={{
                borderColor: "rgba(17,181,233,0.3)",
                backgroundColor: "rgba(17,181,233,0.1)",
                color: "#11b5e9",
              }}
            >
              Expertise
            </Button>

          )}

          {isLast && loading && (
            <span className="inline-flex items-center gap-2 text-xs text-[#11b5e9]">
              Loading…
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Timeline({ blocks, fetchNextEndpoint, cancerType, initialInfoType }: TimelineProps) {
  const [items, setItems] = useState<BlockState[]>(
    blocks.map((b) => ({ data: b, showSource: false }))
  );
  const [loading, setLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef(false);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setScrollProgress(max > 0 ? Math.min(el.scrollTop / max, 1) : 0);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

const fetchNext = async (requestedInfoType: string) => {
  setLoading(true);
  try {
    const res = await fetch(fetchNextEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancerType, requestedInfoType }),
    });
    const next: TimelineBlock = await res.json();
    setItems((prev) => [...prev, { data: next, showSource: false, requestedType: requestedInfoType }]);
  } catch (err) {
    console.error("Timeline fetch error:", err);
  } finally {
    setLoading(false);
    setTimeout(
      () => endRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      80
    );
  }
};

  useEffect(() => {
    if (initialInfoType && blocks.length === 0 && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchNext(initialInfoType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSource = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, showSource: !item.showSource } : item
      )
    );
  };

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden">
      <div
        ref={containerRef}
        className="h-screen overflow-y-auto scroll-smooth"
      >
        <div className="ml-9 px-5 pt-[60px] pb-[140px]">
          {items.map((item, i) => (
            <div key={i}>
              {i > 0 && <Connector visible />}
              <Card
                block={item.data}
                index={i}
                isLast={i === items.length - 1}
                loading={loading && i === items.length - 1}
                onNext={(type) => fetchNext(type)}
                showSource={item.showSource}
                onToggleSource={() => toggleSource(i)}
                requestedType={item.requestedType}
              />
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}