import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.session.userId)
      .select("+email")
      .exec();
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

interface signUpDto {
  username?: string;
  email?: string;
  password?: string;
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  signUpDto,
  unknown
> = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        "Please enter the credentials!!"
      );
    }
    const existingUsername = await UserModel.findOne({
      username: username,
    }).exec();
    if (existingUsername) {
      throw createHttpError(
        StatusCodes.CONFLICT,
        "Username already taken! Please choose a different one or log in instead!"
      );
    }

    const existingEmail = await UserModel.findOne({ email }).exec();
    if (existingEmail) {
      throw createHttpError(
        StatusCodes.CONFLICT,
        "A user with this email address already exists. Please log in instead!"
      );
    }

    const passwordHashed = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      username,
      email,
      password: passwordHashed,
    });

    req.session.userId = newUser._id;

    res.status(StatusCodes.CREATED).json(newUser);
  } catch (error) {
    next(error);
  }
};

interface LoginDto {
  username?: string;
  password?: string;
}

export const login: RequestHandler<
  unknown,
  unknown,
  LoginDto,
  unknown
> = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        "Please provide the credentials"
      );
    }

    const user = await UserModel.findOne({ username })
      .select("+password +email")
      .exec();
    if (!user) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }
    req.session.userId = user._id;
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  req.session.destroy((error) => {
    error ? next(error) : res.sendStatus(StatusCodes.OK);
  });
};
