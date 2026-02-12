import { motion } from "framer-motion";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface DetectedWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  words: DetectedWord[];
  isScanning: boolean;
  cameraReady: boolean;
  error: string | null;
  selectedWord: string | null;
  onStartCamera: () => void;
  onScan: () => void;
  onSelectWord: (word: string) => void;
}

export function CameraView({
  videoRef,
  canvasRef,
  words,
  isScanning,
  cameraReady,
  error,
  selectedWord,
  onStartCamera,
  onScan,
  onSelectWord,
}: CameraViewProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [videoDims, setVideoDims] = useState({ w: 0, h: 0, displayW: 0, displayH: 0 });
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => {
      setVideoDims({
        w: video.videoWidth,
        h: video.videoHeight,
        displayW: video.clientWidth,
        displayH: video.clientHeight,
      });
    };
    video.addEventListener("loadedmetadata", update);
    video.addEventListener("resize", update);
    const id = setInterval(update, 500);
    return () => {
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("resize", update);
      clearInterval(id);
    };
  }, [videoRef]);

  // Auto-scan when camera becomes ready and video has dimensions
  useEffect(() => {
    if (cameraReady && videoDims.w > 0 && !hasScannedRef.current && !isScanning) {
      hasScannedRef.current = true;
      // Small delay to ensure video frame is rendered
      const timer = setTimeout(() => onScan(), 800);
      return () => clearTimeout(timer);
    }
  }, [cameraReady, videoDims.w, isScanning, onScan]);

  if (!cameraReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center"
        >
          <Camera className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h2 className="text-3xl font-display text-foreground text-center">
          Point your camera at some text!
        </h2>
        <p className="text-muted-foreground font-body text-lg text-center max-w-sm">
          We'll find the words so you can tap and practice reading them.
        </p>
        {error && (
          <p className="text-destructive font-body text-center">{error}</p>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartCamera}
          className="bg-primary text-primary-foreground px-10 py-4 rounded-xl shadow-md text-xl font-display flex items-center gap-3"
        >
          <Camera className="w-6 h-6" />
          Open Camera
        </motion.button>
      </div>
    );
  }

  const scaleX = videoDims.w > 0 ? videoDims.displayW / videoDims.w : 1;
  const scaleY = videoDims.h > 0 ? videoDims.displayH / videoDims.h : 1;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Instruction */}
      <p className="text-muted-foreground font-body text-center text-base">
        {isScanning
          ? "Finding words..."
          : words.length > 0
          ? "Tap a highlighted word to practice reading it!"
          : "Point your camera at text and tap Rescan"}
      </p>

      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl border-2 border-border">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full block"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
            <div className="bg-card rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="font-body font-bold text-foreground">Scanning for words...</span>
            </div>
          </div>
        )}

        {/* Word overlays */}
        {!isScanning && (
          <div ref={overlayRef} className="absolute inset-0">
            {words.map((word, i) => (
              <motion.button
                key={`${word.text}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelectWord(word.text)}
                className={`absolute rounded-md cursor-pointer transition-all font-body font-bold text-sm ${
                  selectedWord === word.text
                    ? "bg-primary/50 border-2 border-primary ring-2 ring-primary/30"
                    : "bg-primary/20 border-2 border-primary/40 hover:bg-primary/40 hover:border-primary"
                }`}
                style={{
                  left: word.bbox.x0 * scaleX,
                  top: word.bbox.y0 * scaleY,
                  width: (word.bbox.x1 - word.bbox.x0) * scaleX,
                  height: (word.bbox.y1 - word.bbox.y0) * scaleY,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rescan button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          hasScannedRef.current = false;
          onScan();
        }}
        disabled={isScanning}
        className="flex items-center gap-2 text-muted-foreground font-body text-base hover:text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
        Rescan
      </motion.button>

      {/* Detected words list */}
      {words.length > 0 && !isScanning && (
        <div className="w-full max-w-2xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {words.map((w, i) => (
              <motion.button
                key={`list-${w.text}-${i}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectWord(w.text)}
                className={`px-4 py-2 rounded-xl font-body font-bold text-base shadow-sm transition-colors ${
                  selectedWord === w.text
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border border-border hover:border-primary"
                }`}
              >
                {w.text}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
