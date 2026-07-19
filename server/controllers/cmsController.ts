import { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";
import { catchAsync } from "../utils/catchAsync";
import * as cmsService from "../services/cmsService";

export const getPageBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const page = await cmsService.getPageBySlug(slug);
  
  if (!page) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Page not found"
    });
  }
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Page fetched successfully",
    data: page
  });
});

export const getAllPages = catchAsync(async (req: Request, res: Response) => {
  const pages = await cmsService.getAllPages();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pages fetched successfully",
    data: pages
  });
});

export const createOrUpdatePage = catchAsync(async (req: Request, res: Response) => {
  const page = await cmsService.createOrUpdatePage(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Page updated successfully",
    data: page
  });
});

export const updateSection = catchAsync(async (req: Request, res: Response) => {
  const section = await cmsService.updateSection(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Section updated successfully",
    data: section
  });
});

export const createContentItem = catchAsync(async (req: Request, res: Response) => {
  const item = await cmsService.createContentItem(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Content item created successfully",
    data: item
  });
});

export const updateContentItem = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await cmsService.updateContentItem(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Content item updated successfully",
    data: item
  });
});

export const deleteContentItem = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await cmsService.deleteContentItem(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Content item deleted successfully"
  });
});
