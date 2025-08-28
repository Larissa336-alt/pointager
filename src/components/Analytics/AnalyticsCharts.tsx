import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsChartsProps {
  dailyHours: Record<string, number>;
  departmentStats?: Record<string, number>;
  weeklyTrend?: Array<{ date: string; hours: number }>;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  dailyHours,
  departmentStats = {},
  weeklyTrend = []
}) => {
  // Prepare daily hours data
  const dailyData = Object.entries(dailyHours)
    .map(([date, hours]) => ({
      date: format(new Date(date), 'dd/MM', { locale: fr }),
      hours: Number(hours.toFixed(1)),
      fullDate: date
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    .slice(-7); // Last 7 days

  // Prepare department data
  const departmentData = Object.entries(departmentStats).map(([department, hours]) => ({
    name: department,
    hours: Number(hours.toFixed(1)),
  }));

  // Colors for charts
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Hours Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Heures quotidiennes (7 derniers jours)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-gray-600 dark:text-gray-300"
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-300"
              label={{ value: 'Heures', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value}h`, 'Heures travaillées']}
            />
            <Bar 
              dataKey="hours" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend Line Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tendance hebdomadaire
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-gray-600 dark:text-gray-300"
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-300"
              label={{ value: 'Heures', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value}h`, 'Heures travaillées']}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Department Distribution Pie Chart */}
      {departmentData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition par département
          </h3>
          <div className="flex flex-col lg:flex-row items-center">
            <ResponsiveContainer width="100%" height={300} className="lg:w-1/2">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}h`, 'Heures totales']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="lg:w-1/2 lg:pl-6 mt-4 lg:mt-0">
              <div className="space-y-3">
                {departmentData.map((dept, index) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {dept.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {dept.hours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};