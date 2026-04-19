import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.js";
import * as b2bService from "../services/b2b.service.js";

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await b2bService.createLead(req.body));
});

export const listLeads = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await b2bService.listLeads());
});

export const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
  res.json(await b2bService.updateLeadStatus(req.params.leadId, req.body?.status));
});
