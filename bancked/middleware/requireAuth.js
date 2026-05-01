import { verifyToken } from "../utils/jwt.util.js";
import User from "../models/mongodbModels/user.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized", statusCode: 401 });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid authorization header", statusCode: 401 });
    }

    const decoded = verifyToken(token);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found", statusCode: 401 });
    }

    req.user = user;
    req.token = token;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token", statusCode: 401 });
  }
}
