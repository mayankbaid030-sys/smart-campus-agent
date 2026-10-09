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
  CheckCircle,
  AlertTriangle,
  Building2,
  Clock,
  Sparkles,
  School,
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Student Portal: {details.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  USN: <span className="font-mono font-bold text-blue-700">{details.usn}</span> • {details.department} (Sem {details.semester})
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
              <span className="block text-[10px] text-emerald-700 uppercase font-bold">CGPA</span>
              <span className="text-base font-extrabold text-emerald-800">{details.cgpa}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-center">
              <span className="block text-[10px] text-blue-700 uppercase font-bold">Bus Route</span>
              <span className="text-base font-extrabold text-blue-800">#{details.busRoute}</span>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Faculty Mentor */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assigned Mentor
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Available Today
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">{details.mentorName}</h4>
            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>{details.mentorPhone}</span>
              <button
                onClick={() => onAskAI(`Where is my mentor ${details.mentorName}?`)}
                className="text-blue-600 font-bold hover:underline"
              >
                Locate Mentor
              </button>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Semester Courses
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                5 Subjects
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {details.enrolledCourses?.map((c: any) => (
                <span
                  key={c.code}
                  className="text-xs font-bold bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg"
                  title={c.title}
                >
                  {c.code} ({c.credits} Cr)
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                <School className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Faculty Portal: {details.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {details.designation} • {details.department}
                </p>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 font-bold text-xs">
            Cabin: {details.cabin}
          </span>
        </div>

        {/* Faculty's Schedule Today */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Today's Academic Schedule
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {details.scheduleToday?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                  </span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 text-[11px]">
                    {item.room}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900">{item.activity}</p>
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Parent / Guardian Portal: {name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Ward: <strong className="text-slate-900">{ward?.name}</strong> ({ward?.usn})
                </p>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
            Relation: {details.relation}
          </span>
        </div>

        {/* Ward Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Academic Standing</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{ward?.cgpa} CGPA</div>
            <p className="text-xs text-slate-500 mt-0.5">Sem {ward?.semester} • {ward?.deptCode}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Faculty Mentor</span>
            <div className="text-sm font-extrabold text-slate-900 mt-1">{ward?.mentorName}</div>
            <p className="text-xs text-blue-600 font-medium mt-0.5">{ward?.mentorPhone}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase">University Bus</span>
            <div className="text-sm font-extrabold text-slate-900 mt-1">Route #{ward?.busRoute}</div>
            <p className="text-xs text-slate-500 mt-0.5">Evening Departure: 04:45 PM</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. GUEST / VISITOR VIEW
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
          <Compass className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Sapthagiri NPS University Campus Navigator
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Welcome Visitor! Explore academic blocks, admissions, and campus amenities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onAskAI('Tell me about admissions at Sapthagiri NPS University')}
          className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all cursor-pointer"
        >
          <span className="font-bold text-xs text-slate-900 block">Admissions 2026</span>
          <span className="text-[11px] text-slate-500">Engineering, AI & Management programs</span>
        </button>

        <button
          onClick={() => onAskAI('Where is the campus cafeteria and library?')}
          className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all cursor-pointer"
        >
          <span className="font-bold text-xs text-slate-900 block">Campus Landmarks</span>
          <span className="text-[11px] text-slate-500">Central Library, Food Court, Auditorium</span>
        </button>

        <button
          onClick={() => onAskAI('How do I contact the university helpline?')}
          className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all cursor-pointer"
        >
          <span className="font-bold text-xs text-slate-900 block">Helpline & Info</span>
          <span className="text-[11px] text-slate-500">Campus security & administrative desk</span>
        </button>
      </div>
    </div>
  );
};
