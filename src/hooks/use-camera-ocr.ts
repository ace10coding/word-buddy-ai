import { useRef, useState, useCallback, useEffect } from "react";
import Tesseract from "tesseract.js";

interface DetectedWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

interface UseCameraOCRReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  words: DetectedWord[];
  isScanning: boolean;
  cameraReady: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  scanFrame: () => Promise<void>;
}

export function useCameraOCR(): UseCameraOCRReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [words, setWords] = useState<DetectedWord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      // Wait for the video element to be available (it may not be mounted yet)
      const attachStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setCameraReady(true);
            }).catch(() => {
              setError("Could not play video stream.");
            });
          };
        } else {
          // Video element not mounted yet, retry shortly
          setTimeout(attachStream, 100);
        }
      };

      // Set camera ready first so the video element renders, then attach
      setCameraReady(true);
      setTimeout(attachStream, 50);
    } catch {
      setError("Could not access camera. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setWords([]);
  }, []);

  const scanFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    try {
      const result = await Tesseract.recognize(canvas, "eng", {});
      const detected: DetectedWord[] = result.data.words
        .filter((w) => w.confidence > 40 && w.text.trim().length > 0)
        .map((w) => ({
          text: w.text.replace(/[^a-zA-Z'-]/g, ""),
          bbox: w.bbox,
        }))
        .filter((w) => w.text.length > 0);
      setWords(detected);
    } catch {
      setError("OCR failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Re-attach stream when videoRef becomes available
  useEffect(() => {
    if (cameraReady && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
    }
  });

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, canvasRef, words, isScanning, cameraReady, error, startCamera, stopCamera, scanFrame };
}
