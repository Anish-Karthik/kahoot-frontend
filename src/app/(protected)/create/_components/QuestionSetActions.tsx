"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useSlides } from "./slides.hook";

const QuestionSetActions = () => {
  const validateAll = useSlides((state) => state.validateAllSlides);
  const slides = useSlides((state) => state.slides);
  return (
    <div className="flex py-2 gap-2">
      <Button
        className="text-center font-bold bg-gray-100 hover:bg-gray-200 text-black/90 w-20 rounded-sm shadow-sm"
        onClick={() => {}}
      >
        Exit
      </Button>
      <Button
        className="text-center font-bold bg-gray-200 hover:bg-gray-300 text-black/90 w-20 rounded-sm shadow-sm"
        onClick={() => {
          const isValid = validateAll();
          if (isValid) {
            alert("All questions are valid");
          } else {
            alert("Some questions are invalid");
          }
        }}
      >
        Save
      </Button>
    </div>
  );
};

export default QuestionSetActions;
