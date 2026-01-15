"use client";

import { useState, useEffect, useCallback } from "react";
import { Flashcard as FlashcardType } from "@/lib/types";
import { STARTER_PACK } from "@/lib/starter-pack";
import { fetchCustomCards } from "@/lib/csv-fetcher";
import Flashcard from "@/components/Flashcard";
import Controls from "@/components/Controls";

export default function Home() {
  const [allCards, setAllCards] = useState<FlashcardType[]>([]);
  const [currentDeck, setCurrentDeck] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCards() {
      setIsLoading(true);
      let customCards: FlashcardType[] = [];
      try {
        customCards = await fetchCustomCards();
      } catch (error) {
        console.error("Failed to fetch custom cards:", error);
      }

      const combinedCards = [...STARTER_PACK, ...customCards];
      setAllCards(combinedCards);
      setCurrentDeck(combinedCards);
      
      const storedFavorites = localStorage.getItem("croatian-tutor-favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      setIsLoading(false);
    }

    loadCards();
  }, []);

  useEffect(() => {
    localStorage.setItem("croatian-tutor-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentDeck.length);
  }, [currentDeck.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + currentDeck.length) % currentDeck.length
    );
  }, [currentDeck.length]);

  const handleShuffle = useCallback(() => {
    setCurrentDeck((prevDeck) => {
      const shuffled = [...prevDeck].sort(() => Math.random() - 0.5);
      return shuffled;
    });
    setCurrentIndex(0); // Reset to the first card after shuffling
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(id)
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id]
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-xl text-zinc-700 dark:text-zinc-300">Loading flashcards...</p>
      </div>
    );
  }

  if (currentDeck.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-xl text-zinc-700 dark:text-zinc-300">No flashcards available.</p>
      </div>
    );
  }

  const currentCard = currentDeck[currentIndex];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
        Croatian Flashcards
      </h1>

      <Flashcard
        card={currentCard}
        isFavorite={favorites.includes(currentCard.id)}
        onToggleFavorite={handleToggleFavorite}
      />

      <Controls
        onNext={handleNext}
        onPrevious={handlePrevious}
        onShuffle={handleShuffle}
        currentIndex={currentIndex}
        totalCards={currentDeck.length}
      />
    </div>
  );
}
