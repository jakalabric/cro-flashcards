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
  const [showFavorites, setShowFavorites] = useState(false);

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
      
      const storedFavorites = localStorage.getItem("croatian-tutor-favorites");
      let initialFavorites: string[] = [];
      if (storedFavorites) {
        initialFavorites = JSON.parse(storedFavorites);
        setFavorites(initialFavorites);
      }

      setIsLoading(false);
    }

    loadCards();
  }, []); // Only run once on mount

  useEffect(() => {
    const deckToSet = showFavorites
      ? allCards.filter(card => favorites.includes(card.id))
      : allCards;
    setCurrentDeck(deckToSet);
    setCurrentIndex(0); // Reset index whenever the deck changes
  }, [allCards, favorites, showFavorites]);

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
      const deckToShuffle = showFavorites ? allCards.filter(card => favorites.includes(card.id)) : allCards;
      const shuffled = [...deckToShuffle].sort(() => Math.random() - 0.5);
      return shuffled;
    });
    setCurrentIndex(0); // Reset to the first card after shuffling
  }, [allCards, favorites, showFavorites]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.includes(id)
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id];
      return newFavorites;
    });
  }, []);

  const handleViewFavorites = useCallback(() => {
    setShowFavorites((prev) => !prev);
    setCurrentIndex(0); // Reset index when switching views
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

      {currentDeck.length > 0 ? (
        <Flashcard
          card={currentDeck[currentIndex]}
          isFavorite={favorites.includes(currentDeck[currentIndex].id)}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <p className="text-xl text-zinc-700 dark:text-zinc-300">No cards to display in this view.</p>
      )}

      {currentDeck.length > 0 && (
        <Controls
          onNext={handleNext}
          onPrevious={handlePrevious}
          onShuffle={handleShuffle}
          currentIndex={currentIndex}
          totalCards={currentDeck.length}
        />
      )}

      <button
        onClick={handleViewFavorites}
        className="mt-8 px-4 py-2 text-sm font-medium rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200"
      >
        {showFavorites ? "View All Cards" : `View Favorites (${favorites.length})`}
      </button>
    </div>
  );
}
