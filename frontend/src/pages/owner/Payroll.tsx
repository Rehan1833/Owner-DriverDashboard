import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { OperationsChart } from '../../components/charts/Charts';
import { CreditCard, Landmark, Clock, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { PayrollRecord } from '../../types';

export const Payroll: React.FC = () => {
  const { payroll, createSalary, updateSalary, deleteSalary } = useOperations();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  // Form state
  const [form, setForm] = useState({
    employee: '',
    basicSalary: 0,
    overtime: 0,
    bonus: 0,
    allowance: 0,
    deduction: 0,
    tax: 0,
    paymentStatus: 'Pending' as PayrollRecord['paymentStatus']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'employee' || name === 'paymentStatus' ? value : Number(value)
    }));
  };

  // Calculate Net payout value helper
  const calculateFinalSalary = (basic: number, ot: number, bon: number, allow: number, ded: number, tx: number) => {
    return basic + ot + bon + allow - ded - tx;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVal = calculateFinalSalary(
      form.basicSalary,
      form.overtime,
      form.bonus,
      form.allowance,
      form.deduction,
      form.tax
    );
    createSalary({
      ...form,
      finalSalary: finalVal,
      paymentDate: form.paymentStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined
    });
    setCreateModalOpen(false);
    resetForm();
  };

  const handleEditClick = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setForm({
      employee: record.employee,
      basicSalary: record.basicSalary,
      overtime: record.overtime,
      bonus: record.bonus,
      allowance: record.allowance,
      deduction: record.deduction,
      tax: record.tax,
      paymentStatus: record.paymentStatus
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      const finalVal = calculateFinalSalary(
        form.basicSalary,
        form.overtime,
        form.bonus,
        form.allowance,
        form.deduction,
        form.tax
      );
      updateSalary(selectedRecord.id, {
        ...form,
        finalSalary: finalVal,
        paymentDate: form.paymentStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined
      });
    }
    setEditModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to remove this payroll record?')) {
      deleteSalary(id);
    }
  };

  const handleQuickRelease = (record: PayrollRecord) => {
    updateSalary(record.id, { paymentStatus: 'Paid' });
  };

  const resetForm = () => {
    setForm({
      employee: '',
      basicSalary: 0,
      overtime: 0,
      bonus: 0,
      allowance: 0,
      deduction: 0,
      tax: 0,
      paymentStatus: 'Pending'
    });
    setSelectedRecord(null);
  };

  // Calculations
  const totalPayout = payroll.reduce((acc, curr) => acc + curr.finalSalary, 0);
  const pendingCount = payroll.filter(p => p.paymentStatus === 'Pending').length;
  const approvedCount = payroll.filter(p => p.paymentStatus === 'Paid').length;

  const payrollTrendData = [
    { month: 'Jan', payroll: 145000 },
    { month: 'Feb', payroll: 148000 },
    { month: 'Mar', payroll: 151000 },
    { month: 'Apr', payroll: 153000 },
    { month: 'May', payroll: 159000 },
    { month: 'Jun', payroll: totalPayout || 64200 },
  ];

  const columns = [
    {
      header: 'Employee Name',
      accessor: (row: PayrollRecord) => (
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.employee}&backgroundColor=2563EB`}
            alt=""
            className="w-8 h-8 rounded-full bg-slate-50 border border-gray-100"
          />
          <span className="font-bold text-slate-800 text-xs block">{row.employee}</span>
        </div>
      ),
      sortKey: 'employee' as keyof PayrollRecord,
    },
    {
      header: 'Basic Salary',
      accessor: (row: PayrollRecord) => `INR ${row.basicSalary.toLocaleString()}`,
      sortKey: 'basicSalary' as keyof PayrollRecord,
    },
    {
      header: 'OT + Allowance',
      accessor: (row: PayrollRecord) => `+INR ${(row.overtime + row.allowance).toLocaleString()}`,
    },
    {
      header: 'Tax + Deductions',
      accessor: (row: PayrollRecord) => `-INR ${(row.tax + row.deduction).toLocaleString()}`,
    },
    {
      header: 'Net Pay',
      accessor: (row: PayrollRecord) => (
        <span className="font-bold text-slate-800">INR {row.finalSalary.toLocaleString()}</span>
      ),
      sortKey: 'finalSalary' as keyof PayrollRecord,
    },
    {
      header: 'Payment Status',
      accessor: (row: PayrollRecord) => (
        <Badge variant={row.paymentStatus === 'Paid' ? 'success' : 'warning'}>
          {row.paymentStatus}
        </Badge>
      ),
      sortKey: 'paymentStatus' as keyof PayrollRecord,
    },
    {
      header: 'Actions',
      accessor: (row: PayrollRecord) => {
        const isPending = row.paymentStatus === 'Pending';
        return (
          <div className="flex items-center gap-2">
            {isPending ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickRelease(row)}
                className="text-[10px] py-1 px-2 border-emerald-250 text-emerald-600 hover:bg-emerald-50"
              >
                Release
              </Button>
            ) : (
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Paid
              </span>
            )}
            <button
              onClick={() => handleEditClick(row)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleDeleteClick(row.id)}
              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Salary & Payout Console</h2>
          <p className="text-xs text-slate-405 dark:text-slate-500 mt-1">Directly execute full CRUD operations over employee payroll slips.</p>
        </div>
        <Button
          onClick={() => { resetForm(); setCreateModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 self-start sm:self-auto cursor-pointer border border-transparent"
        >
          <Plus className="h-4 w-4" /> Calculate Pay
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Total Net Payroll</span>
            <h4 className="text-lg font-bold text-slate-808 dark:text-white">INR {totalPayout.toLocaleString()}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">Aggregated payouts</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase block">Pending Salary Releases</span>
            <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400">{pendingCount} Accounts</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-505 mt-0.5">Authorization required</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase block">Disbursed Payouts</span>
            <h4 className="text-lg font-bold text-emerald-605 dark:text-emerald-400">{approvedCount} Accounts</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-505 mt-0.5">Successfully sent</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Table
        data={payroll}
        columns={columns}
        searchKey="employee"
        searchPlaceholder="Search employee pay slips..."
        exportFileName="payroll-ledger"
      />

      {/* Historical Trend */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-6">Historical Monthly Payroll Trend</h3>
        <OperationsChart
          data={payrollTrendData}
          xKey="month"
          series={[{ key: 'payroll', name: 'Total Payout Value (INR)', color: 'var(--color-salary)', type: 'bar' }]}
          type="bar"
        />
      </div>

      {/* Forms */}
      {[
        { isOpen: createModalOpen, setOpen: setCreateModalOpen, title: 'Calculate Salary Slip', submit: handleCreateSubmit },
        { isOpen: editModalOpen, setOpen: setEditModalOpen, title: 'Modify Salary Slip', submit: handleEditSubmit }
      ].map((modal, idx) => (
        <Modal key={idx} isOpen={modal.isOpen} onClose={() => modal.setOpen(false)} title={modal.title} size="md">
          <form onSubmit={modal.submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Employee Name</label>
              <input
                type="text"
                required
                name="employee"
                placeholder="e.g. Rajesh Kumar"
                value={form.employee}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Basic Salary (INR)</label>
                <input
                  type="number"
                  required
                  name="basicSalary"
                  value={form.basicSalary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Overtime Allowance (INR)</label>
                <input
                  type="number"
                  name="overtime"
                  value={form.overtime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Bonuses (INR)</label>
                <input
                  type="number"
                  name="bonus"
                  value={form.bonus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Other Allowances (INR)</label>
                <input
                  type="number"
                  name="allowance"
                  value={form.allowance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Deductions (INR)</label>
                <input
                  type="number"
                  name="deduction"
                  value={form.deduction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Tax Withholdings (INR)</label>
                <input
                  type="number"
                  name="tax"
                  value={form.tax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Initial Payment Status</label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Pending">Pending Approval</option>
                <option value="Paid">Disbursed (Paid)</option>
              </select>
            </div>

            <div className="bg-slate-55 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Auto-Calculated Net Pay:</span>
              <span className="text-blue-600 dark:text-blue-400">
                INR {calculateFinalSalary(form.basicSalary, form.overtime, form.bonus, form.allowance, form.deduction, form.tax).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
              <Button type="button" variant="outline" onClick={() => modal.setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Pay Slip
              </Button>
            </div>
          </form>
        </Modal>
      ))}
    </div>
  );
};
