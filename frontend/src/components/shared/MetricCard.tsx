/**
 * MetricCard Component
 * Displays a single metric with value, label, and optional trend
 */

interface MetricCardProps {
  value: string | number;
  label: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  value,
  label,
  unit,
  trend,
  trendValue,
  color = 'text-gray-900 dark:text-white',
  icon,
  className = '',
}: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-500',
    stable: 'text-gray-500',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {icon && <div className="text-green-600">{icon}</div>}
        {trend && trendValue && (
          <div className={`text-sm font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]} {trendValue}
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold ${color} mb-2`}>
        {value}
        {unit && <span className="text-lg ml-1 text-gray-500">{unit}</span>}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm">{label}</div>
    </div>
  );
}
