import { clerkClient, getAuth } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        console.log("USER ID:", userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const user =
            await clerkClient.users.getUser(userId);

        console.log(
            "PRIVATE METADATA:",
            user.privateMetadata
        );

        if (
            user.privateMetadata?.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        next();

    } catch (error) {

        console.error(
            "protectAdmin ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};