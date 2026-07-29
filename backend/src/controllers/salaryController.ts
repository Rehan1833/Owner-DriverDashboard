import { Request, Response } from 'express';
import Salary from '../models/Salary';

export const getSalaries = async (req: Request, res: Response) => {
  try {
    const salaries = await Salary.find();
    res.json(salaries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createSalary = async (req: Request, res: Response) => {
  try {
    const pay = new Salary(req.body);
    await pay.save();
    res.status(201).json(pay);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateSalary = async (req: Request, res: Response) => {
  try {
    const updated = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteSalary = async (req: Request, res: Response) => {
  try {
    await Salary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Salary record removed.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
