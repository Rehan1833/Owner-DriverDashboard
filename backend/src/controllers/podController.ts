import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import POD from '../models/POD';
import User from '../models/User';
import { emitPodUpdate } from '../sockets/telemetrySocket';

// Create POD (Driver)
export const createPOD = async (req: AuthRequest, res: Response) => {
  try {
    const {
      orderNumber,
      vehicleNumber,
      customerName,
      customerAddress,
      imageUrl,
      signatureUrl,
      remarks,
      latitude,
      longitude
    } = req.body;

    if (!orderNumber || !vehicleNumber || !customerName || !customerAddress || !imageUrl) {
      return res.status(400).json({ message: 'Missing required delivery details.' });
    }

    // Role-based auth verification
    if (req.userRole !== 'Driver') {
      return res.status(403).json({ message: 'Only active drivers can upload POD records.' });
    }

    // Fetch driver details
    const driverUser = await User.findById(req.userId);
    if (!driverUser) {
      return res.status(404).json({ message: 'Driver profile not found.' });
    }

    // Prevent duplicate upload
    const duplicate = await POD.findOne({ orderNumber });
    if (duplicate) {
      return res.status(400).json({ message: `POD for Order ${orderNumber} has already been uploaded.` });
    }

    // Generate unique podId
    const count = await POD.countDocuments();
    const podId = `POD-2026-${String(count + 8801).padStart(4, '0')}`;

    const newPOD = new POD({
      podId,
      driverId: req.userId,
      driverName: driverUser.fullName,
      vehicleNumber,
      orderNumber,
      customerName,
      customerAddress,
      imageUrl,
      signatureUrl,
      remarks,
      latitude,
      longitude,
      status: 'Pending',
      companyId: driverUser.companyId || req.companyId,
    });

    await newPOD.save();

    // Broadcast instant update
    emitPodUpdate({ type: 'UPLOAD', pod: newPOD });

    res.status(201).json(newPOD);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Get All PODs (Owner only, or filtered for Driver)
export const getPODs = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};

    // Drivers can only see their own uploads
    if (req.userRole === 'Driver') {
      filter.driverId = req.userId;
    } else if (req.companyId) {
      // Owners can only see PODs from their company
      filter.companyId = req.companyId;
    }

    // Query filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.driver) {
      filter.driverName = { $regex: String(req.query.driver), $options: 'i' };
    }
    if (req.query.vehicle) {
      filter.vehicleNumber = { $regex: String(req.query.vehicle), $options: 'i' };
    }
    if (req.query.customer) {
      filter.customerName = { $regex: String(req.query.customer), $options: 'i' };
    }
    if (req.query.orderNumber) {
      filter.orderNumber = { $regex: String(req.query.orderNumber), $options: 'i' };
    }
    if (req.query.date) {
      const dateStr = String(req.query.date);
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const pods = await POD.find(filter).sort({ createdAt: -1 });
    res.json(pods);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Get Driver Specific PODs
export const getDriverPODs = async (req: AuthRequest, res: Response) => {
  try {
    const pods = await POD.find({ driverId: req.userId }).sort({ createdAt: -1 });
    res.json(pods);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Get single POD details
export const getPODById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    let pod = await POD.findById(id);
    if (!pod) {
      pod = await POD.findOne({ podId: id });
    }

    if (!pod) {
      return res.status(404).json({ message: 'POD record not found.' });
    }

    // Validate access boundaries
    if (req.userRole === 'Driver' && pod.driverId !== req.userId) {
      return res.status(403).json({ message: 'Access denied to other drivers\' POD logs.' });
    }

    res.json(pod);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Approve POD (Owner)
export const approvePOD = async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'Owner') {
      return res.status(403).json({ message: 'Only administrators/owners can approve POD records.' });
    }

    const ownerUser = await User.findById(req.userId);
    const ownerName = ownerUser ? ownerUser.fullName : 'Administrator';

    const pod = await POD.findById(req.params.id);
    if (!pod) {
      return res.status(404).json({ message: 'POD record not found.' });
    }

    pod.status = 'Approved';
    pod.approvedBy = ownerName;
    pod.approvedAt = new Date();
    pod.rejectedReason = undefined;

    await pod.save();

    // Broadcast instant update
    emitPodUpdate({ type: 'APPROVE', pod });

    res.json(pod);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Reject POD (Owner)
export const rejectPOD = async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'Owner') {
      return res.status(403).json({ message: 'Only administrators/owners can reject POD records.' });
    }

    const { rejectedReason } = req.body;
    if (!rejectedReason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const pod = await POD.findById(req.params.id);
    if (!pod) {
      return res.status(404).json({ message: 'POD record not found.' });
    }

    pod.status = 'Rejected';
    pod.rejectedReason = rejectedReason;
    pod.approvedBy = undefined;
    pod.approvedAt = undefined;

    await pod.save();

    // Broadcast instant update
    emitPodUpdate({ type: 'REJECT', pod });

    res.json(pod);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Delete POD (Owner or Owner/Driver own)
export const deletePOD = async (req: AuthRequest, res: Response) => {
  try {
    const pod = await POD.findById(req.params.id);
    if (!pod) {
      return res.status(404).json({ message: 'POD record not found.' });
    }

    if (req.userRole !== 'Owner' && pod.driverId !== req.userId) {
      return res.status(403).json({ message: 'Access denied to delete this record.' });
    }

    await pod.deleteOne();

    // Broadcast instant update
    emitPodUpdate({ type: 'DELETE', podId: req.params.id });

    res.json({ message: 'POD log successfully purged.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
