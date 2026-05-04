"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DayClickEventHandler } from "react-day-picker" // Import DayClickEventHandler
import { isSameDay } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onDateDoubleClick?: (date: Date) => void;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onDateDoubleClick,
  onDayClick, // Capture user's onDayClick to call it if provided
  ...props // Remaining DayPicker props (mode, onSelect, selected, modifiers, etc.)
}: CalendarProps) {
  const [clickedDate, setClickedDate] = React.useState<Date | null>(null);
  const [clickTimeout, setClickTimeout] = React.useState<NodeJS.Timeout | null>(null);

  // This handler is given to DayPicker's onDayClick prop.
  const handleDayClickInternal: DayClickEventHandler = (day, activeModifiers, e) => {
    // First, call the user's onDayClick if they provided one.
    if (onDayClick) {
      onDayClick(day, activeModifiers, e);
    }

    // Then, handle the double-click logic if onDateDoubleClick is provided.
    if (onDateDoubleClick) {
      if (clickedDate && isSameDay(clickedDate, day) && clickTimeout) {
        // Double click
        clearTimeout(clickTimeout);
        setClickTimeout(null);
        setClickedDate(null);
        onDateDoubleClick(day);
      } else {
        // First click (or click on a different day)
        if (clickTimeout) {
          clearTimeout(clickTimeout); // Clear previous timeout if any
        }
        setClickedDate(day);
        const timeout = setTimeout(() => {
          // Timeout expired, it's a single click in terms of double-click detection.
          // DayPicker itself handles selection via its 'onSelect' prop (if mode is appropriate
          // and onSelect is provided in ...props). No need to call props.onSelect here.
          setClickTimeout(null);
          setClickedDate(null);
        }, 250); // 250ms to detect double click
        setClickTimeout(timeout);
      }
    }
    // If onDateDoubleClick is not provided, this handler effectively just calls the user's onDayClick (if any).
    // DayPicker's selection (via its onSelect prop) and other behaviors are driven by the props passed in {...props}.
  };

  return (
    <div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        // Pass our internal handler to DayPicker's onDayClick.
        // Any onSelect, mode, selected, etc. from user are passed via {...props}.
        onDayClick={handleDayClickInternal}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex w-full justify-center items-center",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
          row: "flex w-full mt-2 justify-center",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-full [&:has([aria-selected].day-outside)]:bg-accent/70 [&:has([aria-selected])]:bg-primary/50 dark:[&:has([aria-selected])]:bg-primary/50 pink:[&:has([aria-selected])]:bg-primary/70 blue:[&:has([aria-selected])]:bg-primary/70 yellow:[&:has([aria-selected])]:bg-primary/70 [&:has([aria-selected])]:rounded-full first:[&:has([aria-selected])]:rounded-full last:[&:has([aria-selected])]:rounded-full focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground dark:focus:bg-primary dark:focus:text-primary-foreground pink:bg-primary/90 pink:text-primary-foreground blue:bg-primary/90 blue:text-primary-foreground yellow:bg-primary/90 yellow:text-primary-foreground",
          day_today: "rounded-full border-2 text-black bg-white border-black dark:text-white dark:bg-black dark:border-white pink:text-foreground pink:bg-background pink:border-primary blue:text-foreground blue:bg-background blue:border-primary yellow:text-foreground yellow:bg-background yellow:border-primary aria-selected:bg-primary aria-selected:text-primary-foreground dark:aria-selected:bg-primary dark:aria-selected:text-primary-foreground pink:aria-selected:text-primary-foreground blue:aria-selected:text-primary-foreground yellow:aria-selected:text-primary-foreground",
          day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-primary/50 dark:aria-selected:bg-primary/40 pink:aria-selected:bg-primary/70 blue:aria-selected:bg-primary/70 yellow:aria-selected:bg-primary/70 aria-selected:text-accent-foreground aria-selected:rounded-full",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar"

export { Calendar }
