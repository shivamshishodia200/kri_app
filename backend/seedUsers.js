import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_CONN || "mongodb+srv://vikashchaudhary0475:IBZqeOzkxELsnfsl@clusters.fyjelmt.mongodb.net/99acer-db?retryWrites=true&w=majority&appName=99acer-backend";

const usersToSeed = [
  {
    fullName: "Kirayedar Owner Test",
    email: "owner@kirayedar24.com",
    phone: "9876543210",
    passwordRaw: "Owner@123",
    role: "Owner",
    state: "Delhi",
    city: "New Delhi",
    street: "Connaught Place",
    pinCode: "110001",
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    fullName: "Kirayedar Tenant Test",
    email: "tenant@kirayedar24.com",
    phone: "9876543211",
    passwordRaw: "Tenant@123",
    role: "Tenant",
    state: "Delhi",
    city: "New Delhi",
    street: "Saket",
    pinCode: "110017",
    isEmailVerified: true,
    isPhoneVerified: true
  }
];

async function seedUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected successfully.");

    for (const userData of usersToSeed) {
      const hashedPassword = await bcrypt.hash(userData.passwordRaw, 10);
      
      const updatedUser = await User.findOneAndUpdate(
        { email: userData.email },
        {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          password: hashedPassword,
          role: userData.role,
          state: userData.state,
          city: userData.city,
          street: userData.street,
          pinCode: userData.pinCode,
          isEmailVerified: userData.isEmailVerified,
          isPhoneVerified: userData.isPhoneVerified
        },
        { upsert: true, new: true }
      );

      console.log(`\n=============================`);
      console.log(`✅ ${userData.role} User Ready:`);
      console.log(`- Full Name: ${updatedUser.fullName}`);
      console.log(`- Email    : ${updatedUser.email}`);
      console.log(`- Password : ${userData.passwordRaw}`);
      console.log(`- Phone    : ${updatedUser.phone}`);
      console.log(`- Role     : ${updatedUser.role}`);
      console.log(`=============================`);
    }

    console.log("\n🎉 All test users have been configured successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up users:", error);
    process.exit(1);
  }
}

seedUsers();
