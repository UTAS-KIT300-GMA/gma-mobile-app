import { useState } from "react";
import { useRouter } from "expo-router"; 
import { InterestKey, INTEREST_TAGS } from "@/types/type"; 
import { SearchScreenUI } from "@/screens/search/search-UI";

export default function SearchScreenLogic() {
  // Stores the navigation tool in the router var.
  const router = useRouter();

  // Stores the user's typed inputs and date selections in vars.
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  //  Automatically creates a starting dictionary where every single tag is set to 'false'.
  const initialTags = INTEREST_TAGS.reduce((acc, tag) => {
    acc[tag.key] = false;
    return acc;
  }, {} as Record<InterestKey, boolean>);

  // Stores the active/inactive status of every tag in the selected var using the generated dictionary.
  const [selected, setSelected] = useState<Record<InterestKey, boolean>>(initialTags);

  // Stores the function instruction in itoggleTag var.
  const toggleTag = (key: InterestKey) => {
    // Logic: Copies the previous dictionary but flips the boolean of the clicked tag.
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Stores the function instructions in the handleApply var.
  const handleApply = () => {
    // Logic: Filters the selected store to create a clean array of only the active tags.
    const selectedTags = (Object.keys(selected) as InterestKey[]).filter(
      (k) => selected[k]
    );
    
    // Uses the router tool to navigate to the results screen, 
    // passing the current stores as URL parameters.
    router.push({
      pathname: "/search-results",
      params: {
        query,
        location,
        date: date ? date.toISOString() : "",
        tags: selectedTags.join(","), 
      }
    } as any);
  };

  // Stores the instruction for clearing all inputs in the handleReset var.
  const handleReset = () => {
    setQuery("");
    setLocation("");
    setDate(null);
    // Logic: Instantly resets all 25 tags back to false using our generated dictionary.
    setSelected(initialTags); 
  };

  return (
    // Passes all the valuess of var's and function instructions donw to search-screen.
    <SearchScreenUI
      query={query}
      setQuery={setQuery}
      selected={selected}
      toggleTag={toggleTag}
      location={location}
      setLocation={setLocation}
      date={date}
      setDate={setDate}
      showPicker={showPicker}
      setShowPicker={setShowPicker}
      handleApply={handleApply}
      handleReset={handleReset}
    />
  );
}