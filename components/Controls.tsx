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
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 w-full max-w-sm">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="flex items-center justify-center p-4 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:px-8"
      >
        <ChevronLeft size={28} />
        <span className="ml-2 text-lg font-semibold">Previous</span>
      </button>
      <button
        onClick={onShuffle}
        className="flex items-center justify-center p-4 rounded-full bg-zinc-700 text-white shadow-lg hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-500 w-full sm:w-auto sm:px-8"
      >
        <Shuffle size={28} />
        <span className="ml-2 text-lg font-semibold">Shuffle</span>
      </button>
      <button
        onClick={onNext}
        disabled={currentIndex === totalCards - 1}
        className="flex items-center justify-center p-4 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:px-8"
      >
        <span className="mr-2 text-lg font-semibold">Next</span>
        <ChevronRight size={28} />
      </button>
    </div>
  );
}