import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, Clock, Download, Filter } from 'lucide-react';
import { AnalyticsCharts } from '../Analytics/AnalyticsCharts';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedEmployee]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load employees for filter
      const employeeData = await supabaseService.getEmployees();
      setEmployees(employeeData);

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      let endDate = now;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = startOfWeek(now, { locale: fr });
          endDate = endOfWeek(now, { locale: fr });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case '30days':
          startDate = subDays(now, 30);
          break;
        default:
          startDate = subDays(now, 7);
      }

      // Load analytics data
      const employeeId = selectedEmployee === 'all' ? undefined : selectedEmployee;
      const data = await supabaseService.getAnalytics(employeeId, startDate, endDate);
      
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const exportData = () => {
    if (!analytics) return;

    const csvContent = [
      ['Date', 'Heures'],
      ...Object.entries(analytics.dailyHours).map(([date, hours]) => [
        format(new Date(date), 'dd/MM/yyyy', { locale: fr }),
        hours
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Rapports</h1>
        <p className="text-gray-600 dark:text-gray-300">Analysez les données de pointage et les tendances</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="30days">30 derniers jours</option>
              </select>
            </div>

            {user?.employee.role === 'manager' && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les employés</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total des heures</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatHours(analytics.totalHours)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Période sélectionnée</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-xl shadow-sm border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moyenne quotidienne</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatHours(analytics.averageHours)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Par jour travaillé</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-xl shadow-sm border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jours travaillés</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {analytics.totalDays}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sessions complètes</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 rounded-xl shadow-sm border border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employés actifs</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {employees.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total des employés</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <AnalyticsCharts
            dailyHours={analytics.dailyHours}
            departmentStats={{}}
            weeklyTrend={[]}
          />
        </>
      )}
    </div>
  );
};