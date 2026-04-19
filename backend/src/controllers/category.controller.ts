import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middlewares/async.js";
import * as categoryService from "../services/category.service.js";

const categorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await categoryService.listCategories());
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await categoryService.createCategory(categorySchema.parse(req.body) as { slug: string; name: string; description?: string }));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  res.json(await categoryService.updateCategory(req.params.slug, categorySchema.partial().parse(req.body)));
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  res.json(await categoryService.deleteCategory(req.params.slug));
});
