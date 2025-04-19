import React, { useState, useEffect } from "react";
import { Note } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
  note?: Note;
  isEdit?: boolean;
  initialDate?: Date; // Optional initial date (e.g., when adding from calendar)
}

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  note,
  isEdit = false,
  initialDate,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [associatedDate, setAssociatedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      
      if (note.associatedDate) {
        setAssociatedDate(new Date(note.associatedDate));
      } else {
        setAssociatedDate(undefined);
      }
    } else {
      setTitle("");
      setContent("");
      setAssociatedDate(initialDate);
    }
  }, [note, isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData: Partial<Note> = {
      title,
      content,
      associatedDate: associatedDate ? associatedDate.toISOString().split('T')[0] : null,
    };
    
    onSave(noteData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Note" : "Add New Note"}</DialogTitle>
          <DialogDescription>
            Create notes and associate them with specific dates on your calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="mb-4">
              <Label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </Label>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                required
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content"
                rows={4}
                required
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="note-date" className="block text-sm font-medium text-gray-700 mb-1">
                Associated Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="note-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {associatedDate ? format(associatedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={associatedDate}
                    onSelect={setAssociatedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
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

export default NoteModal;
