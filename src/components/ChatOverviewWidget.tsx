"use client";

import { useMemo, useState } from "react";

type Person = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

type ChatThread = {
  id: string;
  title: string;
  section: string;
  peopleIds: string[];
  lastMessage: string;
  updatedAt: string;
  unread: number;
  status: "Open" | "Waiting";
};

const people: Person[] = [
  { id: "admin", name: "Admin User", role: "Operations", initials: "AU" },
  { id: "sarah", name: "Sarah Khan", role: "Lead Assessor", initials: "SK" },
  { id: "michael", name: "Michael Reed", role: "IQA Reviewer", initials: "MR" },
  { id: "jane", name: "Jane Cooper", role: "Finance", initials: "JC" },
  { id: "omar", name: "Omar Ali", role: "Attendance", initials: "OA" },
];

const sections = [
  "Assessment Center",
  "IQA",
  "Finance",
  "Attendance",
  "People & Roles",
];

const sectionTabs = ["All", ...sections];

const initialThreads: ChatThread[] = [
  {
    id: "grading-support",
    title: "Assessor queue handover",
    section: "Assessment Center",
    peopleIds: ["admin", "sarah", "michael"],
    lastMessage: "Can we confirm who owns the late practical submissions?",
    updatedAt: "10:12",
    unread: 2,
    status: "Open",
  },
  {
    id: "iqa-sampling",
    title: "Sampling plan checks",
    section: "IQA",
    peopleIds: ["admin", "michael"],
    lastMessage: "The next cohort is ready for the second review pass.",
    updatedAt: "09:48",
    unread: 0,
    status: "Waiting",
  },
];

const getPeopleForThread = (thread: ChatThread) =>
  thread.peopleIds
    .map((personId) => people.find((person) => person.id === personId))
    .filter((person): person is Person => Boolean(person));

export default function ChatOverviewWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"overview" | "new" | "thread">("overview");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedThreadId, setSelectedThreadId] = useState(initialThreads[0].id);
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [draft, setDraft] = useState({
    title: "",
    section: sections[0],
    peopleIds: ["admin"],
    message: "",
  });

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? threads[0],
    [selectedThreadId, threads],
  );

  const unreadCount = threads.reduce((total, thread) => total + thread.unread, 0);

  const filteredThreads = useMemo(
    () =>
      selectedSection === "All"
        ? threads
        : threads.filter((thread) => thread.section === selectedSection),
    [selectedSection, threads],
  );

  const getSectionCount = (section: string) =>
    section === "All"
      ? threads.length
      : threads.filter((thread) => thread.section === section).length;

  const openThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setThreads((currentThreads) =>
      currentThreads.map((thread) =>
        thread.id === threadId ? { ...thread, unread: 0 } : thread,
      ),
    );
    setView("thread");
  };

  const togglePerson = (personId: string) => {
    setDraft((currentDraft) => {
      const isSelected = currentDraft.peopleIds.includes(personId);
      const nextPeopleIds = isSelected
        ? currentDraft.peopleIds.filter((id) => id !== personId)
        : [...currentDraft.peopleIds, personId];

      return {
        ...currentDraft,
        peopleIds: nextPeopleIds.length > 0 ? nextPeopleIds : currentDraft.peopleIds,
      };
    });
  };

  const createThread = () => {
    const title = draft.title.trim();
    const message = draft.message.trim();

    if (!title || !message) return;

    const newThread: ChatThread = {
      id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      title,
      section: draft.section,
      peopleIds: draft.peopleIds,
      lastMessage: message,
      updatedAt: "Now",
      unread: 0,
      status: "Open",
    };

    setThreads((currentThreads) => [newThread, ...currentThreads]);
    setSelectedThreadId(newThread.id);
    setSelectedSection(newThread.section);
    setDraft({
      title: "",
      section: sections[0],
      peopleIds: ["admin"],
      message: "",
    });
    setView("thread");
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-left text-white shadow-2xl shadow-slate-900/25 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/30"
        aria-label="Open chat overview"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h8M8 14h5m8-2a9 9 0 1 1-4.18-7.6L21 4l-.4 4.18A8.96 8.96 0 0 1 21 12Z"
            />
          </svg>
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-semibold">Team chat</span>
          <span className="block text-xs text-slate-300">Threads and sections</span>
        </span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <section
      className="fixed bottom-5 right-5 z-50 flex max-h-[calc(100vh-2.5rem)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
      aria-label="Chat overview"
    >
      <header className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
              Workspace chat
            </p>
            <h2 className="mt-1 text-lg font-semibold">Chat overview</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Close chat overview"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </header>

      {view === "overview" && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Active threads</p>
              <p className="text-xs text-slate-500">Tagged by LMS section</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedSection !== "All") {
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    section: selectedSection,
                  }));
                }
                setView("new");
              }}
              className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/25"
            >
              New chat
            </button>
          </div>

          <div className="border-b border-slate-100 px-3 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sectionTabs.map((section) => {
                const isSelected = selectedSection === section;

                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setSelectedSection(section)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-700"
                    }`}
                  >
                    {section}
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {getSectionCount(section)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {filteredThreads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No chats in {selectedSection}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Start a new chat and it will appear in this section.
                </p>
              </div>
            ) : filteredThreads.map((thread) => {
              const threadPeople = getPeopleForThread(thread);

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openThread(thread.id)}
                  className="mb-2 w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/40 focus:outline-none focus:ring-4 focus:ring-orange-500/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {thread.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {thread.lastMessage}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-xs font-medium text-slate-400">
                        {thread.updatedAt}
                      </span>
                      {thread.unread > 0 && (
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                          {thread.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {thread.section}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {thread.status}
                    </span>
                    <div className="ml-auto flex -space-x-2">
                      {threadPeople.slice(0, 3).map((person) => (
                        <span
                          key={person.id}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[10px] font-bold text-white"
                          title={person.name}
                        >
                          {person.initials}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "new" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <button
            type="button"
            onClick={() => setView("overview")}
            className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            Back to threads
          </button>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Thread title</span>
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    title: event.target.value,
                  }))
                }
                placeholder="Example: Attendance issue for Cohort B"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Section tag</span>
              <select
                value={draft.section}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    section: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
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
            </label>

            <div>
              <p className="text-sm font-semibold text-slate-800">Add people</p>
              <div className="mt-2 grid gap-2">
                {people.map((person) => {
                  const isSelected = draft.peopleIds.includes(person.id);

                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => togglePerson(person.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus:outline-none focus:ring-4 focus:ring-orange-500/10 ${
                        isSelected
                          ? "border-orange-300 bg-orange-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {person.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">
                          {person.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {person.role}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {isSelected ? "Added" : "Add"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Opening message
              </span>
              <textarea
                value={draft.message}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    message: event.target.value,
                  }))
                }
                placeholder="Write the first message for this thread..."
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>

            <button
              type="button"
              onClick={createThread}
              disabled={!draft.title.trim() || !draft.message.trim()}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Create thread
            </button>
          </div>
        </div>
      )}

      {view === "thread" && selectedThread && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setView("overview")}
              className="mb-3 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Back to threads
            </button>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedThread.title}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
                  {selectedThread.section}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setView("new")}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                New chat
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {getPeopleForThread(selectedThread).map((person) => (
                <span
                  key={person.id}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                >
                  {person.name}
                </span>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-slate-700 shadow-sm">
              {selectedThread.lastMessage}
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-900 p-3 text-sm text-white shadow-sm">
              Thanks, I have tagged this under {selectedThread.section} so the right team can follow it.
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <input
                placeholder="Reply to this thread..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
