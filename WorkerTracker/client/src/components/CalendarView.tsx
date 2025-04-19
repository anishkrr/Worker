import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMinutes, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Task, Note } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TaskCircle from '@/components/TaskCircle';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  tasks: Task[];
  notes: Note[];
  onTaskClick: (taskId: number) => void;
  onNoteClick: (noteId: number) => void;
  onDayClick: (date: Date) => void;
}

// Define the event structure for react-big-calendar
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: 'task' | 'note';
  data: Task | Note;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  notes,
  onTaskClick,
  onNoteClick,
  onDayClick,
}) => {
  const [view, setView] = useState(Views.MONTH);

  // Convert tasks and notes to calendar events
  const createEvents = (): CalendarEvent[] => {
    const taskEvents = tasks
      .filter(task => task.scheduledDate && task.scheduledTime)
      .map(task => {
        // Safely handle potential null values
        if (!task.scheduledDate) return null;
        
        const scheduledDate = new Date(task.scheduledDate);
        const [hours, minutes] = (task.scheduledTime && typeof task.scheduledTime === 'string')
          ? task.scheduledTime.split(':').map(Number)
          : [0, 0];
        
        scheduledDate.setHours(hours);
        scheduledDate.setMinutes(minutes);

        const endTime = new Date(scheduledDate);
        endTime.setMinutes(endTime.getMinutes() + (task.duration || 30));

        return {
          id: task.id,
          title: task.name,
          start: scheduledDate,
          end: endTime,
          allDay: false,
          resource: 'task' as const,
          data: task,
        };
      }).filter(Boolean) as CalendarEvent[]; // Filter out any null entries

    const noteEvents = notes
      .filter(note => note.associatedDate)
      .map(note => {
        // Safely handle potential null values
        if (!note.associatedDate) return null;
        
        const date = new Date(note.associatedDate);
        
        return {
          id: note.id,
          title: note.title,
          start: date,
          end: date,
          allDay: true,
          resource: 'note' as const,
          data: note,
        };
      }).filter(Boolean) as CalendarEvent[]; // Filter out any null entries

    return [...taskEvents, ...noteEvents];
  };

  const events = createEvents();

  const handleEventClick = (event: CalendarEvent) => {
    if (event.resource === 'task') {
      onTaskClick(event.id);
    } else {
      onNoteClick(event.id);
    }
  };

  const handleSlotClick = (slotInfo: { start: Date; end: Date; slots: Date[]; action: string }) => {
    // When a user clicks on a day, use the start date
    onDayClick(slotInfo.start);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    // Different styling for tasks and notes
    const style = {
      backgroundColor: event.resource === 'task' ? '#3b82f6' : '#10b981', // Blue for tasks, green for notes
      borderRadius: '4px',
      color: 'white',
      border: 'none',
      display: 'block',
    };
    return { style };
  };

  return (
    <div className="h-[600px] w-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
        onSelectSlot={handleSlotClick}
        selectable
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={setView as any}
        toolbar={true}
        formats={{
          dayHeaderFormat: (date: Date) => format(date, 'EEEE, MMMM dd'),
          dayFormat: (date: Date) => format(date, 'd'),
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'MMMM dd')} - ${format(end, 'MMMM dd, yyyy')}`,
        }}
        components={{
          event: ({ event }) => (
            <div 
              className="truncate px-2 py-1 text-sm"
              title={event.title}
            >
              {event.title}
            </div>
          ),
          dateCellWrapper: (props) => {
            const { value, children } = props;
            const date = value as Date;
            
            // Get daily tasks
            const dailyTasks = tasks.filter(task => task.isDaily === true);
            
            return (
              <div className="h-full">
                {children}
                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                  {dailyTasks.slice(0, 8).map((task, index) => (
                    <div key={`daily-${task.id}-${index}`} 
                         onClick={(e) => {
                           e.stopPropagation();
                           onTaskClick(task.id);
                         }}
                         className="flex items-center justify-center"
                         style={{ width: '16px', height: '16px' }}>
                      <TaskCircle
                        id={task.id}
                        type={task.taskType as "yes-no" | "letter"}
                        completed={task.isCompleted || false}
                        letter={task.letterValue || ""}
                        onClick={onTaskClick}
                        small={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        }}
      />
    </div>
  );
};