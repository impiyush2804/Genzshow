
import React, { useEffect, useMemo, useState } from "react";
import {
    MapPin,
    Search,
    Navigation,
    ChevronDown,
    SlidersHorizontal,
    Ticket,
    Heart,
    X,
    Armchair,
    MonitorPlay,
    Clapperboard,
    Building2,
    Sparkles,
    ArrowUpRight,
    MapPinned,
    ScanLine,
    RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const Theatres = () => {
    const navigate = useNavigate();
    const { axios } = useAppContext();

    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("All Cities");
    const [sort, setSort] = useState("Recommended");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedType, setSelectedType] = useState("All");
    const [selectedChain, setSelectedChain] = useState("All Chains");
    const [favorites, setFavorites] = useState([]);

    const fetchTheatres = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/theatre");

            if (response.data.success) {
                setTheatres(response.data.theatres || []);
            } else {
                toast.error(response.data.message || "Failed to load theatres");
            }
        } catch (error) {
            console.error("FETCH THEATRES ERROR:", error);
            toast.error(error.response?.data?.message || "Unable to load theatres");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTheatres();
    }, []);

    const cities = useMemo(() => {
        const citySet = new Set();

        theatres.forEach((theatre) => {
            if (theatre.city?.trim()) citySet.add(theatre.city.trim());
        });

        return ["All Cities", ...Array.from(citySet).sort()];
    }, [theatres]);

    const chains = useMemo(() => {
        const chainSet = new Set();

        theatres.forEach((theatre) => {
            if (theatre.theatreChain?.trim()) {
                chainSet.add(theatre.theatreChain.trim());
            }
        });

        return ["All Chains", ...Array.from(chainSet).sort()];
    }, [theatres]);

    const filteredTheatres = useMemo(() => {
        let result = [...theatres];
        const searchValue = search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((theatre) => {
                const name = theatre.name?.toLowerCase() || "";
                const city = theatre.city?.toLowerCase() || "";
                const chain = theatre.theatreChain?.toLowerCase() || "";

                return (
                    name.includes(searchValue) ||
                    city.includes(searchValue) ||
                    chain.includes(searchValue)
                );
            });
        }

        if (location !== "All Cities") {
            result = result.filter(
                (theatre) =>
                    theatre.city?.toLowerCase() === location.toLowerCase()
            );
        }

        if (selectedType !== "All") {
            result = result.filter(
                (theatre) => theatre.type === selectedType
            );
        }

        if (selectedChain !== "All Chains") {
            result = result.filter(
                (theatre) => theatre.theatreChain === selectedChain
            );
        }

        if (sort === "Name") {
            result.sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
        }

        if (sort === "City") {
            result.sort((a, b) =>
                (a.city || "").localeCompare(b.city || "")
            );
        }

        if (sort === "Screens") {
            result.sort(
                (a, b) => (b.screens || 0) - (a.screens || 0)
            );
        }

        if (sort === "Ticket Price") {
            result.sort(
                (a, b) =>
                    (a.averageTicketPrice || 0) -
                    (b.averageTicketPrice || 0)
            );
        }

        return result;
    }, [theatres, search, location, selectedType, selectedChain, sort]);

    const totalScreens = useMemo(
        () => theatres.reduce((sum, theatre) => sum + (Number(theatre.screens) || 0), 0),
        [theatres]
    );

    const totalSeats = useMemo(
        () => theatres.reduce((sum, theatre) => sum + (Number(theatre.totalSeats) || 0), 0),
        [theatres]
    );

    const openDirections = (theatre) => {
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

    const handleViewShows = (theatre) => {
        if (!theatre?._id) {
            toast.error("Theatre ID is missing");
            return;
        }

        navigate(`/theatres/${theatre._id}`);
    };

    const toggleFavorite = (id) => {
        setFavorites((previous) => {
            const exists = previous.includes(id);

            if (exists) {
                toast.success("Removed from favourites");
                return previous.filter((item) => item !== id);
            }

            toast.success("Added to favourites");
            return [...previous, id];
        });
    };

    const clearFilters = () => {
        setSearch("");
        setLocation("All Cities");
        setSelectedType("All");
        setSelectedChain("All Chains");
        setSort("Recommended");
    };

    const hasActiveFilters =
        search ||
        location !== "All Cities" ||
        selectedType !== "All" ||
        selectedChain !== "All Chains";

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen overflow-hidden bg-[#08080b] pb-20 text-white">

            {/* HERO */}
            <section className="relative overflow-hidden border-b border-white/[0.07]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_35%,rgba(225,29,72,0.18),transparent_42%),radial-gradient(ellipse_at_85%_20%,rgba(147,51,234,0.10),transparent_38%)]" />

                <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-red-600/[0.08] blur-[100px]" />
                <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-purple-600/[0.07] blur-[100px]" />

                <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-32 sm:px-8 md:pb-16 md:pt-36">

                    <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">

                        <div className="max-w-2xl">

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
                                <Sparkles size={13} />
                                The GENZSHOW Experience
                            </div>

                            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl">
                                Your next movie
                                <span className="block bg-gradient-to-r from-red-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                                    starts here.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
                                Discover exceptional cinemas, explore theatre
                                experiences and find the perfect screen for your
                                next big-screen moment.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    Discover cinemas
                                </span>
                                <span className="text-zinc-700">•</span>
                                <span>Compare ticket prices</span>
                                <span className="text-zinc-700">•</span>
                                <span>Book your experience</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 lg:min-w-[390px]">
                            {[
                                {
                                    value: theatres.length,
                                    label: "Theatres",
                                    icon: Building2,
                                },
                                {
                                    value: cities.length - 1,
                                    label: "Cities",
                                    icon: MapPinned,
                                },
                                {
                                    value: totalScreens,
                                    label: "Screens",
                                    icon: MonitorPlay,
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl"
                                >
                                    <stat.icon size={17} className="text-red-400" />
                                    <p className="mt-4 text-2xl font-bold tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <main className="mx-auto max-w-7xl px-5 pt-9 sm:px-8">

                {/* SEARCH TOOLBAR */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#111115] p-3 shadow-2xl shadow-black/20">
                    <div className="flex flex-col gap-3 lg:flex-row">

                        <div className="relative flex-1">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search cinemas, cities or chains..."
                                className="w-full rounded-2xl border border-transparent bg-white/[0.035] py-4 pl-12 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-red-500/40 focus:bg-white/[0.05]"
                            />
                        </div>

                        <div className="relative lg:w-52">
                            <MapPin
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400"
                            />
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-transparent bg-white/[0.035] py-4 pl-10 pr-10 text-sm text-zinc-200 outline-none focus:border-red-500/40"
                            >
                                {cities.map((city) => (
                                    <option key={city} value={city} className="bg-zinc-900">
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-sm font-medium transition ${
                                showFilters
                                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                                    : "border-white/[0.07] bg-white/[0.035] text-zinc-300 hover:bg-white/[0.07]"
                            }`}
                        >
                            <SlidersHorizontal size={17} />
                            Filters
                            {(selectedType !== "All" || selectedChain !== "All Chains") && (
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            )}
                        </button>

                        <div className="relative lg:w-48">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-4 pr-10 text-sm text-zinc-300 outline-none focus:border-red-500/40"
                            >
                                <option value="Recommended" className="bg-zinc-900">Recommended</option>
                                <option value="Name" className="bg-zinc-900">Name</option>
                                <option value="City" className="bg-zinc-900">City</option>
                                <option value="Screens" className="bg-zinc-900">Most Screens</option>
                                <option value="Ticket Price" className="bg-zinc-900">Lowest Price</option>
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        </div>
                    </div>
                </div>

                {/* FILTER PANEL */}
                {showFilters && (
                    <div className="mt-4 rounded-3xl border border-white/[0.08] bg-[#111115] p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Refine your search</h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Choose the cinema experience you prefer.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-7 md:grid-cols-2">
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                    Theatre type
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["All", "Multiplex", "Single Screen"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`rounded-xl border px-4 py-2.5 text-xs font-medium transition ${
                                                selectedType === type
                                                    ? "border-red-500/30 bg-red-500 text-white"
                                                    : "border-white/[0.07] bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:text-white"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                    Cinema chain
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {chains.map((chain) => (
                                        <button
                                            key={chain}
                                            onClick={() => setSelectedChain(chain)}
                                            className={`rounded-xl border px-4 py-2.5 text-xs font-medium transition ${
                                                selectedChain === chain
                                                    ? "border-red-500/30 bg-red-500 text-white"
                                                    : "border-white/[0.07] bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:text-white"
                                            }`}
                                        >
                                            {chain}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="text-xs font-medium text-red-400 transition hover:text-red-300"
                            >
                                Reset all filters
                            </button>
                        </div>
                    </div>
                )}

                {/* RESULTS HEADING */}
                <div className="mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
                            <Clapperboard size={14} />
                            Explore venues
                        </div>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                            Cinemas near your world
                        </h2>
                        <p className="mt-2 text-sm text-zinc-500">
                            Showing{" "}
                            <span className="font-semibold text-white">
                                {filteredTheatres.length}
                            </span>{" "}
                            of {theatres.length} theatres
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <ScanLine size={15} className="text-red-400" />
                        {totalSeats.toLocaleString("en-IN")} total seats listed
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {search && (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
                                Search: {search}
                            </span>
                        )}
                        {location !== "All Cities" && (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
                                {location}
                            </span>
                        )}
                        {selectedType !== "All" && (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
                                {selectedType}
                            </span>
                        )}
                        {selectedChain !== "All Chains" && (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
                                {selectedChain}
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-2 py-2 text-xs text-red-400 hover:text-red-300"
                        >
                            <X size={13} />
                            Clear all
                        </button>
                    </div>
                )}

                {/* THEATRE CARDS */}
                {filteredTheatres.length > 0 ? (
                    <div className="mt-7 grid gap-5">
                        {filteredTheatres.map((theatre, index) => {
                            const isFavorite = favorites.includes(theatre._id);

                            return (
                                <article
                                    key={theatre._id}
                                    className="group relative overflow-hidden rounded-[28px] border border-white/[0.075] bg-gradient-to-br from-[#151519] to-[#0e0e12] transition duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-[0_20px_70px_rgba(0,0,0,0.35)]"
                                >
                                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-red-500/[0.045] blur-[75px] transition group-hover:bg-red-500/[0.09]" />

                                    <div className="relative p-5 sm:p-7">

                                        {/* CARD TOP */}
                                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                                            <div className="flex gap-4 sm:gap-5">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/15 to-pink-500/[0.04] text-red-400 sm:h-20 sm:w-20">
                                                    <MonitorPlay size={30} strokeWidth={1.5} />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-lg font-bold tracking-tight sm:text-xl">
                                                            {theatre.name || "Cinema"}
                                                        </h3>

                                                        {theatre.theatreChain && (
                                                            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold text-zinc-400">
                                                                {theatre.theatreChain}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-red-400" />
                                                            {theatre.city || "Location unavailable"}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Armchair size={14} />
                                                            {(theatre.totalSeats || 0).toLocaleString("en-IN")} seats
                                                        </span>
                                                    </div>

                                                    <div className="mt-3">
                                                        <span className="inline-flex rounded-lg border border-white/[0.07] bg-white/[0.035] px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                                                            {theatre.type || "Cinema"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleFavorite(theatre._id)}
                                                title={isFavorite ? "Remove favourite" : "Add to favourites"}
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl border transition md:self-start ${
                                                    isFavorite
                                                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                                                        : "border-white/[0.08] bg-white/[0.035] text-zinc-500 hover:border-red-500/30 hover:text-red-400"
                                                }`}
                                            >
                                                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                                            </button>
                                        </div>

                                        {/* DETAILS */}
                                        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                            <div className="rounded-2xl border border-white/[0.045] bg-black/20 p-4">
                                                <div className="flex items-center gap-2 text-zinc-500">
                                                    <MonitorPlay size={14} />
                                                    <span className="text-[10px] uppercase tracking-wider">Screens</span>
                                                </div>
                                                <p className="mt-3 text-xl font-bold">
                                                    {theatre.screens || 0}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/[0.045] bg-black/20 p-4">
                                                <div className="flex items-center gap-2 text-zinc-500">
                                                    <Armchair size={14} />
                                                    <span className="text-[10px] uppercase tracking-wider">Total seats</span>
                                                </div>
                                                <p className="mt-3 text-xl font-bold">
                                                    {(theatre.totalSeats || 0).toLocaleString("en-IN")}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/[0.045] bg-black/20 p-4">
                                                <div className="flex items-center gap-2 text-zinc-500">
                                                    <Ticket size={14} />
                                                    <span className="text-[10px] uppercase tracking-wider">Avg. ticket</span>
                                                </div>
                                                <p className="mt-3 text-xl font-bold">
                                                    {theatre.averageTicketPrice
                                                        ? `₹${Math.round(theatre.averageTicketPrice)}`
                                                        : "—"}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/[0.045] bg-black/20 p-4">
                                                <div className="flex items-center gap-2 text-zinc-500">
                                                    <MapPin size={14} />
                                                    <span className="text-[10px] uppercase tracking-wider">City</span>
                                                </div>
                                                <p className="mt-3 truncate text-base font-bold">
                                                    {theatre.city || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row">
                                            <button
                                                onClick={() => openDirections(theatre)}
                                                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-5 py-3.5 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                                            >
                                                <Navigation size={15} />
                                                Get directions
                                                <ArrowUpRight size={13} />
                                            </button>

                                            <button
                                                onClick={() => handleViewShows(theatre)}
                                                className="group/button flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-950/30 transition hover:from-red-500 hover:to-rose-400"
                                            >
                                                <Ticket size={16} />
                                                Explore shows
                                                <ArrowUpRight size={14} className="transition group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.10] bg-white/[0.015] px-6 text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] text-zinc-500">
                            <Search size={27} />
                        </div>

                        <h3 className="text-xl font-bold">No cinemas found</h3>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                            We couldn't find a theatre matching your search.
                            Try another city or adjust your filters.
                        </p>

                        <button
                            onClick={clearFilters}
                            className="mt-6 rounded-xl bg-red-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-red-400"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

                {/* FOOTER NOTE */}
                <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-7 text-center sm:flex-row sm:text-left">
                    <p className="text-xs text-zinc-600">
                        Your movie night, your way. Experience more with GENZSHOW.
                    </p>
                    <button
                        onClick={fetchTheatres}
                        className="flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white"
                    >
                        <RefreshCw size={13} />
                        Refresh cinemas
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Theatres;
