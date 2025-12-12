"use client";

import Link from "next/link";

export default function BaziRulePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-black dark:via-purple-950/20 dark:to-cyan-950/20">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <Link
              href="/daily-fortune"
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              ← 返回
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
            生辰八字规则详解
          </h1>

          <div className="prose prose-sm max-w-none dark:prose-invert space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">什么是生辰八字？</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                生辰八字，简称八字，是指一个人出生时的干支历日期，由年、月、日、时四柱组成，每柱两个字，共八个字。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">天干地支</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">十天干：</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    甲、乙、丙、丁、戊、己、庚、辛、壬、癸
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">十二地支：</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">四柱说明</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">年柱</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    根据出生年份确定，以农历新年（立春前后）为界。年柱的天干和地支组合表示出生年份。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">月柱</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    根据出生月份确定，以二十四节气中的"节"为界。月柱的地支固定（正月为寅，二月为卯...），天干根据年干推算。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">日柱</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    根据出生日期确定。日柱需要查万年历或通过复杂算法计算，因为农历和公历的对应关系复杂。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">时柱</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    根据出生时辰确定。地支对应时辰（子时、丑时、寅时...），天干根据日干推算。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">时辰对照表</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr className="bg-purple-100 dark:bg-purple-900/30">
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">时辰</th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">时间</th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">地支</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">子时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">23:00-01:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">子</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">丑时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">01:00-03:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">丑</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">寅时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">03:00-05:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">寅</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">卯时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">05:00-07:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">卯</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">辰时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">07:00-09:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">辰</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">巳时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">09:00-11:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">巳</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">午时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">11:00-13:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">午</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">未时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">13:00-15:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">未</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">申时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">15:00-17:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">申</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">酉时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">17:00-19:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">酉</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">戌时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">19:00-21:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">戌</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">亥时</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">21:00-23:00</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">亥</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">注意事项</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>本工具使用的是简化算法，精确计算生辰八字需要专业的万年历和复杂算法</li>
                <li>年柱以农历新年（立春）为界，不是公历1月1日</li>
                <li>月柱以二十四节气为界，不是公历月份</li>
                <li>如需精确计算，建议咨询专业命理师或使用专业的八字排盘工具</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
