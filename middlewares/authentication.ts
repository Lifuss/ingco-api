import jwt from 'jsonwebtoken';
import requestError from '../utils/requestError';

import { NextFunction, Response } from 'express';
import { CustomRequest, IUser } from '../types/express';
import User from '../models/User';

const authentication = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { authorization = '' } = req.headers;

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw requestError(401);
    }

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const secretKey: string = process.env.JWT_SECRET;

    const { id } = jwt.verify(token, secretKey) as { id: string };

    const user = await User.findById(id);

    if (user && user.token && user.token === token) {
      req.user = user.toObject() as IUser;
    } else {
      throw requestError(401);
    }

    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (!error.status) {
      error.status = 401;
      error.message = 'Unauthorized';
    }
    next(error);
  }
};

export default authentication;
