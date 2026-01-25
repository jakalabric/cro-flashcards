# Category Filter Implementation Plan

## 1. Update CSV Fetcher
In [`lib/csv-fetcher.ts`](lib/csv-fetcher.ts):
```typescript
// Update category mapping in .parse 'complete' callback
category: (row['Category'] || row['category'] || row[keys[2]] || "Uncategorized").trim()
```

## 2. Category State Management
In [`app/page.tsx`](app/page.tsx):
```typescript
// Add state hooks
const [selectedCategory, setSelectedCategory] = useState<string>('All');
const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

// Update categories when cards load
useEffect(() => {
  const categories = Array.from(new Set(allCards.map(card => card.category)));
  setUniqueCategories(['All', ...categories.sort()]);
}, [allCards]);
```

## 3. Category Filtering Logic
In [`app/page.tsx`](app/page.tsx):
```typescript
// Update deck filtering to include category filter
const filteredDeck = currentDeck.filter(card => 
  selectedCategory === 'All' || card.category === selectedCategory
);
```

## 4. Category Dropdown UI
In [`app/page.tsx`](app/page.tsx):
```typescript
// Add dropdown component above flashcard
<select 
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="mb-4 p-2 rounded border border-zinc-300 dark:border-zinc-700"
>
  {uniqueCategories.map(category => (
    <option key={category} value={category}>{category}</option>
  ))}
</select>
```

## 5. Event Handling
- Implement onChange handler for category selection
- Reset currentIndex to 0 when category changes
- Update filtered deck when category changes

## 6. Testing Scenarios
1. Verify dynamic category extraction from CSV
2. Check category dropdown population
3. Test category filtering:
   - All categories view
   - Individual category selection
   - Empty category handling
4. Verify card navigation within filtered deck
5. Test category persistence during favorites toggle