# 🔑 Solutions - TP Niveau 2 : Premiers pas

## 📋 **Solutions des exercices**

---

## 🚀 **Exercice 1 : Création d'items (POST)**

### **1.1 Premier item via Swagger**

**Payload testé :**

```json
{
  "name": "Smartphone Galaxy",
  "description": "Téléphone Android dernière génération",
  "category": "electronics",
  "price": 799.99
}
```

**✅ Réponse attendue :**

```json
{
  "id": "4",
  "name": "Smartphone Galaxy",
  "description": "Téléphone Android dernière génération",
  "category": "electronics",
  "price": 799.99,
  "createdAt": "2024-06-08T10:30:00.000Z"
}
```

- **Code de statut :** `201 Created`
- **ID généré :** Séquentiel (4, 5, 6...)
- **createdAt :** Timestamp automatique

### **1.2 Création via curl**

**Commande :**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Livre JavaScript",
    "description": "Guide complet ES6+",
    "category": "books",
    "price": 35.50
  }'
```

**✅ Validation :**

1. **Item visible dans GET /api/items :** Oui
2. **ID unique et séquentiel :** Oui (ex: "5")
3. **Tous les champs présents :** Oui, y compris `id` et `createdAt`

---

## ⚠️ **Exercice 2 : Tests de validation**

### **2.1 Erreurs de validation**

#### Test A : Prix négatif

```json
{
  "name": "Test Prix",
  "category": "electronics",
  "price": -50
}
```

**✅ Résultat :**

- Code : `400`
- Message : `"Price must be positive"`

#### Test B : Catégorie invalide

```json
{
  "name": "Test Catégorie",
  "category": "invalid",
  "price": 25
}
```

**✅ Résultat :**

- Code : `400`
- Message : `"Category must be one of: electronics, books, clothing, home, sports, toys"`

#### Test C : Nom vide

```json
{
  "name": "",
  "category": "books",
  "price": 15
}
```

**✅ Résultat :**

- Code : `400`
- Message : `"Name is required"`

#### Test D : Prix manquant

```json
{
  "name": "Test Sans Prix",
  "category": "home"
}
```

**✅ Résultat :**

- Code : `400`
- Message : `"Required"`

### **2.2 Analyse des schémas**

**Réponses :**

1. **Catégories autorisées :**
   `"electronics", "books", "clothing", "home", "sports", "toys"`

2. **Validation du prix :**

   - Doit être un nombre (`z.number()`)
   - Doit être positif (`.positive("Price must be positive")`)

3. **Champs obligatoires :**
   - `name` : string non vide
   - `category` : enum des catégories valides
   - `price` : nombre positif
   - `description` : optionnel
   - `id` : généré automatiquement
   - `createdAt` : généré automatiquement

---

## 🔄 **Exercice 3 : Modification d'items (PUT)**

### **3.1 Modification complète**

**Requête :**

```json
PUT /api/items/1
{
  "name": "Laptop Pro Modifié",
  "description": "Ordinateur portable haute performance - MODIFIÉ",
  "category": "electronics",
  "price": 1599.99
}
```

**✅ Réponse attendue :**

```json
{
  "id": "1",
  "name": "Laptop Pro Modifié",
  "description": "Ordinateur portable haute performance - MODIFIÉ",
  "category": "electronics",
  "price": 1599.99,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Vérifications :**

- ✅ Code de statut : `200`
- ✅ Tous les champs modifiés
- ✅ `createdAt` inchangé
- ✅ Item visible dans GET /api/items

### **3.2 Modification partielle**

**Requête :**

```json
PUT /api/items/1
{
  "price": 1299.99
}
```

**✅ Réponses :**

- **Modification partielle fonctionne :** Oui
- **Autres champs restent inchangés :** Oui

### **3.3 Test d'erreur - ID inexistant**

**Commande :**

```bash
curl -X PUT http://localhost:3001/api/items/999 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "books", "price": 10}'
```

**✅ Résultat :**

- Code : `404`
- Message : `"Item not found"`

---

## 🗑️ **Exercice 4 : Suppression d'items (DELETE)**

### **4.1 Suppression normale**

**Séquence :**

1. `GET /api/items` → Liste avec l'item ID "3"
2. `DELETE /api/items/3` → Code 204
3. `GET /api/items` → Item absent de la liste

**✅ Résultat :**

- Code de statut : `204 No Content`
- Item supprimé définitivement

### **4.2 Test d'erreur**

**Commande :**

```bash
curl -X DELETE http://localhost:3001/api/items/999
```

**✅ Résultat :**

- Code : `404`
- Message : `"Item not found"`

---

## 🔍 **Exercice 5 : Traçage du flow**

### **5.1 Suivre une requête POST**

**Flow pour `POST /api/items` :**

1. **Point d'entrée** (`src/routes/items.routes.js`) :

   - **Ligne du POST :** `router.post('/', validateSchema(createItemSchema), itemsController.createItem);`
   - **Middleware appliqué :** `validateSchema(createItemSchema)`

2. **Validation** (`src/middleware/validation.middleware.js`) :

   - **Schéma utilisé :** `createItemSchema` (depuis items.schema.js)
   - **En cas d'erreur :** Retourne 400 avec message Zod

3. **Contrôleur** (`src/controllers/items.controller.js`) :

   - **Méthode appelée :** `createItem`
   - **Code de statut retourné :** `201`

4. **Service** (`src/services/items.service.js`) :
   - **Méthode du service :** `createItem`
   - **Génération ID :** `String(mockData.length + 1)`

### **5.2 Tracer une erreur 404**

**Pour `GET /api/items/999` :**

1. **Détection d'erreur :** Dans `items.service.js`, méthode `getItemById`
2. **Code 404 :** Retourné par le controller quand service retourne `null`

**Code exact :**

```javascript
// Service
getItemById(id) {
  return mockData.find(item => item.id === id) || null;
}

// Controller
const item = itemsService.getItemById(id);
if (!item) {
  return res.status(404).json({ error: 'Item not found' });
}
```

---

## 🛠️ **Exercice 6 : Modifications du code**

### **6.1 Ajouter une catégorie**

**Code modifié dans `src/schemas/items.schema.js` :**

```javascript
const validCategories = [
  "electronics",
  "books",
  "clothing",
  "home",
  "sports",
  "toys",
  "automotive", // ← Nouvelle catégorie
];
```

**✅ Test réussi :**
Création d'un item avec `"category": "automotive"` fonctionne après redémarrage.

### **6.2 Ajouter des données de test**

**Code ajouté dans `src/services/items.service.js` :**

```javascript
const mockData = [
  // ...items existants...
  {
    id: "4",
    name: "Tesla Model 3",
    description: "Voiture électrique autonome",
    category: "automotive",
    price: 45000,
    createdAt: new Date("2024-01-04").toISOString(),
  },
  {
    id: "5",
    name: "Clean Code",
    description: "Livre sur les bonnes pratiques",
    category: "books",
    price: 42.99,
    createdAt: new Date("2024-01-05").toISOString(),
  },
];
```

**✅ Validation :**

- Redémarrage obligatoire
- GET /api/items retourne 5 items
- Nouveaux items avec données correctes

---

## 🧪 **Exercice 7 : Workflow complet**

### **7.1 Scénario de test complet**

**Séquence exécutée :**

1. **Créer** casque audio :

   ```json
   POST /api/items
   {
     "name": "Casque Audio",
     "category": "electronics",
     "price": 150
   }
   ```

2. **Récupérer** : `GET /api/items/{id-généré}`

3. **Modifier** : `PUT /api/items/{id}` avec `{"price": 129.99}`

4. **Vérifier** : `GET /api/items/{id}` → prix modifié

5. **Supprimer** : `DELETE /api/items/{id}`

6. **Vérifier** : `GET /api/items/{id}` → 404

**📝 Codes de statut :**

- **Création :** 201
- **Récupération :** 200
- **Modification :** 200
- **Suppression :** 204
- **Vérification finale :** 404

### **7.2 Test de performance**

**Création de 10 items :**

- **Serveur réactif :** Oui, les données sont en mémoire
- **IDs séquentiels :** Oui (6, 7, 8, 9, 10, 11, 12, 13, 14, 15)

---

## 🎯 **Exercice 8 : Débogage**

### **8.1 Provoquer des erreurs**

#### Erreur 1 : Types incorrects

```json
{
  "name": null,
  "category": "electronics",
  "price": "not-a-number"
}
```

**✅ Résultat :**

- Code : 400
- Message Zod détaillé sur les types incorrects
- Serveur ne plante pas (validation Zod protège)

#### Erreur 2 : Surcharge mémoire

**1000 items rapidement :**

- Serveur reste stable (Node.js gère bien)
- Mémoire augmente mais reste gérable
- IDs continuent de 1001 à 2000

### **8.2 Analyser les logs**

**Types de messages :**

- Démarrage du serveur
- Requêtes HTTP (optionnel avec middleware de logging)
- Erreurs de validation (si activées)

**Informations d'erreur :**

- Stack traces pour erreurs 500
- Messages de validation pour erreurs 400

---

## 🏆 **Quiz de compréhension - Réponses**

### **1. Ordre d'exécution :**

1. **Route** (définit l'endpoint)
2. **Middleware de validation** (vérifie les données)
3. **Controller** (gère la logique de contrôle)
4. **Service** (logique métier)
5. **Réponse client** (JSON de retour)

### **2. Rôle de `validateSchema` :**

✅ **Applique les règles Zod**

### **3. Stockage des données :**

✅ **Variable JavaScript en mémoire**

### **4. Retour de `createItem` :**

✅ **L'objet item complet** (avec id et createdAt)

### **5. Génération de l'ID :**

✅ **Calcul sur la longueur du tableau** (`String(mockData.length + 1)`)

---

## 🔧 **Problèmes courants et solutions**

### **Erreur "Cannot set headers after they are sent"**

**Cause :** Double appel à `res.json()` ou `res.status()`
**Solution :** Utiliser `return` après chaque réponse

### **Validation qui ne fonctionne pas**

**Cause :** Middleware non appliqué ou mauvais ordre
**Solution :** Vérifier l'ordre dans les routes

### **IDs qui se répètent après redémarrage**

**Cause :** Normal, données en mémoire réinitialisées
**Solution :** Attendu dans ce TP, sera résolu avec DB (TP 6)

### **Erreur CORS en front-end**

**Cause :** Headers CORS manquants
**Solution :** Déjà géré par `cors` middleware

---

## 📊 **Points de validation**

### **Niveau Bronze (minimum)**

- ✅ CRUD basique fonctionne
- ✅ Validation de base comprise
- ✅ Codes de statut corrects

### **Niveau Silver (objectif)**

- ✅ Flow de requête tracé
- ✅ Modifications de code réussies
- ✅ Gestion d'erreurs maîtrisée

### **Niveau Gold (excellence)**

- ✅ Workflow complet automatisé
- ✅ Débogage autonome
- ✅ Optimisations proposées

---

## 🚀 **Prérequis pour le TP 3**

Avant de continuer, vous devez maîtriser :

✅ **CRUD complet**

- Création avec POST et validation
- Lecture avec GET (liste et détail)
- Modification avec PUT (complète et partielle)
- Suppression avec DELETE

✅ **Validation des données**

- Schémas Zod pour entrées
- Messages d'erreur explicites
- Codes de statut HTTP appropriés

✅ **Architecture**

- Flow Route → Middleware → Controller → Service
- Séparation des responsabilités
- Gestion centralisée des erreurs

**🎯 Si tout est acquis, passez au TP 3 !**

```bash
git checkout tp-03-validation
```
