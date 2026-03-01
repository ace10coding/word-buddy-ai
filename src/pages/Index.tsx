import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, BookOpenText, Volume2 } from "lucide-react";
import logoImg from "@/assets/logo.png";
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
      {/* Header - only show when not on home */}
      {mode !== "home" && (
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src={logoImg} alt="Reading Pen AI" className="w-8 h-8 object-contain mix-blend-multiply" />
              </div>
              <h1 className="text-xl font-display text-foreground">Reading Pen AI</h1>
            </motion.div>

            {score > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-success text-success-foreground px-4 py-1.5 rounded-full font-display text-base"
              >
                ⭐ {score}
              </motion.div>
            )}
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {mode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 min-h-[80vh] justify-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 flex items-center justify-center"
              >
                <img src={logoImg} alt="Reading Pen AI" className="w-24 h-24 object-contain mix-blend-multiply" />
              </motion.div>

              {/* Title */}
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-display text-foreground mb-3">
                  Reading Pen AI
                </h1>
                <p className="text-lg text-muted-foreground font-body max-w-sm mx-auto leading-relaxed">
                  Scan any page with your camera and follow along word by word. Say each word out loud and build your reading skills!
                </p>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="flex items-center gap-2 border border-border bg-card px-4 py-2 rounded-full text-sm font-body text-foreground">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  Scan Pages
                </span>
                <span className="flex items-center gap-2 border border-border bg-card px-4 py-2 rounded-full text-sm font-body text-foreground">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  Read Aloud
                </span>
                <span className="flex items-center gap-2 border border-border bg-card px-4 py-2 rounded-full text-sm font-body text-foreground">
                  <BookOpenText className="w-4 h-4 text-muted-foreground" />
                  Follow Along
                </span>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 w-full max-w-sm mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMode("camera");
                    camera.startCamera();
                  }}
                  className="flex items-center justify-center gap-3 bg-primary text-primary-foreground w-full py-4 rounded-xl shadow-md text-lg font-display"
                >
                  <Camera className="w-5 h-5" />
                  Scan & Read
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode("manual")}
                  className="flex items-center justify-center gap-3 bg-secondary text-secondary-foreground w-full py-4 rounded-xl shadow-md text-lg font-display"
                >
                  <img src={logoImg} alt="" className="w-6 h-6 object-contain mix-blend-multiply" />
                  Practice Mode
                </motion.button>
              </div>

              {/* Privacy note */}
              <p className="text-sm text-muted-foreground font-body text-center mt-4 max-w-xs leading-relaxed">
                100% free. All processing happens on your device.
                <br />
                No data is sent to any server.
              </p>

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
