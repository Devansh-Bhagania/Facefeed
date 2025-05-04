"use client";

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import WebcamFeed from '../components/WebcamFeed';
import Controls from '../components/Controls';

export default function Home() {
  return (
    <Provider store={store}>
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Face Recognition Demo
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <WebcamFeed />
            </div>
            <div>
              <Controls />
            </div>
          </div>
        </div>
      </main>
    </Provider>
  );
}

