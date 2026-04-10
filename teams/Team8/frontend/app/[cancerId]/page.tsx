'use client'
import { SelectCancer } from "@/components/firstPage/select-cancer";
import Timeline, { TimelineBlock } from "@/components/specificPage/timeline";
import Image from "next/image";
import { useParams } from 'next/navigation'

 
const preloadedBlocks: TimelineBlock[] = [
  {
    year: 1980,
    title: "Breast cancer",
    description: "Breast cancer is the **most frequently diagnosed cancer among women** in the Netherlands, with an estimated **'15,200' new diagnoses of invasive breast cancer expected in 2025**. Although the sources do not provide a year-by-year percentage table for the last 50 years, the **Netherlands Cancer Registry (NKR)** tracks **'relative survival'** (relatieve overleving) for the disease through interactive charts that cover the period from **'1989 to 2025'**.\n\nKey historical and statistical insights from the sources include:\n\n*   **Dedicated Reporting:** The report **'Borstkanker in Nederland (2022)'** provides detailed data on **'incidence, staging, and treatment'** trends.\n*   **Socioeconomic Factors:** A 2024 three-part report titled **'Kanker in Nederland: sociaaleconomische verschillen'** examines how factors like income lead to **'differences in survival, disease course, consequences, and (after)care'**.\n*   **Historical Analysis:** The 2014 report **'Kankerzorg in beeld'** analyzed **'diagnostics, treatment, and survival'** for 21 tumor types, including breast cancer.\n*   **General Survival Trends:** While specific percentages for breast cancer are not excerpted, the sources note that for various other cancers—such as colorectal, liver, and bile duct cancers—**'prognosis and survival rates have improved'** over time. For ovarian cancer, it is specifically noted that there has been a **'gradually longer survival in the first years after diagnosis'**.",
    source: [
    { title: "WHO Report 2024", "url": "https://who.int/..." },
    { title: "Nature Study", "url": "https://nature.com/..." }
  ],
  },

];

export default function Home() {
  const params = useParams<{ cancerId: string}>()
  let cancerId = params.cancerId 
  return (
    <main className="min-h-full">
      <Timeline
      cancerType={cancerId}
        blocks={preloadedBlocks}
        fetchNextEndpoint="/api/timeline/nextblock"
      />
    </main>
  );
}
