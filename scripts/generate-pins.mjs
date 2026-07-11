import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function generatePins() {
  loadEnvFile(envPath);

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "milkman";

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI. Add it to .env.local before running the script.");
  }

  await mongoose.connect(mongoUri, {
    dbName,
    bufferCommands: false,
  });

  const db = mongoose.connection.db;
  const users = db.collection("users");

  // Find all users that don't have a pinHash
  const usersWithoutPin = await users.find({
    $or: [
      { pinHash: { $exists: false } },
      { pinHash: null },
    ],
  }).toArray();

  if (usersWithoutPin.length === 0) {
    console.log("All users already have PINs set. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${usersWithoutPin.length} users without PINs. Generating...`);

  let updated = 0;
  const salt = await bcrypt.genSalt(10);

  for (const user of usersWithoutPin) {
    // Generate a deterministic but unique 4-digit PIN based on phone number
    // Falls back to a random one if phone is missing
    let pin;
    if (user.phone) {
      // Use last 4 digits of phone for deterministic PIN
      const phoneStr = String(user.phone);
      pin = phoneStr.slice(-4).padStart(4, "0");
    } else {
      pin = String(Math.floor(1000 + Math.random() * 9000));
    }

    const pinHash = await bcrypt.hash(pin, salt);

    await users.updateOne(
      { _id: user._id },
      { $set: { pinHash } },
    );

    console.log(`  ✓ ${user.phone || user.username || user._id} → PIN: ${pin}`);
    updated++;
  }

  console.log(`\nDone! ${updated} user(s) updated with PINs.`);
  console.log("⚠️  Write down these PINs and share them with your users securely.");
  console.log("   For security, users should change their PIN after first login.");

  await mongoose.disconnect();
}

generatePins().catch(async (error) => {
  console.error("Failed to generate PINs.");
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
