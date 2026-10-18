// // import express from "express";
// // import { sendPhoneOtp, verifyPhoneOtp, signup , loginUser, googleLogin } from "../controllers/authControllers.js";

// // const router = express.Router();

// // router.post("/send-phone-otp", sendPhoneOtp);
// // router.post("/verify-phone-otp", verifyPhoneOtp);
// // router.post("/signup", signup);
// // router.post("/login", loginUser);
// // router.post("/google-login", googleLogin );

// // export default router;

// import express from "express";
// import {
//   sendPhoneOtp,
//   verifyPhoneOtp,
// //   completeRegistration, // ✅ new controller
//   googleLogin,          // optional — keep if you support Google login
//   getAllUsers,
//   getUserById
// } from "../controllers/authControllers.js";

// const router = express.Router();

// // OTP-based flow
// router.post("/send-phone-otp", sendPhoneOtp);
// router.post("/verify-phone-otp", verifyPhoneOtp);
// // router.post("/complete-registration", completeRegistration);

// // Optional: if you still support Google auth
// router.post("/google-login", googleLogin);

// router.get("/users", getAllUsers);
// router.get("/users/:id", getUserById);
// export default router;


import express from "express";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
   signup,
   loginUser
} from "../controllers/authControllers.js";
import { getAllUsers } from "../controllers/userController.js";
import { editProfile } from "../controllers/editController.js";

const router = express.Router();

router.post("/send-phone-otp", sendPhoneOtp);
router.post("/verify-phone-otp", verifyPhoneOtp);
router.post("/login", loginUser); // Commented out - loginUser not exported
// router.post("/google-login", googleAuth); // Commented out - googleAuth not exported
router.post("/signup", signup); // Commented out - signup not exported
router.get("/users", getAllUsers);
// router.get("/users/:id", getUserById); // Commented out - getUserById not exported
router.put("/edit-profile/:id", editProfile);

export default router;