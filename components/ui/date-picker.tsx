"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const DISPLAY_FORMAT = "dd/MM/yyyy";
const STORAGE_FORMAT = "yyyy-MM-dd";

function toDisplay(value: string): string {
  if (!value) return "";
  try {
    const d = parse(value, STORAGE_FORMAT, new Date());
    return isValid(d) ? format(d, DISPLAY_FORMAT) : value;
  } catch {
    return value;
  }
}

function toStorage(displayValue: string): string | null {
  if (!displayValue.trim()) return null;
  const cleaned = displayValue.replace(/\D/g, "");
  if (cleaned.length === 8) {
    const dd = cleaned.slice(0, 2);
    const mm = cleaned.slice(2, 4);
    const yyyy = cleaned.slice(4, 8);
    const candidate = `${yyyy}-${mm}-${dd}`;
    const d = parse(candidate, STORAGE_FORMAT, new Date());
    return isValid(d) ? candidate : null;
  }
  const normalized = displayValue.replace(/[-.]/g, "/");
  try {
    const d = parse(normalized, DISPLAY_FORMAT, new Date());
    return isValid(d) ? format(d, STORAGE_FORMAT) : null;
  } catch {
    return null;
  }
}

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
};

export function DatePicker({
  value,
  onChange,
  max,
  placeholder = "DD/MM/YYYY",
  id,
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(toDisplay(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInputValue(toDisplay(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    const storage = toStorage(v);
    if (storage) onChange(storage);
  };

  const handleInputBlur = () => {
    const storage = toStorage(inputValue);
    if (storage) {
      setInputValue(toDisplay(storage));
      onChange(storage);
    } else if (value) {
      setInputValue(toDisplay(value));
    } else {
      setInputValue("");
    }
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const str = format(date, STORAGE_FORMAT);
    onChange(str);
    setInputValue(toDisplay(str));
    setOpen(false);
  };

  const dateValue = value ? parse(value, STORAGE_FORMAT, new Date()) : undefined;
  const maxDate = max ? parse(max, STORAGE_FORMAT, new Date()) : undefined;

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        autoComplete="off"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            className="shrink-0"
            aria-label="Open calendar"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <div className="p-4">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleSelect}
              disabled={maxDate ? (date) => date > maxDate : undefined}
              className="[--cell-size:2.5rem]"
              showOutsideDays={false}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
