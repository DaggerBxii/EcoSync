"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Label } from "recharts";
import { TrendingUp } from "lucide-react";

interface BeforeAfterChartProps {
  beforeValue?: number;
  afterValue?: number;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
}

export function BeforeAfterChart({
  beforeValue = 38,
  afterValue = 76,
  beforeLabel = "Before Synclo",
  afterLabel = "After Synclo",
  caption = "Synclo increased load-window alignment from 38% → 76%.",
  showButton = true,
  onButtonClick,
}: BeforeAfterChartProps) {
  const data = [
    { name: beforeLabel, value: beforeValue, fill: "#94a3b8" },
    { name: afterLabel, value: afterValue, fill: "#10b981" },
  ];

  const improvement = ((afterValue - beforeValue) / beforeValue) * 100;

  return (
    <div className="w-full">
      <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border">
        {/* Chart Title */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Impact of Synclo</h3>
          <p className="text-muted-foreground">See the difference intelligent synchronization makes</p>
        </div>

        {/* Bar Chart */}
        <div className="h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barGap={40}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={20}
              />
              <YAxis
                hide
                domain={[0, 100]}
              />
              <Bar
                dataKey="value"
                radius={[12, 12, 0, 0]}
                barSize={120}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Values Display */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-muted-foreground mb-2">{beforeValue}%</div>
            <div className="text-sm text-muted-foreground">{beforeLabel}</div>
            <div className="text-xs text-muted-foreground mt-1">Load-window alignment</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">{afterValue}%</div>
            <div className="text-sm text-green-600 font-semibold">{afterLabel}</div>
            <div className="text-xs text-muted-foreground mt-1">Load-window alignment</div>
          </div>
        </div>

        {/* Improvement Badge */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Improvement</div>
            <div className="text-2xl font-bold text-green-600">+{improvement.toFixed(0)}%</div>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-muted-foreground mb-8">
          {caption}
        </p>

        {/* Action Button */}
        {showButton && onButtonClick && (
          <div className="text-center">
            <button
              onClick={onButtonClick}
              className="px-6 py-3 rounded-full border border-green-600 text-green-600 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
            >
              See it in action →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}