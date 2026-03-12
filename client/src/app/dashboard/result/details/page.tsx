import SingleResult from "@/components/modules/result/DetailResult";
import { Suspense } from "react";

export default function DetailsPage() {
  return (
    <div>
     <Suspense fallback={<div>Loading...</div>}>
     <SingleResult></SingleResult>
     </Suspense>
    </div>
  )
}
