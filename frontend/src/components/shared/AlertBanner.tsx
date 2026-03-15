/**
 * AlertBanner Component
 * Displays important alerts and notifications
 */

interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function AlertBanner({
  type,
  title,
  message,
  onDismiss,
  action,
  className = '',
}: AlertBannerProps) {
  const typeConfig = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'ℹ️',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: '⚠️',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: '❌',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: '✅',
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>
          {message && (
            <p className={`text-sm ${config.text} opacity-80`}>{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium ${config.text} hover:underline`}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-xl ${config.text} hover:opacity-70`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
