import React, { useState } from 'react';
import { Plus, Check, Trash2, Sparkles, Target, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Task } from '../types';
import { sliceTaskWithAI } from '../services/geminiService';

interface TodoListProps {
  tasks: Task[];
  activeTaskId?: string;
  onSelectActiveTask: (taskId: string) => void;
  onAddTask: (title: string, estimatedMinutes?: number, subtasks?: { id: string; title: string; completed: boolean }[]) => void;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onAddTask,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isSlicing, setIsSlicing] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), 15);
    setNewTitle('');
  };

  const handleQuickAdd = (text: string, mins: number) => {
    onAddTask(text, mins);
  };

  const handleAISlice = async () => {
    if (!newTitle.trim()) return;
    setIsSlicing(true);
    try {
      const steps = await sliceTaskWithAI(newTitle);
      const subtasks = steps.map((s, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: `${s.title} (${s.minutes}m)`,
        completed: false,
      }));
      onAddTask(newTitle.trim(), 20, subtasks);
      setNewTitle('');
    } finally {
      setIsSlicing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-neutral-100">Micro Study Tasks</h3>
          <p className="text-xs text-neutral-400">
            Completing any task or sprint cracks open a mystery loot box!
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          {activeTasks.length} active
        </span>
      </div>

      {/* Task Input Form */}
      <form onSubmit={handleCreate} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Read 3 pages of biology, solve 2 math problems..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* AI Slicer Button for Big/Overwhelming tasks */}
        {newTitle.trim().length > 3 && (
          <button
            type="button"
            onClick={handleAISlice}
            disabled={isSlicing}
            className="w-full py-2 px-3 rounded-lg bg-neutral-950 hover:bg-neutral-800/80 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isSlicing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Slicing into 15-min ADHD chunks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Too overwhelming? Slice into 15-min bite-sized steps</span>
              </>
            )}
          </button>
        )}

        {/* Quick Micro-Task Suggestions (for fast zero-friction start) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-neutral-400">
          <span className="font-mono text-neutral-500">Quick bite:</span>
          <button
            type="button"
            onClick={() => handleQuickAdd('Skim 2 pages & write 3 definitions', 15)}
            className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors cursor-pointer"
          >
            + Skim 2 pages (15m)
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('Solve 1 practice problem solo', 10)}
            className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors cursor-pointer"
          >
            + Solve 1 problem (10m)
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('10 Flashcards drill', 10)}
            className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors cursor-pointer"
          >
            + Flashcards (10m)
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {activeTasks.length === 0 && (
          <div className="text-center py-8 text-neutral-500 text-xs font-mono">
            No active tasks. Add a small bite-sized goal to start your focus sprint!
          </div>
        )}

        {activeTasks.map((task) => {
          const isActive = task.id === activeTaskId;
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
          const isExpanded = expandedTasks[task.id] ?? true;

          return (
            <div
              key={task.id}
              className={`rounded-xl border transition-all ${
                isActive
                  ? 'bg-neutral-950 border-emerald-500/70 shadow-sm'
                  : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="w-5 h-5 rounded-lg border border-neutral-600 hover:border-emerald-400 flex items-center justify-center text-transparent hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                    title="Mark finished & crack loot box!"
                  >
                    <Check className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-neutral-100 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                      <span>{task.estimatedMinutes} min sprint</span>
                      {hasSubtasks && (
                        <>
                          <span>·</span>
                          <span>{task.subtasks?.filter((s) => s.completed).length}/{task.subtasks?.length} steps</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Select as active timer objective */}
                  <button
                    onClick={() => onSelectActiveTask(task.id)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                    title={isActive ? 'Currently locking in on this' : 'Set as current timer goal'}
                  >
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{isActive ? 'Target' : 'Focus'}</span>
                    </div>
                  </button>

                  {hasSubtasks && (
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subtasks block */}
              {hasSubtasks && isExpanded && (
                <div className="px-4 pb-3 pt-1 border-t border-neutral-900 space-y-1.5">
                  {task.subtasks!.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-xs text-neutral-300 pl-4 py-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => onToggleSubtask(task.id, sub.id)}
                          className="rounded border-neutral-700 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <span className={sub.completed ? 'line-through text-neutral-500' : ''}>
                          {sub.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Completed list preview */}
        {completedTasks.length > 0 && (
          <div className="pt-3 border-t border-neutral-800/80">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
              COMPLETED & CRACKED ({completedTasks.length})
            </div>
            <div className="space-y-1">
              {completedTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800/50 flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs line-through text-neutral-400 truncate">{task.title}</span>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-neutral-600 hover:text-neutral-400 text-xs ml-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
