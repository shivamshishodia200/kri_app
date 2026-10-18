import SubscriptionPackage from "../models/SubscriptionPackage.js";

/**
 * ==================================================
 * ✅ CREATE PACKAGE (Admin)
 * POST /api/subscription-packages
 * ==================================================
 */
export const createPackage = async (req, res) => {
  try {
    const {
      name,
      amount,
      durationValue,
      durationType,
      description,
      applicableFor,
      applicableCities = [],
      features = [],
      isActive = true,
    } = req.body;

    // 🔴 Basic validation
    if (!name || amount === undefined || !durationValue) {
      return res.status(400).json({
        success: false,
        message: "name, amount and durationValue are required",
      });
    }

    // 🔍 Check duplicate package name
    const existing = await SubscriptionPackage.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Package with this name already exists",
      });
    }

    // 🧹 Sanitize features (must be array of strings)
    const sanitizedFeatures = Array.isArray(features)
      ? features.filter(f => typeof f === "string" && f.trim() !== "")
      : [];

    // ✅ Create package
    const pkg = await SubscriptionPackage.create({
      name,
      amount,
      durationValue,
      durationType,
      description,
      applicableFor,
      applicableCities,
      features: sanitizedFeatures,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Subscription package created successfully",
      data: pkg,
    });
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating package",
    });
  }
};

/**
 * ==================================================
 * ✅ GET ALL PACKAGES
 * GET /api/subscription-packages
 * Optional query: ?city=Noida
 * ==================================================
 */
export const getAllPackages = async (req, res) => {
  try {
    const { city } = req.query;

    let filter = { isActive: true };

    // 🏙️ City-based filtering
    if (city) {
      filter = {
        isActive: true,
        $or: [
          { applicableCities: { $size: 0 } }, // global
          { applicableCities: city },         // city-specific
        ],
      };
    }

    const packages = await SubscriptionPackage.find(filter)
      .sort({ amount: 1 }); // cheaper first (UX friendly)

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    console.error("Get packages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching packages",
    });
  }
};

/**
 * ==================================================
 * ✅ GET SINGLE PACKAGE
 * GET /api/subscription-packages/:id
 * ==================================================
 */
export const getPackageById = async (req, res) => {
  try {
    const pkg = await SubscriptionPackage.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error("Get package error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching package",
    });
  }
};

/**
 * ==================================================
 * ✅ UPDATE PACKAGE
 * PUT /api/subscription-packages/:id
 * ==================================================
 */
export const updatePackage = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // 🧹 Sanitize features if provided
    if (updateData.features) {
      updateData.features = Array.isArray(updateData.features)
        ? updateData.features.filter(
            f => typeof f === "string" && f.trim() !== ""
          )
        : [];
    }

    const updated = await SubscriptionPackage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update package error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating package",
    });
  }
};

/**
 * ==================================================
 * ✅ DELETE PACKAGE
 * DELETE /api/subscription-packages/:id
 * ==================================================
 */
export const deletePackage = async (req, res) => {
  try {
    const deleted = await SubscriptionPackage.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Delete package error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting package",
    });
  }
};

// PUT /api/subscription-packages/:id/free-cities
export const toggleFreeCity = async (req, res) => {
  try {
    const { city, action } = req.body;
    // action = "add" | "remove"

    if (!city || !["add", "remove"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "city and valid action (add/remove) required",
      });
    }

    const update =
      action === "add"
        ? { $addToSet: { isFreeForCities: city } }
        : { $pull: { isFreeForCities: city } };

    const pkg = await SubscriptionPackage.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json({
      success: true,
      message:
        action === "add"
          ? `${city} marked as FREE`
          : `${city} removed from FREE list`,
      data: pkg,
    });
  } catch (error) {
    console.error("Toggle free city error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
