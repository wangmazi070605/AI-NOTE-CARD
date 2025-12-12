"use client";

import { useState, useEffect } from "react";
import { generateDailyFortune } from "@/app/actions/dailyFortune";
import type { DailyFortune } from "@/lib/schemas";
import DailyFortuneCard from "@/components/DailyFortuneCard";

const STORAGE_KEY = "dailyFortuneUserInfo";

export default function DailyFortunePage() {
  const [dailyFortune, setDailyFortune] = useState<DailyFortune | null>(null);
  const [isLoadingFortune, setIsLoadingFortune] = useState(false);
  const [fortuneName, setFortuneName] = useState("");
  const [fortuneBirthDate, setFortuneBirthDate] = useState("");
  const [fortuneBirthTime, setFortuneBirthTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 日期选择器的年月日
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  // 从 YYYY-MM-DD 格式解析年月日
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { year: "", month: "", day: "" };
    const parts = dateStr.split("-");
    return {
      year: parts[0] || "",
      month: parts[1] || "",
      day: parts[2] || "",
    };
  };

  // 将年月日组合成 YYYY-MM-DD 格式
  const formatDate = (year: string, month: string, day: string) => {
    if (!year || !month || !day) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // 获取某年某月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // 从 localStorage 加载保存的信息
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setFortuneName(data.name || "");
          const dateStr = data.birthDate || "";
          setFortuneBirthDate(dateStr);
          setFortuneBirthTime(data.birthTime || "");
          
          // 解析日期并设置年月日
          const { year, month, day } = parseDate(dateStr);
          setSelectedYear(year);
          setSelectedMonth(month);
          setSelectedDay(day);
        }
      } catch (e) {
        console.error("加载保存的信息失败:", e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // 保存信息到 localStorage
  const saveToLocalStorage = (name: string, birthDate: string, birthTime: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name, birthDate, birthTime })
        );
      } catch (e) {
        console.error("保存信息失败:", e);
      }
    }
  };

  // 当年月日变化时，更新 fortuneBirthDate
  useEffect(() => {
    const dateStr = formatDate(selectedYear, selectedMonth, selectedDay);
    setFortuneBirthDate(dateStr);
  }, [selectedYear, selectedMonth, selectedDay]);

  // 实时保存输入的信息（仅在加载完成后保存，避免初始化时重复保存）
  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage(fortuneName, fortuneBirthDate, fortuneBirthTime);
    }
  }, [fortuneName, fortuneBirthDate, fortuneBirthTime, isLoaded]);

  // 生成年份选项（限制最小年龄15岁）
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100; // 最大年龄100岁
  const maxYear = currentYear - 15; // 最小年龄15岁
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  // 生成月份选项
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}月`,
  }));

  // 生成日期选项（根据选择的年月动态计算）
  const getDays = () => {
    if (!selectedYear || !selectedMonth) {
      return [];
    }
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysCount = getDaysInMonth(year, month);
    return Array.from({ length: daysCount }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}日`,
    }));
  };

  // 当月份或年份变化时，如果当前选择的日期无效，重置日期
  // 同时验证年龄是否至少15岁
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const day = parseInt(selectedDay);
      const daysInMonth = getDaysInMonth(year, month);
      
      // 检查日期是否超出月份范围
      if (day > daysInMonth) {
        setSelectedDay("");
        return;
      }
      
      // 检查年龄是否至少15岁
      const dateStr = formatDate(selectedYear, selectedMonth, selectedDay);
      if (dateStr && !validateAge(dateStr)) {
        setError("出生日期对应的年龄必须至少15岁");
        // 不清空日期，只提示错误，让用户自己修改
      } else {
        setError(null); // 清除错误提示
      }
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // 12个时辰
  const birthTimes = [
    { value: "子", label: "子时 (23:00-01:00)" },
    { value: "丑", label: "丑时 (01:00-03:00)" },
    { value: "寅", label: "寅时 (03:00-05:00)" },
    { value: "卯", label: "卯时 (05:00-07:00)" },
    { value: "辰", label: "辰时 (07:00-09:00)" },
    { value: "巳", label: "巳时 (09:00-11:00)" },
    { value: "午", label: "午时 (11:00-13:00)" },
    { value: "未", label: "未时 (13:00-15:00)" },
    { value: "申", label: "申时 (15:00-17:00)" },
    { value: "酉", label: "酉时 (17:00-19:00)" },
    { value: "戌", label: "戌时 (19:00-21:00)" },
    { value: "亥", label: "亥时 (21:00-23:00)" },
  ];

  // 验证年龄是否至少15岁
  const validateAge = (birthDate: string): boolean => {
    if (!birthDate) return false;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    // 如果还没过生日，年龄减1
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return actualAge >= 15;
  };

  // 获取今日运势
  const handleGetDailyFortune = async () => {
    if (!fortuneName.trim()) {
      setError("请输入姓名");
      return;
    }
    if (!fortuneBirthDate) {
      setError("请选择出生日期");
      return;
    }
    if (!fortuneBirthTime) {
      setError("请选择出生时辰");
      return;
    }
    
    // 验证年龄
    if (!validateAge(fortuneBirthDate)) {
      setError("抱歉，本服务仅面向15岁及以上的用户");
      return;
    }

    // 保存到 localStorage
    saveToLocalStorage(fortuneName.trim(), fortuneBirthDate, fortuneBirthTime);

    setIsLoadingFortune(true);
    setError(null);
    setDailyFortune(null);

    try {
      const birthDate = new Date(fortuneBirthDate);
      // 获取当前选择的日期（如果有日期选择器，这里可以传入）
      const targetDate = new Date(); // 暂时使用当前日期，后续可以改为从输入框获取
      const result = await generateDailyFortune(fortuneName.trim(), birthDate, fortuneBirthTime, targetDate);
      // 添加用户姓名到结果中
      result.name = fortuneName.trim();
      setDailyFortune(result);
      // 生成卡片后收起输入框
      setIsInputCollapsed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取今日运势失败，请重试");
      console.error("获取今日运势错误:", err);
    } finally {
      setIsLoadingFortune(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-black dark:via-purple-950/20 dark:to-cyan-950/20 transition-all duration-500">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* 标题区域 */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
            ✨ 今日运势
          </h1>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            每天早上看一眼，开启美好一天
          </p>

          {/* 输入区域 */}
          <div className="max-w-md mx-auto rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800 shadow-lg overflow-hidden">
            {/* 折叠/展开按钮 */}
            {(isInputCollapsed || dailyFortune) && (
              <button
                onClick={() => setIsInputCollapsed(!isInputCollapsed)}
                className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-purple-200 dark:border-purple-800"
              >
                <span>{isInputCollapsed ? "展开输入框" : "收起输入框"}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${isInputCollapsed ? "" : "rotate-180"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
            
            <div className={`transition-all duration-300 overflow-hidden ${isInputCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"}`}>
            <div className="p-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 text-left">
                  姓名
                </label>
                <input
                  type="text"
                  placeholder="请输入您的姓名"
                  value={fortuneName}
                  onChange={(e) => setFortuneName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 text-left">
                  出生日期
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* 年份选择 */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className={`w-full px-3 py-3 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      !selectedYear
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "dark:text-zinc-50"
                    }`}
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">年份</option>
                    {years.map((year) => (
                      <option key={year} value={String(year)}>
                        {year}年
                      </option>
                    ))}
                  </select>

                  {/* 月份选择 */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`w-full px-3 py-3 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      !selectedMonth
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "dark:text-zinc-50"
                    }`}
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">月份</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>

                  {/* 日期选择 */}
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    disabled={!selectedYear || !selectedMonth}
                    className={`w-full px-3 py-3 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      !selectedYear || !selectedMonth
                        ? "opacity-50 cursor-not-allowed text-zinc-400 dark:text-zinc-500"
                        : !selectedDay
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "dark:text-zinc-50"
                    }`}
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">日期</option>
                    {getDays().map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 text-left">
                  出生时辰
                </label>
                <select
                  value={fortuneBirthTime}
                  onChange={(e) => setFortuneBirthTime(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    !fortuneBirthTime
                      ? "text-zinc-400 dark:text-zinc-500"
                      : "dark:text-zinc-50"
                  }`}
                  style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="" disabled>
                    请选择出生时辰
                  </option>
                {birthTimes.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
              </div>
              <button
                onClick={handleGetDailyFortune}
                disabled={isLoadingFortune}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-bold text-sm hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingFortune ? "🔮 占卜中..." : "🔮 一键获取今日运势"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            </div>
            </div>
            </div>
          </div>

        {/* 运势卡片展示区域 */}
        {dailyFortune && (
          <div className="flex flex-col items-center">
            <DailyFortuneCard data={dailyFortune} />
          </div>
        )}

        {/* 未生成时的提示 */}
        {!dailyFortune && !isLoadingFortune && (
          <div className="text-center mt-12">
            <div className="inline-block p-8 rounded-full bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30">
              <span className="text-6xl">🔮</span>
            </div>
            <p className="mt-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              填写信息后点击按钮获取今日运势
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

