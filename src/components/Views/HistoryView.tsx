import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Download, Search } from 'lucide-react';
import { WorkSession } from '../../types';
import { timeTrackingService } from '../../services/timeTrackingService';
import { useAuth } from '../../context/AuthContext';
import { mockEmployees } from '../../data/mockData';

export const HistoryView: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, dateFilter]);

  const loadSessions = async () => {
    if (!user?.employee.id) return;

    setIsLoading(true);
    try {
      const employeeId = user.employee.role === 'manager' ? undefined : user.employee.id;
      const data = await timeTrackingService.getWorkSessions(employeeId);
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(session => {
        const employee = mockEmployees.find(emp => emp.id === session.employeeId);
        return employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const today = now.toDateString();
      filtered = filtered.filter(session => session.date === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(session => new Date(session.clockIn) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(session => new Date(session.clockIn) >= monthAgo);
    }

    setFilteredSessions(filtered);
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
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (hours: number | undefined) => {
    if (!hours) return 'En cours';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historique des pointages</h1>
        <p className="text-gray-600">Consultez l'historique complet des sessions de travail</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={user?.employee.role === 'manager' ? 'Rechercher un employé...' : 'Rechercher...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm font-medium text-gray-700">
            {user?.employee.role === 'manager' && <div>Employé</div>}
            <div className={user?.employee.role === 'manager' ? '' : 'md:col-span-2'}>Date</div>
            <div>Entrée</div>
            <div>Sortie</div>
            <div>Durée</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredSessions.map((session) => (
            <div key={session.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {user?.employee.role === 'manager' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">
                        {getEmployeeName(session.employeeId).split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {getEmployeeName(session.employeeId)}
                    </span>
                  </div>
                )}
                
                <div className={`flex items-center space-x-2 ${user?.employee.role === 'manager' ? '' : 'md:col-span-2'}`}>
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{formatDate(session.clockIn)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-mono text-gray-900">{formatTime(session.clockIn)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {session.clockOut ? (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-mono text-gray-900">{formatTime(session.clockOut)}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-500 italic">En cours</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className={`font-medium ${session.totalHours ? 'text-gray-900' : 'text-yellow-600'}`}>
                    {formatDuration(session.totalHours)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredSessions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune session trouvée</p>
              <p className="text-sm text-gray-400 mt-1">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};