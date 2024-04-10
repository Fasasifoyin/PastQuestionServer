import Question from "../models/Question.js";
import createHttpError from "http-errors";

import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getQuestions = async (req, res, next) => {
  try {
    const { fullName, level, semester, course, topic } = req.query;

    if (!fullName || !level || !semester || !course || !topic) {
      throw createHttpError(400, "Paremeters missing");
    }

    let query = { level: Number(level), semester };
    if (course !== "All") {
      query.course = course;
    }
    if (topic !== "All") {
      query.topic = topic;
    }

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: 30 } },
    ]);

    if (questions.length < 1) {
      throw createHttpError(400, "No available questions");
    }

    res.status(200).json({
      data: questions,
      info: { fullName, level, semester, course, topic },
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const { question, options, level, semester, course, topic, code } =
      req.body;

    if (
      !question ||
      !options ||
      !level ||
      !semester ||
      !course ||
      !topic ||
      !code
    ) {
      throw createHttpError(400, "Paremeters missing");
    }

    if (code !== Number(process.env.code)) {
      throw createHttpError(409, "Incorrect code");
    }

    let newImage = "";
    if (question.image) {
      const upload = await cloudinary.uploader.upload(question.image);
      newImage = upload.url;
    }

    const newQuestion = {
      question: question.question,
    };

    if (newImage) {
      newQuestion.image = newImage;
    }

    await Question.create({
      question: newQuestion,
      options,
      level,
      semester,
      course,
      topic
    })

    res.status(201).json("Question created successfully");
  } catch (error) {
    next(error);
  }
};
