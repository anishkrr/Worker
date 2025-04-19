import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: () => void;
  onSelectNote: () => void;
  initialDate?: Date;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onSelectNote,
  initialDate,
}) => {
  const handleSelectTask = () => {
    onSelectTask();
    onClose();
  };

  const handleSelectNote = () => {
    onSelectNote();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Choose what type of item you want to add{initialDate ? ` for ${initialDate.toLocaleDateString()}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4 items-stretch">
          <Button 
            onClick={handleSelectTask}
            className="py-8 text-lg"
            variant="default"
          >
            Add a Task
          </Button>
          
          <Button 
            onClick={handleSelectNote}
            className="py-8 text-lg"
            variant="outline"
          >
            Add a Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;