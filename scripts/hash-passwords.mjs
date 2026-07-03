import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const cwd = process.cwd();

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

// Load env variables
loadEnvFile(path.join(cwd, ".env"));
loadEnvFile(path.join(cwd, ".env.local"));

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "milkman";

if (!mongoUri) {
  console.error("Missing MONGODB_URI. Add it to .env or .env.local.");
  process.exit(1);
}

async function runMigration() {
  console.log(`Connecting to MongoDB at: ${mongoUri.split("@")[1] || mongoUri} (DB: ${dbName})...`);
  await mongoose.connect(mongoUri, {
    dbName,
    bufferCommands: false,
  });

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  console.log("Connected. Querying users...");
  const users = await usersCollection.find({}).toArray();
  console.log(`Found ${users.length} users in the database.`);

  let updatedCount = 0;
  for (const user of users) {
    let passwordHash = user.passwordHash;
    let shouldUpdate = false;

    // Detect plain text passwords or seeded passwords
    if (passwordHash && (passwordHash === "seeded-password" || passwordHash === "seeded-super-admin" || !passwordHash.startsWith("$2a$"))) {
      let plainTextPassword = "password123"; // default for customers
      if (passwordHash === "seeded-super-admin") {
        plainTextPassword = "admin123";
      } else if (passwordHash === "seeded-password") {
        plainTextPassword = "password123";
      } else {
        plainTextPassword = passwordHash; // convert whatever plain-text to hash
      }

      console.log(`Hashing password for user: ${user.phone} (${user.role})...`);
      passwordHash = await bcrypt.hash(plainTextPassword, 10);
      shouldUpdate = true;
    }

    // Set the username for the SUPER_ADMIN to allow username login
    let username = user.username;
    if (user.role === "SUPER_ADMIN" && !username) {
      username = "superadmin";
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { passwordHash, username, updatedAt: new Date() } }
      );
      updatedCount++;
    }
  }
  console.log(`Updated/hashed passwords for ${updatedCount} users.`);

  // Create default admin user if none exists
  const adminUsername = "admin";
  const defaultAdmin = await usersCollection.findOne({ username: adminUsername });

  if (!defaultAdmin) {
    console.log(`Creating default admin user with username: "${adminUsername}" and password: "admin123"...`);
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);

    await usersCollection.updateOne(
      { phone: "9999999999" },
      {
        $set: {
          username: adminUsername,
          passwordHash: hashedAdminPassword,
          role: "ADMIN",
          name: {
            en: "Admin",
            hi: "एडमिन",
            pa: "ਐਡਮਿਨ"
          },
          phone: "9999999999",
          email: "admin@milkman.local",
          preferredLanguage: "en",
          status: "ACTIVE",
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log("Default admin user created/updated successfully.");
  } else {
    console.log(`Admin user with username: "${adminUsername}" already exists.`);
  }

  await mongoose.disconnect();
  console.log("Migration completed successfully.");
}

runMigration().catch(async (error) => {
  console.error("Migration failed:");
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
