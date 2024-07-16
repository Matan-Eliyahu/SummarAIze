import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../controllers/AuthController";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // JWT <token>
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user as { _id: string };
    next();
  });
}

export default authMiddleware;
