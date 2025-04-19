import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertNoteSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

const apiRouter = express.Router();

export async function registerRoutes(app: Express): Promise<Server> {
  // Tasks endpoints
  apiRouter.get("/tasks", async (req, res) => {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  apiRouter.get("/tasks/daily", async (req, res) => {
    const tasks = await storage.getDailyTasks();
    res.json(tasks);
  });
  
  apiRouter.get("/tasks/date/:date", async (req, res) => {
    try {
      const dateStr = req.params.date; // Format: YYYY-MM-DD
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const tasks = await storage.getTasksByDate(date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.put("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const updateData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, updateData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.delete("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notes endpoints
  apiRouter.get("/notes", async (req, res) => {
    const notes = await storage.getAllNotes();
    res.json(notes);
  });
  
  apiRouter.get("/notes/date/:date", async (req, res) => {
    try {
      const dateStr = req.params.date; // Format: YYYY-MM-DD
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const notes = await storage.getNotesByDate(date);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.put("/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const updateData = insertNoteSchema.partial().parse(req.body);
      const updatedNote = await storage.updateNote(id, updateData);
      
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.delete("/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Notification endpoints
  apiRouter.get("/notifications", async (req, res) => {
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });
  
  apiRouter.get("/notifications/unread", async (req, res) => {
    const notifications = await storage.getUnreadNotifications();
    res.json(notifications);
  });
  
  apiRouter.post("/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  apiRouter.put("/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(id);
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings endpoints
  apiRouter.get("/settings/:key", async (req, res) => {
    const { key } = req.params;
    const value = await storage.getSetting(key);
    
    if (value === undefined) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    res.json({ key, value });
  });

  apiRouter.put("/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (typeof value !== 'string') {
        return res.status(400).json({ message: "Value must be a string" });
      }
      
      await storage.setSetting(key, value);
      res.json({ key, value });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Calendar data endpoint (combines tasks and notes for a date range)
  apiRouter.get("/calendar/:startDate/:endDate", async (req, res) => {
    try {
      const { startDate, endDate } = req.params;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      // Get all tasks and notes
      const allTasks = await storage.getAllTasks();
      const allNotes = await storage.getAllNotes();
      
      // Filter tasks by date range
      const tasksInRange = allTasks.filter(task => {
        if (!task.scheduledDate) return false;
        
        const taskDate = new Date(task.scheduledDate);
        return taskDate >= start && taskDate <= end;
      });
      
      // Filter notes by date range
      const notesInRange = allNotes.filter(note => {
        if (!note.associatedDate) return false;
        
        const noteDate = new Date(note.associatedDate);
        return noteDate >= start && noteDate <= end;
      });
      
      // Organize by date
      const calendarData: Record<string, { tasks: typeof allTasks, notes: typeof allNotes }> = {};
      
      // Process current date range
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        calendarData[dateStr] = { tasks: [], notes: [] };
        
        // Increment date by 1 day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Populate tasks
      tasksInRange.forEach(task => {
        if (!task.scheduledDate) return;
        
        const dateStr = new Date(task.scheduledDate).toISOString().split('T')[0];
        if (calendarData[dateStr]) {
          calendarData[dateStr].tasks.push(task);
        }
      });
      
      // Populate notes
      notesInRange.forEach(note => {
        if (!note.associatedDate) return;
        
        const dateStr = new Date(note.associatedDate).toISOString().split('T')[0];
        if (calendarData[dateStr]) {
          calendarData[dateStr].notes.push(note);
        }
      });
      
      res.json(calendarData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
