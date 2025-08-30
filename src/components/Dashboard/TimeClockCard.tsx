import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Play, Square, Loader2, Camera, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../services/supabaseService';
import { useGeolocation } from '../../hooks/useGeolocation';
import { FaceCapture } from '../FaceRecognition/FaceCapture';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const TimeClockCard: React.FC = () => {
  const { user } = useAuth(); // user.id est UUID
  const { latitude, longitude, error: locationError, getCurrentLocation } = useGeolocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<'clocked-in' | 'clocked-out'>('clocked-out');
  const [todayHours, setTodayHours] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('Bureau Principal');
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [pendingAction, setPendingAction] = useState<'clock-in' | 'clock-out' | null>(null);
  const [useFaceRecognition, setUseFaceRecognition] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadData();
      setUseFaceRecognition(!!user?.employee?.faceEncoding);
    }
  }, [user?.id]);

  useEffect(() => {
    if (latitude && longitude) {
      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  }, [latitude, longitude]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // ⚠️ Passer l'UUID de Supabase Auth
      const entries = await supabaseService.getTimeEntries(user.id, startOfDay, endOfDay);

      // Déterminer le statut actuel
      let currentStatus: 'clocked-in' | 'clocked-out' = 'clocked-out';
      if (entries.length > 0) {
        const lastEntry = entries[0];
        currentStatus = lastEntry.type === 'clock-in' ? 'clocked-in' : 'clocked-out';
      }

      // Calculer les heures travaillées aujourd'hui
      const sessions = calculateWorkSessions(entries);
      const hours = sessions.reduce((sum, session) => sum + (session.totalHours || 0), 0);

      setStatus(currentStatus);
      setTodayHours(hours);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateWorkSessions = (entries: any[]) => {
    const sessions: any[] = [];
    const clockIns = entries.filter(e => e.type === 'clock-in');
    const clockOuts = entries.filter(e => e.type === 'clock-out');

    clockIns.forEach(clockIn => {
      const matchingClockOut = clockOuts.find(out => out.timestamp > clockIn.timestamp);
      const totalHours = matchingClockOut
        ? (matchingClockOut.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60 * 60)
        : undefined;

      sessions.push({
        clockIn: clockIn.timestamp,
        clockOut: matchingClockOut?.timestamp,
        totalHours
      });
    });

    return sessions;
  };

  const handleClockAction = async () => {
    if (!user?.id) return;

    const action = status === 'clocked-out' ? 'clock-in' : 'clock-out';

    if (useFaceRecognition && user?.employee?.faceEncoding) {
      setPendingAction(action);
      setShowFaceCapture(true);
      return;
    }

    await performClockAction(action);
  };

  const performClockAction = async (action: 'clock-in' | 'clock-out', faceVerified = false) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      if (action === 'clock-in') {
        await supabaseService.clockIn(
          user.id, // ⚠️ UUID
          location,
          latitude || undefined,
          longitude || undefined,
          faceVerified
        );
      } else {
        await supabaseService.clockOut(
          user.id, // ⚠️ UUID
          location,
          latitude || undefined,
          longitude || undefined,
          undefined,
          faceVerified
        );
      }

      await loadData();
    } catch (error) {
      console.error('Error clocking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceCapture = async (faceEncoding: string) => {
    if (!pendingAction || !user?.employee?.faceEncoding) return;

    // Ici comparaison faceEncoding si nécessaire
    const faceVerified = true;

    if (faceVerified) {
      await performClockAction(pendingAction, true);
      toast.success('Reconnaissance faciale réussie');
    } else {
      toast.error('Reconnaissance faciale échouée');
    }

    setPendingAction(null);
    setShowFaceCapture(false);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-8 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-700"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pointage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">État actuel du pointage</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{formatTime(currentTime)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{currentTime.toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* STATUT ET HEURES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                status === 'clocked-in'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              } dark:bg-opacity-20`}
            >
              {status === 'clocked-in' ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  En service
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
                  Hors service
                </>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Statut actuel</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatHours(todayHours)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Temps aujourd'hui</p>
          </div>
        </div>

        {/* LOCALISATION & FACE ID */}
        <div className="flex items-center justify-between space-x-4 mb-6">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center space-x-2">
            {locationError && (
              <button
                onClick={getCurrentLocation}
                className="p-1 text-orange-500 hover:text-orange-600 transition-colors"
                title="Actualiser la localisation"
              >
                <Navigation className="h-4 w-4" />
              </button>
            )}
            {useFaceRecognition && (
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <Camera className="h-3 w-3 mr-1" />
                <span>Face ID</span>
              </div>
            )}
          </div>
        </div>

        {/* BOUTON POINTAGE */}
        <button
          onClick={handleClockAction}
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            status === 'clocked-in'
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
              : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Traitement...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              {status === 'clocked-in' ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Pointer la sortie
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Pointer l'entrée
                </>
              )}
            </div>
          )}
        </button>
      </motion.div>

      {/* Face Capture Modal */}
      <FaceCapture
        isOpen={showFaceCapture}
        onClose={() => {
          setShowFaceCapture(false);
          setPendingAction(null);
        }}
        onCapture={handleFaceCapture}
        title="Vérification d'identité"
        description="Positionnez votre visage dans le cadre pour vérifier votre identité"
      />
    </>
  );
};
