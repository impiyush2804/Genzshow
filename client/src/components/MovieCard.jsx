
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Clock3,
  CalendarDays,
  Ticket,
  ArrowUpRight,
} from "lucide-react";

import timeFormat from "../lib/timeFormat";
import { useAppContext } from "../context/AppContext";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { image_base_url } = useAppContext();

  if (!movie) return null;

  const movieId = movie._id || movie.id;

  const imagePath = movie.backdrop_path || movie.poster_path;
  const imageUrl = imagePath
    ? `${image_base_url?.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`
    : "";

  const genres = Array.isArray(movie.genres)
    ? movie.genres
        .slice(0, 2)
        .map((genre) => (typeof genre === "string" ? genre : genre?.name))
        .filter(Boolean)
    : [];

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Coming Soon";

  const rating = Number(movie.vote_average);
  const runtime = Number(movie.runtime);

  const openMovie = () => {
    if (!movieId) return;
    navigate(`/movies/${movieId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <article className="group relative flex w-full max-w-[280px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#15151f] transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">

      {/* Movie Poster */}
      <div
        onClick={openMovie}
        className="relative aspect-[16/10] cursor-pointer overflow-hidden bg-white/5"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={movie.title || "Movie poster"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Image unavailable
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#15151f] via-transparent to-black/10" />

        {/* Rating */}
        {Number.isFinite(rating) && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {rating.toFixed(1)}
          </div>
        )}

        {/* Movie label */}
        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          GENZSHOW PICK
        </div>

        <div className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-3 items-center justify-center rounded-full bg-primary text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </div>
      </div>

      {/* Movie Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          onClick={openMovie}
          className="cursor-pointer truncate text-base font-bold text-white transition-colors group-hover:text-primary"
          title={movie.title}
        >
          {movie.title || "Untitled Movie"}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <CalendarDays size={13} />
            {releaseYear}
          </span>

          {runtime > 0 && (
            <span className="flex items-center gap-1">
              <Clock3 size={13} />
              {timeFormat(runtime)}
            </span>
          )}
        </div>

        {genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {genres.map((genre, index) => (
              <span
                key={`${genre}-${index}`}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-gray-300"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4 mt-5">
          <span className="text-[11px] font-medium text-gray-500">
            Experience the movie
          </span>

          <button
            onClick={openMovie}
            disabled={!movieId}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-primary-dull hover:shadow-[0_5px_20px_rgba(220,38,38,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Ticket size={14} />
            Buy Tickets
          </button>
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
