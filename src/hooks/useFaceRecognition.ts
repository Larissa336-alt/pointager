import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceRecognition = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading face-api models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const detectFace = async (): Promise<string | null> => {
    if (!videoRef.current || !isLoaded) return null;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        return JSON.stringify(Array.from(detection.descriptor));
      }
    } catch (error) {
      console.error('Error detecting face:', error);
    }

    return null;
  };

  const compareFaces = (encoding1: string, encoding2: string): number => {
    try {
      const desc1 = new Float32Array(JSON.parse(encoding1));
      const desc2 = new Float32Array(JSON.parse(encoding2));
      return faceapi.euclideanDistance(desc1, desc2);
    } catch (error) {
      console.error('Error comparing faces:', error);
      return 1; // Return max distance on error
    }
  };

  return {
    isLoaded,
    isLoading,
    videoRef,
    startVideo,
    stopVideo,
    detectFace,
    compareFaces,
  };
};