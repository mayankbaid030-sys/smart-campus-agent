'use client';

import React, { useState, useEffect } from 'react';
import { Faculty } from '@/types';
import {
  getLiveFaculty,
  updateFacultyStatus,
  simulateRandomMovement,
  campusEventBus,
  CAMPUS_EVENTS,
} from '@/lib/events';
import {
  Radio,
  MapPin,
  Wifi,
  Search,
  Shuffle,
  Clock,
  BookOpen,
  Building,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface FacultyRadarProps {
  onAskAboutFaculty: (facultyName: string) => void;
}

export const FacultyRadar: React.FC<FacultyRadarProps> = ({ onAskAboutFaculty }) => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setFacultyList(getLiveFaculty());

    const unsubscribe = campusEventBus.on<Faculty[]>(
      CAMPUS_EVENTS.FACULTY_LOCATION_UPDATED,
      (updatedList) => {
        setFacultyList([...updatedList]);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSimulateMovement = () => {
    setIsSimulating(true);
    simulateRandomMovement();
    setTimeout(() => setIsSimulating(false), 500);
  };

  const handleManualStatusChange = (
    facultyId: string,
    newStatus: Faculty['status'],
    roomId?: string
  ) => {
    updateFacultyStatus(facultyId, newStatus, roomId);
  };

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cabin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.currentLocation.roomName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || f.deptCode === selectedDept;
    return matchesSearch && matchesDept;
  });

  const getStatusBadge = (status: Faculty['status']) => {
    switch (status) {
      case 'In Cabin':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'In Class':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'In Meeting':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'In Research Lab':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 space-y-6">
      {/* Header & Simulator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-violet-600/30 to-pink-600/30 border border-pink-500/30 rounded-2xl text-pink-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-heading">
                Live Faculty Radar
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Wi-Fi AP Triangulation
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                In-app real-time simulator tracking professors across campus blocks
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSimulateMovement}
          disabled={isSimulating}
          className="btn-gradient px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Shuffle className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>Simulate Radar Ping</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search faculty name, cabin, classroom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'CSE', 'AIML', 'ISE', 'ECE'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedDept === dept
                  ? 'btn-gradient shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaculty.map((faculty) => (
          <div
            key={faculty.id}
            className="glass-card border border-white/10 hover:border-pink-500/40 rounded-3xl p-5 shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <h3 className="font-extrabold text-white text-sm group-hover:text-pink-300 transition-colors font-heading">
                    {faculty.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {faculty.designation} • <span className="font-bold text-violet-400">{faculty.deptCode}</span>
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 flex items-center gap-1 ${getStatusBadge(
                    faculty.status
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  {faculty.status}
                </span>
              </div>

              {/* Live Location Box */}
              <div className="my-3 p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <strong>{faculty.currentLocation.roomName}</strong>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {faculty.currentLocation.lastUpdated}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    {faculty.currentLocation.building} ({faculty.currentLocation.floor})
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded text-pink-300 border border-white/5">
                    <Wifi className="w-3 h-3 text-pink-400" />
                    {faculty.currentLocation.wifiAp}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Office Hours: <strong className="text-white">{faculty.officeHours}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Permanent Cabin: <span className="text-slate-200">{faculty.cabin}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Simulate:</span>
                <select
                  value={faculty.status}
                  onChange={(e) =>
                    handleManualStatusChange(faculty.id, e.target.value as Faculty['status'])
                  }
                  className="text-[11px] bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 font-semibold text-slate-200 outline-none cursor-pointer"
                >
                  <option value="In Cabin" className="bg-[#131226]">In Cabin</option>
                  <option value="In Class" className="bg-[#131226]">In Class</option>
                  <option value="In Meeting" className="bg-[#131226]">In Meeting</option>
                  <option value="In Research Lab" className="bg-[#131226]">In Research Lab</option>
                </select>
              </div>

              <button
                onClick={() => onAskAboutFaculty(`Where is ${faculty.name} right now?`)}
                className="text-xs font-bold text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/20 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Ask AI</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
