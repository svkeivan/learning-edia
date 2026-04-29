"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  section: string;
  done: boolean;
};

const sections = [
  "Assessment Center",
  "IQA",
  "Finance",
  "Attendance",
  "People & Roles",
];

const initialTasks: Task[] = [
  {
    id: "review-iqa-sampling",
    title: "Review IQA sampling changes",
    section: "IQA",
    done: false,
  },
  {
    id: "check-assessor-queue",
    title: "Check assessor queue handover",
    section: "Assessment Center",
    done: false,
  },
];

export default function PageTasksDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draft, setDraft] = useState({ title: "", section: sections[0] });

  const openTasks = tasks.filter((task) => !task.done).length;

  const addTask = () => {
    const title = draft.title.trim();
    if (!title) return;

    setTasks((currentTasks) => [
      {
        id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        title,
        section: draft.section,
        done: false,
      },
      ...currentTasks,
    ]);
    setDraft({ title: "", section: sections[0] });
  };

  const toggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task,
      ),
    );
  };

  return (
    <div className="fixed right-6 top-5 z-40">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-500/15"
        aria-expanded={isOpen}
        aria-label="Open task list"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
          />
        </svg>
        Tasks
        {openTasks > 0 && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
            {openTasks}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Page tasks</p>
            <p className="text-xs text-slate-500">Quick notes for work to follow up.</p>
          </div>

          <div className="max-h-64 overflow-y-auto p-3">
            {tasks.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                No tasks yet.
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-medium ${
                          task.done ? "text-slate-400 line-through" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {task.section}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-3">
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  title: event.target.value,
                }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") addTask();
              }}
              placeholder="Add a task..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            />
            <div className="mt-2 flex gap-2">
              <select
                value={draft.section}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    section: event.target.value,
                  }))
                }
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              >
                {sections.map((section) => (
                  <option
                    key={section}
                    value={section}
                  >
                    {section}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addTask}
                disabled={!draft.title.trim()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
