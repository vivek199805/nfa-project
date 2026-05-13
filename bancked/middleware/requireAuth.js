import { verifyToken } from "../utils/jwt.util.js";
import { findUserById } from "../repositories/user.repository.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    // const authHeader = req.header('Authorization') ?? req.header('authorization');
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized", statusCode: 401 });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Invalid authorization header",
        status: 'failure',
        responsecode: 'UNAUTHORIZED',
        message: 'Authorization token missing',
        statusCode: 401
      });
    }

    const decoded = verifyToken(token);
    
    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found", statusCode: 401 });
    }

    req.user = {
      ...user,
      _id: user.id,
      toObject: () => ({ ...user, _id: user.id }),
    };
    req.token = token;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token", statusCode: 401, status: 'failure', responsecode: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
