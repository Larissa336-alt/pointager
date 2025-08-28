import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar } from 'lucide-react';
import { TimeEntry } from '../../types';
import { timeTrackingService } from '../../services/timeTrackingService';
import { mockEmployees } from '../../data/mockData';

export const RecentActivity: React.FC = () => {
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const entries = await timeTrackingService.getTimeEntries();
      setRecentEntries(entries.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === employeeId);
    return employee?.name || 'Employé inconnu';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <p className="text-sm text-gray-600">Derniers pointages</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {recentEntries.map((entry) => (
          <div key={entry.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`w-2 h-2 rounded-full ${
              entry.type === 'clock-in' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getEmployeeName(entry.employeeId)}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  entry.type === 'clock-in' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {entry.type === 'clock-in' ? 'Entrée' : 'Sortie'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTime(entry.timestamp)}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {recentEntries.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune activité récente</p>
          </div>
        )}
      </div>
    </div>
  );
};