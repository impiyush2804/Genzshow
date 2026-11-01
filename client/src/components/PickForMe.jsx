
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Brain,
    CalendarDays,
    Check,
    Clock3,
    Ghost,
    Heart,
    Laugh,
    RefreshCw,
    Smile,
    Sparkles,
    Users,
    User,
    X,
    Zap,
    Film,
    Star,
} from "lucide-react";

import { useAppContext } from "../context/AppContext";


const MOODS = [
    {
        id: "fun",
        label: "Fun & Comedy",
        description: "I just want to have a good time",
        icon: Laugh,
        genres: [35, 12],
    },
    {
        id: "action",
        label: "Adrenaline",
        description: "Give me something intense",
        icon: Zap,
        genres: [28, 53],
    },
    {
        id: "romantic",
        label: "Romantic",
        description: "Something for the heart",
        icon: Heart,
        genres: [10749, 18],
    },
    {
        id: "horror",
        label: "Scary",
        description: "I want to be scared",
        icon: Ghost,
        genres: [27, 53],
    },
    {
        id: "mind",
        label: "Mind-bending",
        description: "Make me think",
        icon: Brain,
        genres: [878, 9648, 53],
    },
    {
        id: "emotional",
        label: "Emotional",
        description: "Something meaningful",
        icon: Heart,
        genres: [18, 10751],
    },
    {
        id: "chill",
        label: "Easy watching",
        description: "Something light and relaxing",
        icon: Smile,
        genres: [35, 16, 10751],
    },
];

const PEOPLE = [
    {
        id: "solo",
        label: "Solo",
        description: "Just me",
        icon: User,
    },
    {
        id: "date",
        label: "Date night",
        description: "Movie night for two",
        icon: Heart,
    },
    {
        id: "friends",
        label: "With friends",
        description: "Movie night with the squad",
        icon: Users,
    },
    {
        id: "family",
        label: "Family",
        description: "Something everyone can enjoy",
        icon: Users,
    },
];

const DURATIONS = [
    {
        id: "short",
        label: "Under 90 minutes",
        description: "A quick movie experience",
        min: 0,
        max: 89,
        icon: Zap,
    },
    {
        id: "medium",
        label: "90–120 minutes",
        description: "Perfect movie night",
        min: 90,
        max: 120,
        icon: Clock3,
    },
    {
        id: "long",
        label: "Over 2 hours",
        description: "I'm here for the experience",
        min: 121,
        max: 500,
        icon: Film,
    },
];

const getMovieGenres = (movie) => {
    if (Array.isArray(movie?.genre_ids)) {
        return movie.genre_ids;
    }

    if (Array.isArray(movie?.genres)) {
        return movie.genres
            .map((genre) =>
                typeof genre === "object"
                    ? genre?.id
                    : genre
            )
            .filter(Boolean);
    }

    return [];
};

const getRuntime = (movie) => {
    const runtime = Number(movie?.runtime);

    return Number.isFinite(runtime) && runtime > 0
        ? runtime
        : null;
};


const PickForMe = () => {

    const navigate = useNavigate();

    const {
        shows = [],
        image_base_url,
        isShowsLoading,
    } = useAppContext();

    const movies = Array.isArray(shows) ? shows : [];

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    const [mood, setMood] = useState(null);
    const [people, setPeople] = useState(null);
    const [duration, setDuration] = useState(null);

    const [showResult, setShowResult] = useState(false);
    const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);


    // Reset the recommendation flow
    const reset = () => {
        setStep(1);
        setMood(null);
        setPeople(null);
        setDuration(null);
        setShowResult(false);
        setSelectedMovieIndex(0);
    };

    const close = () => {
        setIsOpen(false);
        reset();
    };


    // Score movies against the selected preferences
    const recommendedMovies = useMemo(() => {

        if (!mood || !duration || movies.length === 0) {
            return [];
        }

        return movies
            .map((movie) => {

                let score = 0;

                const movieGenres = getMovieGenres(movie);

                const matchingGenres = movieGenres.filter(
                    (genre) => mood.genres.includes(Number(genre))
                );

                score += matchingGenres.length * 20;

                const runtime = getRuntime(movie);

                if (runtime !== null) {
                    if (
                        runtime >= duration.min &&
                        runtime <= duration.max
                    ) {
                        score += 30;
                    } else {
                        const distance = Math.min(
                            Math.abs(runtime - duration.min),
                            Math.abs(runtime - duration.max)
                        );

                        score += Math.max(0, 15 - distance / 10);
                    }
                }

                const rating = Number(movie?.vote_average) || 0;
                score += rating * 2;

                if (people?.id === "family") {
                    if (
                        movieGenres.includes(10751) ||
                        movieGenres.includes(16)
                    ) {
                        score += 20;
                    }
                }

                if (people?.id === "date") {
                    if (
                        movieGenres.includes(10749) ||
                        movieGenres.includes(35)
                    ) {
                        score += 20;
                    }
                }

                if (people?.id === "friends") {
                    if (
                        movieGenres.includes(28) ||
                        movieGenres.includes(35) ||
                        movieGenres.includes(12)
                    ) {
                        score += 15;
                    }
                }

                return { movie, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((item) => item.movie);

    }, [movies, mood, people, duration]);


    const selectedMovie =
        recommendedMovies[selectedMovieIndex];


    // Build a valid TMDB poster URL
    const getPoster = (movie) => {

        const path = movie?.poster_path;

        if (!path) return null;

        if (path.startsWith("http")) {
            return path;
        }

        const base =
            image_base_url ||
            "https://image.tmdb.org/t/p";

        const cleanBase = base
            .replace(/\/+$/, "")
            .replace(/\/(w\d+|original)$/, "");

        return `${cleanBase}/w500/${path.replace(/^\/+/, "")}`;
    };


    const openPicker = () => {
        reset();
        setIsOpen(true);
    };

    const handleMood = (selectedMood) => {
        setMood(selectedMood);
        setStep(2);
    };

    const handlePeople = (selectedPeople) => {
        setPeople(selectedPeople);
        setStep(3);
    };

    const handleDuration = (selectedDuration) => {
        setDuration(selectedDuration);
        setSelectedMovieIndex(0);
        setShowResult(true);
    };

    const viewMovie = () => {

        if (!selectedMovie) return;

        const movieId = selectedMovie._id || selectedMovie.id;

        if (!movieId) return;

        close();
        navigate(`/movies/${movieId}`);
    };


    const SelectionCard = ({
        item,
        selected,
        onClick,
    }) => {

        const Icon = item.icon;

        return (
            <button
                type="button"
                onClick={onClick}
                className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ${
                    selected
                        ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10"
                        : "border-white/[0.08] bg-white/[0.025] hover:border-pink-500/40 hover:bg-white/[0.06]"
                }`}
            >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                    selected
                        ? "bg-pink-500 text-white"
                        : "bg-white/[0.06] text-zinc-400 group-hover:bg-pink-500/10 group-hover:text-pink-400"
                }`}>
                    <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">
                        {item.label}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                        {item.description}
                    </p>
                </div>

                <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                    selected
                        ? "border-pink-500 bg-pink-500 text-white"
                        : "border-white/20 text-transparent"
                }`}>
                    <Check size={14} />
                </div>
            </button>
        );
    };


    return (
        <>
            {/* PICK FOR ME SECTION */}

            <section className="relative overflow-hidden px-6 py-20 md:px-16 lg:px-36">

                <div className="pointer-events-none absolute left-1/4 top-10 h-72 w-72 rounded-full bg-pink-600/[0.08] blur-[120px]" />

                <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-red-600/[0.08] blur-[120px]" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#101015]">

                    <div className="absolute inset-0 bg-gradient-to-br from-pink-600/[0.13] via-transparent to-red-600/[0.12]" />

                    <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/[0.05]" />

                    <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full border border-white/[0.05]" />

                    <div className="relative z-10 grid items-center gap-12 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-14 lg:p-16">

                        <div>

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-400">
                                <Sparkles size={15} />
                                Your personal movie guide
                            </div>

                            <h2 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                                The perfect movie.
                                <span className="block bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                                    Just your vibe.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400 md:text-base">
                                Not sure what to watch? Tell us your mood,
                                who's joining you and how much time you have.
                                We'll find a movie that matches your night.
                            </p>

                            <button
                                type="button"
                                onClick={openPicker}
                                className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-pink-600 to-red-500 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-pink-600/20 transition duration-300 hover:-translate-y-1 hover:shadow-pink-500/30"
                            >
                                <Sparkles size={18} />
                                Find My Movie
                                <ArrowRight size={18} />
                            </button>

                            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-zinc-500">
                                <span className="flex items-center gap-2">
                                    <Check size={14} className="text-pink-400" />
                                    Personalised picks
                                </span>

                                <span className="flex items-center gap-2">
                                    <Check size={14} className="text-pink-400" />
                                    Quick and easy
                                </span>

                                <span className="flex items-center gap-2">
                                    <Check size={14} className="text-pink-400" />
                                    Made for your mood
                                </span>
                            </div>

                        </div>


                        {/* Decorative visual */}

                        <div className="relative mx-auto hidden w-full max-w-sm md:block">

                            <div className="absolute inset-8 rounded-full bg-pink-600/20 blur-[80px]" />

                            <div className="relative rotate-[-7deg] rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl">

                                <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#36142b] via-[#17121f] to-[#351014] p-7">

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-pink-300">
                                            Tonight's mood
                                        </span>

                                        <Sparkles size={19} className="text-pink-400" />
                                    </div>

                                    <div className="my-10 flex justify-center">
                                        <div className="flex h-36 w-36 items-center justify-center rounded-full border border-pink-300/20 bg-pink-500/10 shadow-[0_0_80px_rgba(236,72,153,0.2)]">
                                            <Film size={65} className="text-pink-300" />
                                        </div>
                                    </div>

                                    <p className="text-2xl font-bold text-white">
                                        Your next
                                        <br />
                                        favourite film.
                                    </p>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        One vibe. One perfect pick.
                                    </p>

                                    <div className="mt-7 flex gap-2">
                                        <span className="rounded-full bg-pink-500/20 px-3 py-1.5 text-xs text-pink-300">
                                            Mood
                                        </span>
                                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-zinc-300">
                                            Genre
                                        </span>
                                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-zinc-300">
                                            Time
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <div className="absolute -bottom-5 -left-7 rounded-2xl border border-white/10 bg-[#17171f] px-5 py-3 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/15 text-pink-400">
                                        <Star size={17} fill="currentColor" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            Made for you
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Your personal pick
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* RECOMMENDATION MODAL */}

            {isOpen && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-lg"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            close();
                        }
                    }}
                >

                    <div className="relative my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#101015] shadow-2xl shadow-black/50">

                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close recommendation"
                            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <X size={19} />
                        </button>


                        {!showResult ? (

                            <div className="p-6 sm:p-9">

                                {/* Modal header */}

                                <div className="mb-8">

                                    <div className="mb-3 flex items-center gap-2 text-pink-400">
                                        <Sparkles size={18} />
                                        <span className="text-sm font-semibold">
                                            GENZSHOW PERSONAL PICK
                                        </span>
                                    </div>

                                    <h2 className="pr-10 text-2xl font-bold text-white sm:text-3xl">
                                        {step === 1 && "What's your vibe today?"}
                                        {step === 2 && "Who's watching with you?"}
                                        {step === 3 && "How much time do you have?"}
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-500">
                                        A few quick choices. One great movie night.
                                    </p>

                                    <div className="mt-7 flex gap-2">
                                        {[1, 2, 3].map((number) => (
                                            <div
                                                key={number}
                                                className={`h-1.5 flex-1 rounded-full transition ${
                                                    number <= step
                                                        ? "bg-gradient-to-r from-pink-500 to-red-500"
                                                        : "bg-white/10"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    <p className="mt-3 text-xs font-medium text-zinc-600">
                                        STEP {step} OF 3
                                    </p>

                                </div>


                                {/* Step 1: Mood */}

                                {step === 1 && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {MOODS.map((item) => (
                                            <SelectionCard
                                                key={item.id}
                                                item={item}
                                                selected={mood?.id === item.id}
                                                onClick={() => handleMood(item)}
                                            />
                                        ))}
                                    </div>
                                )}


                                {/* Step 2: People */}

                                {step === 2 && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {PEOPLE.map((item) => (
                                            <SelectionCard
                                                key={item.id}
                                                item={item}
                                                selected={people?.id === item.id}
                                                onClick={() => handlePeople(item)}
                                            />
                                        ))}
                                    </div>
                                )}


                                {/* Step 3: Duration */}

                                {step === 3 && (
                                    <div className="grid gap-3">
                                        {DURATIONS.map((item) => (
                                            <SelectionCard
                                                key={item.id}
                                                item={item}
                                                selected={duration?.id === item.id}
                                                onClick={() => handleDuration(item)}
                                            />
                                        ))}
                                    </div>
                                )}


                                {/* Back button */}

                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep((current) => current - 1)}
                                        className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
                                    >
                                        <ArrowLeft size={16} />
                                        Go back
                                    </button>
                                )}

                            </div>

                        ) : (

                            /* RESULT */

                            <div className="p-6 sm:p-9">

                                <div className="mb-8 text-center">

                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-pink-400">
                                        <Sparkles size={25} />
                                    </div>

                                    <p className="text-xs font-bold tracking-[0.2em] text-pink-400">
                                        YOUR GENZSHOW PICK
                                    </p>

                                    <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                                        Your movie night starts here.
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-500">
                                        Based on your mood, company and available time.
                                    </p>

                                </div>


                                {isShowsLoading ? (

                                    <div className="rounded-2xl border border-white/10 p-10 text-center text-zinc-400">
                                        Finding your movie...
                                    </div>

                                ) : selectedMovie ? (

                                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

                                        <div className="flex flex-col sm:flex-row">

                                            <div className="h-[360px] w-full shrink-0 bg-white/5 sm:h-auto sm:w-64">

                                                {getPoster(selectedMovie) ? (
                                                    <img
                                                        src={getPoster(selectedMovie)}
                                                        alt={selectedMovie.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-64 items-center justify-center text-zinc-600">
                                                        <Film size={42} />
                                                    </div>
                                                )}

                                            </div>


                                            <div className="flex flex-1 flex-col p-6">

                                                <div className="flex items-center gap-2">

                                                    <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-400">
                                                        GENZ PICK
                                                    </span>

                                                    {Number(selectedMovie.vote_average) > 0 && (
                                                        <span className="flex items-center gap-1 text-sm text-amber-400">
                                                            <Star size={14} fill="currentColor" />
                                                            {Number(selectedMovie.vote_average).toFixed(1)}
                                                        </span>
                                                    )}

                                                </div>

                                                <h3 className="mt-4 text-2xl font-bold text-white">
                                                    {selectedMovie.title}
                                                </h3>

                                                {selectedMovie.release_date && (
                                                    <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                                                        <CalendarDays size={15} />
                                                        {new Date(selectedMovie.release_date).getFullYear()}
                                                    </p>
                                                )}

                                                <p className="mt-5 line-clamp-5 text-sm leading-7 text-zinc-400">
                                                    {selectedMovie.overview ||
                                                        "A movie picked especially for your vibe."}
                                                </p>

                                                <div className="mt-auto flex flex-col gap-3 pt-7">

                                                    <button
                                                        type="button"
                                                        onClick={viewMovie}
                                                        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-red-500 px-5 py-3.5 font-semibold text-white transition hover:brightness-110"
                                                    >
                                                        View Movie
                                                        <ArrowRight size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMovieIndex(0)}
                                                        className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                                                    >
                                                        <RefreshCw size={16} />
                                                        Show top pick
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">

                                        <Film className="mx-auto mb-4 text-zinc-600" size={38} />

                                        <h3 className="text-lg font-semibold text-white">
                                            No matching movies found
                                        </h3>

                                        <p className="mt-2 text-sm text-zinc-500">
                                            We couldn't find a movie matching these preferences in the currently available listings.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={reset}
                                            className="mt-6 rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-500"
                                        >
                                            Try different preferences
                                        </button>

                                    </div>

                                )}

                                <button
                                    type="button"
                                    onClick={reset}
                                    className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                                >
                                    <RefreshCw size={15} />
                                    Start over
                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}

        </>
    );
};

export default PickForMe;
