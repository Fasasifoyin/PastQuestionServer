import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: {
        question: String,
        image: {
          type: String,
          required: false,
        },
      },
      required: true,
    },
    options: {
      type: [
        {
          option: String,
          answerText: String,
          isCorrect: Boolean,
        },
      ],
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
