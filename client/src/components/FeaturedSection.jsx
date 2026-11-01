
import React from "react";
import {
    ArrowRight,
    Clapperboard,
    Sparkles,
    ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import { useAppContext } from "../context/AppContext";


const FeaturedSection = () => {

    const navigate = useNavigate();

    const {
        shows = [],
        isShowsLoading,
    } = useAppContext();

    const movies = Array.isArray(shows) ? shows : [];

    const featuredMovies = movies.slice(0, 4);


    const openMovies = () => {
        navigate("/movies");
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    return (

        <section className="relative overflow-hidden px-6 py-20 md:px-16 lg:px-24 xl:px-36">

            {/* Background decoration */}

            <BlurCircle top="20px" right="-100px" />

            <div className="pointer-events-none absolute -left-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-pink-600/[0.06] blur-[120px]" />


            {/* Section heading */}

            <div className="relative z-10 mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                <div>

                    <div className="mb-4 flex items-center gap-2">

                        <span className="h-1.5 w-7 rounded-full bg-gradient-to-r from-pink-500 to-red-500" />

                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
                            The cinema experience
                        </span>

                    </div>


                    <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
                            Now Showing
                        </h2>

                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-zinc-400">
                            {movies.length} movies
                        </span>

                    </div>


                    <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500 md:text-base">
                        Discover what's playing now. Find your next favourite
                        and make your next movie night unforgettable.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={openMovies}
                    className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition duration-300 hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-white"
                >
                    Explore all movies

                    <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />

                </button>

            </div>


            {/* Movie collection */}

            <div className="relative z-10">

                {isShowsLoading ? (

                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">

                        {[1, 2, 3, 4].map((item) => (

                            <div
                                key={item}
                                className="animate-pulse"
                            >
                                <div className="aspect-[2/3] rounded-2xl bg-white/[0.06]" />

                                <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.06]" />

                                <div className="mt-3 h-3 w-1/2 rounded bg-white/[0.04]" />

                            </div>

                        ))}

                    </div>

                ) : featuredMovies.length > 0 ? (

                    <div className="flex flex-wrap justify-center gap-x-7 gap-y-12">

                        {featuredMovies.map((movie) => (

                            <div
                                key={movie._id || movie.id}
                                className="transition duration-300 hover:-translate-y-2"
                            >
                                <MovieCard movie={movie} />
                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">

                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-500">
                            <Clapperboard size={30} />
                        </div>

                        <h3 className="text-xl font-bold text-white">
                            No movies available yet
                        </h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                            We're getting the next movie experience ready.
                            Check back soon.
                        </p>

                    </div>

                )}

            </div>


            {/* Bottom CTA */}

            {!isShowsLoading && movies.length > 4 && (

                <div className="mt-16 flex justify-center">

                    <button
                        type="button"
                        onClick={openMovies}
                        className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-white transition duration-300 hover:border-pink-500/40 hover:bg-pink-500/10"
                    >

                        <Sparkles
                            size={17}
                            className="text-pink-400"
                        />

                        Discover more movies

                        <ChevronRight
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                        />

                    </button>

                </div>

            )}

        </section>

    );

};


export default FeaturedSection;
