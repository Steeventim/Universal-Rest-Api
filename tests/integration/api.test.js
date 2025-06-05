import { test, describe } from "node:test";
import assert from "node:assert";

describe("API Integration Tests", () => {
  const baseUrl = "http://localhost:3001";

  test("GET /api/items should return items list", async () => {
    const response = await fetch(`${baseUrl}/api/items`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert(Array.isArray(data.data));
  });

  test("GET /api/items/:id should return specific item", async () => {
    // Create a test item first
    const testItem = {
      name: "Test Item for GET",
      description: "Test Description",
      price: 19.99,
      category: "electronics",
    };

    const createResponse = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testItem),
    });

    const createData = await createResponse.json();
    const itemId = createData.data.id;

    // Now test GET
    const response = await fetch(`${baseUrl}/api/items/${itemId}`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.id, itemId);
  });

  test("GET /api/items/:id should return 404 for non-existent item", async () => {
    const response = await fetch(`${baseUrl}/api/items/999`);
    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
  });

  test("POST /api/items should create new item", async () => {
    const newItem = {
      name: "Test Item",
      description: "Test Description",
      price: 19.99,
      category: "electronics",
    };

    const response = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, newItem.name);
  });

  test("POST /api/items should validate input data", async () => {
    const invalidItem = {
      name: "", // Invalid: empty name
      price: -10, // Invalid: negative price
    };

    const response = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidItem),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.success, false);
    assert(data.errors && data.errors.length > 0);
  });

  test("PUT /api/items/:id should update item", async () => {
    // Create a test item first
    const testItem = {
      name: "Test Item for UPDATE",
      description: "Test Description",
      price: 19.99,
      category: "electronics",
    };

    const createResponse = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testItem),
    });

    const createData = await createResponse.json();
    const itemId = createData.data.id;

    const updateData = {
      name: "Updated Item",
      description: "Updated Description",
      price: 29.99,
      category: "books",
    };

    const response = await fetch(`${baseUrl}/api/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, updateData.name);
  });

  test("DELETE /api/items/:id should delete item", async () => {
    // Create a test item first
    const testItem = {
      name: "Test Item for DELETE",
      description: "Test Description",
      price: 19.99,
      category: "electronics",
    };

    const createResponse = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testItem),
    });

    const createData = await createResponse.json();
    const itemId = createData.data.id;

    const response = await fetch(`${baseUrl}/api/items/${itemId}`, {
      method: "DELETE",
    });

    assert.strictEqual(response.status, 204);
  });

  test("Swagger documentation should be accessible", async () => {
    const response = await fetch(`${baseUrl}/docs`);

    assert.strictEqual(response.status, 200);
    assert(response.headers.get("content-type")?.includes("text/html"));
  });
});
