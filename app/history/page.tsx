// app/history/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type MatchPlayer = {
  id: string
  name: string
  team: string
  result: string
  isWinner: boolean
  mmrChange: number
  newMMR: number
  matchId: string
}

type GroupedMatch = {
  matchId: string
  winnerTeam: 'A' | 'B'
  teamA: MatchPlayer[]
  teamB: MatchPlayer[]
}

export default function HistoryPage() {
  const [groupedMatches, setGroupedMatches] = useState<GroupedMatch[]>([])

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await fetch('/api/history')
      const matches: GroupedMatch[] = await res.json()
      console.log('Fetched Matches:', matches); // 데이터 확인
      setGroupedMatches(matches)
    }

    fetchMatches()
  }, [])

  return (
    <div className="p-8 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 min-h-screen">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        전적 조회
      </h1>
      {/* 홈으로 돌아가기 버튼 */}
      <Link
        href="/"
        className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
      >
        홈으로
      </Link>
    </div>

      {groupedMatches.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">기록이 없습니다.</p>
      )}

      {groupedMatches.map((match) => (
        <div
          key={match.matchId}
          className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 mb-6 shadow-md bg-white dark:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            🏆 {match.winnerTeam === 'A' ? '높은봉우리' : '낮은골짜기'}팀 승리
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['A', 'B'].map((teamKey) => {
              const team = teamKey === 'A' ? match.teamA : match.teamB;
              const teamName = teamKey === 'A' ? '높은봉우리' : '낮은골짜기'; // 팀 이름 치환
              return (
                <div key={teamKey}>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    {teamName}팀
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {team.map((player, index) => (
                      <li
                        key={`${match.matchId}-${player.id}`}
                        className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md"
                      >
                        <span className="font-medium">{player.name}</span>
                        <span
                          className={`font-mono ${
                            player.mmrChange >= 0
                              ? 'text-green-500'
                              : 'text-red-400'
                          }`}
                        >
                          ({player.mmrChange > 0 ? '+' : ''}
                          {player.mmrChange.toFixed(1)}) → {player.newMMR.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
