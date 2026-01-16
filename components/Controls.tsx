"use client";

import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

interface ControlsProps {
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  currentIndex: number;
  totalCards: number;
}

export default function Controls({
  onNext,
  onPrevious,
  onShuffle,
  currentIndex,
  totalCards,
}: ControlsProps) {
  return (
    <div className="flex flex-row justify-center items-center gap-4 mt-8 w-full">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="flex items-center justify-center text-sm px-3 py-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
        <span className="ml-1">Previous</span>
      </button>
      <button
        onClick={onShuffle}
        className="flex items-center justify-center text-sm px-3 py-2 rounded-full bg-zinc-700 text-white shadow-lg hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-500"
      >
        <Shuffle size={16} />
        <span className="ml-1">Shuffle</span>
      </button>
      <button
        onClick={onNext}
        disabled={currentIndex === totalCards - 1}
        className="flex items-center justify-center text-sm px-3 py-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="ml-1">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}