
import React, { useCallback, useEffect, useState } from "react";
import {
    Ticket,
    CalendarDays,
    Clock3,
    MapPin,
    Armchair,
    BadgeCheck,
    Hourglass,
    XCircle,
    RefreshCw,
    Film,
    CreditCard,
    Clapperboard,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Hash,
    CircleCheck,
    Popcorn,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const MyBookings = () => {
    const { axios, getToken } = useAppContext();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // BOOKING STATUS
    // --------------------------------------------------

    const getBookingState = (item) => {
        if (
            item.isPaid === true ||
            item.status === "confirmed" ||
            item.status === "completed" ||
            item.paymentStatus === "paid" ||
            item.paymentStatus === "completed"
        ) {
            return "confirmed";
        }

        if (item.status === "expired") return "expired";
        if (item.status === "cancelled") return "cancelled";

        if (item.status === "pending" || !item.status) {
            return "CONFIRMED";
        }

        return "CONFIRMED";
    };

    const statusConfig = {
        confirmed: {
            label: "Confirmed",
            icon: BadgeCheck,
            style: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
            dot: "bg-emerald-400",
        },
        pending: {
            label: "Payment Pending",
            icon: Hourglass,
            style: "border-amber-500/20 bg-amber-500/10 text-amber-400",
            dot: "bg-amber-400",
        },
        expired: {
            label: "Expired",
            icon: XCircle,
            style: "border-red-500/20 bg-red-500/10 text-red-400",
            dot: "bg-red-400",
        },
        cancelled: {
            label: "Cancelled",
            icon: XCircle,
            style: "border-red-500/20 bg-red-500/10 text-red-400",
            dot: "bg-red-400",
        },
        processing: {
            label: "CONFIRMED",
            icon: BadgeCheck,
            style: "border-white/10 bg-white/5 text-gray-400",
            dot: "bg-gray-400",
        },
    };

    // --------------------------------------------------
    // FETCH BOOKINGS
    // --------------------------------------------------

    const getMyBookings = useCallback(async (background = false) => {
        try {
            if (background) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const token = await getToken();

            const { data } = await axios.get(
                "/api/user/bookings",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                setBookings(data.bookings || []);
                setError("");
            } else {
                setError(data.message || "Unable to load bookings.");
            }
        } catch (err) {
            console.error("GET BOOKINGS ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load your bookings."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [axios, getToken]);

    useEffect(() => {
        getMyBookings();
    }, [getMyBookings]);

    // --------------------------------------------------
    // AUTOMATIC PENDING PAYMENT REFRESH
    // --------------------------------------------------

    useEffect(() => {
        const hasPendingBookings = bookings.some(
            (booking) => getBookingState(booking) === "pending"
        );

        if (!hasPendingBookings) return;

        const interval = setInterval(() => {
            getMyBookings(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [bookings, getMyBookings]);

    // --------------------------------------------------
    // FORMAT HELPERS
    // --------------------------------------------------

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });
    };

    const formatTime = (date) => {
        if (!date) return "Time unavailable";

        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });
    };

    const getPoster = (movie) => {
        const poster =
            movie?.poster_path ||
            movie?.poster ||
            movie?.backdrop_path;

        if (!poster) return null;

        if (poster.startsWith("http")) return poster;

        return `https://image.tmdb.org/t/p/w500${poster}`;
    };

    // --------------------------------------------------
    // STATISTICS
    // --------------------------------------------------

    const confirmedCount = bookings.filter(
        (item) => getBookingState(item) === "confirmed"
    ).length;

    const pendingCount = bookings.filter(
        (item) => getBookingState(item) === "pending"
    ).length;

    const totalSpent = bookings
        .filter((item) => getBookingState(item) === "confirmed")
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#08080b] text-white">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
                    <Ticket size={34} className="text-primary" />
                    <span className="absolute inset-0 animate-ping rounded-3xl border border-primary/20" />
                </div>

                <h2 className="mt-6 text-lg font-semibold">
                    Preparing your tickets
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Fetching your GENZSHOW bookings...
                </p>
            </div>
        );
    }

    // --------------------------------------------------
    // MAIN UI
    // --------------------------------------------------

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#08080b] px-4 pb-20 pt-28 text-white sm:px-7 lg:px-12">

            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
            <div className="pointer-events-none absolute -right-40 top-[500px] h-96 w-96 rounded-full bg-purple-600/5 blur-[130px]" />

            <div className="relative z-10 mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">

                    <div>
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                            <Sparkles size={15} />
                            Your GENZSHOW experience
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            My <span className="text-primary">Bookings.</span>
                        </h1>

                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
                            Every movie night, every memory. Your tickets
                            and booking history, all in one place.
                        </p>
                    </div>

                    <button
                        onClick={() => getMyBookings(true)}
                        disabled={refreshing}
                        className="flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-primary/40 hover:bg-primary/10 hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        {refreshing ? "Refreshing..." : "Refresh bookings"}
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-7 flex flex-col justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3 text-sm text-red-300">
                            <XCircle size={19} />
                            {error}
                        </div>

                        <button
                            onClick={() => getMyBookings()}
                            className="text-sm font-semibold text-white underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* STATISTICS */}
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-2xl border border-white/[0.07] bg-[#111115] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                                Total bookings
                            </span>
                            <div className="rounded-xl bg-primary/10 p-2.5">
                                <Ticket size={19} className="text-primary" />
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-bold">
                            {bookings.length}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Your movie reservations
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#111115] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                                Confirmed tickets
                            </span>
                            <div className="rounded-xl bg-emerald-500/10 p-2.5">
                                <CircleCheck size={19} className="text-emerald-400" />
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-bold">
                            {confirmedCount}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Successfully paid bookings
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#111115] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                                Confirmed spend
                            </span>
                            <div className="rounded-xl bg-purple-500/10 p-2.5">
                                <CreditCard size={19} className="text-purple-400" />
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-bold">
                            ₹{totalSpent.toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Across completed payments
                        </p>
                    </div>
                </div>

                {/* SECTION TITLE */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold">
                            Your movie tickets
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            View and manage your reservations
                        </p>
                    </div>

                    {pendingCount > 0 && (
                        <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-400">
                            <Hourglass size={14} />
                            {pendingCount} payment{pendingCount > 1 ? "s" : ""} pending
                        </div>
                    )}
                </div>

                {/* EMPTY STATE */}
                {bookings.length === 0 ? (

                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#101014] px-6 text-center">

                        <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-[30px] border border-primary/20 bg-primary/10">
                            <Clapperboard size={42} className="text-primary" />
                            <div className="absolute -right-2 -top-2 rounded-xl bg-[#18181d] p-2">
                                <Popcorn size={18} className="text-primary" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold">
                            Your next movie night awaits.
                        </h2>

                        <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
                            You haven't booked any movies yet. Discover
                            something amazing and make your first reservation.
                        </p>

                        <Link
                            to="/movies"
                            className="mt-8 flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold transition hover:bg-primary/85"
                        >
                            Explore Movies
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                ) : (

                    /* BOOKING CARDS */
                    <div className="space-y-6">

                        {bookings.map((item) => {
                            const show = item.show;
                            const movie = show?.movie;
                            const theatre = show?.theatre;

                            const bookingState = getBookingState(item);
                            const config =
                                statusConfig[bookingState] ||
                                statusConfig.processing;

                            const StatusIcon = config.icon;
                            const poster = getPoster(movie);

                            const movieTitle =
                                movie?.title ||
                                movie?.name ||
                                "Movie";

                            const seats = item.bookedSeats || [];

                            const canPay =
                                bookingState === "pending" &&
                                !item.isPaid &&
                                Boolean(item.paymentLink);

                            return (
                                <article
                                    key={item._id}
                                    className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111115] transition duration-300 hover:border-white/20"
                                >

                                    {/* CARD CONTENT */}
                                    <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)]">

                                        {/* POSTER */}
                                        <div className="relative min-h-[220px] overflow-hidden bg-[#1b1b20] md:min-h-full">
                                            {poster ? (
                                                <img
                                                    src={poster}
                                                    alt={movieTitle}
                                                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Film size={48} className="text-gray-600" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#111115]" />

                                            <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                                GENZSHOW
                                            </div>
                                        </div>

                                        {/* DETAILS */}
                                        <div className="min-w-0 p-5 sm:p-7">

                                            {/* Movie title + status */}
                                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                                <div className="min-w-0">
                                                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                                        <Film size={13} />
                                                        Movie ticket
                                                    </div>

                                                    <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
                                                        {movieTitle}
                                                    </h3>

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        {movie?.original_language
                                                            ? movie.original_language.toUpperCase()
                                                            : "CINEMA EXPERIENCE"}
                                                    </p>
                                                </div>

                                                <div className={`flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${config.style}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                                    <StatusIcon size={15} />
                                                    {config.label}
                                                </div>
                                            </div>

                                            {/* Details grid */}
                                            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">

                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-xl bg-primary/10 p-2.5">
                                                        <CalendarDays size={17} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                                            Show date
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold">
                                                            {formatDate(show?.showDateTime)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-xl bg-primary/10 p-2.5">
                                                        <Clock3 size={17} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                                            Show time
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold">
                                                            {formatTime(show?.showDateTime)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-xl bg-primary/10 p-2.5">
                                                        <MapPin size={17} className="text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                                            Theatre
                                                        </p>
                                                        <p className="mt-1 truncate text-sm font-semibold">
                                                            {theatre?.name || "Theatre"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {theatre?.city || ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-xl bg-primary/10 p-2.5">
                                                        <Armchair size={17} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                                            Seats
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                                            {seats.length > 0 ? (
                                                                seats.map((seat) => (
                                                                    <span
                                                                        key={seat}
                                                                        className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary"
                                                                    >
                                                                        {seat}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-sm text-gray-400">
                                                                    Not available
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TICKET DIVIDER */}
                                    <div className="relative flex items-center">
                                        <div className="absolute -left-3 h-6 w-6 rounded-full border border-white/[0.08] bg-[#08080b]" />
                                        <div className="mx-5 w-full border-t border-dashed border-white/15" />
                                        <div className="absolute -right-3 h-6 w-6 rounded-full border border-white/[0.08] bg-[#08080b]" />
                                    </div>

                                    {/* BOTTOM TICKET DETAILS */}
                                    <div className="flex flex-col justify-between gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-7">

                                        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                                            <div>
                                                <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
                                                    Total amount
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
                                                    Ticket quantity
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {seats.length}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                    <Hash size={12} />
                                                    Booking ID: {item._id}
                                                </div>
                                                <p className="mt-1 text-[10px] text-gray-600">
                                                    Booked on {formatDate(item.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex flex-col gap-3 sm:min-w-[210px]">

                                            {bookingState === "confirmed" && (
                                                <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400">
                                                    <ShieldCheck size={17} />
                                                    Payment confirmed
                                                </div>
                                            )}

                                            {canPay && (
                                                <a
                                                    href={item.paymentLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/85"
                                                >
                                                    <CreditCard size={17} />
                                                    Complete Payment
                                                    <ArrowRight size={16} />
                                                </a>
                                            )}

                                            {bookingState === "pending" && !canPay && (
                                                <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-400">
                                                    <Hourglass size={16} />
                                                    Awaiting confirmation
                                                </div>
                                            )}

                                            {(bookingState === "expired" || bookingState === "cancelled") && (
                                                <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
                                                    <XCircle size={16} />
                                                    {config.label}
                                                </div>
                                            )}

                                            {bookingState === "processing" && (
                                                <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-gray-400">
                                                    <Clock3 size={16} />
                                                    Processing
                                                </div>
                                            )}

                                            <button
                                                onClick={() => getMyBookings(true)}
                                                disabled={refreshing}
                                                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                                            >
                                                <RefreshCw
                                                    size={14}
                                                    className={refreshing ? "animate-spin" : ""}
                                                />
                                                Update booking status
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* FOOTER CTA */}
                <div className="mt-10 flex flex-col justify-between gap-5 rounded-3xl border border-white/[0.07] bg-gradient-to-r from-[#151015] to-[#101014] p-6 sm:flex-row sm:items-center sm:p-8">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-primary/10 p-3">
                            <Popcorn size={25} className="text-primary" />
                        </div>

                        <div>
                            <h3 className="font-bold">
                                Looking for your next movie?
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Discover what's playing and plan your next outing.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/movies"
                        className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                        Explore Movies
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
