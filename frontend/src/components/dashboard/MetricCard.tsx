import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: number;
  description?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconBg = 'bg-primary-100 text-primary-600',
  trend,
  description,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary-200 transition-all' : ''}`}
    >
      <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {(trend !== undefined || description) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend !== undefined && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  trend > 0
                    ? 'text-green-600'
                    : trend < 0
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : trend < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {Math.abs(trend)}%
              </span>
            )}
            {description && (
              <span className="text-xs text-gray-400">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
