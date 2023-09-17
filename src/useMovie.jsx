import { useEffect, useState } from "react";

const useMovies = (query,handleCloseSelection) => {

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setError(() => "");
        setIsLoading(true);
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=833817d2&s=${query}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();

        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(() => data.Search);
        setError(() => "");
      } catch (error) {
        error.name !== "AbortError" && setError(() => error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies(() => []);
      setError(() => "");
      return;
    }
    handleCloseSelection();
    fetchMovies();

    return () => controller.abort();
  }, [query]);

  return { movies, isLoading, error };
};

export default useMovies;
