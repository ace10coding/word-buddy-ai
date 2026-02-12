import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Camera, Pencil } from "lucide-react";
import { CameraView } from "@/components/CameraView";
import { WordPractice } from "@/components/WordPractice";
import { ManualWordInput } from "@/components/ManualWordInput";
import { useCameraOCR } from "@/hooks/use-camera-ocr";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { levenshtein, speakWord, playSound } from "@/lib/reading-utils";

type Mode = "home" | "camera" | "manual" | "practice";

const Index = () => {
  const [mode, setMode] = useState<Mode>("home");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);

  const camera = useCameraOCR();
  const speech = useSpeechRecognition();

  const handleSelectWord = useCallback((word: string) => {
    setSelectedWord(word);
    setResult(null);
    speech.resetTranscript();
    setMode("practice");
  }, [speech]);

  const handleBack = useCallback(() => {
    setSelectedWord(null);
    setResult(null);
    speech.resetTranscript();
    setMode(camera.cameraReady ? "camera" : "home");
  }, [camera.cameraReady, speech]);

  const handleTryAgain = useCallback(() => {
    setResult(null);
    speech.resetTranscript();
  }, [speech]);

  // Validate spoken word
  useEffect(() => {
    if (!speech.transcript || !selectedWord) return;

    const spoken = speech.transcript.toLowerCase().trim();
    const target = selectedWord.toLowerCase().trim();
    const similarity = levenshtein(spoken, target);

    if (similarity >= 0.8) {
      setResult("correct");
      setScore((s) => s + 1);
      playSound("success");
    } else {
      setResult("incorrect");
      playSound("error");
    }
  }, [speech.transcript, selectedWord]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b-2 border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              camera.stopCamera();
              setMode("home");
              setSelectedWord(null);
              setResult(null);
            }}
          >
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-display text-foreground">Reading Pen AI</h1>
          </motion.div>

          {score > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-success text-success-foreground px-4 py-2 rounded-full font-display text-lg"
            >
              ⭐ {score}
            </motion.div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {mode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8 min-h-[70vh] justify-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <BookOpen className="w-28 h-28 text-primary" />
              </motion.div>

              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-display text-foreground text-shadow-playful mb-3">
                  Reading Pen AI
                </h1>
                <p className="text-xl text-muted-foreground font-body max-w-md">
                  Learn to read words by seeing, saying, and hearing them! 📚✨
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMode("camera");
                    camera.startCamera();
                  }}
                  className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-5 rounded-2xl shadow-lg text-xl font-display"
                >
                  <Camera className="w-7 h-7" />
                  Scan Text
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode("manual")}
                  className="flex items-center gap-3 bg-secondary text-secondary-foreground px-8 py-5 rounded-2xl shadow-lg text-xl font-display"
                >
                  <Pencil className="w-7 h-7" />
                  Type a Word
                </motion.button>
              </div>

              {!speech.supported && (
                <p className="text-destructive font-body text-sm text-center">
                  ⚠️ Speech recognition not supported in this browser. Try Chrome.
                </p>
              )}
            </motion.div>
          )}

          {mode === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CameraView
                videoRef={camera.videoRef}
                canvasRef={camera.canvasRef}
                words={camera.words}
                isScanning={camera.isScanning}
                cameraReady={camera.cameraReady}
                error={camera.error}
                selectedWord={selectedWord}
                onStartCamera={camera.startCamera}
                onScan={camera.scanFrame}
                onSelectWord={handleSelectWord}
              />
            </motion.div>
          )}

          {mode === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-[70vh] flex flex-col items-center justify-center"
            >
              <ManualWordInput onSelectWord={handleSelectWord} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode("home")}
                className="text-muted-foreground font-body text-lg underline mt-8"
              >
                ← Back home
              </motion.button>
            </motion.div>
          )}

          {mode === "practice" && selectedWord && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <WordPractice
                word={selectedWord}
                isListening={speech.isListening}
                result={result}
                onSpeak={() => speakWord(selectedWord)}
                onListen={speech.startListening}
                onStopListening={speech.stopListening}
                onTryAgain={handleTryAgain}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
