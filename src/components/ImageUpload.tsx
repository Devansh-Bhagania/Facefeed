import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDetectedFaces, setProcessing, setError, clearFaces } from '../store/faceRecognitionSlice';
import { RootState } from '../store';
import * as faceapi from 'face-api.js';

const ImageUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const dispatch = useDispatch();
  const { isProcessing } = useSelector((state: RootState) => state.faceRecognition);

  // Clear faces when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearFaces());
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [dispatch, previewUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      dispatch(setError('Please upload an image file (JPG, PNG, or WEBP)'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(setError('Image size should be less than 5MB'));
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Create image element for analysis
    const img = new Image();
    img.src = url;

    img.onload = async () => {
      setOriginalImage(img);
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Analyze image
      dispatch(setProcessing(true));
      try {
        const detections = await faceapi
          .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();

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

        dispatch(setDetectedFaces(faces));

        // Draw detections on canvas
        const displaySize = { width: canvas.width, height: canvas.height };
        faceapi.matchDimensions(canvas, displaySize);
        const resized = faceapi.resizeResults(detections, displaySize);

        // First redraw the original image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Then draw the detections
        resized.forEach(det => {
          const box = det.detection.box;
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.fillStyle = 'rgba(59,130,246,0.1)';
          ctx.fillRect(box.x, box.y, box.width, box.height);
        });
        faceapi.draw.drawFaceExpressions(canvas, resized);

      } catch (error) {
        console.error('Face detection error:', error);
        dispatch(setError('Failed to analyze image. Please try another image.'));
        // Redraw the original image if detection fails
        if (originalImage) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(originalImage, 0, 0);
        }
      } finally {
        dispatch(setProcessing(false));
      }
    };

    img.onerror = () => {
      dispatch(setError('Failed to load image. Please try another image.'));
      setPreviewUrl(null);
      setOriginalImage(null);
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <svg
            className={`w-12 h-12 mb-4 ${
              isDragging ? 'text-blue-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className={`text-lg ${
            isDragging ? 'text-blue-500' : 'text-gray-600'
          }`}>
            {isDragging ? 'Drop your image here' : 'Drag and drop an image here, or click to select'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports JPG, PNG, WEBP (max 5MB)
          </p>
        </div>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-blue-600">Processing image...</span>
        </div>
      )}

      {previewUrl && (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full max-w-2xl rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
