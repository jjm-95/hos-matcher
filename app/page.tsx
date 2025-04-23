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

  // 선수 삭제
  const handleDeletePlayer = async (playerId: string) => {
    const confirmDelete = confirm("삭제하시겠습니까?");
    if (!confirmDelete) return;

    const response = await fetch(`/api/players/${playerId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("선수가 삭제되었습니다!");
      fetchPlayers(); // 선수 목록 새로고침
    } else {
      alert("선수 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">🔥🔥히오스 내전🔥🔥</h1>

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
          <h2 className="text-xl font-semibold mb-4">불명예의 전당</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {players
              .sort((a, b) => b.mmr - a.mmr) // 전투력 기준 내림차순 정렬
              .map((player, index, sortedPlayers) => {
                // 순위 계산
                let rank;
                if (index === 0) {
                  // 첫 번째 선수는 항상 1위
                  rank = 1;
                } else if (sortedPlayers[index - 1].mmr === player.mmr) {
                  // 동률인 경우 이전 선수와 동일한 순위
                  rank = sortedPlayers[index - 1].rank;
                } else {
                  // 그렇지 않으면 현재 순위
                  rank = index + 1;
                }

                // 현재 선수에 rank 속성 추가
                player.rank = rank;

                return (
                  <li
                    key={player.id}
                    className="flex justify-between items-center py-2"
                  >
                    <span>
                      🏅 {rank}위 - {player.name} (전투력💪: {player.mmr})
                    </span>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* 설명글 */}
        <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">📜 전투력 보정</h3>
          <ul className="list-disc list-inside text-sm">
            <li>2연승/연패 시 전투력에 ±0.5 보정이 적용</li>
            <li>
              전투력이 0 이하일 경우:
              <ul className="list-disc list-inside ml-4">
                <li>패배 시 전투력이 무조건 0.5 감소</li>
                <li>승리 시 전투력이 무조건 +1 증가</li>
              </ul>
            </li>
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