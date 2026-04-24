import { SearchScreenUI } from "@/screens/search/search-UI";
import {EventDoc, INTEREST_TAGS, InterestKey} from "@/types/type";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEvents } from "@/context/GlobalContext";

/**
 * @summary Manages search form state and AI-assisted ranking for event search routes.
 * @throws {never} Errors are handled with safe fallbacks.
 * @Returns {React.JSX.Element} Search screen logic wrapper.
 */
export default function SearchScreenLogic() {
  // Stores the navigation tool in the router var.
  const router = useRouter();
  const { events: allEvents } = useEvents();

  // Stores the user's typed inputs and date selections in vars.
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initialize the API with your key
  // Stores API bootstrap objects for Gemini model access.
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const model = useMemo(() => {
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }, [apiKey]);

  //  Automatically creates a starting dictionary where every single tag is set to 'false'.
  const initialTags = useMemo(() => {
    return INTEREST_TAGS.reduce(
      (acc, tag) => {
        acc[tag.key] = false;
        return acc;
      },
      {} as Record<InterestKey, boolean>,
    );
  }, []);

  // Stores the active/inactive status of every tag in the selected var using the generated dictionary.
  const [selected, setSelected] =
    useState<Record<InterestKey, boolean>>(initialTags);

  // Stores the function instruction in itoggleTag var.
  /**
   * @summary Toggles the selected state for a single interest tag.
   * @param key - Interest tag key to toggle.
   * @throws {never} Pure state update does not throw.
   * @Returns {void} Updates selected tag map.
   */
  const toggleTag = (key: InterestKey) => {
    // Logic: Copies the previous dictionary but flips the boolean of the clicked tag.
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Stores the function instructions in the handleApply var.
  /**
   * @summary Applies current filters and navigates to search results.
   * @throws {never} Navigation/state logic does not throw.
   * @Returns {void} Pushes filtered search route when input exists.
   */
  const handleApply = () => {
    const selectedTags = (Object.keys(selected) as InterestKey[]).filter(
      (k) => selected[k],
    );

    // Logic: Prevents the user from applying the search if they haven't typed anything.
    if (!query.trim() && !location && !date && selectedTags.length === 0) {
      return;
    }

    // Uses the router tool to navigate to the results screen,
    // passing the current stores as URL parameters.
    router.push({
      pathname: "/search-results",
      params: {
        query,
        location,
        date: date ? date.toISOString() : "",
        tags: selectedTags.join(","),
      },
    } as any);
  };

  // Stores the instruction for clearing all inputs in the handleReset var.
  /**
   * @summary Clears all query inputs and resets selected tags.
   * @throws {never} Pure state update does not throw.
   * @Returns {void} Resets search form state.
   */
  const handleReset = () => {
    setQuery("");
    setLocation("");
    setDate(null);
    // Logic: Instantly resets all 25 tags back to false using our generated dictionary.
    setSelected(initialTags);
  };

  /**
   * @summary Parses a JSON array payload from model output text.
   * @param text - Raw model response text.
   * @throws {never} Parse errors are caught and return fallback.
   * @Returns {string[]} Parsed array of string values.
   */
  const parseJsonArray = (text: string): string[] => {
    try {
      // 1. Remove Markdown code blocks if present
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

      // 2. Try to find the first '[' and last ']'
      const start = cleanText.indexOf('[');
      const end = cleanText.lastIndexOf(']');

      if (start !== -1 && end !== -1) {
        const jsonArrayString = cleanText.substring(start, end + 1);
        const parsed = JSON.parse(jsonArrayString);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      }

      return [];
    } catch (e) {
      console.error("JSON Parsing Error:", e, "Original text:", text);
      return [];
    }
  };

  /**
   * @summary Uses Gemini to rank the most relevant events for a user query.
   * @param userQuery - Free-text query entered by the user.
   * @param events - Candidate events to rank.
   * @throws {never} Errors are caught and return empty results.
   * @Returns {Promise<EventDoc[]>} Ranked subset of matching events.
   */
  const onAiSearch = useCallback(async (userQuery: string, events: EventDoc[]) => {
    try {
      if (!userQuery.trim() || !model) return [];

      const simplifiedEvents = events.map(e => ({
        id: e.id,
        content: `${e.title}: ${e.description}. Location: ${e.address}. Category: ${e.category}`
      }));

      const prompt = `
      User is looking for: "${userQuery}"
      Here is a list of events: ${JSON.stringify(simplifiedEvents)}
      
      Return ONLY a JSON array of the IDs of the 3 most relevant events,
      ordered by relevance. If none match, return [].
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const topIds = parseJsonArray(text);

      return events
          .filter((e) => topIds.includes(e.id))
          .sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id));

    } catch (err) {
      console.log("AI Search Error:", err); // Not showing on user side
      return []; // fallback safely
    }
  }, [model]);

  /**
   * @summary Runs AI search and routes to the results screen with ranked IDs.
   * @param userQuery - Free-text query entered by the user.
   * @throws {never} Navigation cleanup always runs.
   * @Returns {Promise<void>} Resolves after AI search flow completes.
   */
  const handleAiSearch = useCallback(async (userQuery: string) => {
    setIsAiLoading(true);
    try {
      const top = await onAiSearch(userQuery, allEvents);
      const ids = top.map((e) => e.id);

      router.push({
        pathname: "/search-results",
        params: {
          query: userQuery,
          aiIds: ids.join(","),
        },
      } as any);
    } finally {
      setIsAiLoading(false);
    }
  }, [allEvents, onAiSearch, router]);


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
      isAiLoading={isAiLoading}
      onAiSearch={handleAiSearch}
    />
  );
}
