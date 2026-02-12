import { useState } from "react";
import { motion } from "framer-motion";

interface ManualWordInputProps {
  onSelectWord: (word: string) => void;
}

export function ManualWordInput({ onSelectWord }: ManualWordInputProps) {
  const [input, setInput] = useState("");

  const sampleWords = ["cat", "dog", "sun", "book", "tree", "fish", "star", "moon", "bird", "frog"];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <h3 className="text-2xl font-display text-foreground">Or type a word to practice</h3>

      <div className="flex w-full gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onSelectWord(input.trim());
              setInput("");
            }
          }}
          placeholder="Type a word..."
          className="flex-1 bg-card text-card-foreground border-2 border-border rounded-2xl px-6 py-4 text-xl font-body focus:outline-none focus:border-primary transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (input.trim()) {
              onSelectWord(input.trim());
              setInput("");
            }
          }}
          className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-display text-lg shadow-lg"
        >
          Go!
        </motion.button>
      </div>

      <div className="w-full">
        <p className="text-muted-foreground font-body text-center mb-3">Quick picks:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {sampleWords.map((word) => (
            <motion.button
              key={word}
              whileHover={{ scale: 1.1, rotate: Math.random() * 6 - 3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectWord(word)}
              className="bg-card text-card-foreground border-2 border-border hover:border-primary px-5 py-3 rounded-xl font-body font-bold text-lg shadow transition-colors"
            >
              {word}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
