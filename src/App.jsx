import { Fragment, useEffect, useRef, useState } from "react";
import { MagnifyingGlass, Puff } from "react-loader-spinner";
import StarRating from "./StarRating";
import useKey from "./useKey";
import useLocalStorageState from "./useLocalStorageState";
import useMovies from "./useMovie";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "833817d2";

export default function App() {
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const handleSelect = (id) => {
    setSelectedId(() => (selectedId === id ? null : id));
  };

  const handleCloseSelection = () => {
    setSelectedId(() => null);
  };

  const handleAddWatch = (movie) => {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  };

  const handleDeleteWatch = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  const { movies, isLoading, error } = useMovies(query, handleCloseSelection);
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
                  onAddWatch={handleAddWatch}
                  onCloseSelection={handleCloseSelection}
                  watched={watched}
                />
              ) : (
                <>
                  <WatchedSummary watched={watched} />
                  <WatchedMoviesList
                    watched={watched}
                    handleDeleteWatch={handleDeleteWatch}
                  />
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
  const input = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (e.key === "Enter") {
        if (document.activeElement === input.current) return;
        input.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", callback);

    return () => document.removeEventListener("keydown", callback);
  });
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={input}
    />
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>Poprating</h1>
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

function MovieDetails({
  selectedId,
  handleCloseSelection,
  onAddWatch,
  onCloseSelection,
  watched,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(0);

  const counter = useRef(0);

  useEffect(() => {
    if (userRating) counter.current++;
  }, [userRating]);

  const {
    Title: title,
    Year: year,
    Released: released,
    Runtime: runtime,
    Genre: genre,
    Plot: plot,
    Poster: poster,
    Actors: actors,
    imdbRating,
    Director: director,
  } = movie;

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const handleWatched = () => {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      userRating,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      countRatingDecisions: counter.current,
    };
    onAddWatch(newWatchedMovie);
    onCloseSelection();
  };

  useKey("Escape", handleCloseSelection);

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

  useEffect(() => {
    document.title = `Movie | ${title}`;
    return () => (document.title = `usePopcorn`);
  }, [title]);

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
                <span>⭐</span> {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={24} onSet={setUserRating} />
                  {userRating > 0 && (
                    <div className="btn-add" onClick={handleWatched}>
                      + Add to list
                    </div>
                  )}
                </>
              ) : (
                <p>Already watched and rated with ⭐ {watchedUserRating}</p>
              )}
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
  const avgImdbRating = average(
    watched.map((movie) => (isNaN(movie.imdbRating) ? 0 : movie.imdbRating))
  );
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMoviesList({ watched, handleDeleteWatch }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          handleDeleteWatch={handleDeleteWatch}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, handleDeleteWatch }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{isNaN(movie.imdbRating) ? 0 : movie.imdbRating}</span>
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
      <button
        className="btn-delete"
        onClick={() => handleDeleteWatch(movie.imdbID)}
      >
        x
      </button>
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
