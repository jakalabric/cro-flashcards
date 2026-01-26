"use client";

import { useState, useEffect, useCallback, useRef, MouseEvent, TouchEvent } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [uniqueCategories, setUniqueCategories] = useState<string[]>(['All']);
  const prevShowFavorites = useRef(showFavorites);

  // Swipe detection state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

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
      
      // Extract and set unique categories
      const categories = Array.from(new Set(initialDeck.map(card => card.category)));
      setUniqueCategories(['All', ...categories.sort()]);
      
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

  // Handle deck filtering (Favorites, Categories)
  useEffect(() => {
    let filteredDeck = allCards;

    // Apply favorites filter if active
    if (showFavorites) {
      filteredDeck = filteredDeck.filter(card => favorites.includes(card.id));
    }

    // Apply category filter if not showing all
    if (selectedCategory !== 'All') {
      filteredDeck = filteredDeck.filter(card => card.category === selectedCategory);
    }

    const currentDeckIds = currentDeck.map(card => card.id);
    const newDeckIds = filteredDeck.map(card => card.id);
    const deckContentChanged = JSON.stringify(currentDeckIds) !== JSON.stringify(newDeckIds);

    if (deckContentChanged || showFavorites !== prevShowFavorites.current) {
      setCurrentDeck(filteredDeck);
      setCurrentIndex(0);
    } else {
      setCurrentDeck(filteredDeck);
    }

    prevShowFavorites.current = showFavorites;
  }, [allCards, showFavorites, favorites, selectedCategory]);

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

  // Swipe Handlers
  const onTouchStart = (e: TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flag-loader text-8xl">
          🇭🇷
        </div>
      </div>
    );
  }
  if (currentDeck.length === 0) return <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black"><p>No cards available.</p></div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <h1 className="w-full max-w-sm text-center font-black uppercase text-2xl sm:text-3xl md:text-4xl bg-gradient-to-b from-[#FF0000] from-[33%] via-[#FFFFFF] via-[33%] via-[66%] to-[#0000BF] to-[66%] bg-clip-text text-transparent [-webkit-text-stroke:1.5px_white] drop-shadow-[0_5px_5px_rgba(0,0,0,0.4)] mt-12 mb-16">
        Pomalo Cards
      </h1>

      <div className="w-full max-w-sm flex items-center mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentIndex(0);
          }}
          className="w-full px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div 
        className="w-full max-w-sm touch-none"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Flashcard
          card={currentDeck[currentIndex]}
          isFavorite={favorites.includes(currentDeck[currentIndex].id)}
          onToggleFavorite={handleToggleFavorite}
          onSpeech={(e) => handleSpeech(e, currentDeck[currentIndex].croatian)}
        />
      </div>

      <Controls
        onNext={handleNext}
        onPrevious={handlePrevious}
        onShuffle={handleShuffle}
        onViewFavorites={handleViewFavorites}
        showFavorites={showFavorites}
        favoritesCount={favorites.length}
        currentIndex={currentIndex}
        totalCards={currentDeck.length}
      />

    </div>
  );
  
}
