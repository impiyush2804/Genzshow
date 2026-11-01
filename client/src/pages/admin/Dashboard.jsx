
import React, { useEffect, useState } from "react";

import {
    ChartLineIcon,
    CircleDollarSignIcon,
    PlayCircleIcon,
    UsersIcon,
    Film,
    CalendarDays,
    TrendingUp,
    Clapperboard,
    ArrowUpRight,
    RefreshCw,
    Sparkles,
    Ticket,
    Clock3,
    StarIcon,
} from "lucide-react";

import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormat";
import toast from "react-hot-toast";

const Dashboard = () => {
    const { axios, getToken, user, image_base_url } = useAppContext();

    const currency = import.meta.env.VITE_CURRENCY || "₹";

    const [dashboardData, setDashboardData] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        activeShows: [],
        totalUser: 0,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const { data } = await axios.get(
                "/api/admin/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            );

            if (data.success) {
                setDashboardData({
                    totalBookings: data.dashboardData?.totalBookings || 0,
                    totalRevenue: data.dashboardData?.totalRevenue || 0,
                    activeShows: Array.isArray(
                        data.dashboardData?.activeShows
                    )
                        ? data.dashboardData.activeShows
                        : [],
                    totalUser: data.dashboardData?.totalUser || 0,
                });
            } else {
                toast.error(
                    data.message || "Unable to load dashboard."
                );
            }
        } catch (error) {
            console.error("ADMIN DASHBOARD ERROR:", error);
            toast.error(
                error?.response?.data?.message ||
                "Error fetching dashboard data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return <Loading />;
    }

    const dashboardCards = [
        {
            title: "Total Bookings",
            value: dashboardData.totalBookings.toLocaleString("en-IN"),
            description: "Bookings recorded",
            icon: Ticket,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            title: "Total Revenue",
            value: `${currency}${Number(
                dashboardData.totalRevenue
            ).toLocaleString("en-IN")}`,
            description: "Revenue reported by dashboard API",
            icon: CircleDollarSignIcon,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            title: "Active Shows",
            value: dashboardData.activeShows.length.toLocaleString("en-IN"),
            description: "Currently listed shows",
            icon: PlayCircleIcon,
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/20",
        },
        {
            title: "Total Users",
            value: dashboardData.totalUser.toLocaleString("en-IN"),
            description: "Registered users",
            icon: UsersIcon,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
    ];

    const formatPrice = (price) => {
        return `${currency}${Number(price || 0).toLocaleString("en-IN")}`;
    };

    const getPoster = (posterPath) => {
        if (!posterPath) return null;

        if (
            posterPath.startsWith("http://") ||
            posterPath.startsWith("https://")
        ) {
            return posterPath;
        }

        return `${image_base_url}${posterPath}`;
    };

    return (
        <div className="relative min-h-screen space-y-9 pb-12 text-white">

            {/* BACKGROUND */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <BlurCircle top="-100px" left="-100px" />
                <BlurCircle top="500px" left="80%" />
            </div>

            <div className="relative z-10">

                {/* HEADER */}
                <div className="flex flex-col justify-between gap-5 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-center">

                    <div>
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            <Sparkles className="h-4 w-4" />
                            GENZSHOW ADMIN
                        </div>

                        <Title
                            text1="Admin"
                            text2="Dashboard"
                        />

                        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                            Manage your cinema platform, monitor
                            bookings, track revenue and keep your
                            movie experience running smoothly.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-primary/30 hover:bg-primary/10 hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        {refreshing ? "Refreshing..." : "Refresh dashboard"}
                    </button>
                </div>

                {/* OVERVIEW */}
                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Platform overview
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Your platform at a glance
                            </p>
                        </div>

                        <span className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/[0.06] px-3 py-1.5 text-[10px] font-medium text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            Dashboard loaded
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {dashboardCards.map((card, index) => (
                            <div
                                key={card.title}
                                className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-[#111114] p-5 transition duration-300 hover:-translate-y-1 hover:bg-[#17171c]`}
                            >
                                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.025] blur-2xl transition group-hover:bg-white/[0.06]" />

                                <div className="relative flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            {card.title}
                                        </p>

                                        <h3 className="mt-4 break-all text-2xl font-bold tracking-tight sm:text-3xl">
                                            {card.value}
                                        </h3>

                                        <p className="mt-2 text-[11px] text-gray-600">
                                            {card.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
                                    >
                                        <card.icon
                                            className={`h-5 w-5 ${card.color}`}
                                        />
                                    </div>
                                </div>

                                <div className={`mt-5 h-1 w-full overflow-hidden rounded-full ${card.bg}`}>
                                    <div
                                        className={`h-full rounded-full ${card.color.replace("text-", "bg-")} transition-all duration-700`}
                                        style={{
                                            width: `${[75, 85, 65, 70][index]}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                    </div>
                </section>

                {/* QUICK INSIGHTS */}
                <section className="grid gap-4 lg:grid-cols-2">

                    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <Clapperboard className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">
                                Currently on the platform
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">
                                {dashboardData.activeShows.length} Active Shows
                            </h3>
                            <p className="mt-1 text-xs text-gray-600">
                                Shows returned by your admin dashboard API
                            </p>
                        </div>

                        <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-gray-600" />
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">
                                Booking activity
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">
                                {dashboardData.totalBookings.toLocaleString("en-IN")} Total Bookings
                            </h3>
                            <p className="mt-1 text-xs text-gray-600">
                                Overall bookings reported by the backend
                            </p>
                        </div>

                        <ChartLineIcon className="ml-auto h-5 w-5 shrink-0 text-gray-600" />
                    </div>

                </section>

                {/* ACTIVE SHOWS */}
                <section>

                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                <Film className="h-4 w-4" />
                                Cinema management
                            </div>

                            <h2 className="text-2xl font-bold">
                                Active Shows
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Movies and showtimes currently listed on GENZSHOW.
                            </p>
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-400">
                            {dashboardData.activeShows.length} Shows
                        </span>
                    </div>

                    {dashboardData.activeShows.length > 0 ? (

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                            {dashboardData.activeShows.map((show) => {
                                const movie = show.movie || {};
                                const poster = getPoster(movie.poster_path);

                                return (
                                    <div
                                        key={show._id}
                                        className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111114] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_15px_45px_rgba(0,0,0,0.3)]"
                                    >

                                        {/* POSTER */}
                                        <div className="relative h-64 overflow-hidden bg-[#1a1a20]">

                                            {poster ? (
                                                <img
                                                    src={poster}
                                                    alt={movie.title || "Movie poster"}
                                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Film className="h-12 w-12 text-gray-700" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/20" />

                                            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-green-500/20 bg-black/70 px-3 py-1.5 backdrop-blur-md">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400">
                                                    Active
                                                </span>
                                            </div>

                                            {movie.vote_average !== undefined &&
                                                movie.vote_average !== null && (
                                                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-md">
                                                        <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-xs font-semibold">
                                                            {Number(movie.vote_average).toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}

                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h3 className="truncate text-lg font-bold text-white">
                                                    {movie.title || "Untitled movie"}
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-300">
                                                    {movie.release_date || "Release date unavailable"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* SHOW DETAILS */}
                                        <div className="space-y-4 p-4">

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                                        Ticket price
                                                    </p>

                                                    <p className="mt-1 text-lg font-bold text-primary">
                                                        {formatPrice(show.showPrice)}
                                                    </p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                    <Ticket className="h-5 w-5 text-primary" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 border-t border-white/[0.07] pt-3 text-xs text-gray-400">
                                                <CalendarDays className="h-4 w-4 text-primary" />
                                                <span className="truncate">
                                                    {show.showDateTime
                                                        ? dateFormat(show.showDateTime)
                                                        : "Date unavailable"}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}

                        </div>

                    ) : (

                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                                <Film className="h-6 w-6 text-gray-500" />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold">
                                No active shows
                            </h3>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                There are currently no active shows to display.
                                Add shows through your existing show management section.
                            </p>
                        </div>

                    )}

                </section>

                {/* FOOTER */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-6">
                    <p className="text-xs text-gray-600">
                        GENZSHOW Admin Dashboard
                    </p>

                    <p className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock3 className="h-3.5 w-3.5" />
                        Data loaded from your backend
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
