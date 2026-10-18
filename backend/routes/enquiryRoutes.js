import express from "express";
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

// 🔐 agar admin auth hai to yaha import kar sakte ho
// import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ------------------------------------
// PUBLIC ROUTE (Website form)
// ------------------------------------
router.post("/", createEnquiry);

// ------------------------------------
// ADMIN ROUTES
// ------------------------------------

// router.get("/", protectAdmin, getAllEnquiries);
router.get("/", getAllEnquiries);

// router.get("/:id", protectAdmin, getEnquiryById);
router.get("/:id", getEnquiryById);

// router.delete("/:id", protectAdmin, deleteEnquiry);
router.delete("/:id", deleteEnquiry);

export default router;
