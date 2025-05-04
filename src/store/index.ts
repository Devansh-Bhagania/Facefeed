import { configureStore } from '@reduxjs/toolkit';
import faceRecognitionReducer from './faceRecognitionSlice';

export const store = configureStore({
  reducer: {
    faceRecognition: faceRecognitionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 