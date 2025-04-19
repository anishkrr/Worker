import React from "react";
import { Task } from "@shared/schema";
import TaskCircle from "./TaskCircle";
import { Button } from "@/components/ui/button";

interface DailyTasksProps {
  tasks: Task[];
  totalCount: number;
  completedCount: number;
  onTaskClick: (id: number, type: "yes-no" | "letter") => void;
  onCustomize: () => void;
}

const DailyTasks: React.FC<DailyTasksProps> = ({
  tasks,
  totalCount,
  completedCount,
  onTaskClick,
  onCustomize,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Daily Tasks</h2>
        <Button
          variant="link"
          className="text-sm text-accent hover:underline"
          onClick={onCustomize}
        >
          Customize
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
        {tasks.map((task) => (
          <TaskCircle
            key={task.id}
            id={task.id}
            type={task.taskType as "yes-no" | "letter"}
            completed={task.isCompleted}
            letter={task.letterValue || ""}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
};

export default DailyTasks;
