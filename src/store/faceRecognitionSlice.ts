import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, Face } from './types';

const initialState: AppState = {
  isWebcamActive: false,
  detectedFaces: [],
  isProcessing: false,
  error: null,
};

const faceRecognitionSlice = createSlice({
  name: 'faceRecognition',
  initialState,
  reducers: {
    setWebcamActive: (state, action: PayloadAction<boolean>) => {
      state.isWebcamActive = action.payload;
    },
    setDetectedFaces: (state, action: PayloadAction<Face[]>) => {
      state.detectedFaces = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearFaces: (state) => {
      state.detectedFaces = [];
    },
  },
});

export const {
  setWebcamActive,
  setDetectedFaces,
  setProcessing,
  setError,
  clearFaces,
} = faceRecognitionSlice.actions;

export default faceRecognitionSlice.reducer; 