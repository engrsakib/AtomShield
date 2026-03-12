








import { Suspense } from "react";

import UpdateYouTube from "@/components/modules/updateYoutube/UpdateYoutube";

export default function UpdateYouTubePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
     <UpdateYouTube></UpdateYouTube>
    </Suspense>
  );
}




