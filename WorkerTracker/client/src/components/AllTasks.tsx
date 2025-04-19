import React from "react";
import { Task } from "@shared/schema";
import TaskCircle from "./TaskCircle";
import { Button } from "@/components/ui/button";
import { AddIcon, EditIcon, DeleteIcon } from "@/lib/icons";

interface AllTasksProps {
  tasks: Task[];
  onTaskClick: (id: number, type: "yes-no" | "letter") => void;
  onAddTask: () => void;
  onEditTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

const AllTasks: React.FC<AllTasksProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        <div className="flex gap-2">
          <Button
            variant="link"
            className="text-sm text-accent hover:underline flex items-center"
            onClick={onAddTask}
          >
            <AddIcon />
            Add Task
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center p-3 border rounded-lg bg-white shadow-sm"
          >
            <TaskCircle
              id={task.id}
              type={task.taskType as "yes-no" | "letter"}
              completed={task.isCompleted}
              letter={task.letterValue || ""}
              onClick={onTaskClick}
              small
            />
            <div className="flex-grow ml-4">
              <span className="font-medium">{task.name}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => onEditTask(task.id)}
              >
                <EditIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => onDeleteTask(task.id)}
              >
                <DeleteIcon />
              </Button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No tasks yet. Click "Add Task" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTasks;
