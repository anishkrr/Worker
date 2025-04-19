import React from "react";
import { ClipboardCheckIcon, SettingsIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <span className="inline-block mr-2">
          <ClipboardCheckIcon />
        </span>
        Worker
      </h1>
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <SettingsIcon />
        </Button>
      </div>
    </header>
  );
};

export default Header;
