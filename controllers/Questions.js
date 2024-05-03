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

    let query = { level: Number(level), semester, course };
    if (topic.toUpperCase() !== "ALL") {
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

    const existingQuestion = await Question.findOne({
      "question.question": { $regex: new RegExp(question.question, "i") },
    });

    let existingOption;

    if (existingQuestion) {
      for (const newOption of options) {
        existingOption = existingQuestion.options.find(
          (option) =>
            option.answerText.toLowerCase() ===
            newOption.answerText.toLowerCase()
        );

        if (existingOption) {
          break;
        }
      }
    }

    if (
      existingOption &&
      existingQuestion.course === course &&
      existingQuestion.topic === topic
    ) {
      throw createHttpError(
        400,
        "You can't have question with the same option(s) for the same course and same topic"
      );
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
      topic,
    });

    res.status(201).json({ message: "Question created successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchQuestion = async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const search = req.query.search;
    if (!page || !search) {
      throw createHttpError(400, "Parameters missing");
    }

    const LIMIT = 5;
    const startIndex = (page - 1) * LIMIT;

    const query = { $text: { $search: search } };

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / LIMIT);

    const questions = await Question.find(query).skip(startIndex).limit(LIMIT);

    res.status(200).json({
      data: questions,
      currentPage: page,
      totalPages,
      totalQuestions: total,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { code, id } = req.query;
    if (!code || !id) {
      throw createHttpError(400, "Paraneter missing");
    }

    if (Number(code) !== Number(process.env.code)) {
      throw createHttpError(409, "Incorrect code");
    }

    const questionExist = await Question.findById(id);
    if (!questionExist) {
      throw createHttpError(404, "Question not found");
    }

    const deletedQuestion = await Question.findByIdAndDelete(id);

    res.status(200).json({ id: deletedQuestion._id });
  } catch (error) {
    next(error);
  }
};

export const editQuestion = async (req, res, next) => {
  try {
    const { question, options, level, semester, course, topic, code, id } =
      req.body;

    if (
      !question ||
      !options ||
      !level ||
      !semester ||
      !course ||
      !topic ||
      !id ||
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

    await Question.findByIdAndUpdate(
      id,
      {
        question: newQuestion,
        options,
        level,
        semester,
        course,
        topic,
      },
      { new: true }
    );

    res.status(200).json({ message: "Question updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const countQuestionPerCourse = async (req, res, next) => {
  try {
    const questionCounts = await Question.aggregate([
      {
        $group: {
          _id: { course: "$course", topic: "$topic" },
          totalQuestions: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.course",
          totalQuestionsInCourse: { $sum: "$totalQuestions" },
          topics: {
            $push: { topic: "$_id.topic", totalQuestions: "$totalQuestions" },
          },
        },
      },
    ]);
    res.status(200).json(questionCounts);
  } catch (error) {
    next(error);
  }
};
