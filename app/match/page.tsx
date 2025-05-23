'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MatchPage() {
  const [players, setPlayers] = useState<any[]>([]); // 전체 플레이어 목록
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]); // 참여 인원
  const [teamA, setTeamA] = useState<any[]>([]); // 팀 A
  const [teamB, setTeamB] = useState<any[]>([]); // 팀 B
  const [winnerTeam, setWinnerTeam] = useState<"A" | "B" | null>(null); // 승리팀
  const [powerDifferenceWarning, setPowerDifferenceWarning] = useState(false);
  const [powerDifferenceThreshold, setPowerDifferenceThreshold] = useState<number>(3); // 기본값 3
  const router = useRouter();

    // MMR 설정값 가져오기
    const fetchMMRSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data?.POWER_DIFFERENCE_THRESHOLD) {
            setPowerDifferenceThreshold(data.POWER_DIFFERENCE_THRESHOLD);
          }
        } else {
          console.error("Failed to fetch settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

  // 플레이어 목록 가져오기
  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  // 참여 인원 추가
  const handleAddToSelected = (player: any) => {
    setSelectedPlayers([...selectedPlayers, player]);
    setPlayers(players.filter((p) => p.id !== player.id));
  };

  // 참여 인원 제거
  const handleRemoveFromSelected = (player: any) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    setPlayers([...players, player]);
  };

  // 자동 매칭
  const handleAutoMatch = () => {
    if (selectedPlayers.length % 2 !== 0) {
      alert("참여 인원은 짝수여야 합니다!");
      return;
    }
    const totalPlayers = selectedPlayers.length;
    const half = totalPlayers / 2;
    let minDiff = Infinity;
    let bestTeamA: any[] = [];
    let bestTeamB: any[] = [];
  
    // 가능한 모든 조합을 생성하여 팀 구성
    const getCombinations = (players: any[], teamSize: number): any[][] => {
      const results: any[][] = [];
      const combination: any[] = [];
  
      const backtrack = (start: number) => {
        if (combination.length === teamSize) {
          results.push([...combination]);
          return;
        }
  
        for (let i = start; i < players.length; i++) {
          combination.push(players[i]);
          backtrack(i + 1);
          combination.pop();
        }
      };
  
      backtrack(0);
      return results;
    };
  
    const combinations = getCombinations(selectedPlayers, half);
    for (const teamA of combinations) {
      const teamB = selectedPlayers.filter((player) => !teamA.includes(player));
  
      const teamAPower = teamA.reduce((sum, player) => sum + player.mmr, 0);
      const teamBPower = teamB.reduce((sum, player) => sum + player.mmr, 0);
      const powerDifference = Math.abs(teamAPower - teamBPower);


  
      if (powerDifference < minDiff) {
        minDiff = powerDifference;
        bestTeamA = teamA;
        bestTeamB = teamB;
      }

      // 전투력 차이 경고
      if (parseFloat(powerDifference.toFixed(2)) >= powerDifferenceThreshold) {
        setPowerDifferenceWarning(true);
      } else {
        setPowerDifferenceWarning(false);
      }
    }
    
  
    setTeamA(bestTeamA);
    setTeamB(bestTeamB);
  };
  // 경기 결과 제출
  const handleSubmitMatch = async () => {
    if (!winnerTeam) {
      alert("승리팀을 선택해주세요!");
      return;
    }
    if (teamA.length === 0 || teamB.length === 0) {
      alert("자동 매칭을 먼저 수행해주세요!");
      return;
    }

    const response = await fetch("/api/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        players: [...teamA, ...teamB],
        winnerTeam,
      }),
    });

    if (response.ok) {
      alert("경기 결과가 제출되었습니다!");
      router.push("/"); // 홈으로 이동
    } else {
      alert("경기 결과 제출에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchMMRSettings();
  }, []);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">팀 매칭 및 경기 결과 제출</h1>

        {/* 전체 선수 목록 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">전체 선수 목록</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {players.map((player) => (
              <li
                key={player.id}
                className="flex justify-between items-center py-2"
              >
                <span>
                  {player.name} (전투력💪: {player.mmr})
                </span>
                <button
                  onClick={() => handleAddToSelected(player)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  참여
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* 참여 인원 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">참여 인원</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {selectedPlayers.map((player) => (
              <li
                key={player.id}
                className="flex justify-between items-center py-2"
              >
                <span>
                  {player.name} (전투력💪: {player.mmr})
                </span>
                <button
                  onClick={() => handleRemoveFromSelected(player)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleAutoMatch}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 mt-4"
          >
            자동 매칭
          </button>
        </div>
      {/* 경고 문구 */}
      {powerDifferenceWarning && (
        <div className="text-xl text-red-500 font-bold text-center">
          <h2>🚨큰 전투력 매칭🚨</h2>
          <div className="text-sm text-red-500 font-normal mt-1">
            ({powerDifferenceThreshold} 이상의 전투력 차이)
          </div> 
        </div>
      )}
        {/* 팀 A */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            팀 높은봉우리 (총 전투력💪: {teamA.reduce((sum, p) => sum + p.mmr, 0)})
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {teamA.map((player) => (
              <li key={player.id} className="py-2">
                {player.name} (전투력💪: {player.mmr})
              </li>
            ))}
          </ul>
        </div>

        {/* 팀 B */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            팀 낮은골짜기 (총 전투력💪: {teamB.reduce((sum, p) => sum + p.mmr, 0)})
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {teamB.map((player) => (
              <li key={player.id} className="py-2">
                {player.name} (전투력💪: {player.mmr})
              </li>
            ))}
          </ul>
        </div>

        {/* 승리팀 선택 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">승리팀 선택</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="winnerTeam"
                value="A"
                checked={winnerTeam === "A"}
                onChange={() => setWinnerTeam("A")}
                className="w-5 h-5"
              />
              팀 높은봉우리
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="winnerTeam"
                value="B"
                checked={winnerTeam === "B"}
                onChange={() => setWinnerTeam("B")}
                className="w-5 h-5"
              />
              팀 낮은골짜기
            </label>
          </div>
        </div>

        <div className="text-center">
        {/* 경기 결과 제출 버튼 */}
        <button
          onClick={handleSubmitMatch}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 mr-4"
        >
          경기 결과 제출
        </button>

        {/* 홈으로 이동 버튼 */}
        <button
          onClick={() => router.push("/")}
          className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
        >
          홈으로 이동
        </button>
      </div>
      </div>
    </div>
  );
}