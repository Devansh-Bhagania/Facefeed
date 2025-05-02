
"use client";

import React, { useState, useCallback } from "react";
import { WebcamFeed } from "@/components/webcam-feed";
import { AnalysisDisplay } from "@/components/analysis-display";
import { estimateAgeGender, type EstimateAgeGenderOutput, type EstimateAgeGenderInput } from "@/ai/flows/estimate-age-gender";
import type { Face } from "@/services/face-api";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, WebcamIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [capturedImageDataUri, setCapturedImageDataUri] = useState<string | null>(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // Manage streaming state
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAnalysis = useCallback(
    async (imageDataUri: string) => {
      if (!imageDataUri) return;
      setIsLoading(true);
      setFaces([]); // Clear previous faces
      setCapturedImageDataUri(imageDataUri); // Display the captured/uploaded image

      try {
        const input: EstimateAgeGenderInput = { photoDataUri: imageDataUri };
        const result: EstimateAgeGenderOutput = await estimateAgeGender(input);
        setFaces(result.faces || []);
        if (!result.faces || result.faces.length === 0) {
           toast({
             title: "Analysis Complete",
             description: "No faces were detected in the image.",
           });
        } else {
             toast({
                title: "Analysis Complete",
                description: `Detected ${result.faces.length} face(s).`,
            });
        }
      } catch (error) {
        console.error("Error estimating age and gender:", error);
        toast({
          variant: "destructive",
          title: "Analysis Error",
          description: "Failed to analyze the image. Please try again.",
        });
        setFaces([]); // Clear faces on error
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Ensure it's an image file
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., JPG, PNG, WEBP).",
        });
        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          // Stop webcam if running before analyzing uploaded file
          setIsStreaming(false); // This will trigger cleanup in WebcamFeed via useEffect
          handleAnalysis(dataUri);
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not read the selected file.",
        });
      }
      reader.readAsDataURL(file);
       // Clear the file input after processing (optional, allows re-uploading same file)
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary flex items-center gap-3">
        <WebcamIcon size={36} /> FaceFeed
      </h1>

      <WebcamFeed
        onFrameCaptured={handleAnalysis}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        isLoading={isLoading}
      />

      <Separator className="my-8" />

       <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Or Upload an Image</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Label htmlFor="file-upload" className="sr-only">Upload Image</Label>
             <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*" // Accept only image files
                onChange={handleFileChange}
                className="hidden" // Hide the default input
                disabled={isLoading}
            />
            <Button onClick={triggerFileInput} variant="outline" disabled={isLoading}>
              <UploadCloud className="mr-2" /> Select Image File
            </Button>
             <p className="text-xs text-muted-foreground mt-2">Upload an image for facial analysis.</p>
          </CardContent>
       </Card>


      <AnalysisDisplay
        imageDataUri={capturedImageDataUri}
        faces={faces}
        isLoading={isLoading}
      />
    </main>
  );
}

