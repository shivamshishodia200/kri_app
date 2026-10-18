
// import Enquiry from "../models/Enquiry.js";

// /**
//  * @desc    Create new enquiry
//  * @route   POST /api/enquiries
//  * @access  Public
//  */
// export const createEnquiry = async (req, res) => {
//   try {
//     const { name, phone, address, propertyType, message } = req.body;

//     // ✅ Basic validation
//     if (!name || !phone || !address || !propertyType) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be filled",
//       });
//     }

//     // ✅ Phone validation (India)
//     if (!/^[6-9]\d{9}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid phone number",
//       });
//     }

//     const enquiry = await Enquiry.create({
//       name,
//       phone,
//       address,
//       propertyType,
//       message,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Enquiry submitted successfully",
//       enquiry,
//     });
//   } catch (error) {
//     console.error("❌ Create Enquiry Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /**
//  * @desc    Get all enquiries (Admin)
//  * @route   GET /api/enquiries
//  * @access  Admin
//  */
// export const getAllEnquiries = async (req, res) => {
//   try {
//     const enquiries = await Enquiry.find().sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: enquiries.length,
//       enquiries,
//     });
//   } catch (error) {
//     console.error("❌ Get Enquiries Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /**
//  * @desc    Get single enquiry by ID
//  * @route   GET /api/enquiries/:id
//  * @access  Admin
//  */
// export const getEnquiryById = async (req, res) => {
//   try {
//     const enquiry = await Enquiry.findById(req.params.id);

//     if (!enquiry) {
//       return res.status(404).json({
//         success: false,
//         message: "Enquiry not found",
//       });
//     }

//     res.json({
//       success: true,
//       enquiry,
//     });
//   } catch (error) {
//     console.error("❌ Get Enquiry Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /**
//  * @desc    Delete enquiry
//  * @route   DELETE /api/enquiries/:id
//  * @access  Admin
//  */
// export const deleteEnquiry = async (req, res) => {
//   try {
//     const enquiry = await Enquiry.findById(req.params.id);

//     if (!enquiry) {
//       return res.status(404).json({
//         success: false,
//         message: "Enquiry not found",
//       });
//     }

//     await enquiry.deleteOne();

//     res.json({
//       success: true,
//       message: "Enquiry deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Delete Enquiry Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



import Enquiry from "../models/Enquiry.js";
import nodemailer from "nodemailer";

/* =====================================================
  🔐 EMAIL CONFIG (DIRECT CONST – NO .env FILE)
===================================================== */
const EMAIL_USER = "Kirayedar24@gmail.com";       // 👈 apna email
const EMAIL_PASS = "acijqhfbcripyhtc";    // 👈 Gmail App Password

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/* =====================================================
  📩 SEND ENQUIRY EMAIL FUNCTION
===================================================== */
const sendEnquiryMail = async ({ name, phone, address, propertyType, message }) => {
  const mailOptions = {
    from: `"New Enquiry" <${EMAIL_USER}>`,
    to: EMAIL_USER, // 👈 client ka email (ya jaha enquiry chahiye)
    subject: "📩 New Property Enquiry Received",
    html: `
      <h2>New Enquiry Details</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Property Type:</strong> ${propertyType}</p>
      <p><strong>Message:</strong> ${message || "N/A"}</p>
      <br/>
      <p>📅 Received on: ${new Date().toLocaleString()}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/* =====================================================
  📝 CREATE ENQUIRY
  POST /api/enquiries
===================================================== */
export const createEnquiry = async (req, res) => {
  try {
    const { name, phone, address, propertyType, message } = req.body;

    // ✅ Validation
    if (!name || !phone || !address || !propertyType) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // ✅ Indian phone validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Save enquiry
    const enquiry = await Enquiry.create({
      name,
      phone,
      address,
      propertyType,
      message,
    });

    // ✅ Send Email
    await sendEnquiryMail({
      name,
      phone,
      address,
      propertyType,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully & email sent",
      enquiry,
    });

  } catch (error) {
    console.error("❌ Create Enquiry Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
  📋 GET ALL ENQUIRIES (ADMIN)
===================================================== */
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("❌ Get Enquiries Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
  🔍 GET SINGLE ENQUIRY
===================================================== */
export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.json({
      success: true,
      enquiry,
    });
  } catch (error) {
    console.error("❌ Get Enquiry Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
  🗑️ DELETE ENQUIRY
===================================================== */
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    await enquiry.deleteOne();

    res.json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Enquiry Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
