import { Request, Response } from 'express';
import Company from '../models/Company';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/company/check?name=...
 * Public endpoint — checks whether a company name is already taken.
 * Used for real-time duplicate validation on the registration form.
 */
export const checkCompanyName = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      });
    }

    const trimmed = name.trim();

    if (trimmed.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Company name must be at least 3 characters.',
      });
    }

    // Case-insensitive exact match
    const existing = await Company.findOne({
      companyName: { $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    return res.json({
      success: true,
      available: !existing,
      message: existing ? 'Company already exists.' : 'Company name is available.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/company/me
 * Protected — returns the Company record linked to the authenticated user.
 */
export const getMyCompany = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(404).json({
        success: false,
        message: 'No company linked to this account.',
      });
    }

    const company = await Company.findOne({ companyId });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company record not found.',
      });
    }

    return res.json({
      success: true,
      company: {
        id: company._id,
        companyId: company.companyId,
        companyName: company.companyName,
        companyType: company.companyType,
        companyEmail: company.companyEmail,
        companyPhone: company.companyPhone,
        companyAddress: company.companyAddress,
        gstNumber: company.gstNumber,
        logo: company.logo,
        createdBy: company.createdBy,
        createdAt: company.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
