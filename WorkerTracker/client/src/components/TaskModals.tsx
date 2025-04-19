import React, { useState, useEffect } from "react";
import { Task } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { EditIcon, DeleteIcon } from "@/lib/icons";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task;
  isEdit?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  isEdit = false,
}) => {
  const [name, setName] = useState("");
  const [taskType, setTaskType] = useState<"yes-no" | "letter" | "subjective">("yes-no");
  const [letter, setLetter] = useState("");
  const [subjectiveContent, setSubjectiveContent] = useState("");
  
  // New fields for scheduling
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hasTimeRequired, setHasTimeRequired] = useState(true);
  const [duration, setDuration] = useState(30); // default 30 minutes
  const [notificationTime, setNotificationTime] = useState(15); // default 15 minutes before
  
  // Recurrence fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<string>("daily");
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(undefined);
  
  // Is daily task
  const [isDaily, setIsDaily] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setTaskType(task.taskType as "yes-no" | "letter" | "subjective");
      setLetter(task.letterValue || "");
      setSubjectiveContent(task.subjectiveContent || "");
      setIsDaily(task.isDaily || false);
      
      // Set scheduling fields
      if (task.scheduledDate) {
        setDate(new Date(task.scheduledDate));
      } else {
        setDate(undefined);
      }
      
      setTime(task.scheduledTime || "");
      setEndTime(task.endTime || "");
      setHasTimeRequired(task.hasTimeRequired !== false);
      setDuration(task.duration || 30);
      setNotificationTime(task.notificationTime || 15);
      
      // Set recurrence fields
      setIsRecurring(task.isRecurring || false);
      setRecurringType(task.recurringType || "daily");
      setRecurringDays(task.recurringDays ? task.recurringDays.split(",") : []);
      
      if (task.recurringEndDate) {
        setRecurringEndDate(new Date(task.recurringEndDate));
      } else {
        setRecurringEndDate(undefined);
      }
    } else {
      // Reset all fields when adding a new task
      setName("");
      setTaskType("yes-no");
      setLetter("");
      setSubjectiveContent("");
      setDate(undefined);
      setTime("");
      setEndTime("");
      setHasTimeRequired(true);
      setDuration(30);
      setNotificationTime(15);
      setIsRecurring(false);
      setRecurringType("daily");
      setRecurringDays([]);
      setRecurringEndDate(undefined);
      setIsDaily(false);
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<Task> = {
      name,
      taskType,
      letterValue: taskType === "letter" ? letter.toUpperCase().charAt(0) : null,
      subjectiveContent: taskType === "subjective" ? subjectiveContent : null,
      isDaily,
      
      // Scheduling data
      scheduledDate: date ? date.toISOString().split('T')[0] : null,
      scheduledTime: hasTimeRequired ? time || null : null,
      endTime: hasTimeRequired ? endTime || null : null,
      hasTimeRequired,
      duration: hasTimeRequired ? duration || null : null,
      notificationTime: hasTimeRequired ? notificationTime || null : null,
      
      // Recurrence data
      isRecurring,
      recurringType: isRecurring ? recurringType : null,
      recurringDays: isRecurring && recurringDays.length > 0 ? recurringDays.join(",") : null,
      recurringEndDate: isRecurring && recurringEndDate ? recurringEndDate.toISOString().split('T')[0] : null,
    };
    
    onSave(taskData);
  };

  // Helper to generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeValue = `${formattedHour}:${formattedMinute}`;
        const displayTime = `${hour % 12 || 12}:${formattedMinute} ${hour < 12 ? 'AM' : 'PM'}`;
        options.push({ value: timeValue, label: displayTime });
      }
    }
    return options;
  };

  // Days of the week options
  const daysOfWeek = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "7", label: "Sunday" },
  ];

  // Toggle a day selection for recurring weekly tasks
  const toggleDay = (dayValue: string) => {
    setRecurringDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(day => day !== dayValue)
        : [...prev, dayValue]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Task" : "Add New Task"}
          </DialogTitle>
          <DialogDescription>
            Enter task details including scheduling and notification preferences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Task Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-name" className="text-sm font-medium">
                Task Name
              </Label>
              <Input
                id="task-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter task name"
                required
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="is-daily" className="text-sm font-medium">
                Add to Daily Tasks
              </Label>
              <Switch
                id="is-daily"
                checked={isDaily}
                onCheckedChange={setIsDaily}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Task Type
              </Label>
              <RadioGroup 
                value={taskType} 
                onValueChange={(value) => setTaskType(value as "yes-no" | "letter" | "subjective")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes-no" id="task-type-yes-no" />
                  <Label htmlFor="task-type-yes-no">Yes/No Task</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="letter" id="task-type-letter" />
                  <Label htmlFor="task-type-letter">Letter Task</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subjective" id="task-type-subjective" />
                  <Label htmlFor="task-type-subjective">Subjective Task</Label>
                </div>
              </RadioGroup>
            </div>
            
            {taskType === "letter" && (
              <div>
                <Label htmlFor="task-letter" className="text-sm font-medium">
                  Default Letter
                </Label>
                <Input
                  id="task-letter"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value.substring(0, 1).toUpperCase())}
                  className="w-16 text-center uppercase mt-1"
                  maxLength={1}
                  placeholder="A"
                />
              </div>
            )}
            
            {taskType === "subjective" && (
              <div>
                <Label htmlFor="task-subjective" className="text-sm font-medium">
                  Subjective Content
                </Label>
                <Textarea
                  id="task-subjective"
                  value={subjectiveContent}
                  onChange={(e) => setSubjectiveContent(e.target.value)}
                  className="mt-1"
                  placeholder="Enter details about this subjective task..."
                  rows={3}
                />
              </div>
            )}
          </div>
          
          {/* Scheduling Section */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium">Task Scheduling</h3>
            
            <div>
              <div className="mb-4">
                <Label htmlFor="task-date" className="text-sm font-medium">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 justify-start text-left font-normal"
                    >
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="has-time-required"
                  checked={hasTimeRequired}
                  onCheckedChange={(checked) => setHasTimeRequired(!!checked)}
                />
                <Label htmlFor="has-time-required" className="text-sm">
                  Task requires specific time
                </Label>
              </div>
              
              {hasTimeRequired && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="task-time" className="text-sm font-medium">
                      Start Time
                    </Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="task-end-time" className="text-sm font-medium">
                      End Time
                    </Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="task-duration" className="text-sm font-medium block">
                Duration (minutes): {duration}
              </Label>
              <Slider
                id="task-duration"
                value={[duration]}
                min={5}
                max={240}
                step={5}
                onValueChange={(value) => setDuration(value[0])}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="notification-time" className="text-sm font-medium block">
                Notification before task (minutes): {notificationTime}
              </Label>
              <Slider
                id="notification-time"
                value={[notificationTime]}
                min={0}
                max={120}
                step={5}
                onValueChange={(value) => setNotificationTime(value[0])}
                className="mt-2"
              />
            </div>
          </div>
          
          {/* Recurrence Section */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is-recurring" className="text-sm font-medium">
                Recurring Task
              </Label>
              <Switch
                id="is-recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
            
            {isRecurring && (
              <div className="space-y-4 pl-2">
                <div>
                  <Label htmlFor="recurring-type" className="text-sm font-medium">
                    Recurrence Pattern
                  </Label>
                  <Select value={recurringType} onValueChange={setRecurringType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {recurringType === "weekly" && (
                  <div>
                    <Label className="text-sm font-medium block mb-2">
                      Repeat on Days
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {daysOfWeek.map(day => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`day-${day.value}`}
                            checked={recurringDays.includes(day.value)}
                            onCheckedChange={() => toggleDay(day.value)}
                          />
                          <Label htmlFor={`day-${day.value}`} className="text-sm">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="recurring-end-date" className="text-sm font-medium">
                    End Recurrence
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 justify-start text-left font-normal"
                      >
                        {recurringEndDate ? format(recurringEndDate, "PPP") : "No end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={recurringEndDate}
                        onSelect={setRecurringEndDate}
                        initialFocus
                        fromDate={new Date()} // Can't select dates before today
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (completed: boolean, letter?: string, subjectiveContent?: string) => void;
  task?: Task;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  task,
}) => {
  const [letter, setLetter] = useState("");
  const [subjectiveContent, setSubjectiveContent] = useState("");

  useEffect(() => {
    if (task) {
      if (task.taskType === "letter") {
        setLetter(task.letterValue || "");
      } else if (task.taskType === "subjective") {
        setSubjectiveContent(task.subjectiveContent || "");
      }
    }
  }, [task, isOpen]);

  const handleSetLetter = () => {
    if (!letter.trim()) return;
    onComplete(true, letter.toUpperCase().charAt(0));
  };

  const handleSetSubjective = () => {
    if (!subjectiveContent.trim()) return;
    onComplete(true, undefined, subjectiveContent);
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center">{task.name}</DialogTitle>
          {task.scheduledDate && task.scheduledTime && (
            <DialogDescription className="text-center">
              Scheduled for {format(new Date(task.scheduledDate), "PPP")} at {
                task.scheduledTime.slice(0, 2) + ":" + task.scheduledTime.slice(2, 4)
              }
            </DialogDescription>
          )}
        </DialogHeader>

        {task.taskType === "yes-no" && (
          <div className="flex justify-center space-x-4 mb-4 mt-2">
            <Button
              onClick={() => onComplete(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Complete
            </Button>
            <Button
              onClick={() => onComplete(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Incomplete
            </Button>
          </div>
        )}
        
        {task.taskType === "letter" && (
          <div className="mb-4 mt-2 flex flex-col items-center">
            <Input
              value={letter}
              onChange={(e) => setLetter(e.target.value.substring(0, 1).toUpperCase())}
              className="w-16 text-center text-xl font-bold uppercase mb-4"
              maxLength={1}
              placeholder="A"
            />
            <Button onClick={handleSetLetter}>Set Letter</Button>
          </div>
        )}
        
        {task.taskType === "subjective" && (
          <div className="mb-4 mt-2 flex flex-col items-center">
            <Textarea
              value={subjectiveContent}
              onChange={(e) => setSubjectiveContent(e.target.value)}
              className="min-h-[100px] text-left mb-4"
              placeholder="Enter your notes or feedback..."
            />
            <Button onClick={handleSetSubjective}>Save Response</Button>
          </div>
        )}

        <Button
          variant="link"
          className="text-sm text-gray-500"
          onClick={onClose}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

interface CustomizeTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (count: number) => void;
  dailyTasks: Task[];
  onEditTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  currentCount: number;
}

export const CustomizeTasksModal: React.FC<CustomizeTasksModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dailyTasks,
  onEditTask,
  onDeleteTask,
  currentCount,
}) => {
  const [taskCount, setTaskCount] = useState(currentCount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Daily Tasks</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label htmlFor="total-tasks" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Daily Tasks
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="total-tasks"
              value={[taskCount]}
              min={1}
              max={12}
              step={1}
              onValueChange={(value) => setTaskCount(value[0])}
              className="flex-grow"
            />
            <span className="font-medium">{taskCount}</span>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Current Daily Tasks</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center">
                  {task.taskType === "yes-no" ? (
                    <div
                      className={`w-6 h-6 border-2 border-primary rounded-full mr-3 ${
                        task.isCompleted ? "bg-primary" : ""
                      }`}
                    ></div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-primary rounded-full mr-3 flex items-center justify-center">
                      <span className="text-xs font-bold">{task.letterValue}</span>
                    </div>
                  )}
                  <span>
                    {task.name} ({task.taskType === "yes-no" ? "Yes/No" : "Letter"})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => onEditTask(task.id)}
                  >
                    <EditIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              </div>
            ))}
            {dailyTasks.length === 0 && (
              <div className="text-center text-gray-500 p-2">
                No daily tasks set up. Add tasks and mark them as daily.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(taskCount)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
