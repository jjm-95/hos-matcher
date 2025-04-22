// /app/page.tsx
'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [players, setPlayers] = useState<any[]>([]); // 선수 목록
  const [newPlayerName, setNewPlayerName] = useState(""); // 새 선수 이름
  const [newPlayerMMR, setNewPlayerMMR] = useState(""); // 새 선수 전투력
  const router = useRouter();

  // 선수 목록 가져오기
  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();

    // 전투력 기준으로 내림차순 정렬
    const sortedPlayers = data.sort((a: any, b: any) => b.mmr - a.mmr);
    setPlayers(sortedPlayers);
  };

  // 선수 추가
  const handleAddPlayer = async () => {
    if (!newPlayerName || !newPlayerMMR) {
      alert("선수 이름과 전투력을 입력해주세요!");
      return;
    }

    const newPlayer = {
      name: newPlayerName,
      mmr: parseInt(newPlayerMMR, 10),
    };

    const response = await fetch("/api/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPlayer),
    });

    if (response.ok) {
      alert("선수가 추가되었습니다!");
      setNewPlayerName("");
      setNewPlayerMMR("");
      fetchPlayers(); // 선수 목록 새로고침
    } else {
      alert("선수 추가에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // 순위 계산 로직
  const calculateRankings = (players: any[]) => {
    let rank = 1; // 현재 순위
    let previousMMR: number | null = null; // 이전 전투력
    let sameRankCount = 0; // 동률인 선수 수

    return players.map((player, index) => {
      if (previousMMR === null || player.mmr === previousMMR) {
        sameRankCount++; // 동률인 경우
      } else {
        rank += sameRankCount; // 동률이 끝나면 순위를 조정
        sameRankCount = 1; // 새로운 동률 시작
      }

      previousMMR = player.mmr; // 이전 전투력 갱신
      return { ...player, rank };
    });
  };

  const rankedPlayers = calculateRankings(players);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">선수 관리 시스템</h1>

        {/* 선수 추가 폼 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">선수 추가</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="선수 이름"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded px-4 py-2 w-full bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <input
              type="number"
              placeholder="전투력 (MMR)"
              value={newPlayerMMR}
              onChange={(e) => setNewPlayerMMR(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded px-4 py-2 w-full bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <button
              onClick={handleAddPlayer}
              className="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700"
            >
              추가
            </button>
          </div>
        </div>

        {/* 등록된 선수 목록 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">등록된 선수</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {rankedPlayers.map((player) => (
              <li
                key={player.id}
                className="flex justify-between items-center py-2"
              >
                <span>
                  {player.rank}위: {player.name} (전투력: {player.mmr})
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Match 페이지로 이동 버튼 */}
        <div className="text-center">
          <button
            onClick={() => router.push("/match")}
            className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
          >
            매칭 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
}