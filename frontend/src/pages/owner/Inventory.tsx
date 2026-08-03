import React, { useState } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AlertCircle, PackageCheck, AlertOctagon, Edit2, Trash2, Plus, FileSpreadsheet } from 'lucide-react';
import { InventoryItem } from '../../types';
import { downloadInventoryExcel } from '../../utils/downloadInventoryReport';

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
    description: '',
    barcode: '',
    subCategory: '',
    brand: '',
    unit: 'Pieces',
    storageLocation: 'Warehouse Floor',
    reservedStock: 0,
    maximumStockLevel: 1000,
    reorderLevel: 10,
    manufacturingDate: '',
    lastRestockedDate: '',
    status: 'Active'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minimumQuantity' || name === 'purchasePrice' || name === 'sellingPrice' || name === 'reservedStock' || name === 'maximumStockLevel' || name === 'reorderLevel'
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
      description: item.description || '',
      barcode: item.barcode || '',
      subCategory: item.subCategory || '',
      brand: item.brand || '',
      unit: item.unit || 'Pieces',
      storageLocation: item.storageLocation || 'Warehouse Floor',
      reservedStock: item.reservedStock || 0,
      maximumStockLevel: item.maximumStockLevel || 1000,
      reorderLevel: item.reorderLevel || 10,
      manufacturingDate: item.manufacturingDate || '',
      lastRestockedDate: item.lastRestockedDate || '',
      status: item.status || 'Active'
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
      description: '',
      barcode: '',
      subCategory: '',
      brand: '',
      unit: 'Pieces',
      storageLocation: 'Warehouse Floor',
      reservedStock: 0,
      maximumStockLevel: 1000,
      reorderLevel: 10,
      manufacturingDate: '',
      lastRestockedDate: '',
      status: 'Active'
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
        <div className="text-left">
          <span className="font-bold text-[#0B1C30] text-sm block">{row.itemName}</span>
          <span className="text-[11px] text-[#6D7A79] font-mono mt-0.5 block">{row.sku}</span>
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
        <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">
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
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[#6D7A79] hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-slate-400 hover:text-[#EF4444] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-slate-100 tracking-tight leading-none">Inventory & Stock Console</h2>
          <p className="text-[13px] text-[#6D7A79] dark:text-[#94A3B8] mt-1.5 font-medium">Directly execute full CRUD operations over manufacturing logs.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-[#F8F9FF] dark:bg-[#0F172A] p-1 border border-[#E5EEFF]/80 dark:border-[#334155]/60 rounded-xl">
            {(['All', 'Low Stock', 'Out Of Stock'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === type 
                    ? 'bg-[#006A6A] text-white shadow-sm' 
                    : 'text-[#6D7A79] hover:text-[#545F73] dark:hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <Button
            onClick={() => downloadInventoryExcel(inventory)}
            variant="outline"
            className="text-xs py-2 rounded-xl flex items-center gap-1.5 border border-[#E5EEFF] dark:border-[#334155] text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#107C41]" /> Export Enterprise Excel
          </Button>
          <Button
            onClick={() => { resetForm(); setCreateModalOpen(true); }}
            variant="primary"
            className="text-xs py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-900/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-[#006A6A]/10 text-[#006A6A] dark:text-[#14B8A6]">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">Total Stock Valuation</span>
            <h4 className="text-[26px] font-extrabold text-[#0B1C30] dark:text-white leading-tight">INR {totalItemsVal.toLocaleString()}</h4>
            <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] mt-0.5 font-medium">Calculated using selling values</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">Low Stock Alerts</span>
            <h4 className="text-[26px] font-extrabold text-[#F59E0B] leading-tight">{lowStockCount} SKUs</h4>
            <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] mt-0.5 font-medium">Need safety replenishment</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E5EEFF] dark:border-[#334155] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444]">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-[#6D7A79] dark:text-[#6D7A79] uppercase tracking-tight block">Out of Stock Count</span>
            <h4 className="text-[26px] font-extrabold text-[#EF4444] leading-tight">{outOfStockCount} SKUs</h4>
            <p className="text-[11px] text-[#6D7A79] dark:text-[#6D7A79] mt-0.5 font-medium">Line halts active</p>
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
          <form onSubmit={modal.submit} className="space-y-5 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  name="itemName"
                  placeholder="e.g. Steel Sheets"
                  value={form.itemName}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">SKU Code</label>
                <input
                  type="text"
                  required
                  name="sku"
                  placeholder="e.g. STL-CR-001"
                  value={form.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option>Raw Materials</option>
                  <option>Assemblies</option>
                  <option>Electronics</option>
                  <option>Packaging</option>
                  <option>Lubricants</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Sub Category</label>
                <input
                  type="text"
                  name="subCategory"
                  placeholder="e.g. Flat Rolled"
                  value={form.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  placeholder="Barcode Number"
                  value={form.barcode}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Brand</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Tata Steel"
                  value={form.brand}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Unit</label>
                <input
                  type="text"
                  name="unit"
                  placeholder="e.g. Kg, Pieces, Litre"
                  value={form.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Current Stock Qty</label>
                <input
                  type="number"
                  required
                  name="quantity"
                  value={form.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Reserved Stock</label>
                <input
                  type="number"
                  name="reservedStock"
                  value={form.reservedStock}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Min Stock Level</label>
                <input
                  type="number"
                  required
                  name="minimumQuantity"
                  value={form.minimumQuantity}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Max Stock Level</label>
                <input
                  type="number"
                  name="maximumStockLevel"
                  value={form.maximumStockLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Reorder Level</label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={form.reorderLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Storage Location</label>
                <input
                  type="text"
                  name="storageLocation"
                  placeholder="e.g. Row A, Shelf 2"
                  value={form.storageLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Purchase Price (INR)</label>
                <input
                  type="number"
                  required
                  name="purchasePrice"
                  value={form.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Selling Price (INR)</label>
                <input
                  type="number"
                  required
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Supplier</label>
                <input
                  type="text"
                  required
                  name="supplier"
                  placeholder="Supplier Name"
                  value={form.supplier}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Batch Number</label>
                <input
                  type="text"
                  name="batchNumber"
                  placeholder="e.g. BT-99"
                  value={form.batchNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Warehouse</label>
                <input
                  type="text"
                  required
                  name="warehouse"
                  placeholder="Warehouse Location"
                  value={form.warehouse}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Manufacturing Date</label>
                <input
                  type="date"
                  name="manufacturingDate"
                  value={form.manufacturingDate}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Last Restocked Date</label>
                <input
                  type="date"
                  name="lastRestockedDate"
                  value={form.lastRestockedDate}
                  onChange={handleInputChange}
                  className="w-full px-4 h-12 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#545F73] dark:text-[#CBD5E1] uppercase">Remarks / Description</label>
              <textarea
                name="description"
                rows={2}
                value={form.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-sm border border-[#E5EEFF] dark:border-[#334155] bg-[#F8F9FF] focus:bg-white focus:ring-2 focus:ring-[#006A6A]/20 focus:border-[#006A6A] rounded-xl focus:outline-none transition-all shadow-sm font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EEFF] dark:border-[#334155] dark:border-slate-800">
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


