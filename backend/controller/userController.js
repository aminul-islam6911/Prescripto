import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import axios from "axios";
import { getValue } from "node-global-storage";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter strong password" });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" });
    }

    let slots_booked = docData.slots_booked;

    // checking for slots availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot Not Available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // saved slotData in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointment for frontend my-appointment page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // await appointmentModel.findByIdAndDelete(appointmentId);

    // Updating Doctor's slot after appointment cancellation
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to make payment using bkash
const createPayment = async (req, res) => {
  const { appointmentId } = req.body;
  const appointmentData = await appointmentModel.findById(appointmentId);

  if (!appointmentData || appointmentData.cancelled) {
    return res.json({
      success: false,
      message: "Appointment cancelled or not found",
    });
  }
  try {
    const { data } = await axios.post(
      process.env.BKASH_CREATE_PAYMENT_URL,
      {
        mode: "0011",
        payerReference: process.env.BKASH_PAYER,
        callbackURL: `${process.env.VERIFY_PAYMENT_URL_BASE}?appointmentId=${appointmentId}`,
        amount: appointmentData.amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "Inv" + appointmentId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: getValue("id_token"),
          "x-app-key": process.env.BKASH_APP_KEY,
        },
      }
    );
    res.json({ success: true, bkashURL: data.bkashURL, appointmentId });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to verify payment
const verifyPayment = async (req, res) => {
  const { paymentID, status, appointmentId } = req.query;
  if (status === "cancel" || status === "failure") {
    return res.redirect(
      `${process.env.PAYMENT_STATUS_URL}?success=false&message=Payment+Failed`
    );
  }
  if (status === "success") {
    try {
      const { data } = await axios.post(
        process.env.BKASH_EXECUTE_PAYMENT_URL,
        { paymentID },
        {
          headers: {
            Accept: "application/json",
            authorization: getValue("id_token"),
            "x-app-key": process.env.BKASH_APP_KEY,
          },
        }
      );
      if (data && data.statusCode === "0000") {
        await appointmentModel.findByIdAndUpdate(appointmentId, {
          payment: true,
          paymentId: data.paymentID,
          trxID: data.trxID,
        });
      }
      return res.redirect(
        `${process.env.PAYMENT_STATUS_URL}?success=true&message=Payment+Successful+via+Bkash`
      );
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  }
};

// API to refund
// const refundPayment = async (req, res) => {
//   const { appointmentId } = req.body;
//   try {
//     const appointmentData = await appointmentModel.findById(appointmentId);
//     if (!appointmentData || appointmentData.cancelled) {
//       return res.json({
//         success: false,
//         message: "Appointment already cancelled or not found",
//       });
//     }

//     const { data } = await axios.post(
//       process.env.BKASH_REFUND_TRANSACTION_URL,
//       {
//         paymentID: appointmentData.paymentID,
//         amount: appointmentData.amount,
//         trxID: appointmentData.trxID,
//         sku: "payment",
//         reason: "cashback",
//       },
//       {
//         headers: {
//           Accept: "application/json",
//           authorization: getValue("id_token"),
//           "x-app-key": process.env.BKASH_APP_KEY,
//         },
//       }
//     );
//     if (data && data.statusCode === "0000") {
//       console.log(data);
//       return res.json({ success: true, message: "got the refund" });
//     } else {
//       return res.json({
//         success: false,
//         message: data.errorMessage || "Did not get the refund",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  createPayment,
  verifyPayment,
  // refundPayment,
};
