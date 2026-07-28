import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { soundPlayer } from '../../utils/audio';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  UserCheck,
  UserX,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Break' | 'Off Duty' | 'Absent';
  avatar: string;
  branch: string;
  performanceScore: number;
}

const INITIAL_WORKERS: Worker[] = [
  { id: 'w-1', name: 'Rajesh Kumar', role: 'Senior Driver', email: 'rajesh.kumar@smartops.com', phone: '+91 9123456789', status: 'Active', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rajesh&backgroundColor=0284C7', branch: 'Pune HQ', performanceScore: 98 },
  { id: 'w-2', name: 'Arjun Singh', role: 'Driver', email: 'arjun.singh@smartops.com', phone: '+91 9812345670', status: 'On Break', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Arjun&backgroundColor=F59E0B', branch: 'Pune HQ', performanceScore: 90 },
  { id: 'w-3', name: 'Amit Patel', role: 'Warehouse Supervisor', email: 'amit.patel@smartops.com', phone: '+91 9543210987', status: 'Active', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Amit&backgroundColor=10B981', branch: 'Mumbai Hub', performanceScore: 95 },
  { id: 'w-4', name: 'Vikram Singh', role: 'Fleet Manager', email: 'vikram.singh@smartops.com', phone: '+91 9776543210', status: 'Off Duty', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram&backgroundColor=8B5CF6', branch: 'Pune HQ', performanceScore: 97 },
  { id: 'w-5', name: 'Sanjay Dutt', role: 'Technician', email: 'sanjay.dutt@smartops.com', phone: '+91 9332115500', status: 'Absent', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sanjay&backgroundColor=EF4444', branch: 'Bangalore Whse', performanceScore: 84 },
  { id: 'w-6', name: 'Sunita Sharma', role: 'Inventory Clerk', email: 'sunita.sharma@smartops.com', phone: '+91 9223344556', status: 'Active', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sunita&backgroundColor=EC4899', branch: 'Mumbai Hub', performanceScore: 94 }
];

export const Workers: React.FC = () => {
  const { triggerNotification, addActivity } = useOperations();
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  // New Worker Form State
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('Driver');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerBranch, setNewWorkerBranch] = useState('Pune HQ');

  // Message Form State
  const [messageText, setMessageText] = useState('');

  // Audio Play Trigger
  const playSound = (severity: 'Success' | 'Warning' | 'Error' | 'Info') => {
    const savedSettings = localStorage.getItem('smartops_owner_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { soundEnabled: true, soundVolume: 0.5 };
    if (settings.soundEnabled) {
      soundPlayer.play(severity, settings.soundVolume);
    }
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName || !newWorkerEmail) return;

    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      name: newWorkerName,
      role: newWorkerRole,
      email: newWorkerEmail,
      phone: newWorkerPhone || '+91 9000000000',
      status: 'Off Duty',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newWorkerName)}&backgroundColor=006A6A`,
      branch: newWorkerBranch,
      performanceScore: 100
    };

    setWorkers(prev => [newWorker, ...prev]);
    setAddModalOpen(false);
    playSound('Success');
    triggerNotification('System Alert', 'Roster Updated', `Registered staff member ${newWorkerName} under branch: ${newWorkerBranch}`, 'Info');
    addActivity('Staff Registered', `Added new team member: ${newWorkerName} (${newWorkerRole})`, 'attendance');

    // Reset Form
    setNewWorkerName('');
    setNewWorkerEmail('');
    setNewWorkerPhone('');
  };

  const handleDeleteWorker = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the active personnel registry?`)) {
      setWorkers(prev => prev.filter(w => w.id !== id));
      playSound('Error');
      triggerNotification('System Alert', 'Roster Removed', `Revoked access credentials for staff: ${name}`, 'Warning');
      addActivity('Staff Suspended', `Removed team member: ${name}`, 'attendance');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedWorker) return;

    playSound('Success');
    triggerNotification(
      'System Alert',
      'SMS Dispatch Initiated',
      `Internal dispatch notification delivered to ${selectedWorker.name}: "${messageText.slice(0, 30)}..."`,
      'Info'
    );
    setMessageText('');
    setMessageModalOpen(false);
    alert(`Message dispatched to ${selectedWorker.name} successfully.`);
  };

  // Filter Logic
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) || worker.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || worker.role.includes(filterRole);
    const matchesStatus = filterStatus === 'All' || worker.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-white tracking-tight flex items-center gap-2 leading-none">
            <Users className="h-7 w-7 text-[#006A6A] dark:text-[#14B8A6]" />
            Personnel Directory
          </h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">
            Track employee status registers, branch classifications, performance ratings, and dispatch alert messages.
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          variant="primary"
          className="w-full sm:w-auto text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-teal-900/10"
        >
          <Plus className="h-4 w-4" /> Add Team Member
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-[20px] p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="search-icon-glow absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="navbar-search-input w-full pl-9 pr-3 h-9 text-xs border border-[#E5E7EB] dark:border-[#334155] rounded-full bg-slate-50/50 dark:bg-slate-800/40 text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#006A6A] focus:border-[#006A6A] transition-all font-medium"
          />
        </div>

        {/* Roles select */}
        <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="w-full md:w-44 px-4 h-11 text-xs border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-[#F8F9FF] dark:bg-[#0F172A] text-slate-700 focus:outline-none cursor-pointer font-semibold"
          >
            <option value="All">All Roles</option>
            <option value="Driver">Drivers</option>
            <option value="Supervisor">Supervisors</option>
            <option value="Manager">Managers</option>
            <option value="Clerk">Clerks / Techs</option>
          </select>
        </div>

        {/* Status select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full md:w-44 px-4 h-11 text-xs border border-[#E5EEFF] dark:border-[#334155] rounded-xl bg-[#F8F9FF] dark:bg-[#0F172A] text-slate-700 focus:outline-none cursor-pointer font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">?? Active (On Duty)</option>
            <option value="On Break">?? On Break</option>
            <option value="Off Duty">? Off Duty</option>
            <option value="Absent">?? Absent</option>
          </select>
        </div>
      </div>

      {/* Grid of Workers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map(worker => (
            <div
              key={worker.id}
              className="bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 text-left flex flex-col justify-between"
            >
              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-12 h-12 rounded-xl border border-slate-50 dark:border-slate-800 bg-[#F8F9FF] shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <h4 className="text-[15px] font-semibold text-[#0B1C30] dark:text-white whitespace-normal break-words leading-tight">{worker.name}</h4>
                    <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] font-bold uppercase mt-1 tracking-wider">{worker.role}</p>
                  </div>
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${
                    worker.status === 'Active' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/15' :
                    worker.status === 'On Break' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/15' :
                    worker.status === 'Absent' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/15' :
                    'bg-slate-100 text-[#6D7A79] border-slate-200 dark:bg-slate-800 dark:text-[#94A3B8]'
                  }`}>
                    {worker.status}
                  </span>
                </div>

                <div className="space-y-2.5 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 pt-4 text-[13px] text-[#6D7A79] dark:text-[#94A3B8] font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="whitespace-normal break-words leading-tight font-semibold">{worker.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-semibold">{worker.phone}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold border-t border-dashed border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800/80 pt-3 mt-3">
                    <span className="text-slate-400 uppercase tracking-wider">Location Hub</span>
                    <span className="text-[#0B1C30] dark:text-[#CBD5E1]">{worker.branch}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">KPI Rating</span>
                    <span className="text-[#006A6A] dark:text-[#14B8A6]">{worker.performanceScore}% Score</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedWorker(worker);
                    setMessageModalOpen(true);
                  }}
                  className="py-2 px-3 border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] hover:bg-[#F8F9FF] dark:bg-[#0F172A] dark:hover:bg-slate-800 text-slate-700 dark:text-[#CBD5E1] font-semibold rounded-xl text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Send className="h-3 w-3 text-[#006A6A]" /> Text Alert
                </button>
                <button
                  onClick={() => {
                    alert(`Details Editor for ${worker.name} requested!`);
                  }}
                  className="py-2 px-3 border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] hover:bg-[#F8F9FF] dark:bg-[#0F172A] dark:hover:bg-slate-800 text-slate-700 dark:text-[#CBD5E1] font-semibold rounded-xl text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Edit2 className="h-3 w-3 text-[#6D7A79]" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteWorker(worker.id, worker.name)}
                  className="py-2 px-3 bg-[#EF4444]/10 hover:bg-[#EF4444]/15 text-[#EF4444] font-semibold rounded-xl text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-[#EF4444]/20 shadow-sm"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-[#1E293B] border border-[#E5EEFF] dark:border-[#334155] rounded-[20px] p-16 text-center shadow-sm">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3.5" />
            <h4 className="text-[15px] font-bold text-[#0B1C30] dark:text-[#F8FAFC]">No personnel found</h4>
            <p className="text-[13px] text-[#6D7A79] dark:text-[#6D7A79] mt-1 font-medium">Try modifying your query filter tags or register a new staff member.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD TEAM MEMBER */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register Team Member">
        <form onSubmit={handleAddWorker} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Staff Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Harpreet Singh"
              value={newWorkerName}
              onChange={e => setNewWorkerName(e.target.value)}
              className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Assigned Role</label>
              <select
                value={newWorkerRole}
                onChange={e => setNewWorkerRole(e.target.value)}
                className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
              >
                <option>Driver</option>
                <option>Senior Driver</option>
                <option>Warehouse Supervisor</option>
                <option>Fleet Manager</option>
                <option>Technician</option>
                <option>Inventory Clerk</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Location HQ Hub</label>
              <select
                value={newWorkerBranch}
                onChange={e => setNewWorkerBranch(e.target.value)}
                className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
              >
                <option>Pune HQ</option>
                <option>Mumbai Hub</option>
                <option>Bangalore Whse</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@smartops.com"
                value={newWorkerEmail}
                onChange={e => setNewWorkerEmail(e.target.value)}
                className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Mobile Number</label>
              <input
                type="text"
                placeholder="+91 XXXXX XXXXX"
                value={newWorkerPhone}
                onChange={e => setNewWorkerPhone(e.target.value)}
                className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800 mt-4">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: DISPATCH SMS TEXT */}
      <Modal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} title={`Dispatch SMS Alert: ${selectedWorker?.name}`}>
        <form onSubmit={handleSendMessage} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">SMS Text Notification Details</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Please proceed to warehouse gate 3 for physical inventory inspection..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
              <Send className="h-4 w-4" /> Send SMS
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


