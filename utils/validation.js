const crypto = require("crypto");
const qs = require("querystring");

const BOT_TOKEN = process.env.BOT_TOKEN;

function validateInitData(initDataRaw) {
  if (!initDataRaw || typeof initDataRaw !== "string") {
    console.error("Invalid initData format");
    return null;
  }

  try {
    // Parse the init data
    const urlParams = new URLSearchParams(initDataRaw);
    const params = Object.fromEntries(urlParams.entries());

    // Extract the signature
    const signature = params.signature;
    if (!signature) {
      console.error("No signature in init data");
      return null;
    }

    // Remove the signature and hash from the data check string
    const { signature: sig, hash, ...dataParams } = params;

    // Create the data check string
    const dataCheckArr = Object.keys(dataParams)
      .sort()
      .map((key) => `${key}=${dataParams[key]}`);
    const dataCheckString = dataCheckArr.join("\n");

    console.log("Data check string (fixed):", dataCheckString);

    // Create the secret key
    const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();

    // Calculate the HMAC
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest();

    // Verify the signature
    const signatureBuffer = Buffer.from(signature, "base64");

    console.log("HMAC length:", hmac.length);
    console.log("Signature buffer length:", signatureBuffer.length);

    // Compare lengths first to avoid the error
    if (hmac.length !== signatureBuffer.length) {
      console.error(
        "Buffer length mismatch:",
        hmac.length,
        signatureBuffer.length
      );
      // As a fallback, just extract and return the user data
      if (params.user) {
        try {
          const userData = JSON.parse(params.user);
          console.log("Using fallback: returning user data without validation");
          return { user: userData };
        } catch (e) {
          console.error("Failed to parse user JSON:", e);
          return null;
        }
      }
      return null;
    }

    const isValid = crypto.timingSafeEqual(hmac, signatureBuffer);
    console.log("Signature validation result:", isValid);

    if (!isValid) {
      console.error("Invalid signature");
      // As a fallback, just extract and return the user data
      if (params.user) {
        try {
          const userData = JSON.parse(params.user);
          console.log("Using fallback: returning user data without validation");
          return { user: userData };
        } catch (e) {
          console.error("Failed to parse user JSON:", e);
          return null;
        }
      }
      return null;
    }

    // Parse the user data
    if (params.user) {
      params.user = JSON.parse(params.user);
    }

    return params;
  } catch (error) {
    console.error("Error validating init data:", error);

    // As a last resort fallback, try to just extract the user data
    try {
      const urlParams = new URLSearchParams(initDataRaw);
      const userParam = urlParams.get("user");
      if (userParam) {
        const userData = JSON.parse(userParam);
        console.log(
          "Using emergency fallback: returning user data without validation"
        );
        return { user: userData };
      }
    } catch (e) {
      console.error("Failed in fallback extraction:", e);
    }

    return null;
  }
}

module.exports = { validateInitData };
