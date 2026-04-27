import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middlewares/async.js";
import * as productService from "../services/product.service.js";

const productSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  sizes: z.array(z.object({ label: z.string().min(1), price: z.coerce.number().nonnegative() })).min(1),
  description: z.string().default(""),
  badge: z.string().optional(),
  images: z.array(z.string()).optional(),
  image: z.string().optional(),
  bg: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  rating: z.coerce.number().optional(),
  reviews: z.coerce.number().optional(),
  inventory: z.coerce.number().optional(),
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await productService.listProducts({ cat: String(req.query.cat || ""), q: String(req.query.q || "") });
    res.json(products);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      detail: "Database connection failed. Please check DATABASE_URL configuration.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productService.getProduct(req.params.productId));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await productService.createProduct(productSchema.parse(req.body) as productService.ProductInput));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productService.updateProduct(req.params.productId, productSchema.parse(req.body) as productService.ProductInput));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productService.deleteProduct(req.params.productId));
});

export const bulkImport = asyncHandler(async (req: Request, res: Response) => {
  const body = z.object({ products: z.array(productSchema) }).parse(req.body);
  res.status(201).json(await productService.bulkImportProducts(body.products as productService.ProductInput[]));
});
