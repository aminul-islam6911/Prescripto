import jwt from "jsonwebtoken";

//user authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decode.role !== "user" || typeof token_decode.id !== "string") {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    req.body = req.body || {};
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }
};

export default authUser;
