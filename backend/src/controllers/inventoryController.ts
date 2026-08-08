import { Response } from 'express';
import Inventory from '../models/Inventory';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      return res.status(403).json({ message: 'Access denied: Company context required.' });
    }
    const filter: any = { companyId };
    const items = await Inventory.find(filter).populate('productId').sort({ createdAt: -1 });

    const flatItems = items.map((inv: any) => {
      const prod = inv.productId || {};
      return {
        id: inv._id,
        _id: inv._id,
        productId: prod._id || '',
        itemName: prod.productName || inv.itemName || 'Unknown Item',
        category: prod.category || inv.category || 'Raw Materials',
        sku: prod.sku || inv.sku || '',
        unit: prod.unit || 'Pieces',
        warehouse: inv.warehouse,
        storageLocation: inv.storageLocation || '',
        supplier: inv.supplier || prod.supplier || '',
        purchasePrice: prod.purchasePrice !== undefined ? prod.purchasePrice : (inv.purchasePrice || 0),
        sellingPrice: prod.sellingPrice !== undefined ? prod.sellingPrice : (inv.sellingPrice || 0),
        quantity: inv.quantity !== undefined ? inv.quantity : 0,
        reservedStock: inv.reservedStock || 0,
        availableStock: (inv.quantity || 0) - (inv.reservedStock || 0),
        minimumQuantity: prod.minimumStockLevel !== undefined ? prod.minimumStockLevel : (inv.minimumQuantity || 0),
        maximumStockLevel: prod.maximumStockLevel || 1000,
        expiryDate: inv.expiryDate || '',
        manufacturingDate: inv.manufacturingDate || '',
        lastRestockedDate: inv.lastRestockedDate || '',
        description: inv.remarks || prod.description || inv.description || '',
        remarks: inv.remarks || '',
        status: prod.status || 'Active',
        companyId: inv.companyId,
        ownerId: inv.ownerId,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt
      };
    });

    res.json(flatItems);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createInventory = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      itemName,
      category,
      sku,
      barcode,
      subCategory,
      brand,
      unit,
      purchasePrice,
      sellingPrice,
      minimumQuantity,
      maximumStockLevel,
      reorderLevel,
      quantity,
      reservedStock,
      warehouse,
      storageLocation,
      supplier,
      batchNumber,
      expiryDate,
      manufacturingDate,
      lastRestockedDate,
      description,
      remarks,
      status
    } = req.body;

    const companyId = req.companyId;
    const ownerId = req.userId;

    // 1. Check if product with this SKU already exists
    let product = await Product.findOne({ sku, companyId }).session(session);
    if (!product) {
      product = new Product({
        productName: itemName,
        sku,
        barcode: barcode || sku,
        category,
        subCategory: subCategory || 'General',
        brand: brand || 'SmartOps',
        unit: unit || 'Pieces',
        purchasePrice: purchasePrice || 0,
        sellingPrice: sellingPrice || 0,
        minimumStockLevel: minimumQuantity || 0,
        maximumStockLevel: maximumStockLevel || 1000,
        reorderLevel: reorderLevel || 10,
        status: status || 'Active',
        companyId,
        ownerId,
        createdBy: req.userId
      });
      await product.save({ session });
    }

    // 2. Create the Inventory document
    const inventory = new Inventory({
      productId: product._id,
      quantity: quantity || 0,
      reservedStock: reservedStock || 0,
      warehouse: warehouse || 'Primary Warehouse',
      storageLocation: storageLocation || '',
      supplier: supplier || '',
      batchNumber: batchNumber || '',
      expiryDate: expiryDate || '',
      manufacturingDate: manufacturingDate || '',
      lastRestockedDate: lastRestockedDate || '',
      remarks: remarks || description || '',
      status: status || 'Active',
      companyId,
      ownerId,
      // Legacy fields
      itemName,
      category,
      sku,
      minimumQuantity: minimumQuantity || 0,
      purchasePrice: purchasePrice || 0,
      sellingPrice: sellingPrice || 0,
      description: remarks || description || ''
    });

    await inventory.save({ session });
    await session.commitTransaction();
    session.endSession();

    const resultObj = {
      id: inventory._id,
      _id: inventory._id,
      productId: product._id,
      itemName: product.productName,
      category: product.category,
      sku: product.sku,
      barcode: product.barcode,
      subCategory: product.subCategory,
      brand: product.brand,
      unit: product.unit,
      warehouse: inventory.warehouse,
      storageLocation: inventory.storageLocation,
      supplier: inventory.supplier,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      quantity: inventory.quantity,
      reservedStock: inventory.reservedStock,
      availableStock: (inventory.quantity || 0) - (inventory.reservedStock || 0),
      minimumQuantity: product.minimumStockLevel,
      maximumStockLevel: product.maximumStockLevel,
      reorderLevel: product.reorderLevel,
      batchNumber: inventory.batchNumber,
      expiryDate: inventory.expiryDate,
      manufacturingDate: inventory.manufacturingDate,
      lastRestockedDate: inventory.lastRestockedDate,
      description: inventory.remarks,
      remarks: inventory.remarks,
      status: product.status,
      companyId: inventory.companyId,
      ownerId: inventory.ownerId,
      createdAt: (inventory as any).createdAt,
      updatedAt: (inventory as any).updatedAt
    };

    res.status(201).json(resultObj);
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

export const updateInventory = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const filter: any = { _id: req.params.id };
    if (req.companyId) {
      filter.companyId = req.companyId;
    }

    const inventory = await Inventory.findOne(filter).session(session);
    if (!inventory) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    const {
      itemName,
      category,
      sku,
      barcode,
      subCategory,
      brand,
      unit,
      purchasePrice,
      sellingPrice,
      minimumQuantity,
      maximumStockLevel,
      reorderLevel,
      quantity,
      reservedStock,
      warehouse,
      storageLocation,
      supplier,
      batchNumber,
      expiryDate,
      manufacturingDate,
      lastRestockedDate,
      description,
      remarks,
      status
    } = req.body;

    if (inventory.productId) {
      const productUpdate: any = {};
      if (itemName !== undefined) productUpdate.productName = itemName;
      if (category !== undefined) productUpdate.category = category;
      if (sku !== undefined) productUpdate.sku = sku;
      if (barcode !== undefined) productUpdate.barcode = barcode;
      if (subCategory !== undefined) productUpdate.subCategory = subCategory;
      if (brand !== undefined) productUpdate.brand = brand;
      if (unit !== undefined) productUpdate.unit = unit;
      if (purchasePrice !== undefined) productUpdate.purchasePrice = purchasePrice;
      if (sellingPrice !== undefined) productUpdate.sellingPrice = sellingPrice;
      if (minimumQuantity !== undefined) productUpdate.minimumStockLevel = minimumQuantity;
      if (maximumStockLevel !== undefined) productUpdate.maximumStockLevel = maximumStockLevel;
      if (reorderLevel !== undefined) productUpdate.reorderLevel = reorderLevel;
      if (status !== undefined) productUpdate.status = status;

      await Product.findByIdAndUpdate(inventory.productId, productUpdate, { new: true, session });
    }

    const inventoryUpdate: any = {};
    if (quantity !== undefined) inventoryUpdate.quantity = quantity;
    if (reservedStock !== undefined) inventoryUpdate.reservedStock = reservedStock;
    if (warehouse !== undefined) inventoryUpdate.warehouse = warehouse;
    if (storageLocation !== undefined) inventoryUpdate.storageLocation = storageLocation;
    if (supplier !== undefined) inventoryUpdate.supplier = supplier;
    if (batchNumber !== undefined) inventoryUpdate.batchNumber = batchNumber;
    if (expiryDate !== undefined) inventoryUpdate.expiryDate = expiryDate;
    if (manufacturingDate !== undefined) inventoryUpdate.manufacturingDate = manufacturingDate;
    if (lastRestockedDate !== undefined) inventoryUpdate.lastRestockedDate = lastRestockedDate;
    if (remarks !== undefined || description !== undefined) inventoryUpdate.remarks = remarks || description;
    if (status !== undefined) inventoryUpdate.status = status;

    if (itemName !== undefined) inventoryUpdate.itemName = itemName;
    if (category !== undefined) inventoryUpdate.category = category;
    if (sku !== undefined) inventoryUpdate.sku = sku;
    if (minimumQuantity !== undefined) inventoryUpdate.minimumQuantity = minimumQuantity;
    if (purchasePrice !== undefined) inventoryUpdate.purchasePrice = purchasePrice;
    if (sellingPrice !== undefined) inventoryUpdate.sellingPrice = sellingPrice;
    if (remarks !== undefined || description !== undefined) inventoryUpdate.description = remarks || description;

    const updatedInventory = await Inventory.findByIdAndUpdate(
      inventory._id,
      inventoryUpdate,
      { new: true, session }
    ).populate('productId');

    await session.commitTransaction();
    session.endSession();

    const prod: any = updatedInventory?.productId || {};
    const resultObj = {
      id: updatedInventory?._id,
      _id: updatedInventory?._id,
      productId: prod._id || '',
      itemName: prod.productName || updatedInventory?.itemName,
      category: prod.category || updatedInventory?.category,
      sku: prod.sku || updatedInventory?.sku,
      unit: prod.unit || 'Pieces',
      warehouse: updatedInventory?.warehouse,
      storageLocation: updatedInventory?.storageLocation,
      supplier: updatedInventory?.supplier,
      purchasePrice: prod.purchasePrice !== undefined ? prod.purchasePrice : updatedInventory?.purchasePrice,
      sellingPrice: prod.sellingPrice !== undefined ? prod.sellingPrice : updatedInventory?.sellingPrice,
      quantity: updatedInventory?.quantity,
      reservedStock: updatedInventory?.reservedStock,
      availableStock: (updatedInventory?.quantity || 0) - (updatedInventory?.reservedStock || 0),
      minimumQuantity: prod.minimumStockLevel !== undefined ? prod.minimumStockLevel : updatedInventory?.minimumQuantity,
      maximumStockLevel: prod.maximumStockLevel || 1000,
      expiryDate: updatedInventory?.expiryDate,
      manufacturingDate: updatedInventory?.manufacturingDate,
      lastRestockedDate: updatedInventory?.lastRestockedDate,
      description: updatedInventory?.remarks,
      remarks: updatedInventory?.remarks,
      status: prod.status || 'Active',
      companyId: updatedInventory?.companyId,
      ownerId: updatedInventory?.ownerId,
      createdAt: (updatedInventory as any)?.createdAt,
      updatedAt: (updatedInventory as any)?.updatedAt
    };

    res.json(resultObj);
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

export const deleteInventory = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const filter: any = { _id: req.params.id };
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    const deleted = await Inventory.findOneAndDelete(filter).session(session);
    if (!deleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    if (deleted.productId) {
      await Product.findByIdAndDelete(deleted.productId).session(session);
    }

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Item deleted.' });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

