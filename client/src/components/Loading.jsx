import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Loading = () => {
    const { nextUrl } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const destination = nextUrl
            ? `/${nextUrl}`
            : "/my-bookings";

        const timer = setTimeout(() => {
            navigate(destination, {
                replace: true,
            });
        }, 8000);

        return () => clearTimeout(timer);
    }, [nextUrl, navigate]);

    return (
        <div className="flex flex-col justify-center items-center h-[80vh] gap-5">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-primary" />

            <p className="text-sm text-gray-400">
                Processing your booking...
            </p>

            <p className="text-xs text-gray-500">
                Please wait while we update your booking status.
            </p>
        </div>
    );
};

export default Loading;