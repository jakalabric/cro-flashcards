export interface Flashcard {
  id: string;
  croatian: string;
  english: string;
  category: string;
  isCustom?: boolean;
}

export type Category = 
  | "Greetings" 
  | "Politeness" 
  | "Numbers" 
  | "Common Sentences" 
  | "Dialogues" 
  | "Travel" 
  | "Food & Drink" 
  | "Time" 
  | "Family"
  | "Custom";
