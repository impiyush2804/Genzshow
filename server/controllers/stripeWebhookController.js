
import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

// ============================================================
// HELPER: SAVE STRIPE SESSION AND SEND PAYMENT EVENT
// ============================================================

const processSuccessfulPayment = async (session) => {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
        console.error(
            "Booking ID missing from Stripe session metadata:",
            session.id
        );

        return {
            success: false,
            message: "Booking ID missing."
        };
    }

    // Verify Stripe confirms payment
    if (session.payment_status !== "paid") {
        console.warn(
            "Stripe session is not paid:",
            session.id,
            session.payment_status
        );

        return {
            success: false,
            message: "Payment is not completed."
        };
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        console.error(
            "Booking not found:",
            bookingId
        );

        throw new Error(
            `Booking not found: ${bookingId}`
        );
    }

    // Verify that this is the expected Stripe session.
    if (
        booking.stripeSessionId &&
        booking.stripeSessionId !== session.id
    ) {
        throw new Error(
            `Stripe session mismatch for booking ${bookingId}`
        );
    }

    // Save Stripe session ID before sending Inngest event.
    if (booking.stripeSessionId !== session.id) {
        booking.stripeSessionId = session.id;
        await booking.save();
    }

    // Already confirmed: avoid unnecessary duplicate events.
    if (booking.isPaid === true) {
        console.log(
            "Booking already paid:",
            bookingId
        );

        return {
            success: true,
            alreadyPaid: true
        };
    }

    // Send payment confirmation event to Inngest.
    await inngest.send({
        name: "app/payment.success",
        data: {
            bookingId: booking._id.toString(),
            stripeSessionId: session.id
        }
    });

    console.log(
        "Payment confirmation event sent to Inngest:",
        bookingId
    );

    return {
        success: true
    };
};

// ============================================================
// STRIPE WEBHOOK
// ============================================================

export const stripeWebhooks = async (req, res) => {
    const signature = req.headers["stripe-signature"];

    // Check Stripe configuration
    if (!stripe) {
        console.error(
            "Stripe secret key is missing."
        );

        return res.status(500).send(
            "Stripe is not configured."
        );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error(
            "Stripe webhook secret is missing."
        );

        return res.status(500).send(
            "Stripe webhook is not configured."
        );
    }

    if (!signature) {
        return res.status(400).send(
            "Stripe signature missing."
        );
    }

    // Verify webhook signature
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(
            "STRIPE SIGNATURE VERIFICATION ERROR:",
            error.message
        );

        return res.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }

    console.log(
        "Stripe webhook received:",
        event.type,
        event.id
    );

    try {
        switch (event.type) {

            // ------------------------------------------------
            // CHECKOUT COMPLETED
            // ------------------------------------------------

            case "checkout.session.completed": {
                const session = event.data.object;

                console.log(
                    "Checkout session completed:",
                    session.id,
                    "Payment status:",
                    session.payment_status
                );

                if (session.payment_status === "paid") {
                    await processSuccessfulPayment(session);
                } else {
                    // Save session ID even if payment is still processing.
                    const bookingId = session.metadata?.bookingId;

                    if (bookingId) {
                        await Booking.findByIdAndUpdate(
                            bookingId,
                            {
                                stripeSessionId: session.id
                            }
                        );
                    }

                    console.log(
                        "Payment not completed yet:",
                        session.id
                    );
                }

                break;
            }

            // ------------------------------------------------
            // ASYNC PAYMENT SUCCESS
            // ------------------------------------------------

            case "checkout.session.async_payment_succeeded": {
                const session = event.data.object;

                console.log(
                    "Asynchronous payment succeeded:",
                    session.id
                );

                await processSuccessfulPayment(session);

                break;
            }

            // ------------------------------------------------
            // ASYNC PAYMENT FAILED
            // ------------------------------------------------

            case "checkout.session.async_payment_failed": {
                const session = event.data.object;

                console.warn(
                    "Asynchronous payment failed:",
                    session.id
                );

                // Do not mark the booking as paid.
                // Your existing expiry workflow can release seats.

                break;
            }

            // ------------------------------------------------
            // CHECKOUT EXPIRED
            // ------------------------------------------------

            case "checkout.session.expired": {
                const session = event.data.object;

                console.log(
                    "Stripe checkout session expired:",
                    session.id
                );

                // Do not change payment status here.
                // Preserve your existing booking expiry workflow.

                break;
            }

            // ------------------------------------------------
            // OTHER EVENTS
            // ------------------------------------------------

            default: {
                console.log(
                    "Unhandled Stripe event:",
                    event.type
                );
            }
        }

        return res.status(200).json({
            received: true
        });

    } catch (error) {
        console.error(
            "STRIPE WEBHOOK HANDLER ERROR:",
            error
        );

        // Stripe retries webhook events after a server error.
        return res.status(500).json({
            received: false,
            message: "Webhook processing failed."
        });
    }
};
