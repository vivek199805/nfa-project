import { verifyToken } from "../utils/jwt.util.js";
import User from "../models/mongodbModels/user.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];  
    const decoded = verifyToken(token);    
     const user = await User.findOne({_id: decoded.userId})
     
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found", statusCode:401 });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
