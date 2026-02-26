'use client';

import { useState } from 'react';
import {
  attendanceEvents,
  AttendanceEvent,
  AttendanceSession,
  AttendanceStatus,
  AttendanceEventType,
  SessionType,
  EventGroup,
  sessionType,
  eventGroup,
} from '@/lib/mock-data';

// ─── Colour maps ─────────────────────────────────────────────────────────────

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  'Electrical': 'bg-yellow-100 text-yellow-700',
  'Plumbing': 'bg-blue-100 text-blue-700',
};
const tradeDot: Record<string, string> = {
  'Gas Engineering': 'bg-orange-400',
  'Electrical': 'bg-yellow-400',
  'Plumbing': 'bg-blue-400',
};

// ─── Session sidebar item ────────────────────────────────────────────────────

function SessionItem({
  session,
  isSelected,
  onClick,
}: {
  session: AttendanceSession;
  isSelected: boolean;
  onClick: () => void;
}) {
  const type = sessionType(session);

  const icon =
    type === 'past' ? (
      // lock icon – past
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ) : type === 'future' ? (
      // calendar icon – upcoming
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-blue-500 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ) : (
      // pulse dot – today
      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 animate-pulse" />
    );

  const activeStyle = isSelected
    ? 'bg-orange-50 border-r-2 border-orange-500'
    : 'hover:bg-gray-50';

  return (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 transition-colors ${activeStyle}`}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <p className={`text-sm font-medium truncate ${
            isSelected ? 'text-orange-700' : type === 'future' ? 'text-slate-500' : 'text-gray-900'
          }`}>
            {session.label}
          </p>
        </div>
        {type === 'today' && (
          <span className="shrink-0 text-xs bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded-full">Today</span>
        )}
        {type === 'future' && (
          <span className="shrink-0 text-xs bg-blue-50 text-blue-500 font-medium px-1.5 py-0.5 rounded-full">Soon</span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-0.5 ml-3.5">{session.date}</p>
      <p className="text-xs text-gray-400 ml-3.5">{session.room}</p>
    </button>
  );
}

// ─── Right panel per session type ────────────────────────────────────────────

type StudentAttendance = Record<string, AttendanceStatus>;

function TodayPanel({
  session,
  attendance,
  onMark,
  onMarkAll,
}: {
  session: AttendanceSession;
  attendance: StudentAttendance;
  onMark: (id: string, s: AttendanceStatus) => void;
  onMarkAll: (s: AttendanceStatus) => void;
}) {
  const total = session.students.length;
  const present = Object.values(attendance).filter(v => v === 'Present').length;
  const absent = Object.values(attendance).filter(v => v === 'Absent').length;
  const unmarked = Object.values(attendance).filter(v => v === 'Unmarked').length;

  return (
    <>
      {/* Session header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{session.date}</h2>
              <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                Today&apos;s Session
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{session.time}</span>
              <span>·</span>
              <span>{session.room}</span>
            </div>
          </div>
          <button
            onClick={() => onMarkAll('Present')}
            className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
          >
            Mark All Present
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Total', value: total, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'Present', value: present, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Absent', value: absent, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Unmarked', value: unmarked, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Attendance rate (marked only)</span>
              <span className="font-medium">
                {total - unmarked > 0 ? Math.round((present / (total - unmarked)) * 100) : 0}%
              </span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
              <div className="bg-green-500 transition-all" style={{ width: `${(present / total) * 100}%` }} />
              <div className="bg-red-400 transition-all" style={{ width: `${(absent / total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Student list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Students · {session.students.length}
          </p>
          {unmarked > 0 && (
            <p className="text-xs text-amber-600 font-medium">{unmarked} unmarked</p>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {session.students.map(student => {
            const status = attendance[student.id] ?? student.status;
            return (
              <div key={student.id} className="flex items-center gap-4 px-5 py-3.5">
              
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onMark(student.id, 'Present')}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      status === 'Present'
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50'
                    }`}
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Present
                  </button>
                  <button
                    onClick={() => onMark(student.id, 'Absent')}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      status === 'Absent'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Absent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {unmarked > 0 ? `${unmarked} students still unmarked` : 'All students marked ✓'}
          </p>
          <button className="text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg transition-colors">
            Save Attendance
          </button>
        </div>
      </div>
    </>
  );
}

function PastPanel({ session, isWebinar = false }: { session: AttendanceSession; isWebinar?: boolean }) {
  const present = session.students.filter(s => s.status === 'Present').length;
  const absent = session.students.filter(s => s.status === 'Absent').length;
  const rate = session.students.length > 0 ? Math.round((present / session.students.length) * 100) : 0;

  const presentLabel = 'Present';
  const absentLabel = 'Absent';

  return (
    <>
      {/* Banner */}
      <div className={`border rounded-xl px-5 py-3.5 flex items-center gap-3 ${isWebinar ? 'bg-violet-50 border-violet-200' : 'bg-gray-50 border-gray-200'}`}>
        {isWebinar ? (
          <svg className="text-violet-400 shrink-0" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
          </svg>
        ) : (
          <svg className="text-gray-400 shrink-0" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        )}
        <div>
          <p className={`text-sm font-semibold ${isWebinar ? 'text-violet-800' : 'text-gray-700'}`}>
            {isWebinar ? 'Past Webinar — Attendance Auto-Recorded' : 'Past Session — View Only'}
          </p>
          <p className={`text-xs mt-0.5 ${isWebinar ? 'text-violet-600' : 'text-gray-500'}`}>
            {isWebinar
              ? `Attendance was automatically captured by the webinar platform on ${session.date}.`
              : `Attendance was recorded on ${session.date}. This record cannot be modified.`}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">{session.date}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{session.time}</span>
              <span>·</span>
              <span>{session.room}</span>
            </div>
          </div>
          <span className="text-sm font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
            {rate}% attendance
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Total', value: session.students.length, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: presentLabel, value: present, color: 'text-green-700', bg: 'bg-green-50' },
            { label: absentLabel, value: absent, color: 'text-red-700', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
            <div className="bg-green-500" style={{ width: `${(present / session.students.length) * 100}%` }} />
            <div className="bg-red-400" style={{ width: `${(absent / session.students.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Student list – read only */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Students · {session.students.length}
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {session.students.map(student => (
            <div key={student.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{student.name}</p>
                <p className="text-xs text-gray-400">{student.email}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                student.status === 'Present' ? 'bg-green-100 text-green-700' :
                student.status === 'Absent' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {student.status === 'Present' ? presentLabel :
                 student.status === 'Absent' ? absentLabel :
                 student.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Webinar today panel (automated) ─────────────────────────────────────────

function WebinarTodayPanel({ session }: { session: AttendanceSession }) {
  const present = session.students.filter(s => s.status === 'Present').length;
  const absent = session.students.filter(s => s.status === 'Absent').length;
  const unmarked = session.students.filter(s => s.status === 'Unmarked').length;
  const total = session.students.length;

  const statusLabel = (status: AttendanceStatus) => {
    if (status === 'Present') return { text: 'Present', cls: 'bg-green-100 text-green-700' };
    if (status === 'Absent') return { text: 'Absent', cls: 'bg-red-100 text-red-700' };
    return { text: 'Unmarked', cls: 'bg-amber-100 text-amber-700' };
  };

  return (
    <>
      {/* Automated banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
          <svg className="text-violet-600" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-violet-900">Attendance Tracked Automatically</p>
          <p className="text-xs text-violet-700 mt-0.5 leading-relaxed">
            This is an online webinar session. Attendance is recorded automatically by the platform — no manual action required from admin.
          </p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-300 px-3 py-1.5 rounded-lg transition-colors">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Sync
        </button>
      </div>

      {/* Session info + live stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{session.date}</h2>
              <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                Live Webinar
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{session.time}</span>
              <span>·</span>
              <span>{session.room}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Auto-tracking active
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Total', value: total, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'Present', value: present, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Absent', value: absent, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Unmarked', value: unmarked, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Attendance rate (marked only)</span>
              <span className="font-medium">
                {total - unmarked > 0 ? Math.round((present / (total - unmarked)) * 100) : 0}%
              </span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
              <div className="bg-green-500 transition-all" style={{ width: `${(present / total) * 100}%` }} />
              <div className="bg-red-400 transition-all" style={{ width: `${(absent / total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Participant list – read only */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Students · {session.students.length}
          </p>
          <p className="text-xs text-gray-400 italic">Updated automatically by platform</p>
        </div>
        <div className="divide-y divide-gray-50">
          {session.students.map(student => {
            const { text, cls } = statusLabel(student.status);
            return (
              <div key={student.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>
        {/* Info footer instead of Save button */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-violet-50/40 flex items-center gap-2">
          <svg className="text-violet-400 shrink-0" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-xs text-violet-700">
            Attendance data is synced in real time. No action needed from admin.
          </p>
        </div>
      </div>
    </>
  );
}

function FuturePanel({ session }: { session: AttendanceSession }) {
  return (
    <>
      {/* Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
        <svg className="text-blue-400 shrink-0" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800">Upcoming Session — Not Yet Available</p>
          <p className="text-xs text-blue-600 mt-0.5">Attendance marking will open on the day of this session ({session.date}).</p>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">{session.date}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{session.time}</span>
              <span>·</span>
              <span>{session.room}</span>
            </div>
          </div>
          <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2.5 py-1.5 rounded-lg">
            Upcoming
          </span>
        </div>
      </div>

      {/* Student roster – no marking buttons, dimmed */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-70">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <svg className="text-gray-400" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Enrolled Students · {session.students.length}
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {session.students.map(student => (
            <div key={student.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400 shrink-0">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">{student.name}</p>
                <p className="text-xs text-gray-400">{student.email}</p>
              </div>
              <span className="text-xs text-gray-300 font-medium px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                Not yet
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Detail view ─────────────────────────────────────────────────────────────

function AttendanceDetail({ event, onBack }: { event: AttendanceEvent; onBack: () => void }) {
  // Default: today's session, otherwise first session
  const defaultSession = event.sessions.find(s => s.isToday) ?? event.sessions[0];
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>(defaultSession);

  // Per-session attendance state (only matters for today's session)
  const [attendance, setAttendance] = useState<StudentAttendance>(() => {
    const init: StudentAttendance = {};
    defaultSession.students.forEach(s => { init[s.id] = s.status; });
    return init;
  });

  const handleSelect = (session: AttendanceSession) => {
    setSelectedSession(session);
    if (session.isToday) {
      const init: StudentAttendance = {};
      session.students.forEach(s => { init[s.id] = s.status; });
      setAttendance(init);
    }
  };

  const type = sessionType(selectedSession);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">{event.course}</h1>

        {event.eventType === 'Webinar' && (
          <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
            Webinar
          </span>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sessions sidebar */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sessions · {event.sessions.length}
              </p>
            </div>

            {/* Legend */}
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Today
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Past
              </span>
              <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                Upcoming
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {event.sessions.map(session => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isSelected={selectedSession.id === session.id}
                  onClick={() => handleSelect(session)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {type === 'today' && event.eventType === 'Webinar' && (
            <WebinarTodayPanel session={selectedSession} />
          )}
          {type === 'today' && event.eventType !== 'Webinar' && (
            <TodayPanel
              session={selectedSession}
              attendance={attendance}
              onMark={(id, s) => setAttendance(prev => ({ ...prev, [id]: s }))}
              onMarkAll={s => {
                const updated: StudentAttendance = {};
                selectedSession.students.forEach(st => { updated[st.id] = s; });
                setAttendance(updated);
              }}
            />
          )}
          {type === 'past' && <PastPanel session={selectedSession} isWebinar={event.eventType === 'Webinar'} />}
          {type === 'future' && <FuturePanel session={selectedSession} />}
        </div>
      </div>
    </div>
  );
}

// ─── Event card ──────────────────────────────────────────────────────────────

function EventCard({ event, onClick }: { event: AttendanceEvent; onClick: () => void }) {
  const group = eventGroup(event);
  const todaySessions = event.sessions.filter(s => s.isToday);
  const unmarked = todaySessions.flatMap(s => s.students).filter(st => st.status === 'Unmarked').length;
  const nextFuture = event.sessions.find(s => s.isFuture);
  const lastPast = [...event.sessions].reverse().find(s => !s.isToday && !s.isFuture);
  const completedSessions = event.sessions.filter(s => !s.isToday && !s.isFuture).length;

  const borderClass =
    group === 'today' ? 'border-orange-200 hover:border-orange-300' :
    group === 'upcoming' ? 'border-blue-100 hover:border-blue-300' :
    'border-gray-200 hover:border-gray-300';

  return (
    <button onClick={onClick} className={`text-left bg-white rounded-xl border p-5 hover:shadow-md transition-all ${borderClass}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${tradeDot[event.trade]}`} />
            <p className="text-xs font-medium text-gray-500">{event.trade}</p>
          </div>
          <p className="font-semibold text-gray-900 mt-0.5 text-base">{event.course}</p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
          group === 'today' ? 'bg-orange-100 text-orange-700' :
          group === 'upcoming' ? 'bg-blue-100 text-blue-600' :
          'bg-gray-100 text-gray-500'
        }`}>
          {group === 'today' ? 'Today' : group === 'upcoming' ? 'Upcoming' : 'Completed'}
        </span>
      </div>

      <div className="space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <span>{event.dateRange}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{event.time}</span>
        </div>
        {group === 'upcoming' && nextFuture && (
          <div className="flex items-center gap-2 text-blue-600">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-xs">Starts {nextFuture.date}</span>
          </div>
        )}
        {group === 'past' && lastPast && (
          <div className="flex items-center gap-2 text-gray-400">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-xs">Ended {lastPast.date}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{event.totalSessions}</p>
            <p className="text-xs text-gray-400">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{event.totalStudents}</p>
            <p className="text-xs text-gray-400">Students</p>
          </div>
        </div>
        {/* Event type badge */}
        {event.eventType === 'Webinar' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1.5 rounded-lg">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
            </svg>
            Webinar
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-lg">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            In Person
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({
  title, count, color,
}: { title: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className={`text-sm font-bold uppercase tracking-wide ${color}`}>{title}</h2>
      <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type EventTypeFilter = 'All' | 'In Person' | 'Webinar';

const monthLabelFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
});

function parseSessionDate(dateText: string): Date | null {
  const normalized = dateText.includes(',') ? dateText.split(',').slice(1).join(',').trim() : dateText;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonthOffset(base: Date, offset: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function eventHasGroupSessionInMonth(
  event: AttendanceEvent,
  group: 'upcoming' | 'past',
  selectedMonth: Date
): boolean {
  const selectedKey = monthKey(selectedMonth);
  const groupSessions = event.sessions.filter(s =>
    group === 'upcoming' ? s.isFuture : !s.isToday && !s.isFuture
  );
  return groupSessions.some(session => {
    const parsed = parseSessionDate(session.date);
    return parsed ? monthKey(getMonthStart(parsed)) === selectedKey : false;
  });
}

function SectionMonthFilter({
  monthLabel,
  onPrev,
  onNext,
}: {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onPrev}
        className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Prev month
      </button>
      <span className="text-xs font-semibold text-gray-500 min-w-28 text-center">{monthLabel}</span>
      <button
        onClick={onNext}
        className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Next month
      </button>
    </div>
  );
}

export default function AttendancePage() {
  const [selectedEvent, setSelectedEvent] = useState<AttendanceEvent | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('All');
  const [upcomingMonthOffset, setUpcomingMonthOffset] = useState(0);
  const [pastMonthOffset, setPastMonthOffset] = useState(0);

  if (selectedEvent) {
    return <AttendanceDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  const todayCount = attendanceEvents.flatMap(e => e.sessions).filter(s => s.isToday).length;

  const filtered = attendanceEvents.filter(e => {
    const matchSearch =
      e.course.toLowerCase().includes(search.toLowerCase()) ||
      e.trade.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || e.eventType === typeFilter;
    return matchSearch && matchType;
  });

  const todayEvents = filtered.filter(e => eventGroup(e) === 'today');
  const upcomingEvents = filtered.filter(e => eventGroup(e) === 'upcoming');
  const pastEvents = filtered.filter(e => eventGroup(e) === 'past');
  const baseMonth = getMonthStart(new Date());
  const selectedUpcomingMonth = addMonthOffset(baseMonth, upcomingMonthOffset);
  const selectedPastMonth = addMonthOffset(baseMonth, pastMonthOffset);
  const upcomingMonthLabel = monthLabelFormatter.format(selectedUpcomingMonth);
  const pastMonthLabel = monthLabelFormatter.format(selectedPastMonth);
  const upcomingEventsByMonth = upcomingEvents.filter(e => eventHasGroupSessionInMonth(e, 'upcoming', selectedUpcomingMonth));
  const pastEventsByMonth = pastEvents.filter(e => eventHasGroupSessionInMonth(e, 'past', selectedPastMonth));

  const totalShown = filtered.length;
  const totalAll = attendanceEvents.length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Assessment Center</p>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">
            Wednesday, 18 Feb 2026 · {todayCount} session{todayCount !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>


      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-7">
        {/* Search */}
        <div className="relative flex-1 min-w-52 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>

        {/* Event type toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1">
          {(['All', 'In Person', 'Webinar'] as EventTypeFilter[]).map(opt => {
            const isActive = typeFilter === opt;
            const counts = {
              All: totalAll,
              'In Person': attendanceEvents.filter(e => e.eventType === 'In Person').length,
              Webinar: attendanceEvents.filter(e => e.eventType === 'Webinar').length,
            };
            return (
              <button
                key={opt}
                onClick={() => setTypeFilter(opt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? opt === 'Webinar'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : opt === 'In Person'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {opt === 'Webinar' && (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                  </svg>
                )}
                {opt === 'In Person' && (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                )}
                {opt}
                <span className={`text-xs px-1 rounded ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {counts[opt]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          No events found
          {search && <> matching &ldquo;{search}&rdquo;</>}
          {typeFilter !== 'All' && <> for <strong>{typeFilter}</strong></>}.
        </div>
      )}

      {/* Today section */}
      {todayEvents.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Today" count={todayEvents.length} color="text-orange-600" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayEvents.map(e => <EventCard key={e.id} event={e} onClick={() => setSelectedEvent(e)} />)}
          </div>
        </div>
      )}

      {/* Upcoming section */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Upcoming" count={upcomingEventsByMonth.length} color="text-blue-600" />
          <div className="flex justify-end mb-3">
            <SectionMonthFilter
              monthLabel={upcomingMonthLabel}
              onPrev={() => setUpcomingMonthOffset(prev => prev - 1)}
              onNext={() => setUpcomingMonthOffset(prev => prev + 1)}
            />
          </div>
          {upcomingEventsByMonth.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEventsByMonth.map(e => <EventCard key={e.id} event={e} onClick={() => setSelectedEvent(e)} />)}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-500">
              No upcoming events in {upcomingMonthLabel}.
            </div>
          )}
        </div>
      )}

      {/* Past section */}
      {pastEvents.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Past" count={pastEventsByMonth.length} color="text-gray-400" />
          <div className="flex justify-end mb-3">
            <SectionMonthFilter
              monthLabel={pastMonthLabel}
              onPrev={() => setPastMonthOffset(prev => prev - 1)}
              onNext={() => setPastMonthOffset(prev => prev + 1)}
            />
          </div>
          {pastEventsByMonth.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEventsByMonth.map(e => <EventCard key={e.id} event={e} onClick={() => setSelectedEvent(e)} />)}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-500">
              No past events in {pastMonthLabel}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
