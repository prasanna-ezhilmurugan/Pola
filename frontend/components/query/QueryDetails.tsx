'use client';

import React, { useState, useCallback } from 'react';
import { X, Plus, Edit3, Check, MapPin, Calendar, DollarSign, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QueryEntity } from '@/lib/types';

interface QueryDetailsProps {
  entities: QueryEntity[];
  onEntitiesChange?: (entities: QueryEntity[]) => void;
  className?: string;
}

export default function QueryDetails({ entities, onEntitiesChange, className }: QueryDetailsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newEntityType, setNewEntityType] = useState<QueryEntity['type']>('custom');
  const [newEntityValue, setNewEntityValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const entityIcons = {
    age: User,
    location: MapPin,
    amount: DollarSign,
    date: Calendar,
    policy_type: Shield,
    custom: Edit3,
  };

  const entityColors = {
    age: 'bg-policy-accent text-policy-primary',
    location: 'bg-policy-accent-teal text-policy-primary', 
    amount: 'bg-yellow-500 text-policy-primary',
    date: 'bg-purple-500 text-white',
    policy_type: 'bg-green-500 text-white',
    custom: 'bg-policy-text-muted text-policy-text',
  };

  const startEdit = useCallback((entity: QueryEntity) => {
    setEditingId(entity.id);
    setEditValue(entity.value);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editValue.trim()) return;

    const updatedEntities = entities.map(entity =>
      entity.id === editingId
        ? { ...entity, value: editValue.trim() }
        : entity
    );

    onEntitiesChange?.(updatedEntities);
    setEditingId(null);
    setEditValue('');
  }, [editingId, editValue, entities, onEntitiesChange]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, []);

  const deleteEntity = useCallback((id: string) => {
    const updatedEntities = entities.filter(entity => entity.id !== id);
    onEntitiesChange?.(updatedEntities);
  }, [entities, onEntitiesChange]);

  const addEntity = useCallback(() => {
    if (!newEntityValue.trim()) return;

    const newEntity: QueryEntity = {
      id: Date.now().toString(),
      type: newEntityType,
      value: newEntityValue.trim(),
      editable: true,
    };

    onEntitiesChange?.([...entities, newEntity]);
    setNewEntityValue('');
    setShowAddForm(false);
  }, [newEntityType, newEntityValue, entities, onEntitiesChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: 'edit' | 'add') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'edit') {
        saveEdit();
      } else {
        addEntity();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (action === 'edit') {
        cancelEdit();
      } else {
        setShowAddForm(false);
        setNewEntityValue('');
      }
    }
  }, [saveEdit, addEntity, cancelEdit]);

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4">
        <h3 className="text-policy-text font-medium text-sm mb-2">
          Extracted Entities
        </h3>
        <p className="text-policy-text-muted text-xs">
          Click to edit entity values or add new ones
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {entities.map((entity) => {
          const Icon = entityIcons[entity.type];
          const isEditing = editingId === entity.id;

          return (
            <div
              key={entity.id}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                entityColors[entity.type],
                !isEditing && entity.editable && 'hover:scale-105 cursor-pointer'
              )}
            >
              <Icon className="w-3 h-3" />
              
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'edit')}
                    className="bg-transparent border-b border-current focus:outline-none min-w-0 w-20"
                    autoFocus
                    aria-label={`Edit ${entity.type} value`}
                  />
                  <button
                    onClick={saveEdit}
                    className="p-0.5 hover:bg-black/20 rounded transition-colors duration-200"
                    aria-label="Save changes"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-0.5 hover:bg-black/20 rounded transition-colors duration-200"
                    aria-label="Cancel changes"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    onClick={() => entity.editable && startEdit(entity)}
                    className={entity.editable ? 'cursor-pointer' : ''}
                  >
                    {entity.value}
                  </span>
                  {entity.editable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntity(entity.id);
                      }}
                      className="p-0.5 hover:bg-black/20 rounded transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-current"
                      aria-label={`Remove ${entity.type} entity`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Add New Entity */}
        {showAddForm ? (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-policy-secondary rounded-lg border border-policy-accent">
            <select
              value={newEntityType}
              onChange={(e) => setNewEntityType(e.target.value as QueryEntity['type'])}
              className="bg-transparent text-policy-text text-sm focus:outline-none"
              aria-label="Select entity type"
            >
              <option value="age">Age</option>
              <option value="location">Location</option>
              <option value="amount">Amount</option>
              <option value="date">Date</option>
              <option value="policy_type">Policy Type</option>
              <option value="custom">Custom</option>
            </select>
            <input
              type="text"
              value={newEntityValue}
              onChange={(e) => setNewEntityValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'add')}
              placeholder="Value"
              className="bg-transparent text-policy-text text-sm focus:outline-none border-b border-current min-w-0 w-20"
              autoFocus
              aria-label="Entity value"
            />
            <button
              onClick={addEntity}
              className="p-0.5 text-policy-accent hover:bg-policy-accent/20 rounded transition-colors duration-200"
              aria-label="Add entity"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewEntityValue('');
              }}
              className="p-0.5 text-policy-text-muted hover:bg-policy-text-muted/20 rounded transition-colors duration-200"
              aria-label="Cancel add entity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-3 py-2 border-2 border-dashed border-policy-text-muted text-policy-text-muted hover:border-policy-accent hover:text-policy-accent rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
            aria-label="Add new entity"
          >
            <Plus className="w-3 h-3" />
            <span className="text-sm">Add Entity</span>
          </button>
        )}
      </div>
    </div>
  );
}