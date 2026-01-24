"use client";

import { useState, useEffect, useCallback, useRef, MouseEvent } from "react";
import { Flashcard as FlashcardType } from "@/lib/types";
import { STARTER_PACK } from "@/lib/starter-pack";
import { fetchCustomCards } from "@/lib/csv-fetcher";
import Flashcard from "@/components/Flashcard";
import Controls from "@/components/Controls";

const STORAGE_KEY = "croatian-tutor-favorites";

function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load favorites from localStorage:", e);
    return [];
  }
}

export default function Home() {
  const [allCards, setAllCards] = useState<FlashcardType[]>([]);
  const [currentDeck, setCurrentDeck] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const prevShowFavorites = useRef(showFavorites);

  // Load cards on mount
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
      const greetingCards = combinedCards.filter(card => card.category === "Greetings");
      const nonGreetingCards = combinedCards.filter(card => card.category !== "Greetings");

      let firstCard: FlashcardType | undefined;
      let remainingCards: FlashcardType[] = [];

      if (greetingCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * greetingCards.length);
        firstCard = greetingCards[randomIndex];
        remainingCards = [...greetingCards.filter((_, i) => i !== randomIndex), ...nonGreetingCards];
      } else {
        remainingCards = nonGreetingCards;
      }

      const shuffledRemainingCards = [...remainingCards].sort(() => Math.random() - 0.5);
      const initialDeck = firstCard ? [firstCard, ...shuffledRemainingCards] : shuffledRemainingCards;

      setAllCards(initialDeck);
      setCurrentDeck(initialDeck);
      setIsLoading(false);
    }

    loadCards();
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  // Handle deck filtering (Favorites vs All)
  useEffect(() => {
    const deckToSet = showFavorites
      ? allCards.filter(card => favorites.includes(card.id))
      : allCards;

    const currentDeckIds = currentDeck.map(card => card.id);
    const newDeckIds = deckToSet.map(card => card.id);
    const deckContentChanged = JSON.stringify(currentDeckIds) !== JSON.stringify(newDeckIds);

    if (deckContentChanged || showFavorites !== prevShowFavorites.current) {
      setCurrentDeck(deckToSet);
      setCurrentIndex(0);
    } else {
      setCurrentDeck(deckToSet);
    }

    prevShowFavorites.current = showFavorites;
  }, [allCards, showFavorites, favorites]);

  // SPEECH HANDLER
  const handleSpeech = useCallback((e: MouseEvent<HTMLButtonElement>, text: string) => {
    e.stopPropagation(); // Stop the card from flipping
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a Croatian voice
    const voices = window.speechSynthesis.getVoices();
    const hrVoice = voices.find(v => v.lang.startsWith('hr'));
    if (hrVoice) utterance.voice = hrVoice;
    utterance.lang = 'hr-HR';
    utterance.rate = 0.9;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentDeck.length);
  }, [currentDeck.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + currentDeck.length) % currentDeck.length);
  }, [currentDeck.length]);

  const handleShuffle = useCallback(() => {
    setCurrentDeck((prevDeck) => {
      const deckToShuffle = showFavorites ? allCards.filter(card => favorites.includes(card.id)) : allCards;
      const shuffled = [...deckToShuffle].sort(() => Math.random() - 0.5);
      return shuffled;
    });
    setCurrentIndex(0);
  }, [allCards, favorites, showFavorites]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) => 
      prevFavorites.includes(id) ? prevFavorites.filter(favId => favId !== id) : [...prevFavorites, id]
    );
  }, []);

  const handleViewFavorites = useCallback(() => {
    setShowFavorites((prev) => !prev);
    setCurrentIndex(0);
  }, []);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black"><p>Loading...</p></div>;
  if (currentDeck.length === 0) return <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black"><p>No cards available.</p></div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">Pomalo Cards</h1>

      <Flashcard
        card={currentDeck[currentIndex]}
        isFavorite={favorites.includes(currentDeck[currentIndex].id)}
        onToggleFavorite={handleToggleFavorite}
        onSpeech={(e) => handleSpeech(e, currentDeck[currentIndex].croatian)} // Passing the handler
      />

      <Controls
        onNext={handleNext}
        onPrevious={handlePrevious}
        onShuffle={handleShuffle}
        currentIndex={currentIndex}
        totalCards={currentDeck.length}
      />

      <button
        onClick={handleViewFavorites}
        className="mt-8 px-6 py-3 text-base font-medium rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
      >
        {showFavorites ? "View All Cards" : `View Favorites (${favorites.length})`}
      </button>
    </div>
  );
  
}
