import type { NextFunction } from "express";
import type { Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"

export interface IUser extends Document {
  _id: string
  name: string,
  email: string,
  image: string,
  instagram: string,
  facebook: string,
  linkedin: string,
  bio: string
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).json({
        message: "Please login no auth heaader"
      });
      return
    }
    const token = authHeader.split(" ")[1];
    //@ts-ignore
    const decodeValue = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;

    if (!decodeValue || !decodeValue.user) {
      res.status(401).json({
        message: "Invalid token"
      })
      return
    }

    req.user = decodeValue.user
    next()

  } catch (error) {
    console.log("JWT verification error", error);
    res.status(401).json({
      message: "Please Login - Jwt Error"
    })
  }
}