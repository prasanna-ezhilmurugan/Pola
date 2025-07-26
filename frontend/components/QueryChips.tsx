'use client';

import { useState } from 'react';
import { X, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QueryChipsProps {
  chips: string[];
  onRemove: (chip: string) => void;
  onEdit: (oldChip: string, newChip: string) => void;
}

export function QueryChips({ chips, onRemove, onEdit }: QueryChipsProps) {
  const [editingChip, setEditingChip] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (chip: string) => {
    setEditingChip(chip);
    setEditValue(chip);
  };

  const saveEdit = () => {
    if (editingChip && editValue.trim() && editValue !== editingChip) {
      onEdit(editingChip, editValue.trim());
    }
    setEditingChip(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingChip(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (chips.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-700">Query Parameters</h3>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <div
            key={chip}
            className="inline-flex items-center bg-slate-100 border border-slate-300 rounded-full px-3 py-1 text-sm"
          >
            {editingChip === chip ? (
              <div className="flex items-center space-x-1">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  className="h-6 w-32 text-xs border-none bg-transparent focus:ring-0 p-0"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={saveEdit}
                  aria-label="Save changes"
                >
                  <Check className="h-3 w-3 text-emerald-600" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-slate-700 mr-1">{chip}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => startEditing(chip)}
                  aria-label={`Edit ${chip}`}
                >
                  <Edit2 className="h-3 w-3 text-slate-500 hover:text-slate-700" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => onRemove(chip)}
                  aria-label={`Remove ${chip}`}
                >
                  <X className="h-3 w-3 text-slate-500 hover:text-rose-600" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        These parameters were extracted from your query. Click to edit or remove them.
      </p>
    </div>
  );
}