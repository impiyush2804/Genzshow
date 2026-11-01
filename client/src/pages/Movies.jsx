
import React, { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Film,
  Sparkles,
  X,
  ArrowUpDown,
  Clapperboard,
} from "lucide-react";

import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";

const getGenres = (movie) => {
  if (!Array.isArray(movie?.genres)) return [];

  return movie.genres
    .map((genre) =>
      typeof genre === "string" ? genre : genre?.name
    )
    .filter(Boolean);
};

const Movies = () => {
  const { shows = [], isShowsLoading } = useAppContext();

  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  const movies = Array.isArray(shows) ? shows : [];

  // Build genre options from the available movie data.
  const genres = useMemo(() => {
    const allGenres = movies.flatMap(getGenres);

    return ["All", ...new Set(allGenres)];
  }, [movies]);

  // Search, filter and sort movies.
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((movie) => {
        const title = movie.title || movie.name || "";
        const overview = movie.overview || "";

        return (
          title.toLowerCase().includes(searchTerm) ||
          overview.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (selectedGenre !== "All") {
      result = result.filter((movie) =>
        getGenres(movie).includes(selectedGenre)
      );
    }

    switch (sortBy) {
      case "rating":
        result.sort(
          (a, b) => (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0)
        );
        break;

      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.release_date || 0) -
            new Date(a.release_date || 0)
        );
        break;

      case "title":
        result.sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
        break;

      case "popular":
      default:
        result.sort(
          (a, b) => (Number(b.popularity) || 0) - (Number(a.popularity) || 0)
        );
        break;
    }

    return result;
  }, [movies, search, selectedGenre, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSelectedGenre("All");
    setSortBy("popular");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080d] pb-28 pt-32 text-white">

      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <BlurCircle top="180px" left="-100px" />
        <BlurCircle top="650px" right="-100px" />

        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-pink-600/[0.07] blur-[160px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.08),transparent_45%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-14 xl:px-20">

        {/* PAGE HEADER */}
        <section className="mb-12">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/[0.08] px-4 py-2 text-xs font-semibold tracking-wider text-pink-300">
            <Sparkles size={14} />
            YOUR CINEMA DESTINATION
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Explore{" "}
                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                  Movies.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                Discover your next favourite movie. Explore stories,
                find hidden gems and experience cinema your way.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 lg:self-auto">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                <Film size={22} />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {movies.length}
                </p>
                <p className="text-xs text-gray-400">
                  Movies available
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SEARCH AND SORT */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:p-5">

          <div className="flex flex-col gap-4 md:flex-row">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies by title..."
                className="h-13 w-full rounded-xl border border-white/10 bg-[#101017] pl-12 pr-11 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/10"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* SORT */}
            <div className="relative md:w-56">
              <ArrowUpDown
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pink-400"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-13 w-full appearance-none rounded-xl border border-white/10 bg-[#101017] pl-11 pr-4 text-sm text-white outline-none transition focus:border-pink-500/60"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest First</option>
                <option value="title">Name: A to Z</option>
              </select>
            </div>

          </div>

          {/* GENRE FILTER */}
          {genres.length > 1 && (
            <div className="mt-5 border-t border-white/[0.07] pt-5">

              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <SlidersHorizontal size={14} />
                Browse by genre
              </div>

              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                      selectedGenre === genre
                        ? "border-pink-500 bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                        : "border-white/10 bg-white/[0.04] text-gray-400 hover:border-pink-500/50 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

            </div>
          )}

        </section>

        {/* MOVIE SECTION HEADING */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">

          <div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-1 rounded-full bg-gradient-to-b from-pink-400 to-rose-600" />

              <h2 className="text-xl font-bold sm:text-2xl">
                {search || selectedGenre !== "All"
                  ? "Search Results"
                  : "Now Showing"}
              </h2>
            </div>

            <p className="ml-4 mt-2 text-xs text-gray-500 sm:text-sm">
              Discover something worth watching.
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-gray-400">
            {filteredMovies.length}{" "}
            {filteredMovies.length === 1 ? "movie" : "movies"}
          </span>

        </div>

        {/* MOVIE GRID */}
        {isShowsLoading ? (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]"
              >
                <div className="aspect-[2/3] animate-pulse bg-white/[0.07]" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.07]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>

        ) : filteredMovies.length > 0 ? (

          <div className="grid grid-cols-1 justify-items-center gap-x-6 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredMovies.map((movie) => (
              <MovieCard
                movie={movie}
                key={movie._id || movie.id}
              />
            ))}
          </div>

        ) : (

          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025] px-6 text-center">

            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-pink-500/20 bg-pink-500/10 text-pink-400">
              {movies.length === 0 ? (
                <Clapperboard size={34} />
              ) : (
                <Search size={34} />
              )}
            </div>

            <h3 className="text-2xl font-bold">
              {movies.length === 0
                ? "No movies available"
                : "No matching movies"}
            </h3>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
              {movies.length === 0
                ? "There are currently no movies available. Please check back soon."
                : "We couldn't find any movies matching your search. Try another title or change your filters."}
            </p>

            {(search || selectedGenre !== "All" || sortBy !== "popular") && (
              <button
                onClick={clearFilters}
                className="mt-7 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/20"
              >
                Clear Filters
              </button>
            )}

          </div>

        )}

      </div>
    </main>
  );
};

export default Movies;
