import {
  clearRefreshTokenCookie,
  revokeRefreshToken,
  rotateRefreshToken,
} from "../utils/authTokens.js";

export const refreshToken = (role) => async (req, res) => {
  try {
    const result = await rotateRefreshToken(req, res, role);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to refresh token" });
  }
};

export const logout = (role) => async (req, res) => {
  try {
    await revokeRefreshToken(req, role);
    clearRefreshTokenCookie(res, role);
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to log out" });
  }
};
