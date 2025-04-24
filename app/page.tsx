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
import { motion, AnimatePresence } from "framer-motion";

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
  const [players, setPlayers] = useState<any[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerMMR, setNewPlayerMMR] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerHistory, setPlayerHistory] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<any | null>(null);
  const router = useRouter();

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data.sort((a: any, b: any) => b.mmr - a.mmr));
  };

  const fetchPlayerHistory = async (playerId: string) => {
    const res = await fetch(`/api/players/${playerId}/history`);
    const data = await res.json();
    setPlayerHistory(data.history);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    const res = await fetch(`/api/players/${playerToDelete.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== playerToDelete.id)
      );
      if (selectedPlayerId === playerToDelete.id) {
        setSelectedPlayerId(null);
        setPlayerHistory([]);
      }
      setShowDeleteModal(false);
      setPlayerToDelete(null);
    } else {
      alert("선수 삭제에 실패했습니다.");
    }
  };

  const handlePlayerClick = async (player: any) => {
    if (selectedPlayerId === player.id) {
      setSelectedPlayerId(null);
      setPlayerHistory([]);
    } else {
      setSelectedPlayerId(player.id);
      await fetchPlayerHistory(player.id);
    }
  };

  const openDeleteModal = (player: any) => {
    setPlayerToDelete(player);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPlayerToDelete(null);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    
    <div className="p-6 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">🔥🔥히오스 내전🔥🔥</h1>

        {/* 설명서 */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 text-sm rounded">
          <p className="font-semibold mb-2">📘 전투력 보정 규칙</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>2연승 / 2연패 시: 전투력 ±0.5 보정 적용</li>
            <li>전투력이 0 이하일 경우 패배 시: 무조건 0.5만큼 감소</li>
            <li>팀 간 전투력 3 이상 차이 시: 전투력이 낮은 팀은 승리 시 +1 보너스</li>
          </ul>
        </div>

        {/* 선수 추가 */}
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
              onClick={async () => {
                if (!newPlayerName) {
                  alert("선수 이름은 필수입니다.");
                  return;
                }

                const res = await fetch("/api/players", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: newPlayerName,
                    mmr: newPlayerMMR ? parseFloat(newPlayerMMR) : undefined,
                  }),
                });

                if (res.ok) {
                  setNewPlayerName("");
                  setNewPlayerMMR("");
                  fetchPlayers();
                } else {
                  alert("선수 추가에 실패했습니다.");
                }
              }}
              className="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700"
            >
              추가
            </button>
          </div>
        </div>

        {/* 선수 목록 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">불명예의 전당</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {(() => {
              let lastMMR: number | null = null;
              let rank = 0;

              return players.map((player, index) => {
                const isSelected = selectedPlayerId === player.id;

                if (player.mmr !== lastMMR) {
                  rank = index + 1;
                }
                lastMMR = player.mmr;

                return (
                  <li key={player.id} className="py-2">
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                      onClick={() => handlePlayerClick(player)}
                    >
                      <span>
                        {rank === 1 && "🏅"} {rank}위 - {player.name} (전투력💪: {player.mmr})
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(player);
                        }}
                        className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </div>

                    {/* 그래프 */}
                    <AnimatePresence>
                      {isSelected && playerHistory.length > 0 && (
                        <motion.div
                          key="chart"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <Line
                            data={{
                              labels: playerHistory.map((_, i) => `Match ${i + 1}`),
                              datasets: [
                                {
                                  label: `${player.name}의 전투력`,
                                  data: playerHistory,
                                  borderColor: "rgb(75, 192, 192)",
                                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              animation: false,
                              plugins: {
                                legend: { position: "top" },
                                title: {
                                  display: true,
                                  text: `${player.name}의 전투력 변동`,
                                },
                              },
                              scales: {
                                y: { title: { display: true, text: "전투력" } },
                                x: { title: { display: true, text: "매칭 횟수" } },
                              },
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              });
            })()}
          </ul>
        </div>


        {/* 삭제 모달 */}
        {showDeleteModal && playerToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-xl font-semibold mb-4">삭제 확인</h2>
              <p className="mb-6">
                정말로 <strong>{playerToDelete.name}</strong> 선수를 삭제하시겠습니까?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeDeleteModal}
                  className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700"
                >
                  취소
                </button>
                <button
                  onClick={handleDeletePlayer}
                  className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 페이지 이동 버튼 */}
        <div className="text-center flex justify-center gap-4 mt-6">
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
