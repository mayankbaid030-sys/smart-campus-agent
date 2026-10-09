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
import roomsData from '@/data/rooms.json';
import {
  Radio,
  MapPin,
  Wifi,
  Search,
  Shuffle,
  Clock,
  BookOpen,
  Building,
  CheckCircle2,
  AlertCircle,
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
    // Load initial live faculty state
    setFacultyList(getLiveFaculty());

    // Subscribe to real-time event updates
    const unsubscribe = campusEventBus.on<Faculty[]>(
      CAMPUS_EVENTS.FACULTY_LOCATION_UPDATED,
      (updatedList) => {
        setFacultyList([...updatedList]);
      }
    );

    return () => {
      unsubscribe();
    };
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

  // Filter faculty by search and department
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Class':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In Meeting':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'In Research Lab':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
      {/* Radar Section Header & Simulator Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Live Campus Faculty Radar
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Wi-Fi AP Triangulation
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                In-app real-time simulator tracking faculty movements across campus blocks
              </p>
            </div>
          </div>
        </div>

        {/* Action: Trigger Simulation */}
        <button
          onClick={handleSimulateMovement}
          disabled={isSimulating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Shuffle className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>Simulate Movement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search faculty name, cabin, classroom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'CSE', 'AIML', 'ISE', 'ECE'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="bg-slate-50/70 border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header: Name, Designation & Live Status Badge */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm hover:text-blue-700 transition-colors">
                    {faculty.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {faculty.designation} • <span className="font-bold text-blue-700">{faculty.deptCode}</span>
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 flex items-center gap-1 ${getStatusBadge(
                    faculty.status
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  {faculty.status}
                </span>
              </div>

              {/* Live Location Box */}
              <div className="my-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <strong>{faculty.currentLocation.roomName}</strong>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {faculty.currentLocation.lastUpdated}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    {faculty.currentLocation.building} ({faculty.currentLocation.floor})
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    {faculty.currentLocation.wifiAp}
                  </span>
                </div>
              </div>

              {/* Office Details */}
              <div className="space-y-1 text-xs text-slate-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Office Hours: <strong className="text-slate-800">{faculty.officeHours}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Permanent Cabin: <span className="font-medium text-slate-800">{faculty.cabin}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quick Status Overrider & Voice Query */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Simulate:</span>
                <select
                  value={faculty.status}
                  onChange={(e) =>
                    handleManualStatusChange(faculty.id, e.target.value as Faculty['status'])
                  }
                  className="text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="In Cabin">In Cabin</option>
                  <option value="In Class">In Class</option>
                  <option value="In Meeting">In Meeting</option>
                  <option value="In Research Lab">In Research Lab</option>
                </select>
              </div>

              <button
                onClick={() => onAskAboutFaculty(`Where is ${faculty.name} right now?`)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
