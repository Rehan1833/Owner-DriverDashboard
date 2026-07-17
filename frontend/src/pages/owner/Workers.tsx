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
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newWorkerName)}`,
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-5 gap-4 text-left">
        <div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary dark:text-blue-500" />
            Personnel Directory
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
            Track employee status registers, branch classifications, performance ratings, and dispatch alert messages.
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="w-full sm:w-auto text-xs font-bold py-2 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Add Team Member
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-205 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Roles select */}
        <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="w-full md:w-40 px-3 py-1.5 text-xs border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-250 cursor-pointer"
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
            className="w-full md:w-40 px-3 py-1.5 text-xs border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-250 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">🟢 Active (On Duty)</option>
            <option value="On Break">🟡 On Break</option>
            <option value="Off Duty">⚪ Off Duty</option>
            <option value="Absent">🔴 Absent</option>
          </select>
        </div>
      </div>

      {/* Grid of Workers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map(worker => (
            <div
              key={worker.id}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-200 text-left flex flex-col justify-between"
            >
              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-12 h-12 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{worker.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">{worker.role}</p>
                  </div>
                  <span className={`ml-auto px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                    worker.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                    worker.status === 'On Break' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                    worker.status === 'Absent' ? 'bg-red-50 text-red-500 dark:bg-red-950/20' :
                    'bg-slate-100 text-slate-550 dark:bg-slate-800'
                  }`}>
                    {worker.status}
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-50 dark:border-slate-850 pt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{worker.phone}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-2.5 mt-2">
                    <span className="text-slate-400 uppercase">Location Hub</span>
                    <span className="text-slate-800 dark:text-slate-350">{worker.branch}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">KPI Rating</span>
                    <span className="text-primary dark:text-blue-450">{worker.performanceScore}% Score</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-3 border-t border-slate-50 dark:border-slate-850">
                <button
                  onClick={() => {
                    setSelectedWorker(worker);
                    setMessageModalOpen(true);
                  }}
                  className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-850 text-slate-550 dark:text-slate-300 font-semibold rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-transparent"
                >
                  <Send className="h-3 w-3" /> Text Alert
                </button>
                <button
                  onClick={() => {
                    alert(`Details Editor for ${worker.name} requested!`);
                  }}
                  className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-850 text-slate-550 dark:text-slate-300 font-semibold rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-transparent"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteWorker(worker.id, worker.name)}
                  className="py-1.5 px-2.5 bg-red-50/20 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-semibold rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-transparent"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-750 dark:text-slate-200">No personnel found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Try modifying your query filter tags or register a new staff member.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD TEAM MEMBER */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register Team Member">
        <form onSubmit={handleAddWorker} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Staff Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Harpreet Singh"
              value={newWorkerName}
              onChange={e => setNewWorkerName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Assigned Role</label>
              <select
                value={newWorkerRole}
                onChange={e => setNewWorkerRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option>Driver</option>
                <option>Senior Driver</option>
                <option>Warehouse Supervisor</option>
                <option>Fleet Manager</option>
                <option>Technician</option>
                <option>Inventory Clerk</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Location HQ Hub</label>
              <select
                value={newWorkerBranch}
                onChange={e => setNewWorkerBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option>Pune HQ</option>
                <option>Mumbai Hub</option>
                <option>Bangalore Whse</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@smartops.com"
                value={newWorkerEmail}
                onChange={e => setNewWorkerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wide">Mobile Number</label>
              <input
                type="text"
                placeholder="+91 XXXXX XXXXX"
                value={newWorkerPhone}
                onChange={e => setNewWorkerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800 mt-4">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary/95 text-white">
              Register Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: DISPATCH SMS TEXT */}
      <Modal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} title={`Dispatch SMS Alert: ${selectedWorker?.name}`}>
        <form onSubmit={handleSendMessage} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">SMS Text Notification Details</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Please proceed to warehouse gate 3 for physical inventory inspection..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5">
              <Send className="h-3 w-3" /> Send SMS
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
