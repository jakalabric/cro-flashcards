"use client";

import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

interface ControlsProps {
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onViewFavorites: () => void;
  showFavorites: boolean;
  favoritesCount: number;
  currentIndex: number;
  totalCards: number;
}

export default function Controls({
  onNext,
  onPrevious,
  onShuffle,
  onViewFavorites,
  showFavorites,
  favoritesCount,
  currentIndex,
  totalCards,
}: ControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 mt-8 w-full">
      <div className="flex flex-row justify-center items-center gap-4">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="flex items-center justify-center text-base px-4 py-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={22} />
        <span className="ml-1">Previous</span>
      </button>
      <button
        onClick={onShuffle}
        className="flex items-center justify-center text-base px-4 py-3 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        <Shuffle size={22} />
        <span className="ml-1">Shuffle</span>
      </button>
      <button
        onClick={onNext}
        disabled={currentIndex === totalCards - 1}
        className="flex items-center justify-center text-base px-4 py-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="ml-1">Next</span>
        <ChevronRight size={22} />
      </button>
      </div>
      <button
        onClick={onViewFavorites}
        className="px-6 py-2 text-base font-medium rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-colors"
      >
        {showFavorites ? "View All Cards" : `View Favorites (${favoritesCount})`}
      </button>
    </div>
  );
}
