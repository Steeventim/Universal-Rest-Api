# 📝 Exercices - TP Niveau 4 : Tests

## 🎯 **Objectif**

Maîtriser l'écriture de tests robustes pour une API REST avec Node.js Test Runner.

---

## 📚 **Exercice 1 : Analyse des tests existants**

### **1.1 Exploration de la structure**

```bash
# Voir la structure des tests
find tests/ -name "*.test.js" -type f

# Exécuter tous les tests
npm test

# Voir le détail des tests unitaires
npm run test:unit -- --reporter=verbose
```

**❓ Questions d'analyse :**

1. Combien de fichiers de test existent ? ****\_\_\_****
2. Quelle est la convention de nommage ? ****\_\_\_****
3. Temps total d'exécution des tests ? ****\_\_\_****

### **1.2 Analyser un test unitaire**

Ouvrez `tests/unit/items.service.test.js` :

```javascript
// Analysez cette structure
describe("ItemsService", () => {
  let service;

  beforeEach(() => {
    service = new ItemsService();
    service.reset();
  });

  describe("getAllItems", () => {
    it("should return all items", () => {
      // Test implementation
    });
  });
});
```

**📝 Notez :**

- Rôle de `describe` : ****\_\_\_****
- Rôle de `beforeEach` : ****\_\_\_****
- Rôle de `it` : ****\_\_\_****
- Pourquoi `service.reset()` ? ****\_\_\_****

### **1.3 Comprendre les assertions**

Analysez ces exemples d'assertions :

```javascript
// Égalité stricte
assert.strictEqual(result, expected);

// Égalité profonde d'objets
assert.deepStrictEqual(actual, expected);

// Vérification booléenne
assert.ok(condition);

// Vérification d'erreur
assert.throws(() => functionThatShouldThrow());

// Vérification asynchrone
await assert.rejects(async () => await functionThatShouldReject());
```

**❓ Quand utiliser chaque type ?**

- `strictEqual` : ****\_\_\_****
- `deepStrictEqual` : ****\_\_\_****
- `ok` : ****\_\_\_****

---

## 🧪 **Exercice 2 : Compléter les tests unitaires**

### **2.1 Tester une nouvelle méthode**

Ajoutez d'abord cette méthode dans `src/services/items.service.js` :

```javascript
// Dans la classe ItemsService
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

### **2.2 Créer les tests correspondants**

Créez `tests/unit/items.service.search.test.js` :

```javascript
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { ItemsService } from "../../src/services/items.service.js";

describe("ItemsService - Recherche et Statistiques", () => {
  let service;

  beforeEach(() => {
    service = new ItemsService();
    service.reset(); // Données par défaut
  });

  describe("searchItems()", () => {
    it("devrait trouver des items par nom", () => {
      const results = service.searchItems("Laptop");

      // TODO: Complétez les assertions
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0);
      // Vérifier que tous les résultats contiennent "laptop" (insensible à la casse)
      // Votre code ici...
    });

    it("devrait trouver des items par description", () => {
      const results = service.searchItems("gaming");

      // TODO: Complétez les assertions
      // Vérifier qu'on trouve l'item avec "gaming" dans la description
      // Votre code ici...
    });

    it("devrait retourner un tableau vide pour une recherche vide", () => {
      // TODO: Testez avec query null, undefined, et string vide
      // Votre code ici...
    });

    it("devrait retourner un tableau vide pour une recherche sans résultats", () => {
      // TODO: Testez avec une query qui ne donne aucun résultat
      // Votre code ici...
    });

    it("devrait être insensible à la casse", () => {
      // TODO: Testez avec différentes casses
      // Votre code ici...
    });
  });

  describe("getItemsSummary()", () => {
    it("devrait retourner un résumé correct", () => {
      const summary = service.getItemsSummary();

      // TODO: Vérifiez la structure du résumé
      assert.ok(typeof summary === "object");
      assert.ok(typeof summary.total === "number");
      assert.ok(Array.isArray(summary.categories));
      assert.ok(typeof summary.averagePrice === "number");
      assert.ok(typeof summary.priceRange === "object");

      // TODO: Vérifiez les valeurs avec les données par défaut
      // Combien d'items par défaut ? Quelles catégories ?
      // Votre code ici...
    });

    it("devrait calculer correctement la moyenne des prix", () => {
      // TODO: Calculez manuellement la moyenne attendue et vérifiez
      // Votre code ici...
    });

    it("devrait identifier le min et max des prix", () => {
      // TODO: Vérifiez les prix min et max
      // Votre code ici...
    });
  });
});
```

### **2.3 Exécuter et déboguer**

```bash
# Exécuter seulement vos nouveaux tests
node --test tests/unit/items.service.search.test.js

# Si erreurs, déboguer avec plus de détails
node --test --reporter=spec tests/unit/items.service.search.test.js
```

**📝 Corrigez les erreurs :**

- Erreurs de syntaxe : ****\_\_\_****
- Assertions échouées : ****\_\_\_****
- Problèmes de logique : ****\_\_\_****

---

## 🔗 **Exercice 3 : Tests d'intégration API**

### **3.1 Analyser le serveur de test**

Regardez `tests/integration/api.test.js` pour comprendre :

```javascript
// Comment le serveur est démarré
let server;
before(async () => {
  // Démarrage du serveur de test
});

// Comment les requêtes sont faites
const response = await fetch(`${baseURL}/api/items`);

// Comment nettoyer entre les tests
beforeEach(async () => {
  // Reset des données
});
```

### **3.2 Créer des tests de workflow**

Créez `tests/integration/api.workflow.test.js` :

```javascript
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";

describe("API Workflow Integration Tests", () => {
  let server;
  let baseURL;

  before(async () => {
    // TODO: Copiez la logique de démarrage de api.test.js
    // Votre code ici...
  });

  after(async () => {
    // TODO: Arrêt propre du serveur
    // Votre code ici...
  });

  beforeEach(async () => {
    // TODO: Reset des données entre chaque test
    // Votre code ici...
  });

  describe("Workflow CRUD complet", () => {
    it("devrait créer, lire, modifier et supprimer un item", async () => {
      // Étape 1: Créer un item
      const createPayload = {
        name: "Test Workflow Item",
        description: "Item pour test de workflow complet",
        category: "electronics",
        price: 299.99,
      };

      const createResponse = await fetch(`${baseURL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      assert.strictEqual(createResponse.status, 201);
      const createdItem = await createResponse.json();
      assert.ok(createdItem.id);
      assert.strictEqual(createdItem.name, createPayload.name);

      const itemId = createdItem.id;

      // Étape 2: Lire l'item créé
      const readResponse = await fetch(`${baseURL}/api/items/${itemId}`);
      // TODO: Vérifiez la réponse
      // Votre code ici...

      // Étape 3: Modifier l'item
      const updatePayload = {
        name: "Item Modifié",
        price: 399.99,
      };

      const updateResponse = await fetch(`${baseURL}/api/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      // TODO: Vérifiez la modification
      // Votre code ici...

      // Étape 4: Supprimer l'item
      // TODO: Implémentez la suppression
      // Votre code ici...

      // Étape 5: Vérifier que l'item n'existe plus
      // TODO: Vérifiez qu'on obtient 404
      // Votre code ici...
    });
  });

  describe("Tests de validation d'intégration", () => {
    it("devrait rejeter des données invalides avec des messages clairs", async () => {
      const invalidPayloads = [
        { name: "", category: "electronics", price: 10 }, // nom vide
        { name: "Test", category: "invalid", price: 10 }, // catégorie invalide
        { name: "Test", category: "electronics", price: -10 }, // prix négatif
        { name: "Test", category: "electronics" }, // prix manquant
      ];

      for (const payload of invalidPayloads) {
        const response = await fetch(`${baseURL}/api/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // TODO: Vérifiez le code d'erreur et le message
        assert.strictEqual(response.status, 400);
        const error = await response.json();
        assert.ok(error.error || error.message);
        // Votre code ici pour plus de vérifications...
      }
    });

    it("devrait gérer les IDs inexistants correctement", async () => {
      const nonExistentId = "999999";

      // GET avec ID inexistant
      // TODO: Testez GET, PUT et DELETE avec un ID inexistant
      // Votre code ici...
    });
  });

  describe("Tests de recherche d'intégration", () => {
    it("devrait permettre de rechercher des items", async () => {
      // TODO: Si vous avez implémenté un endpoint de recherche
      // Testez-le ici en intégration
      // Votre code ici...
    });
  });
});
```

### **3.3 Tests de performance basiques**

Ajoutez dans le même fichier :

```javascript
describe("Tests de performance basiques", () => {
  it("devrait traiter plusieurs requêtes simultanées", async () => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        fetch(`${baseURL}/api/items`).then((r) => ({ status: r.status, id: i }))
      );
    }

    const results = await Promise.all(promises);

    // TODO: Vérifiez que toutes les requêtes ont réussi
    const successCount = results.filter((r) => r.status === 200).length;
    assert.strictEqual(
      successCount,
      concurrentRequests,
      `Seulement ${successCount}/${concurrentRequests} requêtes ont réussi`
    );
  });

  it("devrait répondre rapidement", async () => {
    const maxResponseTime = 500; // 500ms max

    const start = Date.now();
    const response = await fetch(`${baseURL}/api/items`);
    const duration = Date.now() - start;

    assert.strictEqual(response.status, 200);
    assert.ok(
      duration < maxResponseTime,
      `Réponse trop lente: ${duration}ms (max: ${maxResponseTime}ms)`
    );
  });
});
```

---

## 🎭 **Exercice 4 : Mocks et Stubs**

### **4.1 Créer un test de contrôleur avec mocks**

Créez `tests/unit/items.controller.mock.test.js` :

```javascript
import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { ItemsController } from "../../src/controllers/items.controller.js";

describe("ItemsController avec mocks", () => {
  let controller;
  let mockService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock du service avec toutes les méthodes
    mockService = {
      getAllItems: mock.fn(),
      getItemById: mock.fn(),
      createItem: mock.fn(),
      updateItem: mock.fn(),
      deleteItem: mock.fn(),
      searchItems: mock.fn(),
      getItemsSummary: mock.fn(),
    };

    // Mock de la requête Express
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {},
    };

    // Mock de la réponse Express avec chaînage
    mockRes = {
      status: mock.fn(function (code) {
        this.statusCode = code;
        return this;
      }),
      json: mock.fn(function (data) {
        this.data = data;
        return this;
      }),
      send: mock.fn(function (data) {
        this.data = data;
        return this;
      }),
    };

    controller = new ItemsController(mockService);
  });

  describe("getAllItems()", () => {
    it("devrait retourner tous les items avec status 200", async () => {
      // Arrange
      const mockItems = [
        { id: "1", name: "Item 1", category: "electronics", price: 100 },
        { id: "2", name: "Item 2", category: "books", price: 20 },
      ];
      mockService.getAllItems.mock.mockImplementationOnce(() => mockItems);

      // Act
      await controller.getAllItems(mockReq, mockRes);

      // Assert
      // TODO: Vérifiez que le service a été appelé
      assert.strictEqual(mockService.getAllItems.mock.callCount(), 1);

      // TODO: Vérifiez que la réponse est correcte
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      assert.deepStrictEqual(
        mockRes.json.mock.calls[0].arguments[0],
        mockItems
      );

      // TODO: Vérifiez qu'aucun status n'a été défini (200 par défaut)
      assert.strictEqual(mockRes.status.mock.callCount(), 0);
    });

    it("devrait gérer les erreurs du service", async () => {
      // Arrange
      const error = new Error("Service unavailable");
      mockService.getAllItems.mock.mockImplementationOnce(() => {
        throw error;
      });

      // Act
      await controller.getAllItems(mockReq, mockRes);

      // Assert
      // TODO: Vérifiez que le status 500 a été défini
      // TODO: Vérifiez que le message d'erreur est retourné
      // Votre code ici...
    });
  });

  describe("getItemById()", () => {
    it("devrait retourner un item existant", async () => {
      // TODO: Testez le cas nominal
      const mockItem = { id: "1", name: "Test Item" };
      mockReq.params.id = "1";

      // Votre code ici...
    });

    it("devrait retourner 404 pour un item inexistant", async () => {
      // TODO: Testez le cas où le service retourne null
      mockReq.params.id = "999";
      mockService.getItemById.mock.mockImplementationOnce(() => null);

      // Votre code ici...
    });
  });

  describe("createItem()", () => {
    it("devrait créer un item et retourner 201", async () => {
      // TODO: Testez la création d'item
      const newItemData = {
        name: "New Item",
        category: "electronics",
        price: 50,
      };
      const createdItem = {
        id: "3",
        ...newItemData,
        createdAt: new Date().toISOString(),
      };

      mockReq.body = newItemData;
      mockService.createItem.mock.mockImplementationOnce(() => createdItem);

      // Act
      await controller.createItem(mockReq, mockRes);

      // Assert
      // TODO: Vérifiez l'appel du service avec les bonnes données
      // TODO: Vérifiez le status 201
      // TODO: Vérifiez que l'item créé est retourné
      // Votre code ici...
    });
  });

  describe("updateItem()", () => {
    it("devrait mettre à jour un item existant", async () => {
      // TODO: Testez la mise à jour
      // Votre code ici...
    });

    it("devrait retourner 404 pour un item inexistant à modifier", async () => {
      // TODO: Testez le cas où updateItem retourne null
      // Votre code ici...
    });
  });

  describe("deleteItem()", () => {
    it("devrait supprimer un item existant", async () => {
      // TODO: Testez la suppression
      mockReq.params.id = "1";
      mockService.deleteItem.mock.mockImplementationOnce(() => true);

      // Votre code ici...
    });

    it("devrait retourner 404 pour un item inexistant à supprimer", async () => {
      // TODO: Testez le cas où deleteItem retourne false
      // Votre code ici...
    });
  });
});
```

### **4.2 Exécuter et valider**

```bash
# Exécuter les tests de mock
node --test tests/unit/items.controller.mock.test.js

# Vérifier que tous les mocks sont correctement utilisés
node --test --reporter=verbose tests/unit/items.controller.mock.test.js
```

---

## 📊 **Exercice 5 : Couverture et qualité**

### **5.1 Analyser la couverture actuelle**

```bash
# Si c8 est disponible
npx c8 --reporter=html --reporter=text npm test

# Sinon, compter manuellement
npm test 2>&1 | grep -E "(✓|✗|⚠)" | wc -l
```

### **5.2 Identifier les zones à améliorer**

Créez un fichier `coverage-analysis.md` :

```markdown
# Analyse de la couverture de code

## Fichiers analysés

- [ ] src/services/items.service.js - %: \_\_\_
- [ ] src/controllers/items.controller.js - %: \_\_\_
- [ ] src/schemas/items.schema.js - %: \_\_\_
- [ ] src/middleware/validation.middleware.js - %: \_\_\_

## Zones non couvertes identifiées

1. Gestion d'erreurs dans : ****\_\_\_****
2. Cas limites non testés : ****\_\_\_****
3. Branches conditionnelles : ****\_\_\_****

## Plan d'amélioration

1. Ajouter tests pour : ****\_\_\_****
2. Créer mocks pour : ****\_\_\_****
3. Tester cas d'erreur : ****\_\_\_****
```

### **5.3 Créer des tests manquants**

Basé sur votre analyse, créez `tests/unit/missing-coverage.test.js` :

```javascript
import { describe, it } from "node:test";
import assert from "node:assert";

describe("Tests de couverture manquante", () => {
  // TODO: Ajoutez ici les tests pour les zones non couvertes

  it("devrait tester les cas d'erreur non couverts", () => {
    // Votre code ici...
  });

  it("devrait tester les branches conditionnelles manquées", () => {
    // Votre code ici...
  });
});
```

---

## 🧪 **Exercice 6 : Tests avancés (Optionnel)**

### **6.1 Tests de régression**

Créez `tests/regression/api.regression.test.js` :

```javascript
describe("Tests de régression", () => {
  it("ne devrait pas casser le format de réponse de l'API v1", async () => {
    // TODO: Testez que la structure des réponses n'a pas changé
    const response = await fetch(`${baseURL}/api/items`);
    const items = await response.json();

    // Vérifiez la structure attendue
    assert.ok(Array.isArray(items));
    if (items.length > 0) {
      const item = items[0];
      assert.ok(typeof item.id === "string");
      assert.ok(typeof item.name === "string");
      assert.ok(typeof item.category === "string");
      assert.ok(typeof item.price === "number");
      assert.ok(typeof item.createdAt === "string");
    }
  });

  it("devrait maintenir la compatibilité des codes d'erreur", async () => {
    // TODO: Testez que les codes d'erreur sont toujours les mêmes
    // Votre code ici...
  });
});
```

### **6.2 Tests de charge simplifiés**

```javascript
describe("Tests de charge basiques", () => {
  it("devrait gérer 50 créations simultanées", async () => {
    const promises = Array.from({ length: 50 }, (_, i) =>
      fetch(`${baseURL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Load Test Item ${i}`,
          category: "electronics",
          price: 10 + i,
        }),
      })
    );

    const responses = await Promise.all(promises);
    const successCount = responses.filter((r) => r.status === 201).length;

    // Au moins 90% de réussite
    assert.ok(
      successCount >= 45,
      `Trop d'échecs: ${successCount}/50 créations réussies`
    );
  });
});
```

---

## ✅ **Validation finale**

### **Checklist de complétion**

- [ ] ✅ J'ai analysé tous les tests existants
- [ ] ✅ J'ai complété les tests unitaires manquants
- [ ] ✅ J'ai créé des tests d'intégration complets
- [ ] ✅ J'ai utilisé des mocks efficacement
- [ ] ✅ J'ai testé tous les cas d'erreur
- [ ] ✅ J'ai vérifié la couverture de code
- [ ] ✅ J'ai créé des tests de régression
- [ ] ✅ Tous mes tests passent sans erreur

### **Métriques de qualité**

- Nombre total de tests écrits : ****\_\_\_****
- Temps d'exécution total : ****\_\_\_****
- Couverture estimée : ****\_\_\_****%
- Tests d'erreur créés : ****\_\_\_****

### **Auto-évaluation**

**Je suis prêt(e) pour le TP 5 si :**

- [ ] Je comprends la différence entre tests unitaires et d'intégration
- [ ] Je sais écrire des mocks efficaces
- [ ] Je peux déboguer des tests qui échouent
- [ ] Je teste systématiquement les cas d'erreur
- [ ] J'ai une approche méthodique pour les tests

---

## 🚀 **Passage au niveau suivant**

```bash
# Sauvegarder votre travail
git add .
git commit -m "✅ TP4 terminé - Tests complets implémentés"

# Passer au TP suivant
git checkout tp-05-securite
```

**🎯 Prochaine étape : Sécurité et authentification**
