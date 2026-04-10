'use client'
import Timeline from "@/components/specificPage/timeline";
import { useParams } from 'next/navigation'

export default function Home() {
  const params = useParams<{ cancerId: string}>()
  const cancerId = params.cancerId.replace(/-/g, "_")
  return (
    <main className="min-h-full">
      <Timeline
        cancerType={cancerId}
        blocks={[]}
        fetchNextEndpoint="/api/timeline/next_block"
        initialInfoType="facts"
      />
    </main>
  );
}
