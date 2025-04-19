import { 
  users, type User, type InsertUser, 
  tasks, type Task, type InsertTask,
  notes, type Note, type InsertNote,
  settings, type Setting, type InsertSetting,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getDailyTasks(): Promise<Task[]>;
  getTasksByDate(date: Date): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Note methods
  getNote(id: number): Promise<Note | undefined>;
  getAllNotes(): Promise<Note[]>;
  getNotesByDate(date: Date): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Notification methods
  getNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Settings methods
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private notes: Map<number, Note>;
  private settings: Map<string, string>;
  private notifications: Map<number, Notification>;
  private userCurrentId: number;
  private taskCurrentId: number;
  private noteCurrentId: number;
  private notificationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notes = new Map();
    this.settings = new Map();
    this.notifications = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.noteCurrentId = 1;
    this.notificationCurrentId = 1;
    
    // Set default settings
    this.settings.set("dailyTasksCount", "8");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getDailyTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.isDaily);
  }
  
  async getTasksByDate(date: Date): Promise<Task[]> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return Array.from(this.tasks.values()).filter(task => {
      // If the task has a scheduled date, match it
      if (task.scheduledDate) {
        const taskDate = new Date(task.scheduledDate);
        const taskDateStr = taskDate.toISOString().split('T')[0];
        return taskDateStr === dateString;
      }
      return false;
    });
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const now = new Date();
    const task = { 
      ...insertTask, 
      id,
      createdAt: now,
      // Ensure all new fields have valid default values
      isCompleted: insertTask.isCompleted ?? false,
      isDaily: insertTask.isDaily ?? false,
      scheduledDate: insertTask.scheduledDate || null,
      scheduledTime: insertTask.scheduledTime || null,
      duration: insertTask.duration || null,
      notificationTime: insertTask.notificationTime || null,
      isRecurring: insertTask.isRecurring ?? false,
      recurringType: insertTask.recurringType || null,
      recurringDays: insertTask.recurringDays || null,
      recurringEndDate: insertTask.recurringEndDate || null,
      subjectiveContent: insertTask.subjectiveContent || null,
      dailyPosition: insertTask.dailyPosition || null,
      letterValue: insertTask.letterValue || null,
    } as Task;
    
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate } as Task;
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Note methods
  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async getAllNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }
  
  async getNotesByDate(date: Date): Promise<Note[]> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return Array.from(this.notes.values()).filter(note => {
      // If the note has an associated date, match it
      if (note.associatedDate) {
        const noteDate = new Date(note.associatedDate);
        const noteDateStr = noteDate.toISOString().split('T')[0];
        return noteDateStr === dateString;
      }
      return false;
    });
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id,
      createdAt: now,
      associatedDate: insertNote.associatedDate || null,
    } as Note;
    
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...noteUpdate } as Note;
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
  
  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }
  
  async getUnreadNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => !notification.isRead);
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: now,
      isRead: false,
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Settings methods
  async getSetting(key: string): Promise<string | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    this.settings.set(key, value);
  }
}

export const storage = new MemStorage();
