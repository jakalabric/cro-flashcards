import Papa from "papaparse";
import { Flashcard } from "./types";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEQDQZaLEUBBKtNMdd-4OeC15FQgaB0Q8g2W2KI9ld3wYmBIVJLWfTbsthTz-NBX3dsHhVp5U7cE54/pub?output=csv";

export async function fetchCustomCards(): Promise<Flashcard[]> {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const cards: Flashcard[] = results.data.map((row: any, index: number) => {
            // Adjust these keys based on actual CSV headers if they differ
            // Common headers for Google Translate exported sheets are 'Croatian' and 'English'
            // or sometimes they are just columns without headers if not careful.
            // Using a fallback to first and second column if headers don't match.
            const keys = Object.keys(row);
            const croatian = row[keys[0]] || "";
            const english = row[keys[1]] || "";
            
            return {
              id: `custom-${index}`,
              croatian: croatian.trim(),
              english: english.trim(),
              category: "Custom",
              isCustom: true,
            };
          }).filter(card => card.croatian && card.english);
          
          resolve(cards);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return [];
  }
}
