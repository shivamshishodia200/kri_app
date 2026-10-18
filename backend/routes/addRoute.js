import express from 'express';
import { addProperty, getNearbyProperties, deleteProperty, updateProperty, visitProperty, markPropertyAsSold, getSoldProperties, deleteSoldProperty, getMySoldProperties, getAllProperties, approveProperty, rejectProperty, getStates, getCitiesByState, getPincodesByCity, getFilteredProperties, userUpdateProperty, userDeleteProperty, renewProperty, getMyExpiredProperties, getPendingPropertiesWithoutSubscription, getMyPendingPropertiesWithoutSubscription, getAdminAllProperties } from '../controllers/addController.js';


import upload from '../middlewares/addUploads.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyAdminToken } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

//  Add new property
// router.post('/add', upload.array("photosAndVideo", 10),verifyToken ,addProperty);
router.post(
  "/add",
  verifyToken,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 3 },
  ]),
  addProperty
);

// 2. ⭐ NEW ADMIN PROPERTY ADD ROUTE ⭐
// Route: POST /admin/add
// Middleware: file upload, token verification, and ADMIN role check
// router.post('/admin/add', upload.array("photosAndVideo", 10),verifyAdminToken , addProperty);

router.post(
  "/admin/add",
  verifyAdminToken,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 3 },
  ]),
  addProperty
);

router.put(
  "/admin/update/:id",
  verifyAdminToken,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 3 },
  ]),
  updateProperty
);

router.delete(
  "/admin/delete/:id",
  verifyAdminToken,
  deleteProperty
);


//  Mark property as sold
router.patch("/:id/mark-sold", verifyToken, markPropertyAsSold);


//  Get all sold properties
router.get("/sold", getSoldProperties);

//  Delete sold property
router.delete("/sold/:id", verifyToken, deleteSoldProperty);
//  Get my sold properties
router.get("/my-sold", verifyToken, getMySoldProperties);

//  Get my expired properties (Logged-in user)
router.get("/my-expired", verifyToken, getMyExpiredProperties);

//  Get my pending properties without subscription (Future Payment)
router.get("/my-pending-without-subscription", verifyToken, getMyPendingPropertiesWithoutSubscription);



//  Visit property
router.post("/:propertyId/visit", verifyToken, visitProperty);

//  Get nearby properties

router.get('/nearby', verifyToken, getNearbyProperties);

router.get("/properties", getAllProperties);
router.get("/states", getStates);

router.get("/cities", getCitiesByState);

router.get("/pincodes", getPincodesByCity);

// propertyRoutes.js
router.get("/filter", getFilteredProperties);


router.patch("/properties/:id/approve", verifyAdminToken, approveProperty);
router.patch("/properties/:id/reject", verifyAdminToken, rejectProperty);
router.get("/admin/pending-without-subscription", verifyAdminToken, getPendingPropertiesWithoutSubscription);
// New: Admin can see ALL properties with filters
router.get("/admin/all-properties", verifyAdminToken, getAdminAllProperties);

// 🆕 User: Renew expired property (after purchasing new subscription)
// No admin approval needed for renewal
router.patch("/properties/:id/renew", verifyToken, renewProperty);



// DELETE route by property ID
// router.delete('/delete/:id', deleteProperty);

router.put(
  "/update/:id",
  verifyToken,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 3 },
  ]),
  userUpdateProperty
);

router.delete(
  "/delete/:id",
  verifyToken,
  userDeleteProperty
);


// UPDATE route by property ID
// router.put('/edit/:id', upload.array("photosAndVideo", 10), verifyToken , updateProperty);
export default router;