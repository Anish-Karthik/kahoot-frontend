import { create } from "zustand";

export type QuestionType = "QUIZ" | "TRUE_OR_FALSE";
export type PointType = "STANDARD" | "NO_POINTS";
export type AnswerOptionsType = "SINGLE_SELECT" | "MULTI_SELECT";

export const QuestionTypeOptions: QuestionType[] = ["QUIZ", "TRUE_OR_FALSE"];
export const PointTypeOptions: PointType[] = ["STANDARD", "NO_POINTS"];
export const AnswerOptionsTypeOptions: AnswerOptionsType[] = [
  "SINGLE_SELECT",
  "MULTI_SELECT",
];

export type SlideSettings = {
  questionType: QuestionType;
  timeLimit: number;
  points: PointType;
  answerOptions: AnswerOptionsType;
};

export type Answer = {
  isCorrect: boolean;
  answer: string;
  imageUrl?: string;
};

export type Slide = SlideSettings & {
  id?: number;
  question: string;
  image?: string;
  answers: Answer[];
};
export type CurrentSlideSettingActions = {
  setQuestionType: (questionType: SlideSettings["questionType"]) => void;
  setPoints: (points: SlideSettings["points"]) => void;
  setAnswerOptions: (answerOptions: SlideSettings["answerOptions"]) => void;
  setTimeLimit: (timeLimit: number) => void;
};
export type CurrentSlideActions = CurrentSlideSettingActions & {
  setQuestion: (question: string) => void;
  setImage: (image: string) => void;
  addAnswer: (answer: Answer) => void;
  removeAnswer: (index: number) => void;
  setAnswer: (index: number, answer: Answer) => void;
  setAnswerText: (index: number, answer: string) => void;
  setAnswerImage: (index: number, answer: string) => void;
  toggleAnswerCorrect: (index: number) => void;
};

export type SlidesState = {
  slides: Slide[];
  currentSlideIndex: number;
  currentSlide: Slide;
  currentSlideActions: CurrentSlideActions;
  addDefaultSlide: () => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  setCurrentSlide: (index: number) => void;
  removeCurrentSlide: () => void;
  duplicateCurrentSlide: () => void;
};

const defaultSlide: Slide = {
  id: 0,
  question: "",
  questionType: "QUIZ",
  timeLimit: 20,
  points: "STANDARD",
  answerOptions: "SINGLE_SELECT",
  answers: [
    { isCorrect: false, answer: "" },
    { isCorrect: false, answer: "" },
    { isCorrect: false, answer: "" },
    { isCorrect: false, answer: "" },
  ],
};

export const useSlides = create<SlidesState>((set) => ({
  slides: [defaultSlide],
  currentSlideIndex: 0,
  get currentSlide() {
    return this.slides[this.currentSlideIndex];
  },
  addDefaultSlide: () =>
    set((state) => ({ slides: [...state.slides, defaultSlide] })),
  addSlide: (slide) => set((state) => ({ slides: [...state.slides, slide] })),
  removeSlide: (index) =>
    set((state) => ({ slides: state.slides.filter((_, i) => i !== index) })),
  duplicateSlide: (index) =>
    set((state) => ({ slides: [...state.slides, state.slides[index]] })),
  setCurrentSlide: (index) => set({ currentSlideIndex: index }),
  currentSlideActions: {
    setQuestion: (question) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex ? { ...slide, question } : slide
        ),
      })),
    setImage: (image) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex ? { ...slide, image } : slide
        ),
      })),
    addAnswer: (answer) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex
            ? { ...slide, answers: [...slide.answers, answer] }
            : slide
        ),
      })),
    removeAnswer: (index) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex
            ? {
                ...slide,
                answers: slide.answers.filter((_, j) => j !== index),
              }
            : slide
        ),
      })),
    setAnswer: (index, answer) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex
            ? {
                ...slide,
                answers: slide.answers.map((ans, j) =>
                  j === index ? answer : ans
                ),
              }
            : slide
        ),
      })),

    setAnswerText: (index, answer) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex
            ? {
                ...slide,
                answers: slide.answers.map((ans, j) =>
                  j === index ? { ...ans, answer } : ans
                ),
              }
            : slide
        ),
      })),
    setAnswerImage: (index, imageUrl) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex
            ? {
                ...slide,
                answers: slide.answers.map((ans, j) =>
                  j === index ? { ...ans, imageUrl } : ans
                ),
              }
            : slide
        ),
      })),
      
    toggleAnswerCorrect: (index) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex
            ? {
                ...slide,
                answers: slide.answers.map((ans, j) =>
                  j === index
                    ? { ...ans, isCorrect: !ans.isCorrect }
                    : slide.questionType === "QUIZ"
                    ? ans
                    : { ...ans, isCorrect: !ans.isCorrect }
                ),
              }
            : slide
        ),
      })),
    setQuestionType: (questionType) => {
      console.log(questionType);
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex
            ? {
                ...slide,
                questionType,
                answers:
                  questionType === "QUIZ"
                    ? defaultSlide.answers
                    : [
                        { isCorrect: true, answer: "True" },
                        { isCorrect: false, answer: "False" },
                      ],
              }
            : slide
        ),
      }));
    },
    setPoints: (points) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex ? { ...slide, points } : slide
        ),
      })),
    setAnswerOptions: (answerOptions) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex ? { ...slide, answerOptions } : slide
        ),
      })),
    setTimeLimit: (timeLimit) =>
      set((state) => ({
        slides: state.slides.map((slide, i) =>
          i === state.currentSlideIndex ? { ...slide, timeLimit } : slide
        ),
      })),
  },
  removeCurrentSlide: () =>
    set((state) => ({
      slides: state.slides.filter((_, i) => i !== state.currentSlideIndex),
    })),
  duplicateCurrentSlide: () =>
    set((state) => ({
      slides: [...state.slides, state.slides[state.currentSlideIndex]],
    })),
}));
