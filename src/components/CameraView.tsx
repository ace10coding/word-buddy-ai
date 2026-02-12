import { motion } from "framer-motion";
import { Camera, ScanText, Loader2 } from "lucide-react";
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

  if (!cameraReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-primary"
        >
          <Camera className="w-24 h-24" />
        </motion.div>
        <h2 className="text-3xl font-display text-foreground text-center">
          Point your camera at some text!
        </h2>
        <p className="text-muted-foreground font-body text-lg text-center max-w-sm">
          We'll find the words so you can practice reading them.
        </p>
        {error && (
          <p className="text-destructive font-body text-center">{error}</p>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartCamera}
          className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl shadow-lg text-2xl font-display"
        >
          Open Camera 📷
        </motion.button>
      </div>
    );
  }

  const scaleX = videoDims.w > 0 ? videoDims.displayW / videoDims.w : 1;
  const scaleY = videoDims.h > 0 ? videoDims.displayH / videoDims.h : 1;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-xl border-4 border-primary">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full block"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Word overlays */}
        <div ref={overlayRef} className="absolute inset-0">
          {words.map((word, i) => (
            <motion.button
              key={`${word.text}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectWord(word.text)}
              className={`absolute border-2 rounded-lg cursor-pointer transition-colors font-body font-bold text-sm ${
                selectedWord === word.text
                  ? "bg-primary/40 border-primary"
                  : "bg-secondary/30 border-secondary/50 hover:bg-primary/30 hover:border-primary"
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
      </div>

      {/* Scan button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onScan}
        disabled={isScanning}
        className="bg-secondary text-secondary-foreground px-8 py-4 rounded-2xl shadow-lg text-xl font-display flex items-center gap-3 disabled:opacity-50"
      >
        {isScanning ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <ScanText className="w-6 h-6" />
        )}
        {isScanning ? "Scanning..." : "Scan Text 🔍"}
      </motion.button>

      {/* Detected words list */}
      {words.length > 0 && (
        <div className="w-full max-w-2xl">
          <p className="text-muted-foreground font-body text-center mb-3">
            Tap a word to practice reading it!
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {words.map((w, i) => (
              <motion.button
                key={`list-${w.text}-${i}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelectWord(w.text)}
                className={`px-4 py-2 rounded-xl font-body font-bold text-lg shadow transition-colors ${
                  selectedWord === w.text
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border-2 border-border hover:border-primary"
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
