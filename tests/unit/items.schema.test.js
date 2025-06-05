import { test, describe } from "node:test";
import assert from "node:assert";
import {
  createItemSchema,
  updateItemSchema,
} from "../../src/schemas/items.schema.js";

describe("Items Schema Validation Tests", () => {
  describe("createItemSchema", () => {
    test("should validate correct item data", () => {
      const validItem = {
        name: "Test Item",
        description: "Test Description",
        price: 29.99,
        category: "electronics",
      };

      const result = createItemSchema.safeParse(validItem);
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.data, validItem);
    });

    test("should reject item with empty name", () => {
      const invalidItem = {
        name: "",
        description: "Test Description",
        price: 29.99,
        category: "electronics",
      };

      const result = createItemSchema.safeParse(invalidItem);
      assert.strictEqual(result.success, false);
    });

    test("should reject item with negative price", () => {
      const invalidItem = {
        name: "Test Item",
        description: "Test Description",
        price: -10,
        category: "electronics",
      };

      const result = createItemSchema.safeParse(invalidItem);
      assert.strictEqual(result.success, false);
    });

    test("should reject item with invalid category", () => {
      const invalidItem = {
        name: "Test Item",
        description: "Test Description",
        price: 29.99,
        category: "invalid-category",
      };

      const result = createItemSchema.safeParse(invalidItem);
      assert.strictEqual(result.success, false);
    });

    test("should reject item missing required fields", () => {
      const invalidItem = {
        name: "Test Item",
        // Missing description, price, category
      };

      const result = createItemSchema.safeParse(invalidItem);
      assert.strictEqual(result.success, false);
    });
  });

  describe("updateItemSchema", () => {
    test("should validate partial update data", () => {
      const validUpdate = {
        name: "Updated Item",
      };

      const result = updateItemSchema.safeParse(validUpdate);
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.data, validUpdate);
    });

    test("should validate complete update data", () => {
      const validUpdate = {
        name: "Updated Item",
        description: "Updated Description",
        price: 39.99,
        category: "books",
      };

      const result = updateItemSchema.safeParse(validUpdate);
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.data, validUpdate);
    });

    test("should reject empty update data", () => {
      const invalidUpdate = {};

      const result = updateItemSchema.safeParse(invalidUpdate);
      assert.strictEqual(result.success, false);
    });

    test("should reject update with negative price", () => {
      const invalidUpdate = {
        price: -5,
      };

      const result = updateItemSchema.safeParse(invalidUpdate);
      assert.strictEqual(result.success, false);
    });
  });
});
