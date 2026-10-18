import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import admin from "../config/firebase.js";

// Temporary store OTPs (in production use Redis or DB)
let emailOtps = {};


// Step 1: Send Email OTP
// export const sendEmailOtp = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     emailOtps[email] = otp;

//     console.log("Email OTP:", otp);

//     const user = await User.find({ email: email });
//     if (user.length > 0) {
//       res.status(400).json({ message: "email already exist" });
//     } else {
//       res.status(200).json({ message: "otp sent successfully", otp });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // Step 2: Verify Email OTP
// export const verifyEmailOtp = (req, res) => {
//   const { email, otp } = req.body;
//   if (emailOtps[email] && emailOtps[email] == otp) {
//     delete emailOtps[email];
//     res.json({ success: true, message: "Email verified" });
//   } else {
//     res.status(400).json({ success: false, message: "Invalid OTP" });
//   }
// };

export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = 1234; // STATIC OTP

    emailOtps[email] = otp;

    console.log("Email OTP:", otp);

    const user = await User.find({ email: email });
    if (user.length > 0) {
      res.status(400).json({ message: "email already exist" });
    } else {
      res.status(200).json({ message: "otp sent successfully", otp });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyEmailOtp = (req, res) => {
  const { email, otp } = req.body;

  if (emailOtps[email] && emailOtps[email] == otp) {
    delete emailOtps[email];
    res.json({ success: true, message: "Email verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};


// Step 3: Send Phone OTP
// export const sendPhoneOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     phoneOtps[phone] = otp;

//     console.log("Phone OTP:", otp);

//     // await client.messages.create({
//     //   body: `Your OTP is ${otp}`,
//     //   from: "+1XXXXXXXXXX", // Twilio registered number
//     //   to: phone
//     // });

//     res.json({ success: true, message: "Phone OTP sent" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // Step 4: Verify Phone OTP
// export const verifyPhoneOtp = (req, res) => {
//   const { phone, otp } = req.body;
//   if (phoneOtps[phone] && phoneOtps[phone] == otp) {
//     delete phoneOtps[phone];
//     res.json({ success: true, message: "Phone verified" });
//   } else {
//     res.status(400).json({ success: false, message: "Invalid OTP" });
//   }
// };




// Temporary OTP store
const phoneOtps = {};

// Step 3: Send Phone OTP
// export const sendPhoneOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     // generate OTP
//   const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP


//     // save OTP
//     phoneOtps[phone] = otp;

//     console.log("Phone OTP:", otp);

//     const access_token = "2653c6471e8bbee9a8c721182ea23b86";

//     const message = `Your Kirayedar24 login OTP is ${otp}. It is valid for 5 minutes. If you did not request this OTP, please ignore it. - Team Kirayedar24`;

//     const url = `https://apis.wappie.shop/v1/sms/messages?access_token=${access_token}&to=${phone}&country_code=+91&sender=KIRYDR&service=SI&message=${encodeURIComponent(message)}`;

//     const response = await axios.get(url);

//     console.log("SMS API Response:", response.data);

//     res.json({ success: true, message: "OTP sent successfully" });
//   } catch (err) {
//     console.error("SMS Error:", err.response?.data || err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };


// Step 3: Send Phone OTP
// export const sendPhoneOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number is required",
//       });
//     }

//     // 🔐 STEP 1: Check if user is already registered
//     const user = await User.findOne({ phone });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not registered. Please register first.",
//       });
//     }

//     // 🔢 STEP 2: Generate OTP
//     const otp = 1234; // STATIC OTP

//     // ⏳ STEP 3: Store OTP with expiry (5 minutes)
//     phoneOtps[phone] = {
//       otp,
//       expiresAt: Date.now() + 5 * 60 * 1000,
//     };

//     console.log("Phone OTP:", otp);

//     const access_token = "2653c6471e8bbee9a8c721182ea23b86";

//     const message = `Your Kirayedar24 login OTP is ${otp}. It is valid for 5 minutes. If you did not request this OTP, please ignore it. - Team Kirayedar24`;

//     const url = `https://apis.wappie.shop/v1/sms/messages?access_token=${access_token}&to=${phone}&country_code=+91&sender=KIRYDR&service=SI&message=${encodeURIComponent(
//       message
//     )}`;

//     const response = await axios.get(url);

//     console.log("SMS API Response:", response.data);

//     return res.json({
//       success: true,
//       message: "OTP sent successfully",
//     });
//   } catch (err) {
//     console.error("SMS Error:", err.response?.data || err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to send OTP",
//     });
//   }
// };


export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // 🔐 STEP 1: Check if user is already registered
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please register first.",
      });
    }

    // 🔢 STEP 2: Generate 4-digit Dynamic OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // ⏳ STEP 3: Store OTP with expiry (5 minutes)
    phoneOtps[phone] = {
      otp: otp.toString(), // store as string
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log("Phone OTP:", otp);

    const access_token = "2653c6471e8bbee9a8c721182ea23b86";

    const message = `Your Kirayedar24 login OTP is ${otp}. It is valid for 5 minutes. If you did not request this OTP, please ignore it. - Team Kirayedar24`;

    const url = `https://apis.wappie.shop/v1/sms/messages?access_token=${access_token}&to=${phone}&country_code=+91&sender=KIRYDR&service=SI&message=${encodeURIComponent(
      message
    )}`;

    const response = await axios.get(url);

    console.log("SMS API Response:", response.data);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("SMS Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};


// Step 4: Verify Phone OTP + Login
// export const verifyPhoneOtp = async (req, res) => {
//   console.log("--- OTP Verification Started ---");
//   try {
//     const { phone, otp, fcmToken } = req.body;
//     console.log(` Attempting OTP Verify for Phone: ${phone}, Token provided: ${fcmToken ? "Yes" : "No"}`);

//     if (!phone || !otp) {
//       console.warn(" Missing phone or OTP");
//       return res.status(400).json({
//         success: false,
//         message: "Phone and OTP are required",
//       });
//     }

//     const otpData = phoneOtps[phone];

//     // ❌ OTP not found
//     if (!otpData) {
//       console.warn(` No OTP found in memory for phone: ${phone}`);
//       return res.status(400).json({
//         success: false,
//         message: "OTP not found or already used",
//       });
//     }

//     // ⏳ OTP expired
//     if (Date.now() > otpData.expiresAt) {
//       console.warn(` OTP expired for phone: ${phone}`);
//       delete phoneOtps[phone];
//       return res.status(400).json({
//         success: false,
//         message: "OTP expired",
//       });
//     }

//     // 🔐 OTP mismatch
//     if (String(otpData.otp) !== String(otp)) {
//       console.warn(` OTP mismatch for phone: ${phone}. Expected: ${otpData.otp}, Got: ${otp}`);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     // 🟢 OTP verified → remove OTP
//     console.log(` OTP verified successfully for phone: ${phone}`);
//     delete phoneOtps[phone];

//     // 🔍 Fetch registered user
//     const user = await User.findOne({ phone });

//     if (!user) {
//       console.warn(` User with phone ${phone} not found in database after OTP verification`);
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // 🔔 Send Push Notification logic
//     const targetToken = fcmToken || user.fcmToken;

//     if (fcmToken) {
//       console.log(` Updating new FCM token for user: ${user._id}`);
//       user.fcmToken = fcmToken;
//       await user.save();
//       console.log(" New FCM token saved to database");
//     }

//     if (targetToken) {
//       // 📲 Send Welcome Push Notification
//       try {
//         console.log(` Attempting to send welcome push notification to ${fcmToken ? "new" : "existing"} token...`);
//         const pushRes = await admin.messaging().send({
//           token: targetToken,
//           notification: {
//             title: "Login Successful",
//             body: `Welcome back, ${user.fullName || "User"}! You have successfully logged in via OTP.`,
//           },
//         });
//         console.log(" Push notification sent successfully:", pushRes);
//       } catch (pushError) {
//         console.error(" Welcome Push Notification Error:", pushError.message);
//       }
//     } else {
//       console.log(" No fcmToken provided and none found in DB, skipping push notification.");
//     }

//     // 🔑 Generate JWT Token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         phone: user.phone,
//         role: user.role,
//       },
//       process.env.JWT_SECRET || "mysecretkey",
//       { expiresIn: "24h" }
//     );

//     // ✅ Login Success Response
//     console.log(` Login successful for user: ${user.fullName} (${user.phone})`);
//     console.log("--- OTP Verification Completed Successfully ---");
//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("!!! CRITICAL OTP Verify Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "OTP verification failed",
//       error: err.message
//     });
//   }
// };


export const verifyPhoneOtp = async (req, res) => {
  console.log("--- OTP Verification Started ---");

  try {
    const { phone, otp, fcmToken } = req.body;

    console.log(
      `Attempting OTP Verify for Phone: ${phone}, Token provided: ${
        fcmToken ? "Yes" : "No"
      }`
    );

    // 🔴 Validate input
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const otpData = phoneOtps[phone];

    // ❌ OTP not found
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used",
      });
    }

    // 🔐 Attempt limit (max 5 tries)
    if (otpData.attempts >= 5) {
      delete phoneOtps[phone];
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request OTP again.",
      });
    }

    // ⏳ OTP expired
    if (Date.now() > otpData.expiresAt) {
      delete phoneOtps[phone];
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // 🔐 OTP mismatch
    if (otpData.otp !== otp.toString()) {
      otpData.attempts += 1;

      console.warn(
        `OTP mismatch for phone: ${phone}. Attempt ${otpData.attempts}`
      );

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 🟢 OTP verified
    console.log(`OTP verified successfully for phone: ${phone}`);

    delete phoneOtps[phone];

    // 🔍 Fetch user
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔔 Handle FCM token
    const targetToken = fcmToken || user.fcmToken;

    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
      console.log("FCM token updated");
    }

    // 📲 Send Push Notification
    if (targetToken) {
      try {
        const pushRes = await admin.messaging().send({
          token: targetToken,
          notification: {
            title: "Login Successful",
            body: `Welcome back, ${user.fullName || "User"}! You have successfully logged in via OTP.`,
          },
        });

        console.log("Push notification sent:", pushRes);
      } catch (pushError) {
        console.error("Push Notification Error:", pushError.message);
      }
    }

    // 🔑 Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "30d" }
    );

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("CRITICAL OTP Verify Error:", err);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: err.message,
    });
  }
};
//  Step 5: Final Signup
// export const signup = async (req, res) => {
//   try {
//     const { fullName, email, phone, state, city, street, pinCode, password } =
//       req.body;

//     const existingUser = await User.findOne({ 
//       $or: [{ email }, { phone }] 
//     });
//     if (existingUser) {
//       const conflictField = existingUser.email === email ? 'email' : 'phone';
//       return res.status(400).json({ 
//         success: false,
//         error: `User with this ${conflictField} already exists` 
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       fullName,
//       email,
//       phone,
//       state,
//       city,
//       street,
//       pinCode,
//       password: hashedPassword,
//       isEmailVerified: true, //  after OTP flow
//       isPhoneVerified: true,
//     });

//     await newUser.save();

//     // const token = jwt.sign({ id: newUser._id }, "secret123", {
//     //   expiresIn: "1d",
//     // });

//     res.json({ success: true, user: newUser });
//   } catch (err) {
//     if (err.code === 11000) {
//       const field = Object.keys(err.keyPattern)[0];
//       const message = field === 'email' 
//         ? 'Email already exists' 
//         : field === 'phone' 
//         ? 'Phone number already exists' 
//         : 'User already exists';
//       res.status(400).json({ success: false, error: message });
//     } else {
//       res.status(500).json({ success: false, error: err.message });
//     }
//   }
// };
// FINAL SIGNUP (Register User)
export const signup = async (req, res) => {
  try {
    const { fullName, email, phone, state, city, street, pinCode, password, role, fcmToken } =
      req.body;

    // Debug: Log received FCM token
    console.log("📱 Received FCM Token in signup:", fcmToken);
    console.log("📦 Full request body:", req.body);

    // Check user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "phone";
      return res.status(400).json({
        success: false,
        error: `User with this ${conflictField} already exists`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      phone,
      state,
      city,
      street,
      pinCode,
      password: hashedPassword,
      role: role || "Tenant", // default role
      isEmailVerified: true,
      isPhoneVerified: true,
      fcmToken: fcmToken || "", // Save FCM token if provided
    });

    await newUser.save();

    // 📲 Send Welcome Push Notification
    if (fcmToken) {
      try {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: "Welcome to Kirayedar24!",
            body: `Hi ${fullName}, thank you for joining us. We are happy to have you!`,
          },
        });
      } catch (pushError) {
        console.error("Signup Push Error:", pushError);
      }
    }

    res.json({ success: true, user: newUser });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message =
        field === "email"
          ? "Email already exists"
          : field === "phone"
            ? "Phone number already exists"
            : "User already exists";
      return res.status(400).json({ success: false, error: message });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

//Maps.................................................................................

// export const signup = async (req, res) => {
//   try {
//     const { fullName, email, phone, state, city, street, pinCode, password, role } = req.body;

//     // 1. Check if user already exists
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingUser) {
//       const conflictField = existingUser.email === email ? "email" : "phone";
//       return res.status(400).json({
//         success: false,
//         error: `User with this ${conflictField} already exists`,
//       });
//     }

//     // 2. Google Maps Integration: Address to Coordinates (Geocoding)
//  // 2. Google Maps Integration: Address to Coordinates (Geocoding)
// const fullAddress = `${street}, ${city}, ${state}, ${pinCode}`;
// const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// if (!apiKey) {
//   return res.status(500).json({
//     success: false,
//     message: "Google Maps API key not found",
//   });
// }

// let coordinates;

// try {
//   const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//     fullAddress
//   )}&key=${apiKey}`;

//   const response = await axios.get(geoUrl);

//   console.log("Google response:", response.data);

//   // ❌ Stop if Google fails
//   if (response.data.status !== "OK") {
//     return res.status(400).json({
//       success: false,
//       message: "Unable to fetch location from Google Maps",
//       googleStatus: response.data.status,
//       googleError: response.data.error_message || "Unknown error",
//     });
//   }

//   const { lat, lng } = response.data.results[0].geometry.location;
//   coordinates = [lng, lat]; // ✅ correct order

// } catch (geoError) {
//   console.error("Google Maps API Error:", geoError.message);
//   return res.status(500).json({
//     success: false,
//     message: "Google Maps API failed",
//   });
// }


//     // 3. Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 4. Create new user with location
//     const newUser = new User({
//       fullName,
//       email,
//       phone,
//       state,
//       city,
//       street,
//       pinCode,
//       password: hashedPassword,
//       role: role || "Tenant",
//       location: {
//         type: "Point",
//         coordinates: coordinates,
//       },
//       isEmailVerified: true,
//       isPhoneVerified: true,
//     });

//     await newUser.save();

//     // Sensitive data hide karne ke liye
//     const userResponse = newUser.toObject();
//     delete userResponse.password;

//     res.status(201).json({ 
//       success: true, 
//       message: "User registered successfully",
//       user: userResponse 
//     });

//   } catch (err) {
//     // MongoDB Duplicate Key Error (11000)
//     if (err.code === 11000) {
//       const field = Object.keys(err.keyPattern)[0];
//       const message =
//         field === "email"
//           ? "Email already exists"
//           : field === "phone"
//           ? "Phone number already exists"
//           : "User already exists";
//       return res.status(400).json({ success: false, error: message });
//     }

//     res.status(500).json({ success: false, error: err.message });
//   }
// };


// LOGIN CONTROLLER
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // check if email and password provided
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     // find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // generate JWT token
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET || "mysecretkey",
//       { expiresIn: "24h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const loginUser = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    // Debug: Log received FCM token
    console.log("📱 Received FCM Token in login:", fcmToken);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update FCM token if provided (replaces old token)
    if (fcmToken) {
      console.log("✅ Updating FCM token for user:", fcmToken);
      user.fcmToken = fcmToken;
      await user.save();
      console.log("💾 FCM token updated successfully");

      // 📲 Send Login Push Notification
      try {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: "Login Successful",
            body: `Welcome back, ${user.fullName || "User"}! You have successfully logged in.`,
          },
        });
      } catch (pushError) {
        console.error("Login Push Error:", pushError);
      }
    } else {
      console.log("⚠️ No FCM token provided");
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// google auth
const client = new OAuth2Client(process.env.CLIENT_ID);

export const googleAuth = async (req, res) => {
  const { idToken, fcmToken } = req.body;

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not found
      user = new User({
        fullName: name,
        email,
        phone: "", // Optional, can update later
        password: googleId, // Dummy password (or leave blank if your schema allows)
        isEmailVerified: true,
        isPhoneVerified: false,
        fcmToken: fcmToken || "",
      });

      await user.save();
    } else {
      // Update FCM token if user already exists
      if (fcmToken) {
        user.fcmToken = fcmToken;
        await user.save();
      }
    }

    // 📲 Send Google Login Push Notification
    if (fcmToken) {
      try {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: "Login Successful",
            body: `Welcome back, ${user.fullName || "User"}! You have successfully logged in via Google.`,
          },
        });
      } catch (pushError) {
        console.error("Google Login Push Error:", pushError);
      }
    }

    // Generate JWT token for your app
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        fcmToken: user.fcmToken,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};


// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// export const editProfile = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const { fullName, email, phone, state, city, street, pinCode } = req.body;

//     // Check if user exists
//     const user = await User.findById(id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Update fields
//     user.fullName = fullName || user.fullName;
//     user.email = email || user.email;
//     user.phone = phone || user.phone;
//     user.state = state || user.state;
//     user.city = city || user.city;
//     user.street = street || user.street;
//     user.pinCode = pinCode || user.pinCode;

//     await user.save();

//     res.json({ success: true, message: "Profile updated", user });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

export const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, state, city, street, pinCode } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 📍 New: Update coordinates if address changes
    if (state || city || street || pinCode) {
      const fullAddress = `${street || user.street}, ${city || user.city}, ${state || user.state}, ${pinCode || user.pinCode}`;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      try {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
        const response = await axios.get(geoUrl);

        if (response.data.status === "OK") {
          const { lat, lng } = response.data.results[0].geometry.location;
          user.location = {
            type: "Point",
            coordinates: [lng, lat]
          };
        }
      } catch (geoErr) {
        console.error("Geocoding update error:", geoErr.message);
      }
    }

    // Update other fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.state = state || user.state;
    user.city = city || user.city;
    user.street = street || user.street;
    user.pinCode = pinCode || user.pinCode;

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};





