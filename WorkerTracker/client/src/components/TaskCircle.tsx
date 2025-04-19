import React from "react";
import { cn } from "@/lib/utils";

interface TaskCircleProps {
  id: number;
  type: "yes-no" | "letter";
  completed?: boolean;
  letter?: string;
  onClick: (id: number, type: "yes-no" | "letter") => void;
  small?: boolean;
}

const TaskCircle: React.FC<TaskCircleProps> = ({
  id,
  type,
  completed = false,
  letter = "",
  onClick,
  small = false,
}) => {
  const handleClick = () => {
    onClick(id, type);
  };

  return (
    <div
      className={cn(
        "task-circle flex items-center justify-center border-2 rounded-full cursor-pointer relative",
        completed && type === "yes-no" ? "bg-primary border-primary" : "border-primary",
        small ? "w-6 h-6 flex-shrink-0" : "aspect-square"
      )}
      onClick={handleClick}
    >
      {completed && type === "yes-no" && (
        <div className="absolute w-3/4 h-0.5 bg-white rotate-45 rounded-full"></div>
      )}
      {type === "letter" && (
        <span className={cn(
          "font-bold",
          small ? "text-sm" : "text-lg",
          completed ? "line-through text-gray-500" : ""
        )}>
          {letter}
        </span>
      )}
    </div>
  );
};

export default TaskCircle;
