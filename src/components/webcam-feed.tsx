
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Camera } from "lucide-react";

interface WebcamFeedProps {
  onFrameCaptured: (imageDataUri: string) => void;
  isStreaming: boolean;
  setIsStreaming: (isStreaming: boolean) => void;
  isLoading: boolean;
}

export function WebcamFeed({
  onFrameCaptured,
  isStreaming,
  setIsStreaming,
  isLoading,
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startWebcam = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsStreaming(true);
          // Ensure video plays after stream is set (might be needed for some browsers)
          videoRef.current.play().catch((err) => {
            console.error("Error attempting to play video:", err);
            toast({
              variant: "destructive",
              title: "Webcam Error",
              description: "Could not play video stream.",
            });
            stopWebcam(); // Clean up if play fails
          });
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        let description = "Could not access webcam. Please check permissions.";
        if (err instanceof Error) {
            if (err.name === "NotAllowedError") {
                description = "Webcam access denied. Please grant permission in your browser settings.";
            } else if (err.name === "NotFoundError") {
                description = "No webcam found. Please ensure a webcam is connected and enabled.";
            }
        }
        toast({
          variant: "destructive",
          title: "Webcam Error",
          description: description,
        });
        setIsStreaming(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "Your browser does not support webcam access.",
      });
      setIsStreaming(false);
    }
  }, [setIsStreaming, toast]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, [setIsStreaming]);

  const captureFrame = useCallback(() => {
    if (videoRef.current && isStreaming) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL("image/jpeg"); // Use jpeg for smaller size
        onFrameCaptured(dataUri);
      } else {
         toast({
            variant: "destructive",
            title: "Capture Error",
            description: "Could not get canvas context to capture frame.",
          });
      }
    } else {
       toast({
            variant: "destructive",
            title: "Capture Error",
            description: "Webcam is not active.",
        });
    }
  }, [isStreaming, onFrameCaptured, toast]);

  // Cleanup function to stop webcam when component unmounts or streaming stops
  useEffect(() => {
    return () => {
      if (isStreaming) {
        stopWebcam();
      }
    };
  }, [isStreaming, stopWebcam]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-0 relative aspect-video bg-secondary flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Mute to avoid feedback loops if microphone was included
          className={`w-full h-full object-cover rounded-t-lg ${
            isStreaming ? "block" : "hidden"
          }`}
        />
         {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
             <VideoOff size={64} className="mb-4" />
            <p>Webcam is off</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4 p-4 border-t">
        {!isStreaming ? (
          <Button onClick={startWebcam} disabled={isLoading}>
            <Video className="mr-2" /> Start Webcam
          </Button>
        ) : (
          <>
            <Button onClick={stopWebcam} variant="outline" disabled={isLoading}>
              <VideoOff className="mr-2" /> Stop Webcam
            </Button>
            <Button onClick={captureFrame} disabled={isLoading || !isStreaming}>
              <Camera className="mr-2" /> Analyze Frame
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
