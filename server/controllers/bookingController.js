
// server/controllers/bookingController.js

import Stripe from "stripe";
import mongoose from "mongoose";
import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

// ============================================================
// HELPER: RELEASE SEATS SAFELY
// ============================================================

const releaseBookingSeats = async (booking) => {
    if (!booking?.show || !booking?.bookedSeats?.length) {
        return;
    }

    for (const seat of booking.bookedSeats) {
        await Show.updateOne(
            {
                _id: booking.show,
                [`occupiedSeats.${seat}`]: booking.user,
            },
            {
                $unset: {
                    [`occupiedSeats.${seat}`]: "",
                },
            }
        );
    }
};

// ============================================================
// HELPER: HANDLE BOOKING CLEANUP
// ============================================================

const handleBookingCleanup = async ({
    booking,
    stripeSession,
    seatsReserved,
}) => {
    if (!booking) return;

    // No Stripe session was created.
    // The booking can safely be removed.
    if (!stripeSession?.id) {
        if (seatsReserved) {
            await releaseBookingSeats(booking);
        }

        await Booking.findByIdAndDelete(booking._id);
        return;
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(
            stripeSession.id
        );

        // Payment succeeded. Never delete this booking.
        if (session.payment_status === "paid") {
            booking.stripeSessionId = session.id;
            await booking.save();

            await inngest.send({
                name: "app/payment.success",
                data: {
                    bookingId: booking._id.toString(),
                    sessionId: session.id,
                },
            });

            return;
        }

        // Expire an unpaid open Checkout Session.
        if (session.status === "open") {
            try {
                await stripe.checkout.sessions.expire(session.id);
            } catch (error) {
                console.error(
                    "STRIPE EXPIRY ERROR:",
                    error.message
                );
            }
        }

        const latestSession =
            await stripe.checkout.sessions.retrieve(
                stripeSession.id
            );

        // Release seats only after confirmed expiry.
        if (
            latestSession.status === "expired" &&
            latestSession.payment_status !== "paid"
        ) {
            await releaseBookingSeats(booking);

            booking.status = "expired";
            booking.isPaid = false;
            booking.stripeSessionId = latestSession.id;

            await booking.save();
        }

        // If Stripe cannot confirm expiry, preserve the booking.
    } catch (error) {
        console.error(
            "BOOKING CLEANUP RECONCILIATION ERROR:",
            error
        );
    }
};

// ============================================================
// CREATE BOOKING
// ============================================================

export const createBooking = async (req, res) => {
    let booking = null;
    let showData = null;
    let stripeSession = null;
    let seatsReserved = false;

    try {
        const { userId } = req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login to continue.",
            });
        }

        const { showId, selectedSeats } = req.body;

        if (
            !showId ||
            !mongoose.Types.ObjectId.isValid(showId)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid Show ID is required.",
            });
        }

        if (
            !Array.isArray(selectedSeats) ||
            selectedSeats.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one seat.",
            });
        }

        if (selectedSeats.length > 5) {
            return res.status(400).json({
                success: false,
                message: "You can only select 5 seats.",
            });
        }

        const uniqueSeats = [...new Set(selectedSeats)];

        if (uniqueSeats.length !== selectedSeats.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate seats selected.",
            });
        }

        // Seat layout: A1-J9
        const validSeatPattern = /^[A-J][1-9]$/;

        const invalidSeat = uniqueSeats.find(
            (seat) =>
                typeof seat !== "string" ||
                !validSeatPattern.test(seat)
        );

        if (invalidSeat) {
            return res.status(400).json({
                success: false,
                message: `Invalid seat: ${invalidSeat}`,
            });
        }

        // ----------------------------------------------------
        // FIND SHOW
        // ----------------------------------------------------

        showData = await Show.findById(showId)
            .populate("movie")
            .populate("theatre");

        if (!showData) {
            return res.status(404).json({
                success: false,
                message: "Show not found.",
            });
        }

        if (new Date(showData.showDateTime) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "This show has already started or ended.",
            });
        }

        const showPrice = Number(showData.showPrice);

        if (!Number.isFinite(showPrice) || showPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid show price.",
            });
        }

        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: "Stripe is not configured on the server.",
            });
        }

        const totalAmount = Number(
            (showPrice * uniqueSeats.length).toFixed(2)
        );

        // ----------------------------------------------------
        // CREATE PENDING BOOKING
        // ----------------------------------------------------

        booking = await Booking.create({
            user: userId,
            show: showId,
            amount: totalAmount,
            bookedSeats: uniqueSeats,
            isPaid: false,
            status: "pending",
            paymentLink: "",
            stripeSessionId: "",
            paidAt: null,
        });

        // ----------------------------------------------------
        // ATOMIC SEAT RESERVATION
        // ----------------------------------------------------

        const seatFilter = {
            _id: showId,
        };

        const seatUpdates = {};

        uniqueSeats.forEach((seat) => {
            seatFilter[`occupiedSeats.${seat}`] = {
                $exists: false,
            };

            seatUpdates[`occupiedSeats.${seat}`] = userId;
        });

        const reservedShow = await Show.findOneAndUpdate(
            seatFilter,
            {
                $set: seatUpdates,
            },
            {
                new: true,
            }
        );

        if (!reservedShow) {
            await Booking.findByIdAndDelete(booking._id);
            booking = null;

            return res.status(409).json({
                success: false,
                message: "One or more selected seats are already booked.",
            });
        }

        seatsReserved = true;

        // ----------------------------------------------------
        // STRIPE CHECKOUT
        // ----------------------------------------------------

        const frontendUrl = (
            process.env.FRONTEND_URL ||
            req.headers.origin ||
            "http://localhost:5173"
        ).replace(/\/+$/, "");

        const stripeAmount = Math.round(totalAmount * 100);

        if (
            !Number.isSafeInteger(stripeAmount) ||
            stripeAmount <= 0
        ) {
            throw new Error("Invalid payment amount.");
        }

        const movieTitle =
            showData.movie?.title || "Movie Ticket";

        const theatreName =
            showData.theatre?.name || "Theatre";

        stripeSession = await stripe.checkout.sessions.create({
            mode: "payment",

            payment_method_types: ["card"],

            success_url:
                `${frontendUrl}/loading/my-bookings` +
                `?bookingId=${booking._id}` +
                `&session_id={CHECKOUT_SESSION_ID}`,

            cancel_url:
                `${frontendUrl}/my-bookings`,

            line_items: [
                {
                    price_data: {
                        currency: "inr",

                        product_data: {
                            name: movieTitle,
                            description:
                                `${theatreName} - Seats: ${uniqueSeats.join(", ")}`,
                        },

                        unit_amount: stripeAmount,
                    },

                    quantity: 1,
                },
            ],

            client_reference_id: booking._id.toString(),

            metadata: {
                bookingId: booking._id.toString(),
                showId: showId.toString(),
                userId: userId.toString(),
            },

            expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
        });

        // ----------------------------------------------------
        // SAVE STRIPE SESSION
        // ----------------------------------------------------

        booking.paymentLink = stripeSession.url || "";
        booking.stripeSessionId = stripeSession.id;

        await booking.save();

        // ----------------------------------------------------
        // START INNGEST EXPIRY WORKFLOW
        // ----------------------------------------------------

        try {
            await inngest.send({
                name: "app/checkpayment",
                data: {
                    bookingId: booking._id.toString(),
                },
            });
        } catch (inngestError) {
            console.error(
                "INNGEST PAYMENT EVENT ERROR:",
                inngestError
            );

            // Keep the valid Stripe session and booking.
            // Payment webhook can still confirm the booking.
        }

        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(200).json({
            success: true,
            url: stripeSession.url,
            bookingId: booking._id,
            showId,
            theatreId: showData.theatre?._id,
            selectedSeats: uniqueSeats,
            amount: totalAmount,
        });

    } catch (error) {
        console.error("CREATE BOOKING ERROR:", error);

        try {
            await handleBookingCleanup({
                booking,
                stripeSession,
                seatsReserved,
            });
        } catch (cleanupError) {
            console.error(
                "BOOKING CLEANUP ERROR:",
                cleanupError
            );
        }

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to create booking.",
        });
    }
};

// ============================================================
// GET OCCUPIED SEATS
// ============================================================

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;

        if (
            !showId ||
            !mongoose.Types.ObjectId.isValid(showId)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid Show ID is required.",
            });
        }

        const showData = await Show.findById(showId);

        if (!showData) {
            return res.status(404).json({
                success: false,
                message: "Show not found.",
            });
        }

        const occupiedSeats = Object.keys(
            showData.occupiedSeats || {}
        );

        return res.status(200).json({
            success: true,
            showId: showData._id,
            theatreId: showData.theatre,
            occupiedSeats,
        });

    } catch (error) {
        console.error("GET OCCUPIED SEATS ERROR:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to get occupied seats.",
        });
    }
};
