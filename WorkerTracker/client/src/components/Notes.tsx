import React from "react";
import { Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AddIcon, EditIcon, DeleteIcon } from "@/lib/icons";
import { format } from "date-fns";

interface NotesProps {
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (id: number) => void;
  onDeleteNote: (id: number) => void;
}

const Notes: React.FC<NotesProps> = ({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <Button
          variant="link"
          className="text-sm text-accent hover:underline flex items-center"
          onClick={onAddNote}
        >
          <AddIcon />
          Add Note
        </Button>
      </div>

      <div className="notes-container space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{note.title}</h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={() => onEditNote(note.id)}
                >
                  <EditIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={() => onDeleteNote(note.id)}
                >
                  <DeleteIcon />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{note.content}</p>
            <div className="mt-2 text-xs text-gray-400">
              {format(new Date(note.createdAt), "MMMM d, yyyy")}
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No notes yet. Click "Add Note" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
