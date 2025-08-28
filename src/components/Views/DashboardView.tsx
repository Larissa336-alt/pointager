import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Users, Calendar } from 'lucide-react';
import { TimeClockCard } from '../Dashboard/TimeClockCard';
import { StatsCard } from '../Dashboard/StatsCard';
import { RecentActivity } from '../Dashboard/RecentActivity';
import { useAuth } from '../../context/AuthContext';
import { timeTrackingService } from '../../services/timeTrackingService';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    weeklyHours: 0,
    monthlyHours: 0,
    totalEmployees: 4,
    activeEmployees: 0
  });

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user?.employee.id) return;

    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [weeklySessions, monthlySessions, todayEntries] = await Promise.all([
        timeTrackingService.getWorkSessions(user.employee.id, startOfWeek),
        timeTrackingService.getWorkSessions(user.employee.id, startOfMonth),
        timeTrackingService.getTimeEntries()
      ]);

      const weeklyHours = weeklySessions.reduce((sum, session) => sum + (session.totalHours || 0), 0);
      const monthlyHours = monthlySessions.reduce((sum, session) => sum + (session.totalHours || 0), 0);

      // Count unique employees who clocked in today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEmployees = new Set(
        todayEntries
          .filter(entry => entry.timestamp >= todayStart && entry.type === 'clock-in')
          .map(entry => entry.employeeId)
      );

      setStats({
        weeklyHours,
        monthlyHours,
        totalEmployees: 4,
        activeEmployees: todayEmployees.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatHours = (hours: number) => {
    return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité de pointage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Time Clock Card - Full width on mobile, spans 2 columns on desktop */}
        <div className="lg:col-span-2">
          <TimeClockCard />
        </div>

        {/* Stats Cards */}
        <div className="space-y-6">
          <StatsCard
            title="Cette semaine"
            value={formatHours(stats.weeklyHours)}
            subtitle="Heures travaillées"
            icon={Calendar}
            color="blue"
            trend={{ value: 5, isPositive: true }}
          />
          
          <StatsCard
            title="Ce mois"
            value={formatHours(stats.monthlyHours)}
            subtitle="Total mensuel"
            icon={TrendingUp}
            color="green"
            trend={{ value: 12, isPositive: true }}
          />

          {user?.employee.role === 'manager' && (
            <StatsCard
              title="Employés actifs"
              value={`${stats.activeEmployees}/${stats.totalEmployees}`}
              subtitle="Présents aujourd'hui"
              icon={Users}
              color="purple"
            />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  );
};