import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "Missing bearer token" });
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("_id username email emailVerified profileImage");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token user" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
