import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  createPayment,
  verifyPayment,
//  refundPayment,
} from "../controller/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import authBkash from "../middlewares/authBkash.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/create-payment", authBkash, createPayment);
userRouter.get("/verify-payment", authBkash, verifyPayment);
// userRouter.post("/refund-payment", authBkash, refundPayment);

export default userRouter;
