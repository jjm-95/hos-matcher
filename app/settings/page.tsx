'use client';

import { useState, useEffect } from "react";

type Settings = {
  id: number;
  MMR_WIN_CHANGE: number;
  MMR_LOSS_CHANGE: number;
  STREAK_BONUS: number;
  UNDERDOG_BONUS: number;
  POWER_DIFFERENCE_THRESHOLD: number;
};

// 사용자 친화적인 이름 매핑
const settingLabels: Record<keyof Settings, string> = {
  id: "ID (숨김)", // 'id'는 숨김 처리
  MMR_WIN_CHANGE: "승리 시 전투력 +",
  MMR_LOSS_CHANGE: "패배 시 전투력 -",
  STREAK_BONUS: "연승/연패 보정치",
  UNDERDOG_BONUS: "언더독 보너스",
  POWER_DIFFERENCE_THRESHOLD: "팀 간 전투력 차이 기준",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    id: 1, // 초기값 설정
    MMR_WIN_CHANGE: 1,
    MMR_LOSS_CHANGE: -1,
    STREAK_BONUS: 0.5,
    UNDERDOG_BONUS: 1,
    POWER_DIFFERENCE_THRESHOLD: 3,
  });

  // 설정값 가져오기
  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
  };

  // 설정값 저장
  const saveSettings = async () => {
    const settingsWithId = { ...settings, id: settings.id || 1 }; // id가 없으면 기본값 1 설정
    console.log("Saving settings:", settingsWithId);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsWithId),
    });

    try {
      const result = await res.json();
      if (!res.ok) {
        console.error("Error response from server:", result);
        alert("설정을 저장하는 중 오류가 발생했습니다.");
        return;
      }

      alert("설정이 저장되었습니다!");
    } catch (error) {
      console.error("Failed to parse server response:", error);
      alert("서버 응답을 처리하는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold mb-6 text-center">전투력 설정 관리</h1>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {(Object.keys(settings) as (keyof Settings)[])
              .filter((key) => key !== "id") // 'id' 필드를 제외
              .map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="w-1/2 font-semibold">{settingLabels[key]}</label>
                  <input
                    type="number"
                    value={settings[key]}
                    onChange={(e) =>
                      setSettings({ ...settings, [key]: parseFloat(e.target.value) })
                    }
                    className="border border-gray-300 dark:border-gray-700 rounded p-2 w-1/3 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
              ))}
          </div>
          <button
            onClick={saveSettings}
            className="mt-6 w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
          >
            저장
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 w-full py-2 bg-gray-500 text-white font-semibold rounded hover:bg-gray-600 transition"
          >
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}