import jwt from "jsonwebtoken";

//admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
    if (
      token_decode.role !== "admin" ||
      token_decode.id !== process.env.ADMIN_EMAIL
    ) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }
};

export default authAdmin
