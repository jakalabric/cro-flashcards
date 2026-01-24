"use client";

import { useState, useEffect } from "react";
import { Flashcard as FlashcardType } from "@/lib/types";
import { Star, Volume2 } from "lucide-react";

interface FlashcardProps {
  card: FlashcardType;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSpeech: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Flashcard({
  card,
  isFavorite,
  onToggleFavorite,
  onSpeech,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  return (
    <div 
      className="relative w-full max-w-sm aspect-[3/4] cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Side (English) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-zinc-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(card.id);
            }}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Star
              className={`w-6 h-6 ${
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-400"
              }`}
            />
          </button>
          <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-4 uppercase tracking-widest">
            English
          </span>
          <h2 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 text-center">
            {card.english}
          </h2>
        </div>

        {/* Back Side (Croatian) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-zinc-50 dark:bg-zinc-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-zinc-200 dark:border-zinc-800">
          <span className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-4 uppercase tracking-widest">
            Croatian
          </span>
          <h2 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-10">
            {card.croatian}
          </h2>
          
          {/* Speech Button */}
          <button
            onClick={onSpeech}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            <Volume2 className="w-6 h-6 text-zinc-700 dark:text-zinc-200" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Listen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
