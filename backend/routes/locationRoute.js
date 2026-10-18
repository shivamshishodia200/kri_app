import express from 'express';
import * as locationController from '../controllers/locationController.js';

const router = express.Router();

// Get all states
router.get('/states', locationController.getAllStates);

// Get districts by state
router.get('/districts/:state', locationController.getDistrictsByState);

// Get cities/offices by district (optional state query param)
router.get('/cities/:district', locationController.getCitiesByDistrict);

// Get pincode details by city/office name (optional district and state query params)
router.get('/pincode/:city', locationController.getPincodeByCity);

// Search by pincode
router.get('/search/:pincode', locationController.searchByPincode);

// General search by any keyword (office name, district, state, pincode)
router.get('/find/:keyword', locationController.generalSearch);

// Get office names by keyword (for dropdown/autocomplete)
router.get('/offices/:keyword', locationController.getOfficeNames);

// Get pincode by exact office name
router.get('/office/:officename/pincode', locationController.getPincodeByOfficeName);

export default router;
