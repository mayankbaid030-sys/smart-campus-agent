'use client';

import React, { useState } from 'react';
import eventsData from '@/data/events.json';
import busesData from '@/data/buses.json';
import notesData from '@/data/notes.json';
import attendanceData from '@/data/attendance.json';
import holidaysData from '@/data/holidays.json';
import {
  Calendar,
  Bus,
  BookOpen,
  PieChart,
  Sun,
  MapPin,
  Clock,
  Phone,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface CampusHubProps {
  onAskAI: (query: string) => void;
}

export const CampusHub: React.FC<CampusHubProps> = ({ onAskAI }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'buses' | 'attendance' | 'notes' | 'holidays'>('events');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Navigation Tabs Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 pt-3 flex gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'events'
              ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Events & Fests</span>
        </button>

        <button
          onClick={() => setActiveTab('buses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'buses'
              ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bus className="w-4 h-4 text-blue-500" />
          <span>University Buses</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4 text-emerald-500" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Study Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'holidays'
              ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sun className="w-4 h-4 text-rose-500" />
          <span>Holidays</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* 1. EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventsData.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {evt.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{evt.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.description}</p>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">By {evt.organizer}</span>
                  <button
                    onClick={() => onAskAI(`Tell me about ${evt.title} and how to register`)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. BUSES TAB */}
        {activeTab === 'buses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {busesData.map((bus) => (
              <div
                key={bus.routeNumber}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Route #{bus.routeNumber}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{bus.routeName}</h3>
                    <p className="text-[11px] font-mono text-slate-500">{bus.busPlateNumber}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="block font-bold text-slate-800">Departs: {bus.eveningDeparture}</span>
                    <span className="text-[10px] text-slate-500">Gate 1 Campus</span>
                  </div>
                </div>

                {/* Stops Timeline */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Key Stops & Morning Timings</span>
                  <div className="space-y-1">
                    {bus.stops.map((stop, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {stop.stopName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{stop.morningTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Driver: <strong>{bus.driverName}</strong>
                  </span>
                  <a
                    href={`tel:${bus.driverPhone}`}
                    className="flex items-center gap-1 font-bold text-blue-600 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{bus.driverPhone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Overall Semester Attendance: 86.4%
                </h3>
                <p className="text-xs text-slate-600">
                  Sapthagiri NPS University / VTU mandatory minimum threshold is <strong>75.0%</strong>.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl font-bold text-xs self-start sm:self-auto">
                Status: Safe / Eligible
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attendanceData[0]?.subjects.map((sub) => (
                <div
                  key={sub.courseCode}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">{sub.courseCode}</span>
                      <h4 className="font-bold text-slate-900 text-xs">{sub.courseName}</h4>
                      <p className="text-[11px] text-slate-500">Faculty: {sub.faculty}</p>
                    </div>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        sub.percentage >= 85
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.percentage >= 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sub.percentage >= 85
                          ? 'bg-emerald-500'
                          : sub.percentage >= 75
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Attended: {sub.classesAttended} / {sub.classesHeld} classes</span>
                    <span>{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesData.map((note) => (
              <div
                key={note.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 mb-1">
                    <span>{note.courseCode} • {note.courseTitle}</span>
                    <span className="font-mono text-slate-500">{note.fileSize}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{note.module}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{note.summary}</p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Uploaded by {note.uploadedBy} on {note.uploadDate}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex gap-1">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onAskAI(`Summarize notes for ${note.courseTitle} ${note.module}`)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explain</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. HOLIDAYS TAB */}
        {activeTab === 'holidays' && (
          <div className="space-y-3">
            {holidaysData.map((hol) => (
              <div
                key={hol.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-rose-100 text-rose-800 p-2.5 rounded-xl text-center shrink-0 min-w-[70px]">
                    <span className="block text-[10px] uppercase font-bold">Holiday</span>
                    <span className="text-xs font-extrabold">{hol.date.split('-').slice(1).join('/')}</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{hol.name}</h3>
                    <p className="text-xs text-slate-500">{hol.description}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 hidden sm:inline-block">
                  {hol.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
