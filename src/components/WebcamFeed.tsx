'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as faceapi from 'face-api.js';
import { RootState } from '../store';
import { setDetectedFaces, setProcessing, setError } from '../store/faceRecognitionSlice';

const WebcamFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const dispatch = useDispatch();
  const { isWebcamActive, detectedFaces } = useSelector((state: RootState) => state.faceRecognition);
  const lastDetectionTime = useRef<number>(0);
  const detectionInterval = 500; // ms

  // 1) Load face-api.js models once
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          faceapi.nets.ageGenderNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch {
        dispatch(setError('Failed to load face detection models'));
      }
    };
    loadModels();
  }, [dispatch]);

  // 2) Start/stop webcam based on Redux flag
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        dispatch(setError('Failed to access webcam'));
      }
    };
    const stopWebcam = () => {
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    if (isWebcamActive) startWebcam();
    else stopWebcam();

    return () => stopWebcam();
  }, [isWebcamActive, dispatch]);

  // 3) Face detection callback
  const detectFaces = useCallback(async () => {
    if (
      !modelsLoaded ||
      !isWebcamActive ||
      !videoRef.current ||
      !canvasRef.current
    ) {
      return;
    }

    const now = Date.now();
    if (now - lastDetectionTime.current < detectionInterval) return;
    lastDetectionTime.current = now;

    dispatch(setProcessing(true));

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Sync canvas size with video pixel size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Perform detection
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      // Map to your Redux state shape
      const faces = detections.map((det, idx) => ({
        id: `face-${idx}`,
        position: {
          x: det.detection.box.x,
          y: det.detection.box.y,
          width: det.detection.box.width,
          height: det.detection.box.height,
        },
        age: Math.round(det.age),
        gender: det.gender,
        emotion: Object.entries(det.expressions).sort((a, b) => b[1] - a[1])[0][0],
      }));

      // Only dispatch if something changed
      if (faces.length > 0 || detectedFaces.length > 0) {
        dispatch(setDetectedFaces(faces));
      }

      // Draw results
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resized.forEach(det => {
          const box = det.detection.box;
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.fillStyle = 'rgba(59,130,246,0.1)';
          ctx.fillRect(box.x, box.y, box.width, box.height);
        });
        // faceapi.draw.drawFaceLandmarks(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);
      }
    } catch {
      dispatch(setError('Failed to detect faces'));
    } finally {
      dispatch(setProcessing(false));
    }
  }, [modelsLoaded, isWebcamActive, dispatch, detectedFaces.length]);

  // 4) Poll for faces at set interval
  useEffect(() => {
    if (!modelsLoaded || !isWebcamActive) return;
    const id = window.setInterval(detectFaces, detectionInterval);
    return () => window.clearInterval(id);
  }, [modelsLoaded, isWebcamActive, detectFaces]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full max-w-2xl rounded-lg "
        style={{ display: isWebcamActive ? 'block' : 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full max-w-2xl"
        style={{ display: isWebcamActive ? 'block' : 'none' }}
      />
      {!isWebcamActive && (
        <div className="w-full max-w-2xl h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Webcam is inactive</p>
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;
