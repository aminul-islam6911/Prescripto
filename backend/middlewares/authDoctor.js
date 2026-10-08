import jwt from "jsonwebtoken";

//Doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    if (token_decode.role !== "doctor" || typeof token_decode.id !== "string") {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    req.body = req.body || {};
    req.body.docId = token_decode.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }
};

export default authDoctor;
