import UpdateExamClient from '@/components/modules/exam/EditExamClient'
import { Edit } from 'lucide-react'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <UpdateExamClient></UpdateExamClient>
      </Suspense>
    </div>
  )
}
