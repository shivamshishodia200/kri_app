import express from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  toggleFreeCity
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Admin creates package
router.post("/", createPackage);

// Get all packages
router.get("/", getAllPackages);

// Get single package
router.get("/:id", getPackageById);

// Update package
router.put("/:id", updatePackage);

// Delete package
router.delete("/:id", deletePackage);
router.put("/:id/free-cities", toggleFreeCity);


export default router;
