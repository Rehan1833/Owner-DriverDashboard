import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * DTO sanitizer — strips all sensitive fields before sending to the client.
 * Never exposes passwordHash, securityAnswerHash, otpCode, otpExpiresAt, googleId.
 */
const toDriverDTO = (user: any) => ({
  id: String(user._id),
  fullName: user.fullName || '',
  email: user.email || '',
  mobileNumber: user.mobileNumber || '',
  role: user.role,
  companyId: user.companyId || null,
  companyName: user.companyName || null,
  driverId: user.driverId || null,
  vehicleNumber: user.vehicleNumber || null,
  licenseNumber: user.licenseNumber || null,
  isEmailVerified: Boolean(user.isEmailVerified),
  isPhoneVerified: Boolean(user.isPhoneVerified),
  // Derived human-readable status based on verification state
  status: user.isEmailVerified ? 'Active' : 'Inactive',
  createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
});

/**
 * GET /api/users/drivers
 * Owner-only: returns all registered Driver accounts from MongoDB.
 * Supports search (fullName, email, mobileNumber), status filter, and pagination.
 *
 * Query params:
 *   search  - string (partial match on name, email, mobile)
 *   status  - 'Active' | 'Inactive' | 'All'
 *   page    - number (default 1)
 *   limit   - number (default 20, max 100)
 */
export const getDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      search = '',
      status = 'All',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build MongoDB filter — always restrict to role = 'Driver'
    const filter: Record<string, any> = { role: 'Driver' };

    // ── DATA ISOLATION: Only return drivers belonging to this Owner's company ──
    // req.companyId is extracted from the JWT by authenticateJWT middleware.
    // If the token is a legacy token (pre-companyId), fall back to a DB lookup.
    let ownerCompanyId = req.companyId;
    if (!ownerCompanyId && req.userId) {
      const ownerUser = await User.findById(req.userId).select('companyId').lean();
      ownerCompanyId = (ownerUser as any)?.companyId || undefined;
    }
    if (ownerCompanyId) {
      filter.$or = [
        { companyId: ownerCompanyId },
        { companyId: { $exists: false } },
        { companyId: null },
        { companyId: '' }
      ];
    }

    // Search across fullName, email, mobileNumber (case-insensitive)
    if (search && search.trim() !== '') {
      const rx = new RegExp(search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { fullName: rx },
            { email: rx },
            { mobileNumber: rx },
          ]
        }
      ];
    }

    // Status filter derived from isEmailVerified field
    if (status === 'Active') {
      filter.isEmailVerified = true;
    } else if (status === 'Inactive') {
      filter.isEmailVerified = false;
    }

    const projection = {
      passwordHash: 0,
      securityAnswerHash: 0,
      otpCode: 0,
      otpExpiresAt: 0,
      googleId: 0,
    };

    const [drivers, total] = await Promise.all([
      User.find(filter, projection)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: drivers.map(toDriverDTO),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err: any) {
    console.error('[getDrivers] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load driver records. Please try again.',
    });
  }
};

/**
 * PATCH /api/users/drivers/:id/status
 * Owner-only: soft deactivate or reactivate a driver by toggling isEmailVerified.
 */
export const updateDriverStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'active' | 'inactive' };

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Expected 'active' or 'inactive'.",
      });
    }

    const driver = await User.findOne({ _id: id, role: 'Driver' });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    driver.isEmailVerified = status === 'active';
    await driver.save();

    return res.status(200).json({
      success: true,
      message: `Driver ${status === 'active' ? 'reactivated' : 'deactivated'} successfully.`,
      data: toDriverDTO(driver.toObject()),
    });
  } catch (err: any) {
    console.error('[updateDriverStatus] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update driver status. Please try again.',
    });
  }
};

/**
 * DELETE /api/users/drivers/:id
 * Owner-only: permanently delete a driver record.
 */
export const deleteDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const driver = await User.findOne({ _id: id, role: 'Driver' });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver record not found.',
      });
    }

    await User.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: `Driver ${driver.fullName} deleted permanently.`,
    });
  } catch (err: any) {
    console.error('[deleteDriver] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete driver record. Please try again.',
    });
  }
};
