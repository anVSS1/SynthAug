// Simple diagnostic script to check the backend configuration
// Run with: node check-backend.js

const fs = require("fs");
const path = require("path");

console.log("🔍 SynthAug Backend Configuration Checker\n");
console.log("=".repeat(50));

// Check if .env file exists
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, ".env.example");

console.log("\n1️⃣  Checking .env file...");
if (!fs.existsSync(envPath)) {
  console.log("   ❌ .env file NOT FOUND!");
  console.log("   ➡️  Action: Copy .env.example to .env");
  if (fs.existsSync(envExamplePath)) {
    console.log(
      "   ➡️  Command: copy .env.example .env (Windows) or cp .env.example .env (Mac/Linux)",
    );
  }
  process.exit(1);
} else {
  console.log("   ✅ .env file exists");
}

// Load environment variables
require("dotenv").config();

// Check required environment variables
console.log("\n2️⃣  Checking environment variables...");

const requiredVars = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
};

let hasErrors = false;

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value.includes("your_") || value.includes("your-")) {
    console.log(`   ❌ ${key}: NOT CONFIGURED (example value detected)`);
    hasErrors = true;
  } else if (value.includes("placeholder")) {
    console.log(`   ⚠️  ${key}: Still has placeholder value`);
    console.log(`       Current: ${value}`);
    if (key === "AI_ENGINE_URL") {
      console.log(
        "       ➡️  Update this with your Ngrok URL from Google Colab",
      );
    }
  } else {
    // Mask sensitive values
    const displayValue =
      key === "JWT_SECRET"
        ? "*".repeat(value.length)
        : key === "MONGO_URI"
          ? value.substring(0, 20) + "..." + value.substring(value.length - 20)
          : value;
    console.log(`   ✅ ${key}: ${displayValue}`);
  }
}

// Check MongoDB URI format
console.log("\n3️⃣  Validating MongoDB URI...");
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  if (
    mongoUri.startsWith("mongodb+srv://") ||
    mongoUri.startsWith("mongodb://")
  ) {
    console.log("   ✅ MongoDB URI format looks correct");

    // Check for common issues
    if (mongoUri.includes("<password>")) {
      console.log("   ❌ Replace <password> with your actual password!");
      hasErrors = true;
    }
    if (mongoUri.includes("<username>")) {
      console.log("   ❌ Replace <username> with your actual username!");
      hasErrors = true;
    }
  } else {
    console.log("   ❌ MongoDB URI format is invalid");
    console.log("       Should start with mongodb:// or mongodb+srv://");
    hasErrors = true;
  }
}

// Check JWT Secret strength
console.log("\n4️⃣  Checking JWT Secret...");
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length < 32) {
    console.log(`   ⚠️  JWT_SECRET is too short (${jwtSecret.length} chars)`);
    console.log("       Recommended: At least 32 characters");
    console.log("       Generate one with: openssl rand -base64 32");
  } else {
    console.log(`   ✅ JWT_SECRET length is good (${jwtSecret.length} chars)`);
  }
}

// Check AI Engine URLs
console.log("\n5️⃣  Checking AI Engine URLs...");
const aiUrl = process.env.AI_ENGINE_URL;
const tabularUrl = process.env.TABULAR_ENGINE_URL;

if (!aiUrl && !tabularUrl) {
  console.log("   ❌ No AI engine URL configured");
  console.log(
    "       Set AI_ENGINE_URL for image projects or TABULAR_ENGINE_URL for tabular projects",
  );
  hasErrors = true;
} else {
  if (aiUrl) {
    if (aiUrl.includes("ngrok")) {
      console.log("   ✅ AI_ENGINE_URL: Ngrok URL detected");
      console.log("   ⚠️  Remember: Ngrok URLs change when you restart Colab!");
    } else if (aiUrl.includes("placeholder")) {
      console.log("   ⚠️  AI_ENGINE_URL: Still using placeholder URL");
      console.log("       Update this after starting Google Colab notebook");
    } else {
      console.log("   ✅ AI_ENGINE_URL: Custom URL configured");
    }
  }

  if (tabularUrl) {
    console.log("   ✅ TABULAR_ENGINE_URL configured");
  }
}

// Check AI Engine Secret
console.log("\n6️⃣  Checking AI Engine Secret...");
if (process.env.AI_ENGINE_SECRET) {
  console.log("   ✅ AI_ENGINE_SECRET configured");
} else {
  console.log("   ⚠️  AI_ENGINE_SECRET is not set");
  console.log("       Recommended to secure /api/proxy/:projectId/webhook");
}

// Check port
console.log("\n7️⃣  Checking port configuration...");
const port = process.env.PORT || 5000;
console.log(`   ✅ Server will run on port ${port}`);

// Check if node_modules exists
console.log("\n8️⃣  Checking dependencies...");
const nodeModulesPath = path.join(__dirname, "node_modules");
if (!fs.existsSync(nodeModulesPath)) {
  console.log("   ❌ node_modules NOT FOUND!");
  console.log('   ➡️  Action: Run "npm install"');
  hasErrors = true;
} else {
  console.log("   ✅ node_modules exists");
}

// Final summary
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.log("❌ Configuration has ERRORS - please fix them before starting");
  console.log("\nNext steps:");
  console.log("1. Fix the errors listed above");
  console.log("2. Run this script again: node check-backend.js");
  console.log("3. Once all checks pass, start the server: npm start");
  process.exit(1);
} else {
  console.log("✅ Configuration looks GOOD!");
  console.log("\nNext steps:");
  console.log("1. Start the backend: npm start");
  console.log("2. Set up Google Colab with your Ngrok token");
  console.log("3. Run all cells in colab_backend.ipynb");
  console.log("4. Update AI_ENGINE_URL with the Ngrok URL");
  console.log("5. Restart the backend");
  console.log("6. Start the frontend: cd client && npm run dev");
  process.exit(0);
}
