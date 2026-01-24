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
          const cards = results.data
            .map((row: any, index: number) => {
              try {
                // Skip if row is not an object or is empty
                if (!row || typeof row !== 'object') {
                  return null;
                }

                // Get all values from the row
                const values = Object.values(row);
                if (!values.length) {
                  return null;
                }

                // Find English text using case-insensitive header matching or first value
                const english = (
                  row['English'] ||
                  row['english'] ||
                  values[0] ||
                  ""
                ).trim();

                // Find Croatian text using case-insensitive header matching or second value
                const croatian = (
                  row['Croatian'] ||
                  row['croatian'] ||
                  values[1] ||
                  ""
                ).trim();

                // Only return valid cards with both values
                if (!english || !croatian) {
                  return null;
                }
                
                return {
                  id: `custom-${index}`,
                  croatian,
                  english,
                  category: "Custom",
                  isCustom: true,
                } as Flashcard;
              } catch (error) {
                console.error("Error mapping row:", error, row);
                return null;
              }
            })
            .filter((card): card is Flashcard => card !== null); // Type guard to filter out nulls

          console.log("Fetched Cards:", cards);
          resolve(cards);
        },
        error: (error: any) => {
          console.error("CSV parsing error:", error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return [];
  }
}
