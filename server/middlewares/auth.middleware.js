export const protectRoute = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization || req.headers.token;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const decodedToken = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}