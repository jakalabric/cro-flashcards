"use client";

import { useState, useEffect, useCallback, useRef, MouseEvent } from "react";
import { Flashcard as FlashcardType } from "@/lib/types";
import { STARTER_PACK } from "@/lib/starter-pack";
import { fetchCustomCards } from "@/lib/csv-fetcher";
import Flashcard from "@/components/Flashcard";
import Controls from "@/components/Controls";
import { motion, AnimatePresence } from "framer-motion";

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
  const swipeDirection = useRef<'left' | 'right' | null>(null);

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
    swipeDirection.current = 'left';
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentDeck.length);
  }, [currentDeck.length]);

  const handlePrevious = useCallback(() => {
    swipeDirection.current = 'right';
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

  // Drag handlers for Tinder-style swipe
  const handleDragEnd = (event: any, info: any) => {
    const { offset, velocity } = info;
    const offsetX = offset.x;
    const velocityX = velocity.x;
    
    // Calculate swipe confidence threshold
    const swipeConfidenceThreshold = Math.abs(offsetX) * Math.abs(velocityX);
    
    // Swipe Left (Next): offset.x < -100 OR velocity.x < -500
    if (offsetX < -100 || velocityX < -500) {
      swipeDirection.current = 'left';
      handleNext();
    }
    // Swipe Right (Prev): offset.x > 100 OR velocity.x > 500
    else if (offsetX > 100 || velocityX > 500) {
      swipeDirection.current = 'right';
      handlePrevious();
    }
    // If neither threshold is met, the card will snap back automatically
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

  const getExitAnimation = () => {
    if (swipeDirection.current === 'left') {
      return {
        opacity: 0,
        x: -1000,
        rotate: -20,
        transition: { duration: 0.3 }
      };
    } else if (swipeDirection.current === 'right') {
      return {
        opacity: 0,
        x: 1000,
        rotate: 20,
        transition: { duration: 0.3 }
      };
    }
    // Default exit animation if direction is not set
    return {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    };
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 overflow-hidden">
      <h1 className="w-[85%] mx-auto text-center font-black uppercase tracking-tighter text-4xl sm:text-5xl md:text-7xl bg-gradient-to-b from-[#FF0000] from-[33%] via-[#FFFFFF] via-[33%] via-[66%] to-[#0000BF] to-[66%] bg-clip-text text-transparent [-webkit-text-stroke:0.5px_rgba(0,0,0,0.3)] dark:[-webkit-text-stroke:0.5px_rgba(255,255,255,0.5)] drop-shadow-lg mt-6 mb-8 whitespace-nowrap">
        Pomalo Cards
      </h1>

      <div className="w-full max-w-sm flex items-center mb-4">
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

      <div className="w-full max-w-sm touch-none" style={{ touchAction: 'pan-y' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDeck[currentIndex]?.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={getExitAnimation()}
            drag="x"
            dragDirectionLock={true}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            whileDrag={{ rotate: 5 }}
            className="cursor-grab active:cursor-grabbing"
          >
            <Flashcard
              card={currentDeck[currentIndex]}
              isFavorite={favorites.includes(currentDeck[currentIndex].id)}
              onToggleFavorite={handleToggleFavorite}
              onSpeech={(e) => handleSpeech(e, currentDeck[currentIndex].croatian)}
            />
          </motion.div>
        </AnimatePresence>
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
