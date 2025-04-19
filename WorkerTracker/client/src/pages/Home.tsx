import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, Note } from "@shared/schema";

import Header from "@/components/Header";
import DailyTasks from "@/components/DailyTasks";
import AllTasks from "@/components/AllTasks";
import Notes from "@/components/Notes";
import { TaskModal, TaskCompletionModal, CustomizeTasksModal } from "@/components/TaskModals";
import NoteModal from "@/components/NoteModals";
import AddItemModal from "@/components/AddItemModal";
import { CalendarView } from "@/components/CalendarView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home: React.FC = () => {
  const { toast } = useToast();
  const [showDailyTasks, setShowDailyTasks] = useState(true);
  
  // Task state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Note state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isEditNoteMode, setIsEditNoteMode] = useState(false);

  // Add Item Modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Settings and UI state
  const [dailyTasksCount, setDailyTasksCount] = useState(8);
  const [selectedView, setSelectedView] = useState<'tasks' | 'calendar'>('tasks');
  
  // Fetch data
  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const { data: dailyTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/daily"],
  });
  
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });
  
  // Fetch settings with proper handler
  const settingsQuery = useQuery<{ key: string; value: string }>({
    queryKey: ["/api/settings/dailyTasksCount"],
  });
  
  // Update daily tasks count when settings are loaded
  useEffect(() => {
    if (settingsQuery.data && settingsQuery.data.value) {
      setDailyTasksCount(parseInt(settingsQuery.data.value, 10));
    }
  }, [settingsQuery.data]);
  
  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (task: Partial<Task>) => apiRequest("POST", "/api/tasks", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/daily"] });
      setIsTaskModalOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }: { id: number; task: Partial<Task> }) => 
      apiRequest("PUT", `/api/tasks/${id}`, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/daily"] });
      setIsTaskModalOpen(false);
      setIsCompletionModalOpen(false);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/daily"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  const createNoteMutation = useMutation({
    mutationFn: (note: Partial<Note>) => apiRequest("POST", "/api/notes", note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsNoteModalOpen(false);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create note: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: Partial<Note> }) => 
      apiRequest("PUT", `/api/notes/${id}`, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsNoteModalOpen(false);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update note: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete note: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateSettingsMutation = useMutation({
    mutationFn: ({ key, value }: { key: string, value: string }) => 
      apiRequest("PUT", `/api/settings/${key}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/dailyTasksCount"] });
      setIsCustomizeModalOpen(false);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Event handlers
  const handleOpenTaskModal = (edit: boolean = false, task?: Task) => {
    setSelectedTask(task);
    setIsEditMode(edit);
    setIsTaskModalOpen(true);
  };
  
  const handleOpenNoteModal = (edit: boolean = false, note?: Note) => {
    setSelectedNote(note);
    setIsEditNoteMode(edit);
    setIsNoteModalOpen(true);
  };
  
  const handleTaskClick = (id: number, type: "yes-no" | "letter") => {
    const task = [...dailyTasks, ...allTasks].find(t => t.id === id);
    if (task) {
      setSelectedTask(task);
      setIsCompletionModalOpen(true);
    }
  };
  
  const handleTaskSave = (taskData: Partial<Task>) => {
    if (isEditMode && selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, task: taskData });
    } else {
      createTaskMutation.mutate({
        ...taskData,
        isDaily: !showDailyTasks ? false : true,
        isCompleted: false,
      });
    }
  };
  
  const handleTaskCompletion = (completed: boolean, letter?: string, subjectiveContent?: string) => {
    if (!selectedTask) return;
    
    const update: Partial<Task> = { isCompleted: completed };
    
    // Handle different task types
    if (selectedTask.taskType === "letter" && letter) {
      update.letterValue = letter;
    }
    
    // Handle subjective content if present
    if (selectedTask.taskType === "subjective" && subjectiveContent) {
      update.subjectiveContent = subjectiveContent;
    }
    
    updateTaskMutation.mutate({
      id: selectedTask.id,
      task: update
    });
  };
  
  // Calendar event handlers
  const handleCalendarTaskClick = (taskId: number) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsCompletionModalOpen(true);
    }
  };
  
  const handleCalendarNoteClick = (noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      handleOpenNoteModal(true, note);
    }
  };
  
  const handleCalendarDayClick = (date: Date) => {
    // When clicking on a calendar day/slot, open the add item modal
    setSelectedDate(date);
    setIsAddItemModalOpen(true);
  };
  
  const handleAddTaskWithDate = () => {
    if (!selectedDate) return;
    
    // Setting up a new task with the selected date
    const scheduledDate = selectedDate.toISOString().split('T')[0];
    const newTask: Partial<Task> = {
      name: "",
      scheduledDate,
      scheduledTime: "09:00", // Default to 9 AM
      isDaily: false,
      isCompleted: false,
      taskType: "yes-no"
    };
    
    setSelectedTask(newTask as Task);
    setIsEditMode(false);
    setIsTaskModalOpen(true);
  };
  
  const handleAddNoteWithDate = () => {
    if (!selectedDate) return;
    
    // Create a new note with the associated date
    setSelectedNote({
      id: 0,
      title: "",
      content: "",
      associatedDate: selectedDate.toISOString().split('T')[0],
      createdAt: new Date()
    });
    setIsEditNoteMode(false);
    setIsNoteModalOpen(true);
  };
  
  const handleNoteSave = (noteData: Partial<Note>) => {
    if (isEditNoteMode && selectedNote) {
      updateNoteMutation.mutate({ id: selectedNote.id, note: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };
  
  const handleTaskCountChange = (count: number) => {
    setDailyTasksCount(count);
    updateSettingsMutation.mutate({
      key: "dailyTasksCount", 
      value: count.toString()
    });
  };

  const completedTasksCount = dailyTasks.filter(task => task.isCompleted).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Header onOpenSettings={() => setIsCustomizeModalOpen(true)} />

      {/* Main View Tabs */}
      <Tabs defaultValue="tasks" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger 
            value="tasks"
            onClick={() => setSelectedView('tasks')}
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="calendar"
            onClick={() => setSelectedView('calendar')}
          >
            Calendar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          {/* Task View Toggle */}
          <div className="mb-6 flex justify-between items-center">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                type="button"
                onClick={() => setShowDailyTasks(true)}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg focus:z-10 focus:ring-2 ${
                  showDailyTasks
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                Daily Tasks
              </Button>
              <Button
                type="button"
                onClick={() => setShowDailyTasks(false)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg focus:z-10 focus:ring-2 ${
                  !showDailyTasks
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                All Tasks
              </Button>
            </div>
            <div className="text-sm font-medium text-gray-500">
              <span>{completedTasksCount}</span>/<span>{dailyTasksCount}</span> tasks
            </div>
          </div>

          {/* Task Container */}
          {showDailyTasks ? (
            <DailyTasks
              tasks={dailyTasks}
              totalCount={dailyTasksCount}
              completedCount={completedTasksCount}
              onTaskClick={handleTaskClick}
              onCustomize={() => setIsCustomizeModalOpen(true)}
            />
          ) : (
            <AllTasks
              tasks={allTasks}
              onTaskClick={handleTaskClick}
              onAddTask={() => {
                setSelectedDate(undefined);
                setIsAddItemModalOpen(true);
              }}
              onEditTask={(id) => {
                const task = allTasks.find(t => t.id === id);
                if (task) handleOpenTaskModal(true, task);
              }}
              onDeleteTask={(id) => deleteTaskMutation.mutate(id)}
            />
          )}

          {/* Notes Section */}
          <Notes
            notes={notes}
            onAddNote={() => {
              setSelectedDate(undefined);
              setIsAddItemModalOpen(true);
            }}
            onEditNote={(id) => {
              const note = notes.find(n => n.id === id);
              if (note) handleOpenNoteModal(true, note);
            }}
            onDeleteNote={(id) => deleteNoteMutation.mutate(id)}
          />
        </TabsContent>
        
        <TabsContent value="calendar">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Calendar View</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDate(undefined);
                  setIsAddItemModalOpen(true);
                }}
              >
                Add Item
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <CalendarView 
              tasks={allTasks}
              notes={notes}
              onTaskClick={handleCalendarTaskClick}
              onNoteClick={handleCalendarNoteClick}
              onDayClick={handleCalendarDayClick}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleTaskSave}
        task={selectedTask}
        isEdit={isEditMode}
      />

      <TaskCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onComplete={handleTaskCompletion}
        task={selectedTask}
      />

      <CustomizeTasksModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onSave={handleTaskCountChange}
        dailyTasks={dailyTasks}
        onEditTask={(id) => {
          setIsCustomizeModalOpen(false);
          const task = dailyTasks.find(t => t.id === id);
          if (task) handleOpenTaskModal(true, task);
        }}
        onDeleteTask={(id) => deleteTaskMutation.mutate(id)}
        currentCount={dailyTasksCount}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleNoteSave}
        note={selectedNote}
        isEdit={isEditNoteMode}
      />
      
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onSelectTask={handleAddTaskWithDate}
        onSelectNote={handleAddNoteWithDate}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default Home;
