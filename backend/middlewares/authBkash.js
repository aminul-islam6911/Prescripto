import axios from "axios";
import { setValue } from "node-global-storage";

const authBkash = async (req, res, next) => {
  try {
    const { data } = await axios.post(
      process.env.BKASH_GRANT_TOKEN_URL,
      {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_SECRET_KEY,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD,
        },
      }
    );

    setValue("id_token", data.id_token, { protected: true });
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authBkash;
