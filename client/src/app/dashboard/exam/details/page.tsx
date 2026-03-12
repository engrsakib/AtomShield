import ExamDetailsClient from '@/components/modules/exam/ExamDetails'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
       <ExamDetailsClient></ExamDetailsClient>
      </Suspense>
    </div>
  )
}
