# Face Recognition Demo

A web application that performs real-time facial recognition using face-api.js, built with Next.js, TypeScript, and Redux.

## Features

- Real-time webcam feed with face detection
- Face landmark detection
- Age and gender estimation
- Emotion recognition
- Multiple face detection
- Responsive design
- Redux state management

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Webcam access

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd face-recognition-demo
```

2. Install dependencies:
```bash
npm install
```

3. Download face-api.js models:
```bash
# Create models directory
mkdir -p public/models

# Download required models
# You can download these from the face-api.js repository or use the following links:
# https://github.com/justadudewhohacks/face-api.js/tree/master/weights
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:9002`

## Project Structure

- `src/components/` - React components
  - `WebcamFeed.tsx` - Webcam feed and face detection
  - `Controls.tsx` - Webcam controls and face information display
- `src/store/` - Redux store configuration
  - `types.ts` - TypeScript interfaces
  - `faceRecognitionSlice.ts` - Redux slice for face recognition state
  - `index.ts` - Store configuration
- `public/models/` - face-api.js model files

## Missing Features and Improvements

1. **Model Loading**
   - Currently missing the face-api.js model files in the public directory
   - Need to download and place the following models:
     - tiny_face_detector_model-weights_manifest.json
     - face_landmark_68_model-weights_manifest.json
     - face_recognition_model-weights_manifest.json
     - face_expression_model-weights_manifest.json
     - age_gender_model-weights_manifest.json

2. **Image Upload**
   - Add ability to upload and analyze static images
   - Implement drag-and-drop functionality

3. **Face Recognition**
   - Add face recognition to identify known faces
   - Implement face database storage
   - Add face name labeling functionality

4. **Performance Optimization**
   - Implement frame rate control
   - Add detection confidence threshold
   - Optimize model loading

5. **UI/UX Improvements**
   - Add loading indicators
   - Implement error handling
   - Add settings panel for detection parameters
   - Add dark mode support

6. **Testing**
   - Add unit tests
   - Add integration tests
   - Add performance tests

7. **Deployment**
   - Add CI/CD pipeline
   - Configure for production deployment
   - Add environment variables for configuration

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
