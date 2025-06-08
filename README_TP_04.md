# 🧪 TP Niveau 4 : Tests

## 🎯 **Objectifs**

- Comprendre l'importance des tests dans le développement d'API
- Maîtriser les tests unitaires et d'intégration
- Écrire des tests robustes avec Node.js Test Runner
- Implémenter des mocks et des stubs
- Atteindre une couverture de code satisfaisante

## ⏱️ **Durée estimée :** 4-5 heures

---

## 📋 **Prérequis**

### Ce que vous devez maîtriser

- ✅ Opérations CRUD complètes (TP 2)
- ✅ Validation avec Zod (TP 3)
- ✅ Compréhension du flow de requête
- ✅ Utilisation de Swagger et curl

### Vérification rapide

```bash
# Démarrer le serveur
npm start

# Tester la validation
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"electronics","price":10}'
```

---

## 🚀 **Configuration du TP**

### 1. Récupération du code

```bash
git checkout tp-04-tests
npm install
```

### 2. Structure des tests

```
tests/
├── unit/                 # Tests unitaires
│   ├── services/        # Tests des services
│   ├── controllers/     # Tests des contrôleurs
│   └── schemas/         # Tests de validation
├── integration/         # Tests d'intégration
│   └── api/            # Tests end-to-end de l'API
└── fixtures/           # Données de test
    └── items.js        # Items de test
```

### 3. Scripts de test disponibles

```bash
# Tous les tests
npm test

# Tests unitaires seulement
npm run test:unit

# Tests d'intégration seulement
npm run test:integration

# Tests avec surveillance des changements
npm run test:watch

# Couverture de code
npm run test:coverage
```

---

## 📚 **Concepts fondamentaux**

### **🔬 Types de tests**

#### **Tests unitaires**

- Testent une fonction/méthode isolée
- Rapides à exécuter
- Utilisent des mocks pour les dépendances
- Exemple : Tester `itemsService.createItem()`

#### **Tests d'intégration**

- Testent l'interaction entre composants
- Plus lents mais plus réalistes
- Testent le flow complet
- Exemple : POST /api/items → Controller → Service → Response

#### **Tests end-to-end (E2E)**

- Testent l'application complète
- Simulent un utilisateur réel
- Les plus lents mais les plus fiables
- Exemple : Scénario complet CRUD

### **🎭 Mocks et Stubs**

#### **Mock**

```javascript
// Remplace complètement une dépendance
const mockService = {
  createItem: () => ({ id: "1", name: "Mock Item" }),
};
```

#### **Stub**

```javascript
// Remplace seulement certaines méthodes
const originalMethod = service.createItem;
service.createItem = () => "stubbed result";
// Puis restaurer: service.createItem = originalMethod;
```

#### **Spy**

```javascript
// Surveille les appels sans changer le comportement
let callCount = 0;
const originalMethod = service.createItem;
service.createItem = (...args) => {
  callCount++;
  return originalMethod.apply(service, args);
};
```

---

## 🧪 **Exercices pratiques**

### **Exercice 1 : Comprendre les tests existants**

#### 1.1 Analyser les tests unitaires

Ouvrez `tests/unit/items.service.test.js` :

```bash
# Exécuter seulement ce fichier
node --test tests/unit/items.service.test.js
```

**❓ Questions d'analyse :**

1. Combien de tests sont définis ? ****\_\_\_****
2. Quelles méthodes du service sont testées ? ****\_\_\_****
3. Comment les données de test sont-elles réinitialisées ? ****\_\_\_****

#### 1.2 Analyser les tests de schémas

Ouvrez `tests/unit/items.schema.test.js` :

**❓ Questions :**

1. Que teste `createItemSchema` ? ****\_\_\_****
2. Comment les erreurs de validation sont-elles vérifiées ? ****\_\_\_****
3. Quels cas limites sont testés ? ****\_\_\_****

#### 1.3 Exécuter et comprendre les résultats

```bash
npm run test:unit
```

**📝 Analysez la sortie :**

- Temps d'exécution : ****\_\_\_****
- Nombre de tests passés : ****\_\_\_****
- Couverture de code (si disponible) : ****\_\_\_****%

### **Exercice 2 : Créer des tests unitaires**

#### 2.1 Tester une nouvelle méthode du service

Ajoutez cette méthode dans `src/services/items.service.js` :

```javascript
// Méthode à ajouter dans la classe ItemsService
getItemsByCategory(category) {
  return this.items.filter(item => item.category === category);
}

getItemsCountByCategory() {
  const counts = {};
  this.items.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });
  return counts;
}

getExpensiveItems(minPrice = 100) {
  return this.items.filter(item => item.price >= minPrice);
}
```

#### 2.2 Écrire les tests correspondants

Créez `tests/unit/items.service.advanced.test.js` :

```javascript
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { ItemsService } from "../../src/services/items.service.js";

describe("ItemsService - Méthodes avancées", () => {
  let service;

  beforeEach(() => {
    service = new ItemsService();
    service.reset(); // Remet les données par défaut
  });

  describe("getItemsByCategory()", () => {
    it("devrait retourner les items de la catégorie electronics", () => {
      const electronics = service.getItemsByCategory("electronics");

      // Vérifications à compléter
      assert.strictEqual(Array.isArray(electronics), true);
      assert.ok(electronics.length > 0);
      electronics.forEach((item) => {
        assert.strictEqual(item.category, "electronics");
      });
    });

    it("devrait retourner un tableau vide pour une catégorie inexistante", () => {
      // TODO: Compléter ce test
    });
  });

  describe("getItemsCountByCategory()", () => {
    it("devrait retourner le bon nombre d'items par catégorie", () => {
      // TODO: Compléter ce test
    });
  });

  describe("getExpensiveItems()", () => {
    it("devrait retourner les items au-dessus du prix minimum", () => {
      // TODO: Compléter ce test
    });
  });
});
```

**📝 Tâche :** Complétez les tests marqués TODO

#### 2.3 Exécuter vos nouveaux tests

```bash
node --test tests/unit/items.service.advanced.test.js
```

### **Exercice 3 : Tests d'intégration API**

#### 3.1 Analyser les tests d'intégration existants

Ouvrez `tests/integration/api.test.js` :

**❓ Questions :**

1. Comment le serveur de test est-il démarré ? ****\_\_\_****
2. Quelle bibliothèque est utilisée pour les requêtes HTTP ? ****\_\_\_****
3. Comment l'isolation entre tests est-elle assurée ? ****\_\_\_****

#### 3.2 Créer de nouveaux tests d'intégration

Ajoutez ces tests dans `tests/integration/api.advanced.test.js` :

```javascript
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";

describe("API Advanced Integration Tests", () => {
  let server;
  let baseURL;

  before(async () => {
    // TODO: Démarrer le serveur de test
    // Inspiration : regarder api.test.js
  });

  after(async () => {
    // TODO: Arrêter le serveur
  });

  beforeEach(async () => {
    // TODO: Réinitialiser les données
  });

  describe("Workflow complet CRUD", () => {
    it("devrait créer, lire, modifier et supprimer un item", async () => {
      // Étape 1 : Créer un item
      const createResponse = await fetch(`${baseURL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Workflow Item",
          description: "Item pour test workflow",
          category: "electronics",
          price: 199.99,
        }),
      });

      assert.strictEqual(createResponse.status, 201);
      const createdItem = await createResponse.json();
      const itemId = createdItem.id;

      // Étape 2 : Lire l'item créé
      // TODO: Compléter

      // Étape 3 : Modifier l'item
      // TODO: Compléter

      // Étape 4 : Supprimer l'item
      // TODO: Compléter

      // Étape 5 : Vérifier qu'il n'existe plus
      // TODO: Compléter
    });
  });

  describe("Tests de validation d'intégration", () => {
    it("devrait rejeter des données invalides avec le bon code d'erreur", async () => {
      // TODO: Tester différents cas d'erreur de validation
    });
  });

  describe("Tests de performance basiques", () => {
    it("devrait traiter 10 requêtes simultanées", async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(fetch(`${baseURL}/api/items`));
      }

      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        assert.strictEqual(response.status, 200);
      });
    });
  });
});
```

### **Exercice 4 : Tests avec mocks**

#### 4.1 Créer un mock du service

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
    // Mock du service
    mockService = {
      getAllItems: mock.fn(() => ["item1", "item2"]),
      getItemById: mock.fn(),
      createItem: mock.fn(),
      updateItem: mock.fn(),
      deleteItem: mock.fn(),
    };

    // Mock de la requête Express
    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    // Mock de la réponse Express
    mockRes = {
      status: mock.fn().mockReturnThis(),
      json: mock.fn().mockReturnThis(),
      send: mock.fn().mockReturnThis(),
    };

    controller = new ItemsController(mockService);
  });

  describe("getAllItems", () => {
    it("devrait appeler le service et retourner les items", async () => {
      await controller.getAllItems(mockReq, mockRes);

      // Vérifier que le service a été appelé
      assert.strictEqual(mockService.getAllItems.mock.callCount(), 1);

      // Vérifier que la réponse est correcte
      assert.strictEqual(mockRes.json.mock.callCount(), 1);
      assert.deepStrictEqual(mockRes.json.mock.calls[0].arguments[0], [
        "item1",
        "item2",
      ]);
    });
  });

  describe("createItem", () => {
    it("devrait créer un item et retourner 201", async () => {
      const newItem = { id: "1", name: "Test Item" };
      mockService.createItem.mock.mockImplementationOnce(() => newItem);
      mockReq.body = { name: "Test Item", category: "electronics", price: 10 };

      await controller.createItem(mockReq, mockRes);

      // TODO: Ajouter les vérifications
    });
  });
});
```

#### 4.2 Tests d'erreurs avec mocks

Ajoutez des tests pour les cas d'erreur :

```javascript
describe("Gestion d'erreurs", () => {
  it("devrait retourner 500 si le service lance une erreur", async () => {
    mockService.getAllItems.mock.mockImplementationOnce(() => {
      throw new Error("Service error");
    });

    await controller.getAllItems(mockReq, mockRes);

    // TODO: Vérifier que le statut 500 est retourné
  });
});
```

### **Exercice 5 : Coverage et qualité**

#### 5.1 Générer un rapport de couverture

```bash
# Si c8 est installé
npx c8 npm test

# Sinon, analyser manuellement
npm test 2>&1 | grep -E "(pass|fail|todo)"
```

#### 5.2 Identifier les zones non testées

**📝 Analysez :**

- Quels fichiers ont moins de 80% de couverture ?
- Quelles fonctions ne sont pas testées ?
- Quels cas limites manquent ?

#### 5.3 Améliorer la couverture

Ajoutez des tests pour couvrir :

- Les cas d'erreur non testés
- Les branches conditionnelles
- Les validations edge cases

---

## 🔧 **Exercices avancés**

### **Exercice 6 : Tests de régression**

#### 6.1 Créer un test de non-régression

```javascript
// tests/regression/api.regression.test.js
describe("Tests de régression", () => {
  it("ne devrait pas casser la compatibilité de l'API v1", async () => {
    // Tester que les anciennes requêtes fonctionnent toujours
  });
});
```

### **Exercice 7 : Tests de performance**

#### 7.1 Tester les temps de réponse

```javascript
describe("Performance", () => {
  it("devrait répondre en moins de 100ms", async () => {
    const start = Date.now();
    const response = await fetch(`${baseURL}/api/items`);
    const duration = Date.now() - start;

    assert.ok(duration < 100, `Réponse trop lente: ${duration}ms`);
  });
});
```

### **Exercice 8 : Tests de charge**

#### 8.1 Tester la charge concurrentielle

```javascript
it("devrait gérer 100 requêtes simultanées", async () => {
  const promises = Array.from({ length: 100 }, () =>
    fetch(`${baseURL}/api/items`)
  );

  const responses = await Promise.all(promises);
  const successCount = responses.filter((r) => r.status === 200).length;

  assert.ok(successCount >= 95, `Trop d'échecs: ${100 - successCount}`);
});
```

---

## 📊 **Validation des acquis**

### **Compétences techniques**

- [ ] Je comprends la différence entre tests unitaires et d'intégration
- [ ] Je sais écrire des tests avec Node.js Test Runner
- [ ] Je maîtrise les mocks et stubs
- [ ] Je peux tester les cas d'erreur
- [ ] Je sais interpréter la couverture de code

### **Compétences pratiques**

- [ ] J'écris des tests avant de coder (TDD)
- [ ] Je teste tous les cas limites
- [ ] Je maintiens une couverture > 80%
- [ ] Je documente mes tests
- [ ] J'automatise l'exécution des tests

### **Bonnes pratiques**

- [ ] Tests isolés et indépendants
- [ ] Noms de tests descriptifs
- [ ] Organisation claire des fichiers de test
- [ ] Tests rapides et fiables
- [ ] Nettoyage après chaque test

---

## 🎯 **Quiz de validation**

### 1. Quelle est la différence principale entre un mock et un stub ?

- [ ] Aucune différence
- [ ] Mock remplace complètement, stub partiellement
- [ ] Stub est plus rapide
- [ ] Mock ne fonctionne qu'avec les classes

### 2. Pourquoi isoler les tests ?

- [ ] Pour la performance
- [ ] Pour éviter les effets de bord
- [ ] Pour la lisibilité
- [ ] Toutes les réponses

### 3. Que teste un test d'intégration ?

- [ ] Une fonction isolée
- [ ] L'interaction entre composants
- [ ] L'interface utilisateur
- [ ] La base de données uniquement

### 4. Quelle couverture de code viser ?

- [ ] 50%
- [ ] 80%
- [ ] 100%
- [ ] Peu importe

---

## ✅ **Checklist finale**

Avant de passer au TP 5, vérifiez :

- [ ] ✅ J'ai analysé les tests existants
- [ ] ✅ J'ai écrit des tests unitaires
- [ ] ✅ J'ai créé des tests d'intégration
- [ ] ✅ J'ai utilisé des mocks efficacement
- [ ] ✅ J'ai testé les cas d'erreur
- [ ] ✅ J'ai vérifié la couverture de code
- [ ] ✅ Tous mes tests passent
- [ ] ✅ Je comprends l'importance des tests

---

## 🚀 **Prêt pour le niveau 5 ?**

Si toutes les cases sont cochées :

```bash
git add .
git commit -m "✅ TP4 terminé - Maîtrise des tests unitaires et d'intégration"
git checkout tp-05-securite
```

**🎯 Dans le prochain TP :**

- Authentification JWT
- Middleware de sécurité
- Protection des endpoints
- Gestion des rôles utilisateurs

---

## 💡 **Points clés à retenir**

### **🧪 Philosophie des tests**

```
"Un code sans tests est un code cassé par design" - Jacob Kaplan-Moss
```

### **📈 Pyramide des tests**

```
     /\
    /E2E\     ← Peu nombreux, lents, fiables
   /______\
  /  INT   \   ← Moyennement nombreux, moyens
 /__________\
/   UNIT     \  ← Nombreux, rapides, isolés
______________
```

### **🔄 Cycle TDD (optionnel)**

1. **Red** : Écrire un test qui échoue
2. **Green** : Écrire le code minimal pour passer
3. **Refactor** : Améliorer le code en gardant les tests verts

### **🛡️ Avantages des tests**

- **Confiance** : Refactoring sans peur
- **Documentation** : Les tests expliquent le comportement
- **Régression** : Détection automatique des bugs
- **Design** : Force une API claire et testable
