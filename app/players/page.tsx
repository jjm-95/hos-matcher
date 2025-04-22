'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [players, setPlayers] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data))
  }, [])

  const handleSubmit = async () => {
    await fetch('/api/players', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    setName('')
    location.reload()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">플레이어 목록</h1>
      <ul className="mb-4">
        {players.map((player: any) => (
          <li key={player.id}>{player.name} (MMR: {player.mmr})</li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="이름 입력"
          className="border px-2 py-1"
        />
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-1">
          추가
        </button>
      </div>
    </div>
  )
}
