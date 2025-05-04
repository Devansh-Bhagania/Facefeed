export interface Face {
  id: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  age?: number;
  gender?: string;
  emotion?: string;
  name?: string;
}

export interface AppState {
  isWebcamActive: boolean;
  detectedFaces: Face[];
  isProcessing: boolean;
  error: string | null;
}

export interface RootState {
  faceRecognition: AppState;
} 