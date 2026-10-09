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
  ExternalLink,
} from 'lucide-react';

interface CampusHubProps {
  onAskAI: (query: string) => void;
}

export const CampusHub: React.FC<CampusHubProps> = ({ onAskAI }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'buses' | 'attendance' | 'notes' | 'holidays'>('events');

  return (
    <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Navigation Tabs Header */}
      <div className="bg-[#100E22]/90 border-b border-white/10 px-4 pt-3 flex gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'events'
              ? 'bg-[#18162f] text-pink-400 border-t-2 border-pink-500 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Events & Fests</span>
        </button>

        <button
          onClick={() => setActiveTab('buses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'buses'
              ? 'bg-[#18162f] text-pink-400 border-t-2 border-pink-500 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bus className="w-4 h-4 text-blue-400" />
          <span>University Buses</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#18162f] text-pink-400 border-t-2 border-pink-500 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4 text-emerald-400" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#18162f] text-pink-400 border-t-2 border-pink-500 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span>Study Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
            activeTab === 'holidays'
              ? 'bg-[#18162f] text-pink-400 border-t-2 border-pink-500 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sun className="w-4 h-4 text-rose-400" />
          <span>Calendar</span>
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
                className="glass-card border border-white/10 rounded-2xl p-5 hover:border-pink-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300">
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {evt.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm font-heading group-hover:text-pink-300 transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{evt.description}</p>

                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">{evt.organizer}</span>
                  <button
                    onClick={() => onAskAI(`Tell me about ${evt.title} and how to register`)}
                    className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
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
                className="glass-card border border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-pink-300 bg-pink-500/20 border border-pink-500/30 px-2.5 py-0.5 rounded-full">
                      Route #{bus.routeNumber}
                    </span>
                    <h3 className="font-extrabold text-white text-sm mt-1.5 font-heading">{bus.routeName}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{bus.busPlateNumber}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="block font-bold text-white">Departs: {bus.eveningDeparture}</span>
                    <span className="text-[10px] text-slate-400">Gate 1 Campus</span>
                  </div>
                </div>

                {/* Stops Timeline */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Key Stops & Morning Pickup</span>
                  <div className="space-y-1">
                    {bus.stops.map((stop, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                          {stop.stopName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{stop.morningTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Driver: <strong className="text-white">{bus.driverName}</strong>
                  </span>
                  <a
                    href={`tel:${bus.driverPhone}`}
                    className="flex items-center gap-1 font-bold text-pink-400 hover:text-pink-300"
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
            <div className="p-4 bg-gradient-to-r from-violet-950/70 to-pink-950/50 border border-pink-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-white text-sm font-heading">
                  Overall Semester Attendance: 86.4%
                </h3>
                <p className="text-xs text-slate-400">
                  Mandatory VTU threshold is <strong>75.0%</strong>. Current standing: Safe.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold text-xs self-start sm:self-auto">
                Status: Safe / Eligible
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attendanceData[0]?.subjects.map((sub) => (
                <div
                  key={sub.courseCode}
                  className="glass-card border border-white/10 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">{sub.courseCode}</span>
                      <h4 className="font-bold text-white text-xs">{sub.courseName}</h4>
                      <p className="text-[11px] text-slate-400">Faculty: {sub.faculty}</p>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        sub.percentage >= 85
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : sub.percentage >= 75
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
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

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
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
                className="glass-card border border-white/10 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-pink-400 mb-1">
                    <span>{note.courseCode} • {note.courseTitle}</span>
                    <span className="font-mono text-slate-400">{note.fileSize}</span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm font-heading">{note.module}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{note.summary}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Uploaded by {note.uploadedBy} on {note.uploadDate}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex gap-1">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onAskAI(`Summarize notes for ${note.courseTitle} ${note.module}`)}
                    className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 cursor-pointer"
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
                className="glass-card border border-white/10 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-rose-500/20 text-rose-300 border border-rose-500/30 p-2.5 rounded-xl text-center shrink-0 min-w-[70px]">
                    <span className="block text-[9px] uppercase font-bold">Holiday</span>
                    <span className="text-xs font-black font-mono">{hol.date.split('-').slice(1).join('/')}</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm font-heading">{hol.name}</h3>
                    <p className="text-xs text-slate-400">{hol.description}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-slate-300 hidden sm:inline-block">
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
