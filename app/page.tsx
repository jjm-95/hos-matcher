'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HomePage() {
  const [players, setPlayers] = useState<any[]>([]); // 선수 목록
  const [newPlayerName, setNewPlayerName] = useState(""); // 새 선수 이름
  const [newPlayerMMR, setNewPlayerMMR] = useState(""); // 새 선수 전투력
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null); // 선택된 선수
  const [playerHistory, setPlayerHistory] = useState<number[]>([]); // 선택된 선수의 전투력 변동 기록
  const router = useRouter();

  // 선수 목록 가져오기
  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data.sort((a: any, b: any) => b.mmr - a.mmr)); // 전투력 기준 내림차순 정렬
  };

  // 특정 선수의 전투력 변동 기록 가져오기
  const fetchPlayerHistory = async (playerId: string) => {
    const res = await fetch(`/api/players/${playerId}/history`);
    const data = await res.json();
    setPlayerHistory(data.history); // 전투력 변동 기록 설정
  };

  // 선수 클릭 핸들러
  const handlePlayerClick = (player: any) => {
    if (selectedPlayer?.id === player.id) {
      // 같은 선수를 다시 클릭하면 차트를 닫음
      setSelectedPlayer(null);
      setPlayerHistory([]);
    } else {
      setSelectedPlayer(player); // 선택된 선수 설정
      fetchPlayerHistory(player.id); // 해당 선수의 전투력 변동 기록 가져오기
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
              onClick={() => {
                // 선수 추가 로직
              }}
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
            {players.map((player, index) => {
              const rank = index + 1; // 순위 계산
              return (
                <li
                  key={player.id}
                  className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handlePlayerClick(player)} // 선수 클릭 핸들러
                >
                  <span>
                    {rank === 1 && "🏅"} {rank}위 - {player.name} (전투력💪: {player.mmr})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 선택된 선수의 전투력 변동 그래프 */}
        {selectedPlayer && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPlayer.name}의 전투력 변동
            </h2>
            <Line
              data={{
                labels: playerHistory.map((_, index) => `Match ${index + 1}`), // 매칭 번호
                datasets: [
                  {
                    label: `${selectedPlayer.name}의 전투력`,
                    data: playerHistory, // 전투력 변동 기록
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: true,
                    text: `${selectedPlayer.name}의 전투력 변동`,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: "전투력",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "매칭 횟수",
                    },
                  },
                },
              }}
            />
          </div>
        )}

        {/* 전투력 보정 설명 */}
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

        {/* 페이지 이동 버튼 */}
        <div className="text-center flex justify-center gap-4">
          <button
            onClick={() => router.push("/match")}
            className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
          >
            매칭 페이지로 이동
          </button>
          <button
            onClick={() => router.push("/history")}
            className="bg-gray-500 dark:bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-600 dark:hover:bg-gray-700"
          >
            전적확인 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
}