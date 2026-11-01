
import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Play,
  Sparkles,
  Ticket,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const FALLBACK_IMAGE = "/backgroundImage.png";

const HeroSection = () => {
  const navigate = useNavigate();

  const { shows, image_base_url, isShowsLoading } = useAppContext();

  const heroMovies = useMemo(() => {
    if (!Array.isArray(shows)) return [];

    return shows
      .filter((movie) => movie && movie.backdrop_path)
      .slice(0, 8);
  }, [shows]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(FALLBACK_IMAGE);

  const activeMovie = heroMovies[activeIndex] || null;

  const getImageUrl = (path) => {
    if (!path) return FALLBACK_IMAGE;

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const base = image_base_url || "https://image.tmdb.org/t/p";

    const cleanBase = base
      .replace(/\/+$/, "")
      .replace(/\/(w\d+|original)$/i, "");

    return `${cleanBase}/original/${path.replace(/^\/+/, "")}`;
  };

  const backgroundImage = activeMovie
    ? getImageUrl(activeMovie.backdrop_path)
    : FALLBACK_IMAGE;

  // Preload the next image before replacing the currently displayed one.
  useEffect(() => {
    let isCurrent = true;

    const preloadImage = new Image();

    preloadImage.onload = () => {
      if (isCurrent) {
        setDisplayedImage(backgroundImage);
      }
    };

    preloadImage.onerror = () => {
      if (isCurrent) {
        setDisplayedImage(FALLBACK_IMAGE);
      }
    };

    preloadImage.src = backgroundImage;

    return () => {
      isCurrent = false;
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [backgroundImage]);

  // Automatic carousel rotation.
  useEffect(() => {
    if (heroMovies.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroMovies.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  // Keep the selected index valid.
  useEffect(() => {
    setActiveIndex((current) =>
      heroMovies.length ? current % heroMovies.length : 0
    );
  }, [heroMovies.length]);

  const previousMovie = () => {
    if (!heroMovies.length) return;

    setActiveIndex(
      (current) => (current - 1 + heroMovies.length) % heroMovies.length
    );
  };

  const nextMovie = () => {
    if (!heroMovies.length) return;

    setActiveIndex((current) => (current + 1) % heroMovies.length);
  };

  const title = activeMovie?.title || "Discover Your Next Favourite";

  const overview =
    activeMovie?.overview ||
    "Explore the latest movies, discover cinematic experiences and find your next favourite story.";

  const releaseYear = activeMovie?.release_date
    ? new Date(activeMovie.release_date).getFullYear()
    : null;

  const genres = Array.isArray(activeMovie?.genres)
    ? activeMovie.genres
        .map((genre) =>
          typeof genre === "string" ? genre : genre?.name
        )
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const runtime = Number(activeMovie?.runtime) || null;

  const openMovies = () => navigate("/movies");

  const openFeaturedMovie = () => {
    if (!activeMovie) {
      openMovies();
      return;
    }

    const movieId = activeMovie._id || activeMovie.id;

    if (!movieId) {
      openMovies();
      return;
    }

    navigate(`/movies/${movieId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative h-[82vh] min-h-[620px] max-h-[900px] w-full overflow-hidden bg-[#08080d] sm:h-[88vh]">

      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img
          src={displayedImage}
          alt={title}
          className="h-full w-full object-cover object-center transition-opacity duration-700"
        />

        {/* CINEMATIC OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080d] via-[#08080d]/85 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/20 to-[#08080d]/30" />

        <div className="absolute inset-0 bg-black/10" />

        <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-pink-600/10 blur-[130px]" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 flex h-full items-center px-6 pb-16 pt-28 md:px-14 lg:px-24 xl:px-32">
        <div className="max-w-3xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white backdrop-blur-xl sm:text-xs">
            <Sparkles size={15} className="text-pink-400" />
            GENZSHOW ORIGINAL EXPERIENCE
          </div>

          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-pink-400 sm:text-sm">
            {isShowsLoading ? "Discovering movies" : "Featured movie"}
          </p>

          <h1
            key={title}
            className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-gray-300 sm:text-sm">
            {genres.length > 0 && (
              <span className="font-medium text-white">
                {genres.join(" · ")}
              </span>
            )}

            {releaseYear && (
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="text-pink-400" />
                {releaseYear}
              </span>
            )}

            {runtime && (
              <span className="flex items-center gap-2">
                <Clock3 size={15} className="text-pink-400" />
                {runtime} min
              </span>
            )}
          </div>

          <p className="mt-6 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
            {overview.length > 190
              ? `${overview.slice(0, 190).trim()}...`
              : overview}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={openFeaturedMovie}
              className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-pink-600/20 transition duration-300 hover:-translate-y-1 hover:shadow-pink-500/40 sm:px-7 sm:py-4"
            >
              <Ticket size={18} />
              Book Tickets
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <button
              onClick={openMovies}
              className="flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/40 hover:bg-white/20 sm:px-7 sm:py-4"
            >
              <Play size={17} fill="currentColor" />
              Explore Movies
            </button>
          </div>

          {heroMovies.length > 1 && (
            <div className="mt-12 flex items-center gap-3">
              {heroMovies.map((movie, index) => (
                <button
                  key={movie._id || movie.id || index}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${movie.title}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    activeIndex === index
                      ? "w-12 bg-pink-500"
                      : "w-5 bg-white/35 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SLIDER CONTROLS */}
      {heroMovies.length > 1 && (
        <div className="absolute bottom-8 right-6 z-20 flex items-center gap-3 md:bottom-10 md:right-14 lg:right-24">
          <button
            onClick={previousMovie}
            aria-label="Previous movie"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition hover:border-pink-500 hover:bg-pink-600 sm:h-12 sm:w-12"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            onClick={nextMovie}
            aria-label="Next movie"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition hover:border-pink-500 hover:bg-pink-600 sm:h-12 sm:w-12"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}

      {/* SLIDE COUNTER */}
      {heroMovies.length > 1 && (
        <div className="absolute bottom-10 left-6 z-20 hidden items-center gap-2 text-xs font-semibold tracking-widest text-white/60 sm:flex md:left-14 lg:left-24">
          <span className="text-white">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span>/</span>
          <span>{String(heroMovies.length).padStart(2, "0")}</span>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
