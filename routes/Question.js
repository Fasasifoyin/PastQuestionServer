import { Router } from "express";
import { createQuestion, getQuestions } from "../controllers/Questions.js";

const router = Router();

router.get("/questions", getQuestions);
router.post("/create/question", createQuestion);

export default router;
