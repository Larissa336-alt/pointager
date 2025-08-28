import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  trend 
}) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600 bg-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600 bg-green-600',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600 bg-orange-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600 bg-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} p-6 rounded-xl shadow-sm border ${colorClasses[color].split(' ')[2]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${colorClasses[color].split(' ')[4]} rounded-lg flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
            trend.isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
};