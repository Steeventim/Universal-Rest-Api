// Simulation d'une base de données en mémoire
const initialItems = [
  {
    id: "1",
    name: "Item 1",
    description: "Description 1",
    price: 10.99,
    category: "electronics",
  },
  {
    id: "2",
    name: "Item 2",
    description: "Description 2",
    price: 25.5,
    category: "books",
  },
];

let items = [...initialItems];

class ItemsService {
  async getAllItems() {
    return items;
  }

  async getItemById(id) {
    const item = items.find((item) => item.id === id);
    if (!item) {
      return null;
    }
    return item;
  }

  async createItem(itemData) {
    const newItem = {
      id: (items.length + 1).toString(),
      ...itemData,
    };
    items.push(newItem);
    return newItem;
  }

  async updateItem(id, itemData) {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    items[index] = { ...items[index], ...itemData };
    return items[index];
  }

  async deleteItem(id) {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    const deletedItem = items[index];
    items.splice(index, 1);
    return true;
  }

  // Méthode pour réinitialiser les données (utile pour les tests)
  reset() {
    items = [...initialItems];
  }
}

export default ItemsService;
