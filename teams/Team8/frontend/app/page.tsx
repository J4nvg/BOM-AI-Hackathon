import { SelectCancer } from "@/components/firstPage/select-cancer";
import Image from "next/image";

// bg-[#006D8C]

export default function Home() {
  return (
    <div className="flex flex-col">
      <main className="flex flex-col items-center justify-center md:mx-40 mx-20">
        <div className="max-w-xl mt-10">
          <h1 className="font-semibold text-2xl mb-4"> Select the type of cancer you want more information about </h1>

          <SelectCancer/>
          
        
        </div>
      </main>
    </div>
  );
}
