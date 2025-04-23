// app/history/page.tsx

'use client'

import { useEffect, useState } from 'react'

type MatchSummary = {
  id: string
  date: string
  summary: string
}

export default function HistoryPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([])

  useEffect(() => {
    fetch('/api/matches/history')
      .then((res) => res.json())
      .then((data) => setMatches(data.matches))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">전적 조회</h1>
      <ul className="space-y-2">
        {matches.map((match) => (
          <li key={match.id} className="border p-3 rounded">
            <p>{new Date(match.date).toLocaleString()}</p>
            <p>{match.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
