import { test, describe } from "node:test";
import assert from "node:assert";
import ItemsService from "../../src/services/items.service.js";

describe("ItemsService Unit Tests", () => {
  let itemsService;

  test("should create ItemsService instance", () => {
    itemsService = new ItemsService();
    assert(itemsService instanceof ItemsService);
  });

  test("getAllItems should return array of items", async () => {
    const items = await itemsService.getAllItems();
    assert(Array.isArray(items));
    assert(items.length >= 0);
  });

  test("getItemById should return item when exists", async () => {
    const item = await itemsService.getItemById("1");
    assert(item !== null);
    assert.strictEqual(item.id, "1");
  });

  test("getItemById should return null when item does not exist", async () => {
    const item = await itemsService.getItemById("999");
    assert.strictEqual(item, null);
  });

  test("createItem should add new item and return it", async () => {
    const newItemData = {
      name: "Test Item",
      description: "Test Description",
      price: 25.99,
      category: "electronics",
    };

    const createdItem = await itemsService.createItem(newItemData);

    assert(createdItem.id);
    assert.strictEqual(createdItem.name, newItemData.name);
    assert.strictEqual(createdItem.description, newItemData.description);
    assert.strictEqual(createdItem.price, newItemData.price);
    assert.strictEqual(createdItem.category, newItemData.category);
  });

  test("updateItem should modify existing item", async () => {
    const updateData = {
      name: "Updated Item",
      description: "Updated Description",
      price: 35.99,
      category: "books",
    };

    const updatedItem = await itemsService.updateItem("1", updateData);

    assert.strictEqual(updatedItem.id, "1");
    assert.strictEqual(updatedItem.name, updateData.name);
    assert.strictEqual(updatedItem.description, updateData.description);
    assert.strictEqual(updatedItem.price, updateData.price);
    assert.strictEqual(updatedItem.category, updateData.category);
  });

  test("updateItem should return null for non-existent item", async () => {
    const updateData = {
      name: "Updated Item",
      description: "Updated Description",
      price: 35.99,
      category: "books",
    };

    const result = await itemsService.updateItem("999", updateData);
    assert.strictEqual(result, null);
  });

  test("deleteItem should remove item and return true when exists", async () => {
    const result = await itemsService.deleteItem("2");
    assert.strictEqual(result, true);

    // Verify item was deleted
    const deletedItem = await itemsService.getItemById("2");
    assert.strictEqual(deletedItem, null);
  });

  test("deleteItem should return false for non-existent item", async () => {
    const result = await itemsService.deleteItem("999");
    assert.strictEqual(result, false);
  });
});
