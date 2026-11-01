
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Film,
  Heart,
  Play,
  PlayCircle,
  Star,
  Ticket,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";

import BlurCircle from "../components/BlurCircle";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";

import timeFormat from "../lib/timeFormat";
import trackMovieDNA from "../utils/movieDNA";

import {
  useAppContext,
} from "../context/AppContext";

const FALLBACK_IMAGE = "/placeholder.png";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const {
    shows,
    axios,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    image_base_url,
  } = useAppContext();

  // --------------------------------------------------
  // IMAGE URL HELPER
  // --------------------------------------------------

  const getImageUrl = useCallback(
    (path) => {
      if (!path) return FALLBACK_IMAGE;

      if (path.startsWith("http")) return path;

      const base = image_base_url?.replace(/\/$/, "");

      return base
        ? `${base}/${path.replace(/^\//, "")}`
        : FALLBACK_IMAGE;
    },
    [image_base_url]
  );

  // --------------------------------------------------
  // FETCH MOVIE DETAILS
  // --------------------------------------------------

  const getShow = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      setShow(null);

      const { data } = await axios.get(`/api/show/${id}`);

      if (data?.success && data?.movie) {
        setShow(data);
      } else if (data?.success && data?.show?.movie) {
        setShow(data.show);
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error("GET MOVIE DETAILS ERROR:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [axios, id]);

  useEffect(() => {
    getShow();
  }, [getShow]);

  // --------------------------------------------------
  // MOVIE DNA VIEW TRACKING
  // --------------------------------------------------

  useEffect(() => {
    if (!show?.movie) return;

    trackMovieDNA({
      axios,
      movie: show.movie,
      action: "view",
    });
  }, [show, axios]);

  // --------------------------------------------------
  // MOVIE DATA
  // --------------------------------------------------

  const movie = show?.movie;

  const movieTitle =
    movie?.title ||
    movie?.name ||
    "Movie";

  const movieRating =
    Number(movie?.vote_average) || 0;

  const movieRuntime =
    Number(movie?.runtime) || 0;

  const movieOverview =
    movie?.overview ||
    "No overview available for this movie.";

  const movieGenres = useMemo(() => {
    if (!Array.isArray(movie?.genres)) return [];

    return movie.genres
      .map((genre) =>
        typeof genre === "object"
          ? genre?.name
          : String(genre)
      )
      .filter(Boolean);
  }, [movie?.genres]);

  const releaseYear = movie?.release_date
    ? movie.release_date.slice(0, 4)
    : "";

  const movieCasts = Array.isArray(movie?.casts)
    ? movie.casts
    : [];

  const posterUrl = getImageUrl(movie?.poster_path);

  const backdropUrl = getImageUrl(
    movie?.backdrop_path || movie?.poster_path
  );

  // --------------------------------------------------
  // FAVORITE STATE
  // --------------------------------------------------

  const isFavorite = useMemo(() => {
    return (
      Array.isArray(favoriteMovies) &&
      favoriteMovies.some(
        (favoriteMovie) =>
          String(favoriteMovie?._id) === String(id)
      )
    );
  }, [favoriteMovies, id]);

  // --------------------------------------------------
  // FAVORITE HANDLER
  // --------------------------------------------------

  const handleFavorite = async () => {
    if (!user) {
      toast.error(
        "Please login to add movies to your favourites."
      );
      return;
    }

    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      const wasFavorite = isFavorite;
      const token = await getToken();

      const { data } = await axios.post(
        "/api/user/update-favorite",
        {
          movieId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.success) {
        await fetchFavoriteMovies();

        if (!wasFavorite && movie) {
          await trackMovieDNA({
            axios,
            movie,
            action: "favorite",
          });
        }

        toast.success(
          data.message ||
            (wasFavorite
              ? "Removed from favourites"
              : "Added to favourites")
        );
      } else {
        toast.error(
          data?.message || "Unable to update favourites."
        );
      }
    } catch (error) {
      console.error("FAVORITE ERROR:", error);

      toast.error(
        "Something went wrong. Please try again."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // --------------------------------------------------
  // WATCH TRAILER HANDLER
  // --------------------------------------------------

  const handleTrailer = () => {
    // 1. Try to find a YouTube trailer key.

    const trailerKey =
      movie?.trailer?.key ||
      movie?.videoKey ||
      movie?.trailerKey ||
      movie?.videos?.results?.find(
        (video) =>
          video?.site === "YouTube" &&
          video?.type === "Trailer"
      )?.key;

    // 2. Check for an existing trailer URL.

    const trailerUrl =
      movie?.trailer?.url ||
      movie?.trailerUrl ||
      movie?.videoUrl;

    // 3. Open direct YouTube trailer.

    if (trailerKey) {
      window.open(
        `https://www.youtube.com/watch?v=${trailerKey}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    // 4. Open the provided trailer URL.

    if (trailerUrl) {
      window.open(
        trailerUrl,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    // 5. Fallback: search YouTube automatically.

    const searchQuery = encodeURIComponent(
      `${movieTitle} ${releaseYear} official trailer`
    );

    window.open(
      `https://www.youtube.com/results?search_query=${searchQuery}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // --------------------------------------------------
  // RECOMMENDED MOVIES
  // --------------------------------------------------

  const recommendedMovies = useMemo(() => {
    if (!Array.isArray(shows)) return [];

    return shows
      .filter(
        (item) =>
          String(item?._id || item?.id) !== String(id)
      )
      .slice(0, 4);
  }, [shows, id]);

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return <Loading />;
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (loadError || !movie) {
    return (
      <div className="min-h-screen page-shell flex items-center justify-center px-5">
        <div className="glass-panel max-w-lg w-full rounded-3xl p-10 text-center">

          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Film className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold mb-3">
            Movie unavailable
          </h2>

          <p className="text-gray-400 text-sm leading-6 mb-7">
            We couldn't load this movie right now.
            Please try again.
          </p>

          <div className="flex flex-wrap justify-center gap-3">

            <button
              onClick={getShow}
              className="premium-button px-6 py-3 rounded-xl"
            >
              Try again
            </button>

            <button
              onClick={() => navigate("/movies")}
              className="premium-outline-button px-6 py-3 rounded-xl"
            >
              Browse movies
            </button>

          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="page-shell min-h-screen pb-24">

      {/* BACKDROP */}

      <section className="relative w-full h-[390px] md:h-[490px] overflow-hidden">

        <img
          src={backdropUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/65 to-[#08090d]/20" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d]/70 to-transparent" />

        <div className="absolute top-24 left-5 md:left-12 lg:left-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>

      </section>

      {/* MOVIE HERO */}

      <section className="relative max-w-7xl mx-auto px-5 md:px-10 lg:px-14 -mt-56 md:-mt-64">

        <div className="relative grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-end">

          <BlurCircle
            top="-60px"
            left="-90px"
          />

          {/* POSTER */}

          <div className="relative z-10 mx-auto md:mx-0 w-full max-w-[280px] lg:max-w-[320px]">

            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">

              <img
                src={posterUrl}
                alt={movieTitle}
                className="w-full aspect-[2/3] object-cover"
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

            </div>

            <div className="absolute -bottom-4 -right-4 bg-[#171820] border border-white/10 rounded-2xl px-4 py-3 shadow-xl">

              <div className="flex items-center gap-2">

                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />

                <div>
                  <p className="font-bold text-lg leading-none">
                    {movieRating.toFixed(1)}
                  </p>

                  <p className="text-[10px] text-gray-400 mt-1">
                    TMDB RATING
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* MOVIE INFORMATION */}

          <div className="relative z-10 pt-5 md:pt-0 pb-3">

            <div className="flex flex-wrap items-center gap-2 mb-4">

              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
                GENZSHOW ORIGINAL EXPERIENCE
              </span>

              {releaseYear && (
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300">
                  {releaseYear}
                </span>
              )}

            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
              {movieTitle}
            </h1>

            {movie?.tagline && (
              <p className="text-primary/90 italic mt-3 text-base md:text-lg">
                "{movie.tagline}"
              </p>
            )}

            {/* MOVIE META */}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6 text-sm text-gray-300">

              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {movieRating.toFixed(1)} / 10
              </span>

              <span className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-primary" />
                {movieRuntime > 0
                  ? timeFormat(movieRuntime)
                  : "Runtime unavailable"}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                {releaseYear || "Release date unavailable"}
              </span>

              <span className="uppercase text-xs tracking-widest text-gray-400">
                {movie?.original_language || "EN"}
              </span>

            </div>

            {/* GENRES */}

            {movieGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">

                {movieGenres.map((genre, index) => (
                  <span
                    key={`${genre}-${index}`}
                    className="px-4 py-2 rounded-full text-xs bg-white/[0.06] border border-white/10 text-gray-300"
                  >
                    {genre}
                  </span>
                ))}

              </div>
            )}

            {/* OVERVIEW */}

            <div className="mt-7 max-w-3xl">

              <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-3">
                About the movie
              </h2>

              <p className="text-gray-300 text-sm md:text-base leading-7">
                {movieOverview}
              </p>

            </div>

            {/* ACTION BUTTONS */}

            <div className="flex flex-wrap items-center gap-3 mt-8">

              <button
                type="button"
                onClick={handleTrailer}
                className="premium-outline-button rounded-xl px-6 py-3.5 flex items-center gap-2"
              >
                <PlayCircle size={19} />
                Watch trailer
              </button>

              <a
                href="#dateSelect"
                className="premium-button rounded-xl px-7 py-3.5 flex items-center gap-2"
              >
                <Ticket size={19} />
                Book tickets
              </a>

              <button
                type="button"
                onClick={handleFavorite}
                disabled={favoriteLoading}
                aria-label={
                  isFavorite
                    ? "Remove from favourites"
                    : "Add to favourites"
                }
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition ${
                  isFavorite
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-white/[0.05] border-white/10 text-gray-300 hover:text-primary hover:border-primary/40"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? "fill-current" : ""
                  }`}
                />
              </button>

              {isFavorite && (
                <span className="text-xs text-primary flex items-center gap-1">
                  <Check size={14} />
                  In your favourites
                </span>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* CAST */}

      {movieCasts.length > 0 && (
        <section className="section-shell mt-24">

          <div className="flex items-end justify-between mb-8">

            <div>
              <p className="text-primary text-xs tracking-[0.2em] font-bold uppercase mb-2">
                THE PEOPLE BEHIND IT
              </p>

              <h2 className="text-2xl md:text-3xl font-bold">
                Meet the cast
              </h2>
            </div>

            <span className="text-xs text-gray-500">
              {movieCasts.length} cast members
            </span>

          </div>

          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-5">

            {movieCasts.slice(0, 12).map((cast, index) => (

              <div
                key={cast?._id || cast?.id || index}
                className="group shrink-0 w-[115px] text-center"
              >

                <div className="w-[100px] h-[100px] mx-auto rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/60 transition duration-300">

                  <img
                    src={getImageUrl(cast?.profile_path)}
                    alt={cast?.name || "Cast member"}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />

                </div>

                <p className="text-sm font-semibold mt-3 truncate">
                  {cast?.name || "Unknown"}
                </p>

                {cast?.character && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {cast.character}
                  </p>
                )}

              </div>

            ))}

          </div>
        </section>
      )}

      {/* DATE AND SHOW SELECTION */}

      <section
        id="dateSelect"
        className="section-shell mt-20 scroll-mt-28"
      >

        <div className="mb-8">

          <p className="text-primary text-xs tracking-[0.2em] font-bold uppercase mb-2">
            YOUR MOVIE NIGHT STARTS HERE
          </p>

          <h2 className="text-2xl md:text-3xl font-bold">
            Choose your show
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            Select a date and find the perfect show for you.
          </p>

        </div>

        <div className="glass-panel rounded-3xl p-4 md:p-7">

          <DateSelect
            dateTime={show?.dateTime}
            id={id}
          />

        </div>

      </section>

      {/* RECOMMENDED MOVIES */}

      <section className="section-shell mt-24">

        <div className="flex flex-wrap items-end justify-between gap-4 mb-9">

          <div>
            <p className="text-primary text-xs tracking-[0.2em] font-bold uppercase mb-2">
              CURATED FOR YOUR NEXT WATCH
            </p>

            <h2 className="text-2xl md:text-3xl font-bold">
              You may also like
            </h2>

            <p className="text-gray-400 text-sm mt-2">
              More movies worth adding to your watchlist.
            </p>
          </div>

          <button
            onClick={() => navigate("/movies")}
            className="text-sm text-primary hover:text-white transition flex items-center gap-2"
          >
            Explore all movies
            <Play size={14} />
          </button>

        </div>

        {recommendedMovies.length > 0 ? (

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7 justify-items-center">

            {recommendedMovies.map((movieItem, index) => (
              <MovieCard
                key={movieItem?._id || movieItem?.id || index}
                movie={movieItem}
              />
            ))}

          </div>

        ) : (

          <div className="glass-panel rounded-2xl p-8 text-center">

            <Users className="w-8 h-8 text-gray-500 mx-auto mb-3" />

            <p className="text-gray-400 text-sm">
              More recommendations are coming soon.
            </p>

          </div>

        )}

      </section>

      {/* BOTTOM CTA */}

      <section className="section-shell mt-24">

        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-[#17121c] to-[#17121c] p-8 md:p-12">

          <div className="absolute -right-16 -top-24 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-7">

            <div>

              <p className="text-primary text-xs tracking-[0.2em] font-bold uppercase mb-3">
                MAKE IT A MOVIE NIGHT
              </p>

              <h2 className="text-2xl md:text-3xl font-bold">
                Your next cinematic experience awaits.
              </h2>

              <p className="text-gray-400 text-sm mt-3">
                Pick your show, grab your seats and enjoy the experience.
              </p>

            </div>

            <a
              href="#dateSelect"
              className="premium-button shrink-0 rounded-xl px-7 py-4 flex items-center gap-2"
            >
              <Ticket size={19} />
              Book your tickets
            </a>

          </div>
        </div>

      </section>

    </main>
  );
};

export default MovieDetails;
