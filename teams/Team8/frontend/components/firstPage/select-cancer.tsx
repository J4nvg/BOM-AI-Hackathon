"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"

type SelectableItem = {
  itemName: string;
  itemUrl : string;
}

const cancers: SelectableItem[] = [
  { itemName: "Breast Cancer", itemUrl: "breast-cancer" },
  { itemName: "Prostate cancer", itemUrl: "prostate-cancer" },
  { itemName: "Colorectal cancer", itemUrl: "colorectal-cancer" },
]

export function SelectCancer() {
  const [selectedCancer, setSelectedCancer] = useState<string>("")
  const router = useRouter()

  const handleNavigate = () => {
    if (!selectedCancer) return

    const selectedObj = cancers.find((c) => c.itemName === selectedCancer)
    
    if (selectedObj) {
      router.push(`/${selectedObj.itemUrl}`)
    }
  }

  return (
    <div className="flex flex-row gap-4">
      <Combobox 
        value={selectedCancer} 
        onValueChange={(val) => setSelectedCancer(val || "")} 
        items={cancers.map((c) => c.itemName)}
      >
        <ComboboxInput placeholder="Select a cancer type..." />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {cancers.map((cancer) => (
              <ComboboxItem key={cancer.itemName} value={cancer.itemName}>
                {cancer.itemName}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Button 
        variant="outline" 
        className="cursor-pointer"
        onClick={handleNavigate}
        disabled={!selectedCancer}      
      >
        Learn more
      </Button>
    </div>
  )
}