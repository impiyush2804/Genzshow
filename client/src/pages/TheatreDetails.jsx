
import React, { useEffect, useMemo, useState } from "react";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock3,
    MapPin,
    MonitorPlay,
    Navigation,
    Ticket,
    Sparkles,
    Armchair,
    Building2,
    Clapperboard,
    Film,
    ChevronRight,
    IndianRupee,
    RefreshCw,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";

const TheatreDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { axios, image_base_url } = useAppContext();

    const [theatre, setTheatre] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");

    // FETCH THEATRE AND SHOWS
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const theatreResponse = await axios.get(
                    `/api/theatre/${id}`
                );

                if (!theatreResponse.data.success) {
                    toast.error(
                        theatreResponse.data.message || "Theatre not found"
                    );
                    setTheatre(null);
                    return;
                }

                setTheatre(theatreResponse.data.theatre);

                const showsResponse = await axios.get(
                    `/api/theatre/${id}/shows`
                );

                if (showsResponse.data.success) {
                    setShows(showsResponse.data.shows || []);
                } else {
                    setShows([]);
                }
            } catch (error) {
                console.error("THEATRE DETAILS ERROR:", error);

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load theatre"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // AVAILABLE DATES
    const availableDates = useMemo(() => {
        return [
            ...new Set(
                shows
                    .filter((show) => show.showDateTime)
                    .map((show) =>
                        new Date(show.showDateTime)
                            .toISOString()
                            .split("T")[0]
                    )
            ),
        ].sort();
    }, [shows]);

    // DEFAULT SELECTED DATE
    useEffect(() => {
        if (availableDates.length > 0) {
            setSelectedDate((current) => {
                if (current && availableDates.includes(current)) {
                    return current;
                }

                return availableDates[0];
            });
        } else {
            setSelectedDate("");
        }
    }, [availableDates]);

    // MOVIES FOR SELECTED DATE
    const moviesForDate = useMemo(() => {
        const selectedShows = shows.filter((show) => {
            const date = new Date(show.showDateTime)
                .toISOString()
                .split("T")[0];

            return date === selectedDate && show.movie;
        });

        const grouped = {};

        selectedShows.forEach((show) => {
            const movieId = String(show.movie._id);

            if (!grouped[movieId]) {
                grouped[movieId] = {
                    movie: show.movie,
                    shows: [],
                };
            }

            grouped[movieId].shows.push(show);
        });

        return Object.values(grouped);
    }, [shows, selectedDate]);

    // DATE FORMAT
    const formatDate = (date) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
            }
        );
    };

    const getDateParts = (date) => {
        const parsed = new Date(`${date}T00:00:00`);

        return {
            day: parsed.toLocaleDateString("en-IN", {
                day: "2-digit",
            }),
            month: parsed.toLocaleDateString("en-IN", {
                month: "short",
            }),
            weekday: parsed.toLocaleDateString("en-IN", {
                weekday: "short",
            }),
        };
    };

    // TIME FORMAT
    const formatTime = (dateTime) => {
        return new Date(dateTime).toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    // DIRECTIONS
    const openDirections = () => {
        const lat = theatre?.location?.lat;
        const lon = theatre?.location?.lon;

        if (
            typeof lat === "number" &&
            typeof lon === "number"
        ) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                "_blank",
                "noopener,noreferrer"
            );
        } else {
            const query = encodeURIComponent(
                `${theatre.name}, ${theatre.city}`
            );

            window.open(
                `https://www.google.com/maps/search/?api=1&query=${query}`,
                "_blank",
                "noopener,noreferrer"
            );
        }
    };

    // BOOKING NAVIGATION
    const handleSelectShow = (movie, show) => {
        if (!show?._id || !movie?._id) {
            toast.error("Show information is incomplete");
            return;
        }

        navigate(
            `/movies/${movie._id}/${selectedDate}?showId=${show._id}&theatreId=${id}`
        );
    };

    // LOADING
    if (loading) return <Loading />;

    // NOT FOUND
    if (!theatre) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#08080b] px-5 text-center text-white">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400">
                    <Building2 size={34} />
                </div>

                <h1 className="mt-6 text-2xl font-bold">
                    Theatre not found
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    This cinema may have been removed or is unavailable.
                </p>

                <button
                    onClick={() => navigate("/theatres")}
                    className="mt-7 flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                    <ArrowLeft size={16} />
                    Back to Theatres
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-hidden bg-[#08080b] pb-24 text-white">

            {/* CINEMATIC BACKGROUND */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-red-600/[0.055] blur-[120px]" />
                <div className="absolute -right-40 top-96 h-96 w-96 rounded-full bg-purple-600/[0.045] blur-[120px]" />
            </div>

            <main className="relative mx-auto max-w-7xl px-5 pt-28 sm:px-8 md:pt-32">

                {/* BREADCRUMB */}
                <div className="mb-7 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <button
                        onClick={() => navigate("/")}
                        className="transition hover:text-white"
                    >
                        Home
                    </button>

                    <ChevronRight size={13} />

                    <button
                        onClick={() => navigate("/theatres")}
                        className="transition hover:text-white"
                    >
                        Theatres
                    </button>

                    <ChevronRight size={13} />

                    <span className="max-w-[180px] truncate text-zinc-300">
                        {theatre.name}
                    </span>
                </div>

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate("/theatres")}
                    className="mb-7 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                >
                    <ArrowLeft size={17} />
                    Back to cinemas
                </button>

                {/* THEATRE HERO */}
                <section className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-gradient-to-br from-[#191419] via-[#111115] to-[#0d0d11]">

                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(225,29,72,0.16),transparent_45%)]" />

                    <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-red-500/[0.08] blur-[100px]" />

                    <div className="relative p-6 sm:p-9 md:p-11">

                        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">

                            <div className="flex gap-5 sm:gap-6">

                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/20 to-pink-500/[0.05] text-red-400 sm:h-24 sm:w-24">
                                    <MonitorPlay size={39} strokeWidth={1.4} />
                                </div>

                                <div className="min-w-0">

                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300">
                                        <Sparkles size={12} />
                                        Cinema experience
                                    </div>

                                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                                        {theatre.name}
                                    </h1>

                                    {theatre.theatreChain && (
                                        <p className="mt-2 text-sm text-zinc-400">
                                            {theatre.theatreChain}
                                        </p>
                                    )}

                                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-zinc-400">

                                        <span className="flex items-center gap-2">
                                            <MapPin size={15} className="text-red-400" />
                                            {theatre.city || "Location unavailable"}
                                        </span>

                                        <span className="flex items-center gap-2">
                                            <MonitorPlay size={15} />
                                            {theatre.screens || 0} Screens
                                        </span>

                                        <span className="flex items-center gap-2">
                                            <Armchair size={15} />
                                            {(theatre.totalSeats || 0).toLocaleString("en-IN")} Seats
                                        </span>

                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={openDirections}
                                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-white"
                            >
                                <Navigation size={16} />
                                Get directions
                                <ArrowRight size={14} />
                            </button>
                        </div>

                        {/* STATS */}
                        <div className="mt-9 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-7 sm:grid-cols-4">

                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                    Theatre type
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    {theatre.type || "Cinema"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                    Average ticket
                                </p>
                                <p className="mt-2 flex items-center gap-1 text-sm font-semibold">
                                    <IndianRupee size={14} className="text-red-400" />
                                    {theatre.averageTicketPrice
                                        ? Math.round(theatre.averageTicketPrice)
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                    Available dates
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    {availableDates.length} Days
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                    Scheduled shows
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    {shows.length} Shows
                                </p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* SHOWTIME SECTION */}
                <section className="mt-12">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
                                <Clapperboard size={15} />
                                What's playing
                            </div>

                            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                Movies & Showtimes
                            </h2>

                            <p className="mt-2 text-sm text-zinc-500">
                                Choose your movie, select a showtime and book your seats.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Ticket size={15} className="text-red-400" />
                            {shows.length} scheduled shows
                        </div>
                    </div>

                    {/* DATE SELECTOR */}
                    {availableDates.length > 0 && (
                        <div className="mt-8">

                            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                <CalendarDays size={15} className="text-red-400" />
                                Select date
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-3">
                                {availableDates.map((date) => {
                                    const parts = getDateParts(date);
                                    const isActive = selectedDate === date;

                                    return (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={`flex min-w-[82px] shrink-0 flex-col items-center rounded-2xl border px-4 py-4 transition duration-200 ${
                                                isActive
                                                    ? "border-red-500/40 bg-gradient-to-b from-red-500/20 to-red-500/[0.06] text-white shadow-lg shadow-red-950/20"
                                                    : "border-white/[0.07] bg-white/[0.025] text-zinc-500 hover:border-white/20 hover:text-white"
                                            }`}
                                        >
                                            <span className={`text-[10px] font-semibold uppercase tracking-widest ${isActive ? "text-red-300" : ""}`}>
                                                {parts.weekday}
                                            </span>

                                            <span className="mt-2 text-2xl font-bold">
                                                {parts.day}
                                            </span>

                                            <span className={`mt-1 text-[10px] uppercase ${isActive ? "text-red-300" : "text-zinc-600"}`}>
                                                {parts.month}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* MOVIE LIST */}
                    <div className="mt-7">

                        {moviesForDate.length > 0 ? (
                            <div className="space-y-5">

                                {moviesForDate.map(({ movie, shows: movieShows }) => (

                                    <article
                                        key={movie._id}
                                        className="group overflow-hidden rounded-[26px] border border-white/[0.075] bg-gradient-to-br from-[#151519] to-[#0e0e12] transition hover:border-red-500/20"
                                    >
                                        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-7">

                                            {/* POSTER */}
                                            <div className="relative mx-auto w-32 shrink-0 sm:mx-0 sm:w-36">
                                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl">
                                                    {movie.poster_path ? (
                                                        <img
                                                            src={`${image_base_url}${movie.poster_path}`}
                                                            alt={movie.title || "Movie poster"}
                                                            className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex aspect-[2/3] items-center justify-center text-zinc-600">
                                                            <Film size={35} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#17171b] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                                                    Now showing
                                                </div>
                                            </div>

                                            {/* MOVIE DETAILS */}
                                            <div className="min-w-0 flex-1 pt-2">

                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                                                            {movie.title}
                                                        </h3>

                                                        {movie.release_date && (
                                                            <p className="mt-2 text-xs text-zinc-500">
                                                                {movie.release_date}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-[10px] font-semibold text-emerald-400">
                                                        {movieShows.length} Showtimes
                                                    </span>
                                                </div>

                                                {/* SHOWTIMES */}
                                                <div className="mt-7">
                                                    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                                        <Clock3 size={14} className="text-red-400" />
                                                        Available showtimes
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                                                        {movieShows
                                                            .slice()
                                                            .sort(
                                                                (a, b) =>
                                                                    new Date(a.showDateTime) -
                                                                    new Date(b.showDateTime)
                                                            )
                                                            .map((show) => (
                                                                <button
                                                                    key={show._id}
                                                                    onClick={() =>
                                                                        handleSelectShow(movie, show)
                                                                    }
                                                                    className="group/time flex items-center justify-between gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3 py-3.5 text-left transition duration-200 hover:border-red-500/40 hover:bg-red-500/[0.08]"
                                                                >
                                                                    <div>
                                                                        <p className="text-sm font-bold text-zinc-200 transition group-hover/time:text-white">
                                                                            {formatTime(show.showDateTime)}
                                                                        </p>
                                                                        <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-600">
                                                                            Select show
                                                                        </p>
                                                                    </div>

                                                                    <ArrowRight
                                                                        size={15}
                                                                        className="shrink-0 text-zinc-600 transition group-hover/time:translate-x-1 group-hover/time:text-red-400"
                                                                    />
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/[0.10] bg-white/[0.015] px-6 text-center">

                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.035] text-zinc-500">
                                    <MonitorPlay size={34} />
                                </div>

                                <h3 className="mt-6 text-xl font-bold">
                                    No shows available
                                </h3>

                                <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
                                    {availableDates.length > 0
                                        ? "There are no movies scheduled for this date. Select another date to explore available shows."
                                        : "No movie showtimes have been added to this theatre yet. Please check again later."}
                                </p>

                                {availableDates.length === 0 && (
                                    <p className="mt-4 rounded-lg bg-white/[0.035] px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-600">
                                        Admin · Add Shows
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* BOTTOM CTA */}
                <section className="mt-12 overflow-hidden rounded-3xl border border-red-500/15 bg-gradient-to-r from-red-500/[0.10] via-[#171116] to-purple-500/[0.06] p-6 sm:p-8">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                                <Ticket size={23} />
                            </div>

                            <div>
                                <h3 className="font-bold">
                                    Ready for movie night?
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Pick a showtime and make it a cinematic experience.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                document.getElementById("showtimes")?.scrollIntoView({
                                    behavior: "smooth",
                                })
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-red-400"
                        >
                            Explore showtimes
                            <ArrowRight size={15} />
                        </button>

                    </div>
                </section>

            </main>
        </div>
    );
};

export default TheatreDetails;
