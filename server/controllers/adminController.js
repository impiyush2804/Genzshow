
import { clerkClient } from "@clerk/express";

import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// API to check if user is admin
export const isAdmin = async (req, res) => {
    // Keep your existing admin middleware/authorization
    // and add actual role verification before production.
    return res.json({
        success: true,
        isAdmin: true
    });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        // 1. Get actual registered users from Clerk
        const totalUser = await clerkClient.users.getCount();

        // 2. Count paid bookings and calculate revenue
        // Based on your Booking model, isPaid is the payment indicator.
        const [bookingStats] = await Booking.aggregate([
            {
                $match: {
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: {
                        $sum: 1
                    },
                    totalRevenue: {
                        $sum: {
                            $ifNull: ["$amount", 0]
                        }
                    }
                }
            }
        ]);

        // 3. Fetch upcoming shows
        const activeShows = await Show.find({
            showDateTime: {
                $gte: new Date()
            }
        })
            .populate("movie")
            .sort({
                showDateTime: 1
            });

        // 4. Dashboard response
        const dashboardData = {
            totalBookings: bookingStats?.totalBookings || 0,
            totalRevenue: bookingStats?.totalRevenue || 0,
            activeShows,
            totalUser: totalUser || 0
        };

        return res.status(200).json({
            success: true,
            dashboardData
        });

    } catch (error) {
        console.error("Dashboard data error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// API to get all upcoming shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({
            showDateTime: {
                $gte: new Date()
            }
        })
            .populate("movie")
            .sort({
                showDateTime: 1
            });

        return res.status(200).json({
            success: true,
            shows
        });

    } catch (error) {
        console.error("Get all shows error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate({
                path: "show",
                populate: [
                    {
                        path: "movie"
                    },
                    {
                        path: "theatre"
                    }
                ]
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error("Get all bookings error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
