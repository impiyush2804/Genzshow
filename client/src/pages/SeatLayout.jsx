
import React, { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import {
    ArrowLeft,
    ArrowRight,
    Armchair,
    CalendarDays,
    Check,
    Clock3,
    MapPin,
    MonitorPlay,
    Ticket,
    Users,
    Sparkles,
    ShieldCheck,
} from "lucide-react";

import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const SeatLayout = () => {
    const groupRows = [
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
        ["G", "H"],
        ["I", "J"],
    ];

    const { id, date } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const showId = searchParams.get("showId");
    const theatreId = searchParams.get("theatreId");

    const {
        axios,
        getToken,
        user,
        image_base_url,
    } = useAppContext();

    const [movieShow, setMovieShow] = useState(null);
    const [theatre, setTheatre] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSeats, setLoadingSeats] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Fetch movie show and theatre
    const getShowData = async () => {
        try {
            setLoading(true);

            if (!showId) {
                toast.error("Show information is missing");
                return;
            }

            const { data } = await axios.get(`/api/show/${id}`, {
                params: { theatreId },
            });

            if (!data.success) {
                toast.error(data.message || "Failed to load show");
                return;
            }

            setMovieShow(data);

            const dateShows = data.dateTime?.[date] || [];

            const exactShow = dateShows.find(
                (item) => String(item.showId) === String(showId)
            );

            if (!exactShow) {
                toast.error("This show is no longer available");
                return;
            }

            setSelectedTime(exactShow);

            if (theatreId) {
                const theatreResponse = await axios.get(
                    `/api/theatre/${theatreId}`
                );

                if (theatreResponse.data.success) {
                    setTheatre(theatreResponse.data.theatre);
                }
            }
        } catch (error) {
            console.error("SEAT LAYOUT ERROR:", error);
            console.error("SERVER RESPONSE:", error.response?.data);

            toast.error(
                error.response?.data?.message ||
                "Failed to load show"
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch occupied seats
    const getOccupiedSeats = async (currentShowId) => {
        try {
            setLoadingSeats(true);

            const { data } = await axios.get(
                `/api/booking/seats/${currentShowId}`
            );

            if (data.success) {
                setOccupiedSeats(data.occupiedSeats || []);
            } else {
                toast.error(data.message || "Failed to load seats");
            }
        } catch (error) {
            console.error("OCCUPIED SEATS ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load seats"
            );
        } finally {
            setLoadingSeats(false);
        }
    };

    useEffect(() => {
        getShowData();
    }, [id, date, showId, theatreId]);

    useEffect(() => {
        if (selectedTime?.showId) {
            setSelectedSeats([]);
            getOccupiedSeats(selectedTime.showId);
        }
    }, [selectedTime]);

    // Seat selection
    const handleSeatClick = (seatId) => {
        if (!selectedTime) {
            toast.error("Please select a showtime first");
            return;
        }

        if (occupiedSeats.includes(seatId)) {
            toast.error("This seat is already booked");
            return;
        }

        if (
            !selectedSeats.includes(seatId) &&
            selectedSeats.length >= 5
        ) {
            toast.error("You can only select 5 seats");
            return;
        }

        setSelectedSeats((previousSeats) =>
            previousSeats.includes(seatId)
                ? previousSeats.filter((seat) => seat !== seatId)
                : [...previousSeats, seatId]
        );
    };

    // Render individual seats
    const renderSeats = (row) => (
        <div
            key={row}
            className="flex items-center justify-center gap-1.5 sm:gap-2"
        >
            <span className="w-5 text-[10px] font-semibold text-gray-500">
                {row}
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2">
                {Array.from({ length: 9 }, (_, index) => {
                    const seatId = `${row}${index + 1}`;
                    const isSelected = selectedSeats.includes(seatId);
                    const isOccupied = occupiedSeats.includes(seatId);

                    return (
                        <button
                            key={seatId}
                            type="button"
                            aria-label={`Seat ${seatId}${isOccupied ? ", booked" : isSelected ? ", selected" : ", available"}`}
                            title={seatId}
                            disabled={isOccupied || loadingSeats}
                            onClick={() => handleSeatClick(seatId)}
                            className={`
                                relative flex h-7 w-7 sm:h-9 sm:w-9
                                items-center justify-center rounded-t-lg
                                rounded-b-md border text-[9px] sm:text-[10px]
                                font-semibold transition-all duration-200
                                ${
                                    isOccupied
                                        ? "cursor-not-allowed border-gray-700 bg-gray-800 text-gray-600"
                                        : isSelected
                                            ? "scale-105 border-red-400 bg-primary text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                                            : "border-white/15 bg-white/[0.04] text-gray-400 hover:border-primary hover:bg-primary/20 hover:text-white"
                                }
                            `}
                        >
                            {isSelected ? (
                                <Check size={13} strokeWidth={3} />
                            ) : (
                                index + 1
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    // Checkout
    const bookTickets = async () => {
        try {
            if (!user) {
                toast.error("Please login to proceed");
                return;
            }

            if (!selectedTime?.showId) {
                toast.error("Please select a showtime");
                return;
            }

            if (!selectedSeats.length) {
                toast.error("Please select at least one seat");
                return;
            }

            if (selectedSeats.length > 5) {
                toast.error("You can only select 5 seats");
                return;
            }

            setBookingLoading(true);

            const token = await getToken();

            const { data } = await axios.post(
                "/api/booking/create",
                {
                    showId: selectedTime.showId,
                    selectedSeats,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                window.location.href = data.url;
            } else {
                toast.error(data.message || "Booking failed");
            }
        } catch (error) {
            console.error("BOOKING ERROR:", error);
            console.error("SERVER RESPONSE:", error.response?.data);

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Booking failed"
            );
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <Loading />;

    if (!movieShow || !selectedTime) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#08080b] px-6 text-center text-white">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                    <MonitorPlay size={34} className="text-primary" />
                </div>

                <h1 className="text-2xl font-bold">Show Not Found</h1>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                    This show may no longer be available. Please select
                    another showtime.
                </p>

                <button
                    onClick={() =>
                        navigate(
                            theatreId
                                ? `/theatres/${theatreId}`
                                : "/theatres"
                        )
                    }
                    className="mt-7 rounded-full bg-primary px-7 py-3 text-sm font-semibold transition hover:bg-primary/80"
                >
                    Back to Theatre
                </button>
            </div>
        );
    }

    const movie = movieShow.movie;
    const dateShows = movieShow.dateTime?.[date] || [];

    const formattedDate = new Date(
        `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-16 pt-28 text-white md:pt-32">
            <BlurCircle top="-100px" left="-120px" />
            <BlurCircle bottom="0" right="-100px" />

            <div className="relative z-10 mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-10">

                {/* Breadcrumb */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() =>
                            navigate(
                                theatreId
                                    ? `/theatres/${theatreId}`
                                    : "/theatres"
                            )
                        }
                        className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to showtimes
                    </button>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-primary">01</span>
                        <span>Showtime</span>
                        <span className="mx-1 text-gray-700">/</span>
                        <span className="text-white">02 Seat selection</span>
                        <span className="mx-1 text-gray-700">/</span>
                        <span>03 Payment</span>
                    </div>
                </div>

                {/* Page heading */}
                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        <Sparkles size={14} />
                        Your movie experience starts here
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Choose your <span className="text-primary">seats.</span>
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Pick your favourite spot and get ready for the big screen.
                    </p>
                </div>

                {/* Main layout */}
                <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">

                    {/* LEFT: Seat selection */}
                    <section className="min-w-0 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101014]">

                        {/* Movie information */}
                        <div className="flex flex-col gap-5 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:p-7">
                            <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
                                {movie?.poster_path && (
                                    <img
                                        src={`${image_base_url}${movie.poster_path}`}
                                        alt={movie.title || "Movie poster"}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                        Now booking
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {movie?.release_date
                                            ? new Date(movie.release_date).getFullYear()
                                            : ""}
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold sm:text-2xl">
                                    {movie?.title || "Movie"}
                                </h2>

                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
                                    {theatre && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-primary" />
                                            {theatre.name}, {theatre.city}
                                        </span>
                                    )}

                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays size={14} className="text-primary" />
                                        {formattedDate}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <Clock3 size={14} className="text-primary" />
                                        {isoTimeFormat(selectedTime.time)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Showtime selector */}
                        <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
                            <div className="mb-3 flex items-center gap-2">
                                <Clock3 size={16} className="text-primary" />
                                <h3 className="text-sm font-semibold">Available showtimes</h3>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {dateShows.map((item) => {
                                    const isCurrent =
                                        String(item.showId) === String(showId);

                                    return (
                                        <button
                                            key={item.showId}
                                            disabled={isCurrent}
                                            onClick={() => {
                                                navigate(
                                                    `/movies/${id}/${date}?showId=${item.showId}&theatreId=${theatreId}`
                                                );
                                            }}
                                            className={`
                                                rounded-xl border px-4 py-2.5 text-xs font-semibold transition
                                                ${
                                                    isCurrent
                                                        ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                                                        : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-primary/50 hover:text-white"
                                                }
                                            `}
                                        >
                                            {isoTimeFormat(item.time)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Seat selection area */}
                        <div className="p-5 sm:p-8 lg:p-10">

                            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Select your seats
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Maximum 5 seats per booking
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-400">
                                    <Users size={14} />
                                    {selectedSeats.length}/5 selected
                                </div>
                            </div>

                            {/* Screen */}
                            <div className="mx-auto mb-14 max-w-2xl px-2">
                                <div className="relative mx-auto h-1.5 w-[85%] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_8px_35px_rgba(239,68,68,0.4)]" />

                                <div className="mx-auto mt-1 h-12 w-[75%] rounded-b-[50%] bg-gradient-to-b from-primary/15 to-transparent blur-md" />

                                <div className="-mt-8 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-500">
                                    <MonitorPlay size={13} />
                                    Screen this way
                                </div>
                            </div>

                            {/* Seat legend */}
                            <div className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                                {[
                                    {
                                        label: "Available",
                                        style: "border-white/20 bg-white/[0.04]",
                                    },
                                    {
                                        label: "Selected",
                                        style: "border-primary bg-primary",
                                    },
                                    {
                                        label: "Booked",
                                        style: "border-gray-700 bg-gray-800",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-2 text-[11px] text-gray-400"
                                    >
                                        <div className={`h-3.5 w-3.5 rounded-t-md rounded-b-sm border ${item.style}`} />
                                        {item.label}
                                    </div>
                                ))}
                            </div>

                            {/* Seats */}
                            <div className="mx-auto max-w-[580px] overflow-x-auto pb-3">
                                <div className="min-w-[340px] space-y-5">
                                    {groupRows.map((group, groupIndex) => (
                                        <div
                                            key={groupIndex}
                                            className="space-y-3"
                                        >
                                            {group.map((row) => (
                                                <React.Fragment key={row}>
                                                    {renderSeats(row)}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {loadingSeats && (
                                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Updating seat availability...
                                </div>
                            )}

                            {/* Selected seat chips */}
                            <div className="mt-9 border-t border-white/[0.07] pt-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold">
                                        Your selection
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        {selectedSeats.length} seats
                                    </span>
                                </div>

                                {selectedSeats.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSeats.map((seat) => (
                                            <button
                                                key={seat}
                                                onClick={() => handleSeatClick(seat)}
                                                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
                                            >
                                                <Armchair size={13} />
                                                {seat}
                                                <span className="text-primary/60">×</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">
                                        No seats selected yet. Choose your seats above.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: Booking summary */}
                    <aside className="h-max space-y-5 lg:sticky lg:top-28">

                        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101014]">

                            <div className="border-b border-white/[0.07] p-6">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    <Ticket size={14} />
                                    Booking summary
                                </div>

                                <h3 className="text-xl font-bold">
                                    Almost there!
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Review your seats before checkout.
                                </p>
                            </div>

                            <div className="space-y-5 p-6">
                                <div>
                                    <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
                                        Movie
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {movie?.title}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
                                        Theatre
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {theatre?.name || "Theatre"}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {theatre?.city || ""}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
                                            Date
                                        </p>
                                        <p className="text-xs font-medium">
                                            {new Date(`${date}T00:00:00`).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                }
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
                                            Showtime
                                        </p>
                                        <p className="text-xs font-medium">
                                            {isoTimeFormat(selectedTime.time)}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-white/[0.07] pt-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            Selected seats
                                        </p>
                                        <p className="text-xs font-semibold">
                                            {selectedSeats.length}
                                        </p>
                                    </div>

                                    <div className="flex min-h-12 flex-wrap content-start gap-2">
                                        {selectedSeats.length ? (
                                            selectedSeats.map((seat) => (
                                                <span
                                                    key={seat}
                                                    className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary"
                                                >
                                                    {seat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-600">
                                                No seats selected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-white/[0.07] pt-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">
                                            Total seats
                                        </span>
                                        <span className="text-sm font-bold">
                                            {selectedSeats.length}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={bookTickets}
                                    disabled={
                                        !selectedSeats.length ||
                                        loadingSeats ||
                                        bookingLoading
                                    }
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/85 hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                                >
                                    {bookingLoading
                                        ? "Processing..."
                                        : "Proceed to Checkout"}

                                    {!bookingLoading && (
                                        <ArrowRight
                                            size={17}
                                            className="transition group-hover:translate-x-1"
                                        />
                                    )}
                                </button>

                                <div className="flex items-start gap-2 text-[10px] leading-relaxed text-gray-500">
                                    <ShieldCheck
                                        size={14}
                                        className="mt-0.5 shrink-0 text-green-500"
                                    />
                                    Secure checkout. Your booking will be confirmed
                                    after successful payment.
                                </div>
                            </div>
                        </div>

                        {/* Help card */}
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Sparkles size={15} className="text-primary" />
                                Make it a movie night
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-gray-500">
                                Choose your preferred seats, complete your payment,
                                and enjoy the show with GENZSHOW.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default SeatLayout;
