
import React, { useState } from "react";

import {
    ArrowRight,
    Bot,
    Search,
    Sparkles,
    Star,
    X,
    Film,
    Clapperboard,
    WandSparkles,
    BrainCircuit,
    RotateCcw,
    MessageSquare,
    ChevronRight,
    Zap,
    CirclePlay,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";
import { trackAIRequestDNA } from "../utils/movieDNA";

const QUICK_PROMPTS = [
    {
        icon: "🧠",
        label: "Mind-bending",
        prompt: "Give me a mind-bending thriller with a huge twist",
    },
    {
        icon: "😂",
        label: "Feel good",
        prompt: "Find me a funny movie for a chill night",
    },
    {
        icon: "❤️",
        label: "Romance",
        prompt: "I want an emotional romantic movie",
    },
    {
        icon: "🔥",
        label: "Action",
        prompt: "Suggest an action movie with a powerful hero",
    },
    {
        icon: "👻",
        label: "Horror",
        prompt: "Find a scary horror movie for tonight",
    },
    {
        icon: "🚀",
        label: "Sci-fi",
        prompt: "Give me a futuristic sci-fi movie",
    },
];

const formatVibe = (vibe) => {
    if (!vibe) return "";

    if (typeof vibe === "string") return vibe;

    if (typeof vibe !== "object") return String(vibe);

    const parts = [];

    if (vibe.mood) parts.push(`Mood: ${vibe.mood}`);

    if (Array.isArray(vibe.moods) && vibe.moods.length) {
        parts.push(`Moods: ${vibe.moods.join(", ")}`);
    }

    if (Array.isArray(vibe.genres) && vibe.genres.length) {
        parts.push(`Genres: ${vibe.genres.join(", ")}`);
    }

    if (vibe.audience) parts.push(`Audience: ${vibe.audience}`);

    if (vibe.language) parts.push(`Language: ${vibe.language}`);

    if (
        vibe.minRuntime !== undefined &&
        vibe.maxRuntime !== undefined
    ) {
        parts.push(
            `Runtime: ${vibe.minRuntime}-${vibe.maxRuntime} min`
        );
    }

    if (vibe.minRating !== undefined) {
        parts.push(`Rating: ${vibe.minRating}+`);
    }

    return parts.join(" • ");
};

const getVibeGenres = (vibe) => {
    if (!vibe || typeof vibe !== "object") return [];
    return Array.isArray(vibe.genres) ? vibe.genres : [];
};

const getMovieId = (movie) => {
    return (
        movie?._id ||
        movie?.id ||
        movie?.tmdbId ||
        movie?.tmdb_id
    );
};

const GenZAI = () => {
    const navigate = useNavigate();
    const { axios } = useAppContext();

    const [prompt, setPrompt] = useState("");
    const [results, setResults] = useState([]);
    const [reason, setReason] = useState("");
    const [vibe, setVibe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (customPrompt = null) => {
        const cleanPrompt = String(customPrompt ?? prompt).trim();

        if (!cleanPrompt) {
            toast.error("Tell me what kind of movie you want.");
            return;
        }

        if (loading) return;

        setPrompt(cleanPrompt);
        setLoading(true);
        setError("");
        setHasSearched(true);
        setResults([]);
        setReason("");
        setVibe(null);

        try {
            const { data } = await axios.post(
                "/api/recommendation/ai",
                {
                    prompt: cleanPrompt,
                }
            );

            if (!data?.success) {
                throw new Error(
                    data?.message ||
                    "Unable to generate recommendations."
                );
            }

            const movies = Array.isArray(data?.movies)
                ? data.movies
                : Array.isArray(data?.results)
                ? data.results
                : [];

            setResults(movies);

            setReason(
                typeof data?.reason === "string"
                    ? data.reason
                    : ""
            );

            setVibe(
                data?.vibe ||
                data?.profile ||
                data?.filters ||
                null
            );

            await trackAIRequestDNA({
                axios,
                prompt: cleanPrompt,
            });

            if (movies.length === 0) {
                toast(
                    "I couldn't find matching movies in the current catalogue."
                );
            }
        } catch (err) {
            console.error(
                "GENZ AI ERROR:",
                err?.response?.data || err
            );

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong while generating recommendations.";

            setError(message);
            setResults([]);
            setReason("");
            setVibe(null);

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (quickPrompt) => {
        setPrompt(quickPrompt);
        handleSearch(quickPrompt);
    };

    const clearSearch = () => {
        if (loading) return;

        setPrompt("");
        setResults([]);
        setReason("");
        setVibe(null);
        setError("");
        setHasSearched(false);
    };

    const openMovie = (movie) => {
        const movieId = getMovieId(movie);

        if (!movieId) {
            console.error("MOVIE ID MISSING:", movie);
            return;
        }

        navigate(`/movies/${movieId}`);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const vibeGenres = getVibeGenres(vibe);

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#08080b] px-4 pb-24 pt-28 text-white sm:px-6 md:px-10 lg:px-16">

            {/* BACKGROUND ATMOSPHERE */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
                <div className="absolute right-[-150px] top-[500px] h-[350px] w-[350px] rounded-full bg-purple-600/[0.07] blur-[130px]" />
                <div className="absolute left-[-150px] top-[900px] h-[350px] w-[350px] rounded-full bg-primary/[0.06] blur-[130px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#08080b_80%)]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl">

                {/* HERO */}
                <section className="mx-auto max-w-4xl pt-5 text-center">

                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-2 text-xs font-medium tracking-wide text-primary shadow-[0_0_30px_rgba(255,0,80,0.08)]">
                        <Sparkles className="h-4 w-4" />
                        YOUR PERSONAL AI MOVIE ASSISTANT
                        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
                    </div>

                    <h1 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-7xl">
                        Your mood.
                        <br />
                        Your movies.
                        <br />
                        <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Your GENZ experience.
                        </span>
                    </h1>

                    <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base md:text-lg">
                        Forget endless scrolling. Tell GENZ AI what
                        you're in the mood for, and discover movies
                        that match your vibe.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-primary" />
                            Natural language discovery
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-gray-700 sm:block" />

                        <span className="flex items-center gap-2">
                            <Film className="h-4 w-4 text-primary" />
                            Catalogue-based matches
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-gray-700 sm:block" />

                        <span className="flex items-center gap-2">
                            <WandSparkles className="h-4 w-4 text-primary" />
                            Personalized discovery
                        </span>
                    </div>
                </section>

                {/* SEARCH EXPERIENCE */}
                <section className="mx-auto mt-14 max-w-4xl">

                    <div className="rounded-[28px] border border-white/[0.09] bg-[#111114]/90 p-3 shadow-[0_25px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-5">

                        <div className="mb-3 flex items-center gap-2 px-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>

                            <div>
                                <p className="text-xs font-semibold">
                                    GENZ AI
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    Tell us what you want to watch
                                </p>
                            </div>

                            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/[0.07] px-2.5 py-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                <span className="text-[10px] text-green-400">
                                    Ready to discover
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/[0.08] bg-[#09090c] p-3 transition focus-within:border-primary/40 sm:p-4">

                            <textarea
                                value={prompt}
                                onChange={(event) =>
                                    setPrompt(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        !event.shiftKey
                                    ) {
                                        event.preventDefault();
                                        handleSearch();
                                    }
                                }}
                                disabled={loading}
                                rows={3}
                                maxLength={500}
                                placeholder="Describe your perfect movie night... e.g. A dark psychological thriller with unexpected twists and a brilliant ending."
                                className="min-h-[90px] w-full resize-none bg-transparent px-1 py-2 text-sm leading-7 text-white outline-none placeholder:text-gray-600 disabled:opacity-50 sm:text-base"
                            />

                            <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">

                                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    AI-powered movie discovery
                                </div>

                                <div className="flex items-center gap-2">
                                    {prompt && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            disabled={loading}
                                            className="rounded-xl p-2 text-gray-500 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        disabled={loading || !prompt.trim()}
                                        onClick={() => handleSearch()}
                                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold transition hover:bg-primary-dull hover:shadow-[0_0_25px_rgba(255,0,80,0.2)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:text-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Thinking...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Discover Movies
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QUICK PROMPTS */}
                        <div className="mt-5 px-1 pb-1">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                    Explore by mood
                                </p>

                                <span className="text-[10px] text-gray-600">
                                    Quick suggestions
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {QUICK_PROMPTS.map((item) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            handleQuickPrompt(item.prompt)
                                        }
                                        className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-xs text-gray-400 transition hover:border-primary/40 hover:bg-primary/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <span>{item.icon}</span>
                                        {item.label}
                                        <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ERROR */}
                {error && (
                    <section className="mx-auto mt-8 max-w-4xl">
                        <div className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                                <Bot className="h-5 w-5 text-red-400" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-red-300">
                                    GENZ AI couldn't complete the request
                                </h3>

                                <p className="mt-1 break-words text-sm leading-6 text-red-300/70">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => handleSearch()}
                                    disabled={loading}
                                    className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-300 transition hover:text-white"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Try again
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* LOADING STATE */}
                {loading && (
                    <section className="mx-auto mt-16 max-w-4xl">
                        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111114]/80 px-6 py-16 text-center">

                            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                                <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
                                <div className="absolute inset-2 rounded-full border border-primary/20" />
                                <BrainCircuit className="h-8 w-8 text-primary" />
                            </div>

                            <h2 className="mt-7 text-xl font-semibold">
                                Understanding your vibe
                                <span className="animate-pulse text-primary">
                                    ...
                                </span>
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                                GENZ AI is interpreting your preferences
                                and finding matching movies from the
                                catalogue.
                            </p>

                            <div className="mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
                                <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
                            </div>

                            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gray-600">
                                Finding your next favourite movie
                            </p>
                        </div>
                    </section>
                )}

                {/* AI RESULTS */}
                {!loading && hasSearched && results.length > 0 && (
                    <section className="mx-auto mt-16 max-w-7xl">

                        {/* RESULT HEADING */}
                        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    <Sparkles className="h-4 w-4" />
                                    Your AI discovery
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    Your next movie
                                    <span className="text-primary"> awaits.</span>
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    Selected based on your mood and preferences.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={clearSearch}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-gray-300 transition hover:border-primary/30 hover:text-white"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                New discovery
                            </button>
                        </div>

                        {/* AI INSIGHT */}
                        <div className="relative mb-12 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.10] via-[#151116] to-[#101014] p-5 sm:p-8">

                            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.10] blur-[80px]" />

                            <div className="relative flex flex-col gap-5 sm:flex-row">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/15">
                                    <Bot className="h-6 w-6 text-primary" />
                                </div>

                                <div className="min-w-0 flex-1">

                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                            GENZ AI INSIGHT
                                        </p>

                                        <span className="rounded-full border border-green-500/20 bg-green-500/[0.07] px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-green-400">
                                            Matches found
                                        </span>
                                    </div>

                                    <h3 className="mt-3 text-xl font-semibold sm:text-2xl">
                                        We understood your vibe.
                                    </h3>

                                    {reason && (
                                        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
                                            {reason}
                                        </p>
                                    )}

                                    {vibe && (
                                        <div className="mt-6">
                                            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                                                YOUR DISCOVERY PROFILE
                                            </p>

                                            <div className="flex flex-wrap gap-2">

                                                {vibe?.mood && (
                                                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary">
                                                        {vibe.mood}
                                                    </span>
                                                )}

                                                {Array.isArray(vibe?.moods) &&
                                                    vibe.moods.map((mood) => (
                                                        <span
                                                            key={mood}
                                                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300"
                                                        >
                                                            {mood}
                                                        </span>
                                                    ))}

                                                {vibeGenres.map((genre) => (
                                                    <span
                                                        key={genre}
                                                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300"
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}

                                                {vibe?.audience && (
                                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300">
                                                        {vibe.audience}
                                                    </span>
                                                )}

                                                {vibe?.language && (
                                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300">
                                                        {vibe.language}
                                                    </span>
                                                )}

                                                {vibe?.minRuntime !== undefined &&
                                                    vibe?.maxRuntime !== undefined && (
                                                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300">
                                                            {vibe.minRuntime}-{vibe.maxRuntime} min
                                                        </span>
                                                    )}

                                                {vibe?.minRating !== undefined && (
                                                    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300">
                                                        <Star className="h-3 w-3 fill-primary text-primary" />
                                                        {vibe.minRating}+
                                                    </span>
                                                )}
                                            </div>

                                            {!formatVibe(vibe) && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    GENZ AI identified a personalized movie vibe for you.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MOVIE RESULTS */}
                        <div className="mb-7 flex items-end justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                    <Clapperboard className="h-4 w-4" />
                                    AI matched movies
                                </div>

                                <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                                    Made for your vibe
                                </h3>
                            </div>

                            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-400">
                                {results.length}{" "}
                                {results.length === 1 ? "movie" : "movies"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
                            {results.map((movie, index) => (
                                <div
                                    key={getMovieId(movie) || index}
                                    className="group min-w-0 transition duration-300 hover:-translate-y-1"
                                >
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>

                        {/* DISCOVERY FOOTER */}
                        <div className="mt-14 flex flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.025] px-5 py-9 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                Still looking for something different?
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                                Describe another mood and let GENZ AI
                                discover a new collection of movies.
                            </p>

                            <button
                                type="button"
                                onClick={clearSearch}
                                className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold transition hover:bg-primary-dull active:scale-95"
                            >
                                Discover something new
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </section>
                )}

                {/* EMPTY RESULTS */}
                {!loading && hasSearched && !error && results.length === 0 && (
                    <section className="mx-auto mt-16 max-w-2xl">
                        <div className="rounded-3xl border border-white/[0.08] bg-[#111114]/80 px-6 py-14 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                <Search className="h-7 w-7 text-gray-500" />
                            </div>

                            <h2 className="mt-6 text-2xl font-bold">
                                No exact matches found.
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
                                Your vibe might be a little too specific.
                                Try changing your mood, genre, language,
                                or the kind of movie experience you want.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    handleSearch(
                                        "Give me something really good to watch tonight"
                                    )
                                }
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold transition hover:bg-primary-dull"
                            >
                                Try another vibe
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </section>
                )}

                {/* INITIAL EXPERIENCE */}
                {!loading && !hasSearched && (
                    <section className="mx-auto mt-20 max-w-6xl">

                        <div className="mb-8 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                THE EXPERIENCE
                            </p>

                            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                                Movie discovery, reimagined.
                            </h2>

                            <p className="mt-3 text-sm text-gray-500">
                                Three simple steps to your next favourite movie.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">

                            <div className="group rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-primary/30 hover:bg-white/[0.04]">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                    </div>

                                    <span className="text-3xl font-bold text-white/[0.06]">
                                        01
                                    </span>
                                </div>

                                <h3 className="mt-6 text-lg font-semibold">
                                    Describe your vibe
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-gray-500">
                                    Tell GENZ AI about your mood,
                                    preferred genre, language, or
                                    the movie experience you want.
                                </p>
                            </div>

                            <div className="group rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-primary/30 hover:bg-white/[0.04]">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                        <BrainCircuit className="h-5 w-5 text-primary" />
                                    </div>

                                    <span className="text-3xl font-bold text-white/[0.06]">
                                        02
                                    </span>
                                </div>

                                <h3 className="mt-6 text-lg font-semibold">
                                    AI understands you
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-gray-500">
                                    GENZ AI processes your natural
                                    language preferences and searches
                                    for matching movies.
                                </p>
                            </div>

                            <div className="group rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-primary/30 hover:bg-white/[0.04]">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                        <CirclePlay className="h-5 w-5 text-primary" />
                                    </div>

                                    <span className="text-3xl font-bold text-white/[0.06]">
                                        03
                                    </span>
                                </div>

                                <h3 className="mt-6 text-lg font-semibold">
                                    Discover your movie
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-gray-500">
                                    Explore the recommendations and
                                    open a movie to discover more
                                    details.
                                </p>
                            </div>

                        </div>

                        {/* BOTTOM NOTE */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-gray-600">
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            Powered by GENZ AI movie discovery
                            <span className="text-gray-700">•</span>
                            Discover movies from the GENZSHOW catalogue
                        </div>

                    </section>
                )}
            </div>
        </main>
    );
};

export default GenZAI;
