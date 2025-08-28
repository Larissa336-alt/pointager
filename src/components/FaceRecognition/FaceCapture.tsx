import React, { useState, useEffect } from 'react';
import { Camera, X, Check, Loader2 } from 'lucide-react';
import { useFaceRecognition } from '../../hooks/useFaceRecognition';
import { motion, AnimatePresence } from 'framer-motion';

interface FaceCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (faceEncoding: string) => void;
  title?: string;
  description?: string;
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Reconnaissance faciale",
  description = "Positionnez votre visage dans le cadre pour la vérification"
}) => {
  const { isLoaded, isLoading, videoRef, startVideo, stopVideo, detectFace } = useFaceRecognition();
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen && isLoaded) {
      startVideo();
    }
    
    return () => {
      stopVideo();
    };
  }, [isOpen, isLoaded]);

  const handleCapture = async () => {
    if (!isLoaded || isCapturing) return;

    setIsCapturing(true);
    setCaptureStatus('detecting');

    try {
      const faceEncoding = await detectFace();
      
      if (faceEncoding) {
        setCaptureStatus('success');
        setTimeout(() => {
          onCapture(faceEncoding);
          handleClose();
        }, 1000);
      } else {
        setCaptureStatus('error');
        setTimeout(() => setCaptureStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      setCaptureStatus('error');
      setTimeout(() => setCaptureStatus('idle'), 2000);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    stopVideo();
    setCaptureStatus('idle');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement des modèles...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                />
                
                {/* Face detection overlay */}
                <div className="absolute inset-4 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
                  {captureStatus === 'detecting' && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg animate-pulse" />
                  )}
                  {captureStatus === 'success' && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg" />
                  )}
                  {captureStatus === 'error' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg" />
                  )}
                </div>

                {/* Status indicator */}
                <div className="absolute top-2 right-2">
                  {captureStatus === 'detecting' && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Détection...
                    </div>
                  )}
                  {captureStatus === 'success' && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Succès
                    </div>
                  )}
                  {captureStatus === 'error' && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      Aucun visage détecté
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCapture}
                  disabled={!isLoaded || isCapturing || captureStatus === 'detecting'}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Capture...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Capturer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};