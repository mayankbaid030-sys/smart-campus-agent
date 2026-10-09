'use client';

import React from 'react';
import { UserAccount } from '@/types';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Users,
  Compass,
  Phone,
  Bus,
  School,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RoleDashboardProps {
  account: UserAccount;
  onAskAI: (query: string) => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({ account, onAskAI }) => {
  const { role, details, name } = account;

  // 1. STUDENT VIEW
  if (role === 'student' && details) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-600/30 to-pink-600/30 border border-pink-500/30 rounded-2xl text-pink-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight font-heading">
                Student Portal: {details.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                USN: <span className="font-mono font-bold text-pink-400">{details.usn}</span> • {details.department} (Sem {details.semester})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-2xl text-center">
              <span className="block text-[9px] text-emerald-400 uppercase font-black">CGPA</span>
              <span className="text-base font-black text-emerald-300 font-heading">{details.cgpa}</span>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-2xl text-center">
              <span className="block text-[9px] text-blue-400 uppercase font-black">Bus Route</span>
              <span className="text-base font-black text-blue-300 font-heading">#{details.busRoute}</span>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assigned Mentor
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                On Campus
              </span>
            </div>
            <h4 className="font-extrabold text-white text-sm font-heading">{details.mentorName}</h4>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{details.mentorPhone}</span>
              <button
                onClick={() => onAskAI(`Where is my mentor ${details.mentorName}?`)}
                className="text-pink-400 font-bold hover:underline cursor-pointer"
              >
                Locate Radar
              </button>
            </div>
          </div>

          <div className="glass-card border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Enrolled Subjects
              </span>
              <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                5 Courses
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {details.enrolledCourses?.map((c: any) => (
                <span
                  key={c.code}
                  className="text-xs font-bold bg-white/5 text-slate-200 border border-white/10 px-2.5 py-1 rounded-xl"
                  title={c.title}
                >
                  {c.code}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. FACULTY VIEW
  if (role === 'faculty' && details) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-600/30 to-pink-600/30 border border-pink-500/30 rounded-2xl text-pink-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight font-heading">
                Faculty Portal: {details.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {details.designation} • {details.department}
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-300 font-bold text-xs">
            Cabin: {details.cabin}
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Today's Academic Schedule
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {details.scheduleToday?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="glass-card border border-white/10 rounded-2xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-pink-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                  </span>
                  <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-300 text-[10px]">
                    {item.room}
                  </span>
                </div>
                <p className="text-xs font-semibold text-white">{item.activity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. PARENT VIEW
  if (role === 'parent' && details) {
    const ward = details.ward;
    return (
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-600/30 to-pink-600/30 border border-pink-500/30 rounded-2xl text-pink-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight font-heading">
                Parent Portal: {name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Ward: <strong className="text-white">{ward?.name}</strong> ({ward?.usn})
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
            Relation: {details.relation}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Standing</span>
            <div className="text-xl font-black text-white mt-1 font-heading">{ward?.cgpa} CGPA</div>
            <p className="text-xs text-slate-400 mt-0.5">Sem {ward?.semester} • {ward?.deptCode}</p>
          </div>

          <div className="glass-card border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty Mentor</span>
            <div className="text-sm font-extrabold text-white mt-1 font-heading">{ward?.mentorName}</div>
            <p className="text-xs text-pink-400 font-medium mt-0.5">{ward?.mentorPhone}</p>
          </div>

          <div className="glass-card border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Campus Bus</span>
            <div className="text-sm font-extrabold text-white mt-1 font-heading">Route #{ward?.busRoute}</div>
            <p className="text-xs text-slate-400 mt-0.5">Departs 04:45 PM Gate 1</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. GUEST VIEW
  return (
    <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="p-2.5 bg-gradient-to-br from-violet-600/30 to-pink-600/30 border border-pink-500/30 rounded-2xl text-pink-400">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight font-heading">
            Sapthagiri NPS University Campus Navigator
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Welcome Campus Guest! Explore academic departments, amenities, and admissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onAskAI('Tell me about admissions at Sapthagiri NPS University')}
          className="text-left p-4 rounded-2xl border border-white/10 hover:border-pink-500/40 glass-card transition-all cursor-pointer"
        >
          <span className="font-bold text-xs text-white block font-heading">Admissions 2026</span>
          <span className="text-[11px] text-slate-400">AI, Engineering & Management</span>
        </button>

        <button
          onClick={() => onAskAI('Where is the campus cafeteria and library?')}
          className="text-left p-4 rounded-2xl border border-white/10 hover:border-pink-500/40 glass-card transition-all cursor-pointer"
        >
          <span className="font-bold text-xs text-white block font-heading">Campus Landmarks</span>
          <span className="text-[11px] text-slate-400">Central Library, Food Court</span>
        </button>

        <button
          onClick={() => onAskAI('How do I contact the university helpline?')}
          className="text-left p-4 rounded-2xl border border-white/10 hover:border-pink-500/40 glass-card transition-all cursor-pointer"
        >
          <span className="font-bold text-xs text-white block font-heading">Help Desk</span>
          <span className="text-[11px] text-slate-400">Security & Admissions Helpline</span>
        </button>
      </div>
    </div>
  );
};
