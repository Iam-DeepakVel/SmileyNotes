import { RequestHandler } from "express";
import createHttpError from "http-errors";
import NoteModel from "../models/note.model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { assertIsDefined } from "../util/assertIsDefined";

export const getAllNotes: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  try {
    // Making a check whether authenicatedUserId is surely has a value or not
    assertIsDefined(authenticatedUserId);
    const notes = await NoteModel.find({ userId: authenticatedUserId }).exec();
    res.status(StatusCodes.OK).json(notes);
  } catch (error) {
    next(error);
  }
};

export const getSingleNote: RequestHandler = async (req, res, next) => {
  const { noteId } = req.params;
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    // Checks whether the shape of noteId is correct
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid note id");
    }
    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Note not Found");
    }

    if (!note.userId.equals(authenticatedUserId)) {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "You cannot access this note"
      );
    }

    res.status(StatusCodes.OK).json(note);
  } catch (error) {
    next(error);
  }
};

interface CreateNoteDto {
  title?: string;
  text?: string;
}

export const createNote: RequestHandler<
  unknown,
  unknown,
  CreateNoteDto,
  unknown
> = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  const { title, text } = req.body;
  try {
    assertIsDefined(authenticatedUserId);
    if (!title) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Title is required");
    }
    const newNote = await NoteModel.create({
      userId: authenticatedUserId,
      title,
      text,
    });
    res.status(StatusCodes.CREATED).json(newNote);
  } catch (error) {
    next(error);
  }
};

interface UpdateNoteDto {
  title?: string;
  text?: string;
}

interface UpdateNoteParams {
  noteId: string;
}

export const updateNote: RequestHandler<
  UpdateNoteParams,
  unknown,
  UpdateNoteDto,
  unknown
> = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  const { noteId } = req.params;
  const { title, text } = req.body;
  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid note id");
    }
    if (!title) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Title is required");
    }
    const note = await NoteModel.findById(noteId).exec();
    if (!note) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Note not Found");
    }

    // Checking whether the note that is being updated is his own note
    if (!note.userId.equals(authenticatedUserId)) {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "You cannot access this note"
      );
    }

    note.title = title;
    note.text = text;
    const updatedNote = await note.save();
    res.status(StatusCodes.OK).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote: RequestHandler = async (req, res, next) => {
  const { noteId } = req.params;
  const authenticatedUserId = req.session.userId;
  try {
    assertIsDefined(authenticatedUserId);
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid note id");
    }
    const note = await NoteModel.findByIdAndRemove(noteId).exec();
    if (!note) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Note not Found");
    }
    // Checking whether the note that is being updated is his own note
    if (!note.userId.equals(authenticatedUserId)) {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "You cannot access this note"
      );
    }
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};
