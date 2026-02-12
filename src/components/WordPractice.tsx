import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Volume2, Mic, MicOff } from "lucide-react";

interface WordPracticeProps {
  word: string;
  isListening: boolean;
  result: "correct" | "incorrect" | null;
  onSpeak: () => void;
  onListen: () => void;
  onStopListening: () => void;
  onTryAgain: () => void;
  onBack: () => void;
}

export function WordPractice({
  word,
  isListening,
  result,
  onSpeak,
  onListen,
  onStopListening,
  onTryAgain,
  onBack,
}: WordPracticeProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-6 min-h-[60vh]">
      {/* Word display */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="bg-card rounded-3xl shadow-xl px-12 py-8 border-4 border-primary">
          <h1 className="text-6xl md:text-8xl font-display text-foreground text-shadow-playful tracking-wide">
            {word}
          </h1>
        </div>
      </motion.div>

      {/* Result feedback */}
      <AnimatePresence mode="wait">
        {result === "correct" && (
          <motion.div
            key="correct"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-3 bg-success text-success-foreground px-8 py-4 rounded-2xl shadow-lg"
          >
            <Check className="w-10 h-10" />
            <span className="text-3xl font-display">Great job!</span>
          </motion.div>
        )}
        {result === "incorrect" && (
          <motion.div
            key="incorrect"
            initial={{ scale: 0 }}
            animate={{ scale: 1, x: [0, -10, 10, -10, 10, 0] }}
            exit={{ scale: 0 }}
            transition={{ x: { duration: 0.4 } }}
            className="flex items-center gap-3 bg-destructive text-destructive-foreground px-8 py-4 rounded-2xl shadow-lg"
          >
            <X className="w-10 h-10" />
            <span className="text-3xl font-display">Try again!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        {/* Listen button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSpeak}
          className="flex items-center gap-3 bg-secondary text-secondary-foreground px-8 py-5 rounded-2xl shadow-lg text-xl font-bold font-body"
        >
          <Volume2 className="w-7 h-7" />
          Listen
        </motion.button>

        {/* Mic button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? onStopListening : onListen}
          className={`flex items-center gap-3 px-8 py-5 rounded-2xl shadow-lg text-xl font-bold font-body ${
            isListening
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          {isListening ? "Stop" : "Say it!"}
        </motion.button>

        {/* Try again */}
        {result === "incorrect" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTryAgain}
            className="flex items-center gap-3 bg-accent text-accent-foreground px-8 py-5 rounded-2xl shadow-lg text-xl font-bold font-body"
          >
            Try Again
          </motion.button>
        )}
      </div>

      {/* Back button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="text-muted-foreground font-body text-lg underline mt-4"
      >
        ← Pick another word
      </motion.button>
    </div>
  );
}
