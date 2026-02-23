import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Calendar, Clock, List, Link } from 'lucide-react';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  task?: Task;
  initialStatus?: Task['status'];
}

export function TaskModal({ isOpen, onClose, onSave, onDelete, task, initialStatus = 'todo' }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    name: '',
    description: '',
    status: initialStatus,
    depends: [],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        start: task.start ? new Date(task.start) : undefined,
        end: task.end ? new Date(task.end) : undefined,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: initialStatus,
        depends: [],
        start: new Date(),
        end: new Date(),
      });
    }
  }, [task, initialStatus, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return; // Simple validation

    // Ensure dates are valid
    const start = formData.start ? new Date(formData.start) : undefined;
    const end = formData.end ? new Date(formData.end) : undefined;

    // Calculate duration roughly
    let duration = formData.duration;
    if (start && end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    }

    onSave({
      id: task?.id || Math.random().toString(36).substr(2, 9), // Temp ID gen if creating
      name: formData.name,
      description: formData.description,
      status: formData.status as Task['status'],
      start,
      end,
      duration,
      depends: formData.depends || [],
    });
    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete) {
      if (confirm('Are you sure you want to delete this task?')) {
        onDelete(task.id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter task name..."
                  autoFocus
                />
              </div>

              {/* Status & Dependencies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <List className="w-4 h-4" /> Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4" /> Dependencies (IDs)
                  </label>
                  <input
                    type="text"
                    value={formData.depends?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, depends: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="task_1, task_2"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Add a more detailed description..."
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start ? format(formData.start, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormData({ ...formData, start: e.target.valueAsDate || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end ? format(formData.end, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormData({ ...formData, end: e.target.valueAsDate || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            {task && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : (
              <div></div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="task-form"
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
              >
                <Save className="w-4 h-4" /> Save Task
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
