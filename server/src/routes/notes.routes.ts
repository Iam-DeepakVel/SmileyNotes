import { Router } from "express";
import * as NotesController from "../controllers/notes.controllers";
 
const router = Router();

router.route("/").get(NotesController.getAllNotes).post(NotesController.createNote)
router.route("/:noteId").get(NotesController.getSingleNote).patch(NotesController.updateNote).delete(NotesController.deleteNote)

export { router as noteRoutes };
