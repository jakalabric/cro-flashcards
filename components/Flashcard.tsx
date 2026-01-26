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

const CATEGORY_COLORS: Record<string, string> = {
  Greetings: "text-blue-500 dark:text-blue-400",
  Basics: "text-green-500 dark:text-green-400",
  Numbers: "text-orange-500 dark:text-orange-400",
  Food: "text-red-500 dark:text-red-400",
  Travel: "text-purple-500 dark:text-purple-400",
  Family: "text-pink-500 dark:text-pink-400",
  Verbs: "text-indigo-500 dark:text-indigo-400",
  Adjectives: "text-teal-500 dark:text-teal-400",
};

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

  const categoryColor = CATEGORY_COLORS[card.category] || "text-zinc-400 dark:text-zinc-500";

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
        <div className="absolute inset-0 w-full h-full card-front bg-white dark:bg-zinc-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="absolute top-6 left-6">
            <span className={`text-xs font-bold uppercase tracking-tighter ${categoryColor}`}>
              {card.category}
            </span>
          </div>
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
        <div className="absolute inset-0 w-full h-full card-back rotate-y-180 bg-zinc-50 dark:bg-zinc-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="absolute top-6 left-6">
            <span className={`text-xs font-bold uppercase tracking-tighter ${categoryColor}`}>
              {card.category}
            </span>
          </div>
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
