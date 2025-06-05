#!/usr/bin/env node

import { strict as assert } from "assert";

console.log("🧪 Running API validation tests...\n");

const BASE_URL = "http://localhost:3001";

// Test API endpoint
async function testAPI() {
  try {
    console.log("📡 Testing GET /api/items...");
    const response = await fetch(`${BASE_URL}/api/items`);
    const data = await response.json();

    assert.strictEqual(response.status, 200, "Status should be 200");
    assert.strictEqual(data.success, true, "Response should be successful");
    assert(Array.isArray(data.data), "Data should be an array");
    console.log("✅ GET /api/items - PASSED");

    console.log("\n📡 Testing POST /api/items...");
    const newItem = {
      name: "Test Item",
      description: "Test Description",
      price: 29.99,
      category: "electronics",
    };

    const postResponse = await fetch(`${BASE_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });

    const postData = await postResponse.json();

    assert.strictEqual(postResponse.status, 201, "Status should be 201");
    assert.strictEqual(postData.success, true, "Response should be successful");
    assert(postData.data.id, "Created item should have an ID");
    console.log("✅ POST /api/items - PASSED");

    console.log("\n📡 Testing GET /docs (Swagger)...");
    const docsResponse = await fetch(`${BASE_URL}/docs`);
    assert.strictEqual(
      docsResponse.status,
      200,
      "Swagger docs should be accessible"
    );
    console.log("✅ GET /docs - PASSED");

    console.log("\n🎉 All tests passed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Test validation schemas
async function testValidation() {
  try {
    console.log("\n📋 Testing validation...");

    const invalidItem = {
      name: "", // Should fail - empty name
      description: "Test",
      price: -10, // Should fail - negative price
      category: "invalid", // Should fail - invalid category
    };

    const response = await fetch(`${BASE_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidItem),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 400, "Invalid data should return 400");
    assert.strictEqual(data.success, false, "Response should indicate failure");
    console.log("✅ Validation test - PASSED");
  } catch (error) {
    console.error("❌ Validation test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
testAPI().then(() => testValidation());
