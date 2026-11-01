
import React, { useState } from "react";

import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    Menu,
    X,
    Search,
    TicketPlus,
    Heart,
    Clapperboard,
    Sparkles,
    ChevronRight,
} from "lucide-react";

import {
    useClerk,
    UserButton,
    useUser,
} from "@clerk/clerk-react";

import { useAppContext } from "../context/AppContext";


const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false);

    const { user } = useUser();
    const { openSignIn } = useClerk();

    const navigate = useNavigate();
    const location = useLocation();

    const { favoriteMovies = [] } = useAppContext();

    const closeMenu = () => {
        setIsOpen(false);
    };

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Movies", path: "/movies" },
        { name: "GenZ AI", path: "/genz-ai", badge: "AI" },
        { name: "Theatres", path: "/theatres" },
        { name: "Releases", path: "/releases", badge: "NEW" },
    ];

    if (favoriteMovies.length > 0) {
        navLinks.push({
            name: "Favorites",
            path: "/favorite",
            icon: Heart,
        });
    }

    const handleNavigation = (path) => {
        navigate(path);
        closeMenu();
    };

    return (
        <>
            {/* Background gradient */}
            <div className="
                pointer-events-none
                fixed
                inset-x-0
                top-0
                z-40
                h-28
                bg-gradient-to-b
                from-black/80
                to-transparent
            " />

            <header className="
                fixed
                left-0
                top-0
                z-50
                w-full
                px-4
                py-4
                sm:px-8
                lg:px-16
                xl:px-28
            ">

                <div className="
                    mx-auto
                    flex
                    max-w-[1600px]
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-white/[0.09]
                    bg-black/65
                    px-4
                    py-3
                    shadow-[0_8px_40px_rgba(0,0,0,0.25)]
                    backdrop-blur-2xl
                    sm:px-6
                ">

                    {/* LOGO */}
                    <Link
                        to="/"
                        onClick={closeMenu}
                        className="
                            group
                            flex
                            shrink-0
                            items-center
                            gap-2.5
                        "
                    >
                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-red-500
                            to-rose-700
                            shadow-[0_0_25px_rgba(239,68,68,0.25)]
                            transition
                            duration-300
                            group-hover:scale-105
                            group-hover:shadow-[0_0_30px_rgba(239,68,68,0.45)]
                        ">
                            <Clapperboard
                                className="h-5 w-5 text-white"
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className="
                                text-xl
                                font-black
                                tracking-tight
                                text-white
                                sm:text-2xl
                            ">
                                GENZ<span className="text-red-500">SHOW</span>
                            </span>

                            <span className="
                                -mt-0.5
                                text-[8px]
                                font-semibold
                                uppercase
                                tracking-[0.28em]
                                text-zinc-500
                            ">
                                Your movie universe
                            </span>
                        </div>
                    </Link>


                    {/* DESKTOP NAVIGATION */}
                    <nav className="
                        hidden
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-white/[0.06]
                        bg-white/[0.035]
                        p-1.5
                        xl:flex
                    ">

                        {navLinks.map((item) => {
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        relative
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        px-4
                                        py-2.5
                                        text-[13px]
                                        font-medium
                                        transition-all
                                        duration-300
                                        ${
                                            active
                                                ? "bg-white/10 text-white shadow-inner shadow-white/5"
                                                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                                        }
                                    `}
                                >
                                    {item.icon && (
                                        <item.icon className="h-3.5 w-3.5" />
                                    )}

                                    {item.name}

                                    {item.badge && (
                                        <span className={`
                                            rounded-full
                                            px-1.5
                                            py-0.5
                                            text-[8px]
                                            font-bold
                                            tracking-wider
                                            ${
                                                item.badge === "AI"
                                                    ? "border border-purple-400/20 bg-purple-500/15 text-purple-300"
                                                    : "border border-red-400/20 bg-red-500/15 text-red-300"
                                            }
                                        `}>
                                            {item.badge}
                                        </span>
                                    )}

                                    {active && (
                                        <span className="
                                            absolute
                                            bottom-0
                                            left-1/2
                                            h-0.5
                                            w-5
                                            -translate-x-1/2
                                            rounded-full
                                            bg-red-500
                                            shadow-[0_0_10px_rgba(239,68,68,0.8)]
                                        " />
                                    )}
                                </Link>
                            );
                        })}

                    </nav>


                    {/* RIGHT ACTIONS */}
                    <div className="
                        flex
                        items-center
                        gap-3
                        sm:gap-4
                    ">

                        {/* SEARCH */}
                        <button
                            type="button"
                            onClick={() => handleNavigation("/movies")}
                            aria-label="Search movies"
                            className="
                                hidden
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-white/[0.08]
                                bg-white/[0.04]
                                text-zinc-300
                                transition
                                hover:border-red-500/30
                                hover:bg-red-500/10
                                hover:text-white
                                sm:flex
                            "
                        >
                            <Search className="h-[18px] w-[18px]" />
                        </button>


                        {/* MY BOOKINGS */}
                        {user && (
                            <button
                                type="button"
                                onClick={() => handleNavigation("/my-bookings")}
                                aria-label="My bookings"
                                className="
                                    hidden
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/[0.08]
                                    bg-white/[0.04]
                                    px-4
                                    text-xs
                                    font-semibold
                                    text-zinc-300
                                    transition
                                    hover:border-red-500/30
                                    hover:bg-red-500/10
                                    hover:text-white
                                    sm:flex
                                "
                            >
                                <TicketPlus className="h-4 w-4" />
                                Bookings
                            </button>
                        )}


                        {/* AUTHENTICATION */}
                        {!user ? (
                            <button
                                type="button"
                                onClick={() => openSignIn()}
                                className="
                                    rounded-full
                                    bg-gradient-to-r
                                    from-red-600
                                    to-rose-500
                                    px-5
                                    py-2.5
                                    text-xs
                                    font-bold
                                    text-white
                                    shadow-[0_4px_20px_rgba(239,68,68,0.2)]
                                    transition
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:shadow-[0_6px_25px_rgba(239,68,68,0.4)]
                                    sm:px-6
                                    sm:text-sm
                                "
                            >
                                Login
                            </button>
                        ) : (
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action
                                        label="My Bookings"
                                        labelIcon={<TicketPlus width={15} />}
                                        onClick={() => navigate("/my-bookings")}
                                    />
                                </UserButton.MenuItems>
                            </UserButton>
                        )}


                        {/* MOBILE MENU */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isOpen}
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-white/10
                                bg-white/[0.05]
                                text-white
                                transition
                                hover:bg-white/10
                                xl:hidden
                            "
                        >
                            {isOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>

                    </div>

                </div>


                {/* MOBILE MENU OVERLAY */}
                {isOpen && (
                    <div
                        className="
                            fixed
                            inset-0
                            top-[76px]
                            z-[-1]
                            bg-black/60
                            backdrop-blur-sm
                            xl:hidden
                        "
                        onClick={closeMenu}
                    />
                )}


                {/* MOBILE NAVIGATION */}
                <div className={`
                    absolute
                    left-4
                    right-4
                    top-[88px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#101010]/95
                    shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                    backdrop-blur-2xl
                    transition-all
                    duration-300
                    xl:hidden
                    ${
                        isOpen
                            ? "visible translate-y-0 opacity-100"
                            : "invisible -translate-y-3 opacity-0"
                    }
                `}>

                    <div className="p-4">

                        <div className="
                            mb-3
                            flex
                            items-center
                            gap-2
                            px-3
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.25em]
                            text-zinc-500
                        ">
                            <Sparkles className="h-3 w-3 text-red-400" />
                            Explore GENZSHOW
                        </div>

                        <div className="space-y-1">

                            {navLinks.map((item) => {
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={closeMenu}
                                        className={`
                                            flex
                                            items-center
                                            justify-between
                                            rounded-xl
                                            px-4
                                            py-3.5
                                            text-sm
                                            font-medium
                                            transition
                                            ${
                                                active
                                                    ? "bg-red-500/10 text-red-400"
                                                    : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                                            }
                                        `}
                                    >
                                        <span className="flex items-center gap-2">
                                            {item.icon && (
                                                <item.icon className="h-4 w-4" />
                                            )}

                                            {item.name}

                                            {item.badge && (
                                                <span className="
                                                    rounded-full
                                                    bg-red-500/10
                                                    px-2
                                                    py-0.5
                                                    text-[8px]
                                                    font-bold
                                                    text-red-400
                                                ">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </span>

                                        <ChevronRight className="
                                            h-4
                                            w-4
                                            text-zinc-600
                                        " />
                                    </Link>
                                );
                            })}

                        </div>


                        {/* MOBILE SEARCH */}
                        <button
                            type="button"
                            onClick={() => handleNavigation("/movies")}
                            className="
                                mt-3
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-xl
                                border
                                border-white/[0.08]
                                bg-white/[0.04]
                                px-4
                                py-3
                                text-sm
                                text-zinc-300
                                transition
                                hover:bg-white/[0.08]
                            "
                        >
                            <Search className="h-4 w-4" />
                            Explore movies
                        </button>


                        {/* MOBILE BOOKINGS */}
                        {user && (
                            <button
                                type="button"
                                onClick={() => handleNavigation("/my-bookings")}
                                className="
                                    mt-2
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    border-white/[0.08]
                                    bg-white/[0.04]
                                    px-4
                                    py-3
                                    text-sm
                                    text-zinc-300
                                    transition
                                    hover:bg-white/[0.08]
                                "
                            >
                                <TicketPlus className="h-4 w-4" />
                                My Bookings
                            </button>
                        )}

                    </div>

                    <div className="
                        border-t
                        border-white/[0.07]
                        px-5
                        py-3
                        text-center
                        text-[10px]
                        tracking-wider
                        text-zinc-600
                    ">
                        YOUR MOVIE UNIVERSE · GENZSHOW
                    </div>

                </div>

            </header>
        </>
    );
};

export default Navbar;
