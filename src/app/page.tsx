"use client";

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import WebcamFeed from '../components/WebcamFeed';
import Controls from '../components/Controls';
import ImageUpload from '../components/ImageUpload';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'webcam' | 'upload'>('webcam');

  return (
    <Provider store={store}>
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Face Recognition Demo
          </h1>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('webcam')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'webcam'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
            >
              Webcam
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'upload'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
            >
              Upload Image
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {activeTab === 'webcam' ? <WebcamFeed /> : <ImageUpload />}
            </div>
            <div>
              <Controls />
            </div>
          </div>

         
        </div>
        <div>
            <p className="mt-8 text-gray-600 text-center justify-end">
              Developed by Devansh Bhagania
            </p>
          </div>
      </main>
    </Provider>
  );
}