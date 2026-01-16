"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flashcard as FlashcardType } from "@/lib/types";
import { Star } from "lucide-react";

interface FlashcardProps {
  card: FlashcardType;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function Flashcard({ card, isFavorite, onToggleFavorite }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000 group">
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(card.id);
        }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 shadow-md backdrop-blur-sm transition-transform active:scale-95"
      >
        <Star
          size={24}
          className={isFavorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-400"}
        />
      </button>

      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        onClick={handleFlip}
      >
        {/* Front (Croatian) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-xl border-2 border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-sm font-medium text-blue-500 mb-4 uppercase tracking-wider">
            {card.category}
          </span>
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 break-words">
            {card.croatian}
          </h2>
          <p className="mt-8 text-zinc-400 text-sm italic">Tap to see translation</p>
        </div>

        {/* Back (English) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-blue-50 dark:bg-zinc-700 shadow-xl border-2 border-blue-100 dark:border-zinc-600 flex flex-col items-center justify-center p-8 text-center"
          style={{ transform: "rotateY(180deg)" }}
        >
          <span className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            English
          </span>
          <h2 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 break-words">
            {card.english}
          </h2>
          <p className="mt-8 text-zinc-400 text-sm italic">Tap to see original</p>
        </div>
      </motion.div>
    </div>
  );
}
