import { Router } from "express";
import {
  countQuestionPerCourse,
  createQuestion,
  deleteQuestion,
  editQuestion,
  getQuestions,
  searchQuestion,
} from "../controllers/Questions.js";

const router = Router();

router.get("/questions", getQuestions);
router.post("/create", createQuestion);
router.get("/search", searchQuestion);
router.delete("/delete", deleteQuestion);
router.patch("/edit", editQuestion);
router.get("/count", countQuestionPerCourse)

export default router;
