import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setWebcamActive, clearFaces } from '../store/faceRecognitionSlice';

const Controls: React.FC = () => {
  const dispatch = useDispatch();
  const { isWebcamActive, detectedFaces, isProcessing, error } = useSelector(
    (state: RootState) => state.faceRecognition
  );
  const [displayedFaces, setDisplayedFaces] = useState(detectedFaces);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (detectedFaces.length === 0) {
      setDisplayedFaces([]);
      return;
    }

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayedFaces(detectedFaces);
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [detectedFaces]);

  const handleToggleWebcam = () => {
    if (isWebcamActive) {
      dispatch(clearFaces());
      setDisplayedFaces([]);
    }
    dispatch(setWebcamActive(!isWebcamActive));
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={handleToggleWebcam}
          className={`px-4 py-2 rounded-lg ${
            isWebcamActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white font-semibold transition-colors`}
        >
          {isWebcamActive ? 'Stop Webcam' : 'Start Webcam'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* {isProcessing && ( */}
        <div className="p-4 bg-blue-100 text-blue-700 rounded-lg">
        {
          isProcessing ? (
            <div>
              <p>Processing faces...</p>
            </div>
          ) : (
            <p>No faces detected</p>
          )
        }
        </div>
      {/* )} */}

      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {displayedFaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedFaces.map((face) => (
              <div
                key={face.id}
                className="p-4 bg-white rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105"
              >
                <h3 className="font-semibold mb-2 text-lg">Face {face.id}</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Age:</span> {face.age} years
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Gender:</span> {face.gender}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Emotion:</span> {face.emotion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls; 