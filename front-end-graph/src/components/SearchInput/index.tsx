"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { SearchRoot } from "./search";
import { useRouter } from "next/navigation";
import { fetchServer } from "../service/Notion";
type ResultSearch = { id: string; name: string };
const fetchSearchResults = async (query: string, token: string) => {
  const data = (await fetchServer(`/search`, token, {
    method: "POST",
    body: JSON.stringify({ query }),
  })) as SearchRoot;

  const result = data?.results
    .map((item) => ({
      id: item.id,
      name:
        item.properties["title"]?.title[0].plain_text ||
        item.properties["Name"]?.title[0].plain_text,
    }))
    .filter((item) => item.name);
  return result;
};

export default function SearchInput() {
  const { data } = useSession();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<ResultSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (inputValue) {
        setIsLoading(true);
        const searchResults = await fetchSearchResults(
          inputValue,
          data?.user?.tokens.access_token || "",
        );
        setResults(searchResults);
        setIsLoading(false);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [inputValue, data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex > -1) {
      setInputValue(results[selectedIndex].name);
      setShowResults(false);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const handleResultClick = (result: ResultSearch) => {
    setInputValue(result.name);
    setShowResults(false);
    router.push(`/graph/${result.id}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full mx-auto p-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search by your Notion pages..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-8 pr-4 py-2 w-full rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 ease-in-out bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
        {showResults && (
          <ul
            ref={resultsRef}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {results.map((result, index) => (
              <li
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  index === selectedIndex ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
              >
                {result.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
