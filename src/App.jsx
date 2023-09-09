import { Fragment, useEffect, useState } from "react";
import { MagnifyingGlass, Puff } from "react-loader-spinner";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "833817d2";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (id) => {
    setSelectedId(() => (selectedId === id ? null : id));
  };

  const handleCloseSelection = () => {
    setSelectedId(() => null);
  };

  useEffect(() => {
    async function fetchMovies() {
      try {
        setError(() => "");
        setIsLoading(true);
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`
        );

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();

        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(() => data.Search);
        setError(() => "");
      } catch (error) {
        setError(() => error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies(() => []);
      setError(() => "");
      return;
    }
    fetchMovies();
  }, [query]);
  return (
    <Fragment>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box className="searched">
          {error ? (
            <div className="loader">{error}</div>
          ) : isLoading ? (
            <Loader />
          ) : (
            <Movielist
              selectedId={selectedId}
              movies={movies}
              handleSelect={handleSelect}
            />
          )}
        </Box>
        <Box
          className="watched"
          element={
            <>
              {selectedId ? (
                <MovieDetails
                  selectedId={selectedId}
                  handleCloseSelection={handleCloseSelection}
                />
              ) : (
                <>
                  <WatchedSummary watched={watched} />
                  <WatchedMoviesList watched={watched} />
                </>
              )}
            </>
          }
        />
      </Main>
    </Fragment>
  );
}

function Loader({ loaderName }) {
  return loaderName == "spin" ? (
    <Puff
      height="60"
      width="60"
      radius={1}
      color="#6741d9"
      ariaLabel="puff-loading"
      wrapperStyle={{}}
      wrapperClass="loader"
      visible={true}
    />
  ) : (
    <MagnifyingGlass
      height="50"
      width="50"
      ariaLabel="MagnifyingGlass-loading"
      wrapperClass="MagnifyingGlass-wrapper loader"
      glassColor="#6741d9"
      color="#ffffff"
    />
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length || "0"}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Movielist({ movies, handleSelect, selectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          key={movie.imdbID}
          movie={movie}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
      ))}
    </ul>
  );
}

function MovieDetails({ selectedId, handleCloseSelection }) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const {
    Title: title,
    Year: year,
    Rated: rated,
    Released: released,
    Runtime: runtime,
    Genre: genre,
    Plot: plot,
    Poster: poster,
    Actors: actors,
    imdbRating,
    Director: director,
  } = movie;

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(() => true);
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(() => data);
      setIsLoading(() => false);
    }
    getMovieDetails();
  }, [selectedId]);
  return (
    <div className="details">
      {isLoading ? (
        <Loader loaderName="spin" />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseSelection}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span> {imdbRating}
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating maxRating={10} size={24} />
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Movie({ movie, onSelect, selectedId }) {
  return (
    <li
      onClick={() => onSelect(movie.imdbID)}
      className={selectedId === movie.imdbID ? "selected" : ""}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>📆</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMoviesList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

function Box({ className, element, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={className + " box"}>
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && (element || children)}
    </div>
  );
}
