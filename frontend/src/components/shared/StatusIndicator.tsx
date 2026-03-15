/**
 * StatusIndicator Component
 * Shows system status with color-coded indicator
 */

interface StatusIndicatorProps {
  status: 'optimal' | 'warning' | 'critical';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  status,
  showLabel = true,
  size = 'md',
  className = '',
}: StatusIndicatorProps) {
  const statusConfig = {
    optimal: {
      color: 'bg-green-600',
      label: 'Optimal',
      textColor: 'text-green-600',
    },
    warning: {
      color: 'bg-yellow-500',
      label: 'Warning',
      textColor: 'text-yellow-500',
    },
    critical: {
      color: 'bg-red-500',
      label: 'Critical',
      textColor: 'text-red-500',
    },
  };

  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} ${config.color} rounded-full live-indicator`} />
      {showLabel && (
        <span className={`font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
