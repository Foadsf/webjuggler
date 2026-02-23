import React, { useState, useRef, useEffect } from 'react';

interface InlineEditProps {
  text: string;
  onSave: (newText: string) => void;
  className?: string;
  placeholder?: string;
}

export function InlineEdit({ text, onSave, className = '', placeholder = 'Enter text...' }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (value.trim() !== text) {
        onSave(value);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(text);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (value.trim() !== text) {
      onSave(value);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`bg-white border border-indigo-300 rounded px-1 py-0.5 outline-none ring-2 ring-indigo-500/50 w-full ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1 border border-transparent hover:border-gray-200 transition-colors ${className}`}
      title="Click to edit"
    >
      {text || <span className="text-gray-400 italic">{placeholder}</span>}
    </span>
  );
}
