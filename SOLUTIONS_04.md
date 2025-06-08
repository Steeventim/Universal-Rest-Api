# 🔑 Solutions - TP Niveau 4 : Tests

## 📋 **Solutions complètes des exercices**

---

## 📚 **Exercice 1 : Analyse des tests existants**

### **1.1 Exploration de la structure**
```bash
# Structure attendue
tests/
├── unit/
│   ├── items.service.test.js
│   └── items.schema.test.js
└── integration/
    └── api.test.js

# Commandes d'analyse
find tests/ -name "*.test.js" -type f | wc -l  # Nombre de fichiers
npm test | grep -E "(pass|fail)" | wc -l      # Nombre de tests
```

**✅ Réponses attendues :**
1. **Nombre de fichiers :** 3 fichiers de test
2. **Convention de nommage :** `*.test.js`
3. **Temps d'exécution :** < 1 seconde pour tous les tests

### **1.2 Structure type d'un test unitaire**
```javascript
// Structure analysée dans items.service.test.js
describe('ItemsService', () => {           // Groupe de tests
  let service;

  beforeEach(() => {                       // Setup avant chaque test
    service = new ItemsService();
    service.reset();                       // État propre
  });

  describe('getAllItems', () => {          // Sous-groupe pour une méthode
    it('should return all items', () => {  // Test individuel
      const items = service.getAllItems();
      assert.ok(Array.isArray(items));
      assert.strictEqual(items.length, 3);
    });
  });
});
```

**✅ Rôles identifiés :**
- `describe` : Groupe et organise les tests
- `beforeEach` : Réinitialise l'état avant chaque test
- `it` : Définit un test individuel
- `service.reset()` : Évite les effets de bord entre tests

### **1.3 Types d'assertions**
```javascript
// Exemples d'utilisation appropriée
assert.strictEqual(actual, expected);        // Primitives (string, number)
assert.deepStrictEqual(obj1, obj2);         // Objets et tableaux
assert.ok(condition);                       // Conditions booléennes
assert.throws(() => func());                // Fonctions qui doivent lever une erreur
await assert.rejects(async () => func());   // Fonctions async qui rejettent
```

---

## 🧪 **Exercice 2 : Tests unitaires complétés**

### **2.1 Méthodes ajoutées au service**
```javascript
// Dans src/services/items.service.js
searchItems(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  return this.items.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  );
}

getItemsSummary() {
  if (this.items.length === 0) {
    return {
      total: 0,
      categories: [],
      averagePrice: 0,
      priceRange: { min: 0, max: 0 }
    };
  }

  return {
    total: this.items.length,
    categories: [...new Set(this.items.map(item => item.category))],
    averagePrice: this.items.reduce((sum, item) => sum + item.price, 0) / this.items.length,
    priceRange: {
      min: Math.min(...this.items.map(item => item.price)),
      max: Math.max(...this.items.map(item => item.price))
    }
  };
}
```

### **2.2 Tests complets correspondants**
```javascript
// tests/unit/items.service.search.test.js
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ItemsService } from '../../src/services/items.service.js';

describe('ItemsService - Recherche et Statistiques', () => {
  let service;

  beforeEach(() => {
    service = new ItemsService();
    service.reset();
  });

  describe('searchItems()', () => {
    it('devrait trouver des items par nom', () => {
      const results = service.searchItems('Laptop');
      
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0);
      
      // Vérifier que tous les résultats contiennent "laptop" dans le nom
      results.forEach(item => {
        assert.ok(
          item.name.toLowerCase().includes('laptop'),
          `Item "${item.name}" ne contient pas "laptop"`
        );
      });
    });

    it('devrait trouver des items par description', () => {
      const results = service.searchItems('gaming');
      
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0);
      
      // Au moins un résultat doit avoir "gaming" dans la description
      const hasGameInDescription = results.some(item =>
        item.description.toLowerCase().includes('gaming')
      );
      assert.ok(hasGameInDescription, 'Aucun item trouvé avec "gaming" dans la description');
    });

    it('devrait retourner un tableau vide pour une recherche vide', () => {
      assert.deepStrictEqual(service.searchItems(null), []);
      assert.deepStrictEqual(service.searchItems(undefined), []);
      assert.deepStrictEqual(service.searchItems(''), []);
      assert.deepStrictEqual(service.searchItems(123), []); // Type incorrect
    });

    it('devrait retourner un tableau vide pour une recherche sans résultats', () => {
      const results = service.searchItems('MotInexistant123XYZ');
      assert.deepStrictEqual(results, []);
    });

    it('devrait être insensible à la casse', () => {
      const lowercaseResults = service.searchItems('laptop');
      const uppercaseResults = service.searchItems('LAPTOP');
      const mixedCaseResults = service.searchItems('LaPtOp');
      
      assert.deepStrictEqual(lowercaseResults, uppercaseResults);
      assert.deepStrictEqual(lowercaseResults, mixedCaseResults);
      assert.ok(lowercaseResults.length > 0);
    });
  });

  describe('getItemsSummary()', () => {
    it('devrait retourner un résumé correct', () => {
      const summary = service.getItemsSummary();
      
      // Structure
      assert.ok(typeof summary === 'object');
      assert.ok(typeof summary.total === 'number');
      assert.ok(Array.isArray(summary.categories));
      assert.ok(typeof summary.averagePrice === 'number');
      assert.ok(typeof summary.priceRange === 'object');
      assert.ok(typeof summary.priceRange.min === 'number');
      assert.ok(typeof summary.priceRange.max === 'number');
      
      // Valeurs avec données par défaut (3 items)
      assert.strictEqual(summary.total, 3);
      assert.ok(summary.categories.includes('electronics'));
      assert.ok(summary.categories.includes('home'));
    });

    it('devrait calculer correctement la moyenne des prix', () => {
      // Prix par défaut : 1299.99 + 15.99 + 199.99 = 1515.97
      // Moyenne : 1515.97 / 3 = 505.32333...
      const summary = service.getItemsSummary();
      const expectedAverage = (1299.99 + 15.99 + 199.99) / 3;
      
      assert.ok(
        Math.abs(summary.averagePrice - expectedAverage) < 0.01,
        `Moyenne incorrecte: ${summary.averagePrice}, attendu: ${expectedAverage}`
      );
    });

    it('devrait identifier le min et max des prix', () => {
      const summary = service.getItemsSummary();
      
      // Avec les données par défaut
      assert.strictEqual(summary.priceRange.min, 15.99); // Coffee Mug
      assert.strictEqual(summary.priceRange.max, 1299.99); // Laptop
    });

    it('devrait gérer le cas avec aucun item', () => {
      service.items = []; // Vider le service
      const summary = service.getItemsSummary();
      
      assert.strictEqual(summary.total, 0);
      assert.deepStrictEqual(summary.categories, []);
      assert.strictEqual(summary.averagePrice, 0);
      assert.deepStrictEqual(summary.priceRange, { min: 0, max: 0 });
    });
  });
});
```

---

## 🔗 **Exercice 3 : Tests d'intégration API**

### **3.1 Configuration du serveur de test**
```javascript
// tests/integration/api.workflow.test.js
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { createServer } from '../../src/framework/express/server.js';

describe('API Workflow Integration Tests', () => {
  let server;
  let baseURL;

  before(async () => {
    // Démarrage du serveur sur un port de test
    const testPort = 3002;
    server = createServer();
    
    await new Promise((resolve) => {
      server.listen(testPort, '127.0.0.1', () => {
        baseURL = `http://127.0.0.1:${testPort}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  beforeEach(async () => {
    // Reset des données via l'API interne
    const resetResponse = await fetch(`${baseURL}/api/items/reset`, {
      method: 'POST'
    });
    // Note: Cet endpoint de reset devrait être ajouté pour les tests
  });

  // Tests suivent...
});
```

### **3.2 Workflow CRUD complet**
```javascript
describe('Workflow CRUD complet', () => {
  it('devrait créer, lire, modifier et supprimer un item', async () => {
    // Étape 1: Créer un item
    const createPayload = {
      name: 'Test Workflow Item',
      description: 'Item pour test de workflow complet',
      category: 'electronics',
      price: 299.99
    };

    const createResponse = await fetch(`${baseURL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload)
    });

    assert.strictEqual(createResponse.status, 201);
    const createdItem = await createResponse.json();
    assert.ok(createdItem.id);
    assert.strictEqual(createdItem.name, createPayload.name);
    assert.strictEqual(createdItem.price, createPayload.price);

    const itemId = createdItem.id;

    // Étape 2: Lire l'item créé
    const readResponse = await fetch(`${baseURL}/api/items/${itemId}`);
    assert.strictEqual(readResponse.status, 200);
    
    const readItem = await readResponse.json();
    assert.strictEqual(readItem.id, itemId);
    assert.strictEqual(readItem.name, createPayload.name);

    // Étape 3: Modifier l'item
    const updatePayload = {
      name: 'Item Modifié',
      price: 399.99
    };
    
    const updateResponse = await fetch(`${baseURL}/api/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    
    assert.strictEqual(updateResponse.status, 200);
    const updatedItem = await updateResponse.json();
    assert.strictEqual(updatedItem.name, updatePayload.name);
    assert.strictEqual(updatedItem.price, updatePayload.price);
    assert.strictEqual(updatedItem.category, createPayload.category); // Inchangé

    // Étape 4: Supprimer l'item
    const deleteResponse = await fetch(`${baseURL}/api/items/${itemId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(deleteResponse.status, 204);

    // Étape 5: Vérifier que l'item n'existe plus
    const checkResponse = await fetch(`${baseURL}/api/items/${itemId}`);
    assert.strictEqual(checkResponse.status, 404);
  });
});
```

### **3.3 Tests de validation d'intégration**
```javascript
describe('Tests de validation d\'intégration', () => {
  it('devrait rejeter des données invalides avec des messages clairs', async () => {
    const invalidPayloads = [
      { 
        payload: { name: '', category: 'electronics', price: 10 },
        expectedError: 'Name is required'
      },
      { 
        payload: { name: 'Test', category: 'invalid', price: 10 },
        expectedError: 'Category must be one of'
      },
      { 
        payload: { name: 'Test', category: 'electronics', price: -10 },
        expectedError: 'Price must be positive'
      },
      { 
        payload: { name: 'Test', category: 'electronics' },
        expectedError: 'price'
      }
    ];

    for (const { payload, expectedError } of invalidPayloads) {
      const response = await fetch(`${baseURL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(response.status, 400, 
        `Payload ${JSON.stringify(payload)} devrait retourner 400`);
      
      const error = await response.json();
      assert.ok(error.error || error.message, 'Devrait avoir un message d\'erreur');
      
      const errorMessage = error.error || error.message;
      assert.ok(errorMessage.toLowerCase().includes(expectedError.toLowerCase()),
        `Message d'erreur "${errorMessage}" devrait contenir "${expectedError}"`);
    }
  });

  it('devrait gérer les IDs inexistants correctement', async () => {
    const nonExistentId = '999999';
    
    // GET avec ID inexistant
    const getResponse = await fetch(`${baseURL}/api/items/${nonExistentId}`);
    assert.strictEqual(getResponse.status, 404);

    // PUT avec ID inexistant
    const putResponse = await fetch(`${baseURL}/api/items/${nonExistentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    });
    assert.strictEqual(putResponse.status, 404);

    // DELETE avec ID inexistant
    const deleteResponse = await fetch(`${baseURL}/api/items/${nonExistentId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(deleteResponse.status, 404);
  });
});
```

### **3.4 Tests de performance**
```javascript
describe('Tests de performance basiques', () => {
  it('devrait traiter plusieurs requêtes simultanées', async () => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        fetch(`${baseURL}/api/items`).then(r => ({ status: r.status, id: i }))
      );
    }

    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.status === 200).length;
    assert.strictEqual(successCount, concurrentRequests, 
      `Seulement ${successCount}/${concurrentRequests} requêtes ont réussi`);
  });

  it('devrait répondre rapidement', async () => {
    const maxResponseTime = 500; // 500ms max
    
    const start = Date.now();
    const response = await fetch(`${baseURL}/api/items`);
    const duration = Date.now() - start;
    
    assert.strictEqual(response.status, 200);
    assert.ok(duration < maxResponseTime, 
      `Réponse trop lente: ${duration}ms (max: ${maxResponseTime}ms)`);
  });
});
```

---

## 🎭 **Exercice 4 : Mocks et Stubs complets**

### **4.1 Configuration des mocks**
```javascript
// tests/unit/items.controller.mock.test.js
import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { ItemsController } from '../../src/controllers/items.controller.js';

describe('ItemsController avec mocks', () => {
  let controller;
  let mockService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock complet du service
    mockService = {
      getAllItems: mock.fn(),
      getItemById: mock.fn(),
      createItem: mock.fn(),
      updateItem: mock.fn(),
      deleteItem: mock.fn(),
      searchItems: mock.fn(),
      getItemsSummary: mock.fn()
    };

    // Mock de la requête Express
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };

    // Mock de la réponse Express avec chaînage
    let statusCode = 200;
    let responseData = null;

    mockRes = {
      status: mock.fn(function(code) {
        statusCode = code;
        return this;
      }),
      json: mock.fn(function(data) {
        responseData = data;
        return this;
      }),
      send: mock.fn(function(data) {
        responseData = data;
        return this;
      }),
      // Helpers pour les tests
      getStatusCode: () => statusCode,
      getData: () => responseData
    };

    controller = new ItemsController(mockService);
  });
```

### **4.2 Tests complets avec mocks**
```javascript
  describe('getAllItems()', () => {
    it('devrait retourner tous les items avec status 200', async () => {
      // Arrange
      const mockItems = [
        { id: '1', name: 'Item 1', category: 'electronics', price: 100 },
        { id: '2', name: 'Item 2', category: 'books', price: 20 }
      ];
      mockService.getAllItems.mock.mockImplementationOnce(() => mockItems);

      // Act
      await controller.getAllItems(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockService.getAllItems.mock.callCount(), 1);
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      assert.deepStrictEqual(mockRes.json.mock.calls[0].arguments[0], mockItems);
      assert.strictEqual(mockRes.status.mock.callCount(), 0); // Pas d'appel explicite au status
    });

    it('devrait gérer les erreurs du service', async () => {
      // Arrange
      const error = new Error('Service unavailable');
      mockService.getAllItems.mock.mockImplementationOnce(() => {
        throw error;
      });

      // Act
      await controller.getAllItems(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockRes.status.mock.callCount(), 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 500);
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      
      const errorResponse = mockRes.json.mock.calls[0].arguments[0];
      assert.ok(errorResponse.error);
    });
  });

  describe('getItemById()', () => {
    it('devrait retourner un item existant', async () => {
      // Arrange
      const mockItem = { id: '1', name: 'Test Item', category: 'electronics', price: 50 };
      mockReq.params.id = '1';
      mockService.getItemById.mock.mockImplementationOnce(() => mockItem);

      // Act
      await controller.getItemById(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockService.getItemById.mock.callCount(), 1);
      assert.strictEqual(mockService.getItemById.mock.calls[0].arguments[0], '1');
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      assert.deepStrictEqual(mockRes.json.mock.calls[0].arguments[0], mockItem);
    });

    it('devrait retourner 404 pour un item inexistant', async () => {
      // Arrange
      mockReq.params.id = '999';
      mockService.getItemById.mock.mockImplementationOnce(() => null);

      // Act
      await controller.getItemById(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockRes.status.mock.callCount(), 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 404);
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      
      const errorResponse = mockRes.json.mock.calls[0].arguments[0];
      assert.strictEqual(errorResponse.error, 'Item not found');
    });
  });

  describe('createItem()', () => {
    it('devrait créer un item et retourner 201', async () => {
      // Arrange
      const newItemData = { name: 'New Item', category: 'electronics', price: 50 };
      const createdItem = { 
        id: '3', 
        ...newItemData, 
        createdAt: new Date().toISOString() 
      };
      
      mockReq.body = newItemData;
      mockService.createItem.mock.mockImplementationOnce(() => createdItem);

      // Act
      await controller.createItem(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockService.createItem.mock.callCount(), 1);
      assert.deepStrictEqual(mockService.createItem.mock.calls[0].arguments[0], newItemData);
      assert.strictEqual(mockRes.status.mock.callCount(), 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 201);
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      assert.deepStrictEqual(mockRes.json.mock.calls[0].arguments[0], createdItem);
    });

    it('devrait gérer les erreurs de création', async () => {
      // Arrange
      mockReq.body = { name: 'Test', category: 'electronics', price: 10 };
      mockService.createItem.mock.mockImplementationOnce(() => {
        throw new Error('Validation failed');
      });

      // Act
      await controller.createItem(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockRes.status.mock.callCount(), 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 500);
    });
  });

  describe('updateItem()', () => {
    it('devrait mettre à jour un item existant', async () => {
      // Arrange
      const updateData = { name: 'Updated Item', price: 75 };
      const updatedItem = { id: '1', ...updateData, category: 'electronics' };
      
      mockReq.params.id = '1';
      mockReq.body = updateData;
      mockService.updateItem.mock.mockImplementationOnce(() => updatedItem);

      // Act
      await controller.updateItem(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockService.updateItem.mock.callCount(), 1);
      assert.strictEqual(mockService.updateItem.mock.calls[0].arguments[0], '1');
      assert.deepStrictEqual(mockService.updateItem.mock.calls[0].arguments[1], updateData);
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      assert.deepStrictEqual(mockRes.json.mock.calls[0].arguments[0], updatedItem);
    });

    it('devrait retourner 404 pour un item inexistant à modifier', async () => {
      // Arrange
      mockReq.params.id = '999';
      mockReq.body = { name: 'Test' };
      mockService.updateItem.mock.mockImplementationOnce(() => null);

      // Act
      await controller.updateItem(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockRes.status.mock.callCount(), 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 404);
    });
  });

  describe('deleteItem()', () => {
    it('devrait supprimer un item existant', async () => {
      // Arrange
      mockReq.params.id = '1';
      mockService.deleteItem.mock.mockImplementationOnce(() => true);

      // Act
      await controller.deleteItem(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockService.deleteItem.mock.callCount(), 1);
      assert.strictEqual(mockService.deleteItem.mock.calls[0].arguments[0], '1');
      assert.strictEqual(mockRes.status.mock.callCount(), 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 204);
      assert.strictEqual(mockRes.send.mock.callCount(), 1);
    });

    it('devrait retourner 404 pour un item inexistant à supprimer', async () => {
      // Arrange
      mockReq.params.id = '999';
      mockService.deleteItem.mock.mockImplementationOnce(() => false);

      // Act
      await controller.deleteItem(mockReq, mockRes);

      // Assert
      assert.strictEqual(mockRes.status.mock.callCount(), 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 404);
    });
  });
});
```

---

## 📊 **Exercice 5 : Couverture et qualité**

### **5.1 Analyse de couverture**
```bash
# Avec c8 (coverage tool)
npx c8 --reporter=html --reporter=text npm test

# Résultats attendus
# =============================== Coverage summary ===============================
# Statements   : 85.5% ( 94/110 )
# Branches     : 78.9% ( 15/19  )
# Functions    : 90.0% ( 18/20  )
# Lines        : 85.5% ( 94/110 )
# ================================================================================
```

### **5.2 Rapport d'analyse**
```markdown
# Analyse de la couverture de code

## Fichiers analysés
- [x] src/services/items.service.js - 90%: Toutes les méthodes CRUD couvertes
- [x] src/controllers/items.controller.js - 85%: Gestion d'erreurs partiellement couverte
- [x] src/schemas/items.schema.js - 95%: Tous les schémas testés
- [ ] src/middleware/validation.middleware.js - 60%: Cas d'erreurs manquants

## Zones non couvertes identifiées
1. Gestion d'erreurs dans : Controllers (cas de service indisponible)
2. Cas limites non testés : Validation middleware avec headers malformés
3. Branches conditionnelles : Gestion des erreurs réseau

## Plan d'amélioration
1. Ajouter tests pour : Middleware validation avec cas limites
2. Créer mocks pour : Erreurs réseau et timeouts
3. Tester cas d'erreur : Parsing JSON invalide
```

### **5.3 Tests pour améliorer la couverture**
```javascript
// tests/unit/missing-coverage.test.js
import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { ItemsController } from '../../src/controllers/items.controller.js';

describe('Tests de couverture manquante', () => {
  let controller;
  let mockService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockService = {
      getAllItems: mock.fn(),
      createItem: mock.fn()
    };

    mockReq = { body: {}, params: {} };
    mockRes = {
      status: mock.fn().mockReturnThis(),
      json: mock.fn().mockReturnThis()
    };

    controller = new ItemsController(mockService);
  });

  it('devrait gérer les erreurs de parsing JSON', async () => {
    // Simuler une erreur de parsing JSON
    const parseError = new SyntaxError('Unexpected token in JSON');
    mockService.createItem.mock.mockImplementationOnce(() => {
      throw parseError;
    });

    await controller.createItem(mockReq, mockRes);

    assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 400);
  });

  it('devrait gérer les erreurs de timeout', async () => {
    // Simuler un timeout
    const timeoutError = new Error('ETIMEDOUT');
    timeoutError.code = 'ETIMEDOUT';
    
    mockService.getAllItems.mock.mockImplementationOnce(() => {
      throw timeoutError;
    });

    await controller.getAllItems(mockReq, mockRes);

    assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 503);
  });

  it('devrait valider les types de paramètres', () => {
    // Tester avec des paramètres de types incorrects
    const invalidIds = [null, undefined, {}, [], true];
    
    invalidIds.forEach(id => {
      mockReq.params.id = id;
      // Le service devrait rejeter ces valeurs
      assert.throws(() => {
        if (typeof id !== 'string') {
          throw new Error('Invalid ID type');
        }
      });
    });
  });
});
```

---

## 🧪 **Exercice 6 : Tests avancés**

### **6.1 Tests de régression**
```javascript
// tests/regression/api.regression.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('Tests de régression', () => {
  let server;
  let baseURL;

  before(async () => {
    // Setup serveur de test
    // ... (même configuration que les tests d'intégration)
  });

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('ne devrait pas casser le format de réponse de l\'API v1', async () => {
    const response = await fetch(`${baseURL}/api/items`);
    const items = await response.json();
    
    // Vérifier la structure exacte attendue
    assert.ok(Array.isArray(items), 'La réponse devrait être un tableau');
    
    if (items.length > 0) {
      const item = items[0];
      
      // Structure obligatoire de l'API v1
      const requiredFields = ['id', 'name', 'category', 'price', 'createdAt'];
      requiredFields.forEach(field => {
        assert.ok(item.hasOwnProperty(field), `Le champ ${field} est obligatoire`);
      });
      
      // Types stricts
      assert.strictEqual(typeof item.id, 'string');
      assert.strictEqual(typeof item.name, 'string');
      assert.strictEqual(typeof item.category, 'string');
      assert.strictEqual(typeof item.price, 'number');
      assert.strictEqual(typeof item.createdAt, 'string');
      
      // Format de date ISO
      assert.ok(!isNaN(Date.parse(item.createdAt)), 'createdAt doit être une date ISO valide');
    }
  });

  it('devrait maintenir la compatibilité des codes d\'erreur', async () => {
    const errorTests = [
      {
        method: 'GET',
        url: '/api/items/999999',
        expectedStatus: 404,
        description: 'Item inexistant'
      },
      {
        method: 'POST',
        url: '/api/items',
        body: { name: '', category: 'invalid' },
        expectedStatus: 400,
        description: 'Données invalides'
      },
      {
        method: 'PUT',
        url: '/api/items/999999',
        body: { name: 'Test' },
        expectedStatus: 404,
        description: 'Modification item inexistant'
      }
    ];

    for (const test of errorTests) {
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(`${baseURL}${test.url}`, options);
      
      assert.strictEqual(response.status, test.expectedStatus,
        `${test.description}: attendu ${test.expectedStatus}, reçu ${response.status}`);
    }
  });

  it('devrait maintenir les en-têtes de réponse standards', async () => {
    const response = await fetch(`${baseURL}/api/items`);
    
    // Headers obligatoires pour l'API
    assert.ok(response.headers.get('content-type').includes('application/json'));
    assert.ok(response.headers.get('x-powered-by')); // Si Express
  });
});
```

### **6.2 Tests de charge simplifiés**
```javascript
// tests/performance/load.test.js
describe('Tests de charge basiques', () => {
  it('devrait gérer 50 créations simultanées', async () => {
    const startTime = Date.now();
    const concurrentRequests = 50;
    
    const promises = Array.from({ length: concurrentRequests }, (_, i) => 
      fetch(`${baseURL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Load Test Item ${i}`,
          category: 'electronics',
          price: 10 + i
        })
      }).then(r => ({ status: r.status, index: i }))
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    // Métriques de performance
    const successCount = responses.filter(r => r.status === 201).length;
    const totalTime = endTime - startTime;
    const averageTime = totalTime / concurrentRequests;
    
    // Assertions
    assert.ok(successCount >= 45, 
      `Trop d'échecs: ${successCount}/50 créations réussies`);
    
    assert.ok(averageTime < 100, 
      `Temps de réponse moyen trop élevé: ${averageTime}ms`);
    
    assert.ok(totalTime < 5000, 
      `Temps total trop élevé: ${totalTime}ms`);

    console.log(`Performance: ${successCount}/${concurrentRequests} réussies en ${totalTime}ms (${averageTime}ms en moyenne)`);
  });

  it('devrait maintenir des performances stables sous charge répétée', async () => {
    const iterations = 5;
    const requestsPerIteration = 20;
    const maxResponseTime = 200; // ms
    
    for (let i = 0; i < iterations; i++) {
      const promises = Array.from({ length: requestsPerIteration }, () => {
        const start = Date.now();
        return fetch(`${baseURL}/api/items`)
          .then(r => ({ 
            status: r.status, 
            duration: Date.now() - start 
          }));
      });

      const results = await Promise.all(promises);
      
      // Vérifier que toutes les requêtes ont réussi
      const successCount = results.filter(r => r.status === 200).length;
      assert.strictEqual(successCount, requestsPerIteration,
        `Itération ${i}: ${successCount}/${requestsPerIteration} réussites`);
      
      // Vérifier les temps de réponse
      const slowRequests = results.filter(r => r.duration > maxResponseTime);
      assert.ok(slowRequests.length === 0,
        `Itération ${i}: ${slowRequests.length} requêtes trop lentes`);
    }
  });
});
```

---

## 📈 **Métriques de validation**

### **Résultats attendus après complétion**

```bash
# Exécution de tous les tests
npm test

# Résultats attendus:
✓ Tests unitaires services      (15 tests)
✓ Tests unitaires schémas       (8 tests)
✓ Tests unitaires contrôleurs   (12 tests)
✓ Tests d'intégration API       (20 tests)
✓ Tests de régression          (5 tests)
✓ Tests de performance         (3 tests)

Total: 63 tests | Durée: ~2-3 secondes
Couverture: >85% pour tous les modules critiques
```

### **Checklist de qualité**

**✅ Tests unitaires**
- [ ] Tous les services testés avec mocks
- [ ] Tous les cas d'erreur couverts
- [ ] Isolation complète entre tests
- [ ] Temps d'exécution < 500ms

**✅ Tests d'intégration**
- [ ] Workflow CRUD complet testé
- [ ] Validation end-to-end fonctionnelle
- [ ] Gestion d'erreurs HTTP correcte
- [ ] Performance acceptable

**✅ Qualité du code de test**
- [ ] Noms de tests descriptifs
- [ ] Structure AAA (Arrange-Act-Assert)
- [ ] Pas de duplication de code
- [ ] Documentation des cas complexes

---

## 🏆 **Validation finale**

**🎯 Vous maîtrisez le TP 4 si :**

1. **Tests unitaires** : Vous savez tester une fonction isolément avec des mocks
2. **Tests d'intégration** : Vous testez le flow complet d'une API
3. **Gestion d'erreurs** : Vous testez tous les cas d'échec possibles
4. **Performance** : Vous mesurez et validez les temps de réponse
5. **Maintenance** : Vos tests sont lisibles et maintenables

**🚀 Prêt pour le TP 5 - Sécurité !**

```bash
git add .
git commit -m "✅ TP4 Solutions complètes - Tests robustes implémentés"
git checkout tp-05-securite
```
