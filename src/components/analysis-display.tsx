
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Face } from "@/services/face-api"; // Use the existing type

interface AnalysisDisplayProps {
  imageDataUri: string | null;
  faces: Face[];
  isLoading: boolean;
}

export function AnalysisDisplay({
  imageDataUri,
  faces,
  isLoading,
}: AnalysisDisplayProps) {
  if (!imageDataUri) {
    return null; // Don't render anything if no image is available
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6 shadow-lg">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
          <Image
            src={imageDataUri}
            alt="Captured frame analysis"
            layout="fill"
            objectFit="contain" // Use contain to see the whole image
            unoptimized // Necessary for data URIs
          />
          {faces.map((face, index) => (
            <div
              key={index}
              className="absolute border-2 border-accent rounded shadow-md"
              style={{
                left: `${face.box.x}px`,
                top: `${face.box.y}px`,
                width: `${face.box.width}px`,
                height: `${face.box.height}px`,
              }}
            >
              <Badge
                variant="secondary" // Use secondary for less visual clutter than accent
                className="absolute -top-6 left-0 text-xs whitespace-nowrap bg-opacity-80 backdrop-blur-sm"
              >
                {`Face ${index + 1}: ${face.gender}, ~${face.age} yrs`}
              </Badge>
            </div>
          ))}
           {isLoading && (
             <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-lg">
               <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span className="ml-3 text-lg font-medium">Analyzing...</span>
             </div>
           )}
        </div>
         {faces.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground">No faces detected in the frame.</p>
         )}
        {faces.length > 0 && (
          <div className="space-y-2">
            {faces.map((face, index) => (
              <div key={index} className="p-2 border rounded flex items-center justify-between text-sm">
                <span>Face {index + 1}</span>
                <div className="flex gap-2">
                    <Badge variant="outline">Gender: {face.gender}</Badge>
                    <Badge variant="outline">Age: ~{face.age}</Badge>
                 </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
