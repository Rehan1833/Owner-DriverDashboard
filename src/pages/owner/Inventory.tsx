import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AlertCircle, PackageCheck, AlertOctagon, Edit2, Trash2, Plus } from 'lucide-react';
import { InventoryItem } from '../../types';

export const Inventory: React.FC = () => {
  const { inventory, createInventory, updateInventory, deleteInventory } = useOperations();
  const [filterType, setFilterType] = useState<'All' | 'Low Stock' | 'Out Of Stock'>('All');
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states
  const [form, setForm] = useState({
    itemName: '',
    category: 'Raw Materials',
    sku: '',
    quantity: 0,
    minimumQuantity: 0,
    warehouse: 'Pune Main',
    purchasePrice: 0,
    sellingPrice: 0,
    supplier: '',
    batchNumber: '',
    expiryDate: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minimumQuantity' || name === 'purchasePrice' || name === 'sellingPrice' 
        ? Number(value) 
        : value
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInventory(form);
    setCreateModalOpen(false);
    resetForm();
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setForm({
      itemName: item.itemName,
      category: item.category,
      sku: item.sku,
      quantity: item.quantity,
      minimumQuantity: item.minimumQuantity,
      warehouse: item.warehouse,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier,
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate || '',
      description: item.description || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      updateInventory(selectedItem.id, form);
    }
    setEditModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to remove this stock record?')) {
      deleteInventory(id);
    }
  };

  const resetForm = () => {
    setForm({
      itemName: '',
      category: 'Raw Materials',
      sku: '',
      quantity: 0,
      minimumQuantity: 0,
      warehouse: 'Pune Main',
      purchasePrice: 0,
      sellingPrice: 0,
      supplier: '',
      batchNumber: '',
      expiryDate: '',
      description: ''
    });
    setSelectedItem(null);
  };

  // Calculate stats
  const totalItemsVal = inventory.reduce((acc, curr) => acc + (curr.quantity * curr.sellingPrice), 0);
  const lowStockCount = inventory.filter(i => i.quantity <= i.minimumQuantity && i.quantity > 0).length;
  const outOfStockCount = inventory.filter(i => i.quantity === 0).length;

  const handleFilter = (data: InventoryItem[]) => {
    if (filterType === 'All') return data;
    if (filterType === 'Low Stock') return data.filter(i => i.quantity <= i.minimumQuantity && i.quantity > 0);
    if (filterType === 'Out Of Stock') return data.filter(i => i.quantity === 0);
    return data;
  };

  const columns = [
    {
      header: 'Material Name',
      accessor: (row: InventoryItem) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">{row.itemName}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{row.sku}</span>
        </div>
      ),
      sortKey: 'itemName' as keyof InventoryItem,
    },
    {
      header: 'Category',
      accessor: 'category' as keyof InventoryItem,
      sortKey: 'category' as keyof InventoryItem,
    },
    {
      header: 'Stock Levels',
      accessor: (row: InventoryItem) => (
        <span className="font-semibold text-slate-700">
          {row.quantity.toLocaleString()} / {row.minimumQuantity.toLocaleString()} Min
        </span>
      ),
      sortKey: 'quantity' as keyof InventoryItem,
    },
    {
      header: 'Prices (Buy/Sell)',
      accessor: (row: InventoryItem) => `INR ${row.purchasePrice} / INR ${row.sellingPrice}`,
    },
    {
      header: 'Location',
      accessor: 'warehouse' as keyof InventoryItem,
      sortKey: 'warehouse' as keyof InventoryItem,
    },
    {
      header: 'Supplier',
      accessor: 'supplier' as keyof InventoryItem,
    },
    {
      header: 'Safety Status',
      accessor: (row: InventoryItem) => {
        const isOut = row.quantity === 0;
        const isLow = row.quantity <= row.minimumQuantity;
        return (
          <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row: InventoryItem) => (
        <div className="flex items-center gap-2">
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
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Inventory & Stock Console</h2>
          <p className="text-xs text-slate-405 dark:text-slate-500 mt-1">Directly execute full CRUD operations over manufacturing logs.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 border border-gray-100 dark:border-slate-800 rounded-xl">
            {(['All', 'Low Stock', 'Out Of Stock'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === type ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <Button
            onClick={() => { resetForm(); setCreateModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer border border-transparent"
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Total Stock Valuation</span>
            <h4 className="text-lg font-bold text-slate-808 dark:text-white">INR {totalItemsVal.toLocaleString()}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Calculated using selling values</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Low Stock Alerts</span>
            <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400">{lowStockCount} SKUs</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Need safety replenishment</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Out of Stock Count</span>
            <h4 className="text-lg font-bold text-red-600 dark:text-red-400">{outOfStockCount} SKUs</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Line halts active</p>
          </div>
        </div>
      </div>

      {/* Main CRUD Table */}
      <Table
        data={inventory}
        columns={columns}
        searchKey="itemName"
        searchPlaceholder="Search inventory by name..."
        filterComponent={handleFilter}
        exportFileName="inventory-crud-ledger"
      />

      {/* Inventory Item Form Drawer / Modal template */}
      {[
        { isOpen: createModalOpen, setOpen: setCreateModalOpen, title: 'Add New Inventory Item', submit: handleCreateSubmit },
        { isOpen: editModalOpen, setOpen: setEditModalOpen, title: 'Edit Inventory Item', submit: handleEditSubmit }
      ].map((modal, index) => (
        <Modal key={index} isOpen={modal.isOpen} onClose={() => modal.setOpen(false)} title={modal.title} size="lg">
          <form onSubmit={modal.submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  name="itemName"
                  placeholder="e.g. Steel Sheets"
                  value={form.itemName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">SKU Code</label>
                <input
                  type="text"
                  required
                  name="sku"
                  placeholder="e.g. STL-CR-001"
                  value={form.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-805 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option>Raw Materials</option>
                  <option>Assemblies</option>
                  <option>Electronics</option>
                  <option>Packaging</option>
                  <option>Lubricants</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Quantity</label>
                <input
                  type="number"
                  required
                  name="quantity"
                  value={form.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Min Quantity</label>
                <input
                  type="number"
                  required
                  name="minimumQuantity"
                  value={form.minimumQuantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Purchase Price (INR)</label>
                <input
                  type="number"
                  required
                  name="purchasePrice"
                  value={form.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Selling Price (INR)</label>
                <input
                  type="number"
                  required
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Supplier</label>
                <input
                  type="text"
                  required
                  name="supplier"
                  placeholder="Supplier Name"
                  value={form.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Batch Number</label>
                <input
                  type="text"
                  name="batchNumber"
                  placeholder="e.g. BT-99"
                  value={form.batchNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Warehouse</label>
                <input
                  type="text"
                  required
                  name="warehouse"
                  placeholder="Warehouse Location"
                  value={form.warehouse}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Material Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
              <Button type="button" variant="outline" onClick={() => modal.setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Material
              </Button>
            </div>
          </form>
        </Modal>
      ))}
    </div>
  );
};
