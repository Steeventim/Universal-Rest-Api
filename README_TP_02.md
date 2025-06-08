# 🔧 TP Niveau 2 : Premiers pas

## 🎯 **Objectifs**

- Comprendre le cycle complet d'une requête HTTP
- Créer et modifier des données via l'API
- Maîtriser la validation des entrées
- Gérer les erreurs et cas limites

## ⏱️ **Durée estimée :** 2-3 heures

---

## 📋 **Prérequis**

### Ce que vous devez maîtriser

- ✅ Installation et démarrage du projet (TP 1)
- ✅ Navigation dans Swagger UI
- ✅ Tests d'endpoints GET
- ✅ Compréhension de base de REST

### Vérification rapide

```bash
# Démarrer le serveur
npm start

# Tester un endpoint
curl http://localhost:3001/api/items
```

Si cela fonctionne, vous êtes prêt !

---

## 🚀 **Prise en main**

### 1. Récupération du code

```bash
# Si vous venez du TP 1
git checkout tp-02-premiers-pas

# Sinon, cloner et installer
git clone <repo-url>
cd universal-rest-api
git checkout tp-02-premiers-pas
npm install
```

### 2. Configuration

```bash
cp .env.example .env
npm start
```

---

## 📚 **Nouveaux concepts**

### **🔄 Le cycle complet d'une requête**

```
Client → Route → Middleware → Controller → Service → Data
  ↑                                                    ↓
Response ← Controller ← Service ← Data Processing ←────┘
```

### **✅ Validation des données**

- **Zod** : Bibliothèque de validation TypeScript-first
- **Schémas** : Définition de la structure attendue
- **Erreurs** : Messages d'erreur explicites

### **🛠️ Opérations CRUD**

- **C**reate : POST /api/items
- **R**ead : GET /api/items, GET /api/items/:id
- **U**pdate : PUT /api/items/:id
- **D**elete : DELETE /api/items/:id

---

## 🧪 **Exercices pratiques**

### **Exercice 1 : Créer un nouvel item**

#### 1.1 Via Swagger UI

1. Accédez à http://localhost:3001/docs
2. Cliquez sur `POST /api/items`
3. Cliquez sur "Try it out"
4. Utilisez ce payload :

```json
{
  "name": "Mon Nouveau Produit",
  "description": "Un produit créé pendant le TP",
  "category": "electronics",
  "price": 299.99
}
```

**❓ Questions :**

- Quel code de statut recevez-vous ? ****\_\_\_****
- Quel est l'ID généré ? ****\_\_\_****
- L'item apparaît-il dans GET /api/items ? ****\_\_\_****

#### 1.2 Via curl

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produit via curl",
    "description": "Créé en ligne de commande",
    "category": "books",
    "price": 19.99
  }'
```

### **Exercice 2 : Tester la validation**

#### 2.1 Données invalides

Testez ces payloads et notez les erreurs :

```json
// Test 1 : Prix négatif
{
  "name": "Test",
  "category": "electronics",
  "price": -10
}

// Test 2 : Catégorie invalide
{
  "name": "Test",
  "category": "invalid-category",
  "price": 10
}

// Test 3 : Nom manquant
{
  "category": "electronics",
  "price": 10
}
```

**📝 Notez les messages d'erreur :**

- Prix négatif : ****\_\_\_****
- Catégorie invalide : ****\_\_\_****
- Nom manquant : ****\_\_\_****

#### 2.2 Analyser le code de validation

Ouvrez `src/schemas/items.schema.js` et examinez :

- Les validations définies
- Les messages d'erreur personnalisés
- Les catégories autorisées

### **Exercice 3 : Modifier un item existant**

#### 3.1 Modification complète (PUT)

1. Récupérez un item existant : `GET /api/items/1`
2. Modifiez-le avec `PUT /api/items/1` :

```json
{
  "name": "Laptop Modifié",
  "description": "Description mise à jour",
  "category": "electronics",
  "price": 1499.99
}
```

#### 3.2 Modification partielle

Testez avec seulement quelques champs :

```json
{
  "price": 999.99
}
```

**❓ Questions :**

- La modification partielle fonctionne-t-elle ? ****\_\_\_****
- Que se passe-t-il avec un ID inexistant ? ****\_\_\_****

### **Exercice 4 : Supprimer un item**

#### 4.1 Suppression normale

```bash
curl -X DELETE http://localhost:3001/api/items/2
```

#### 4.2 Test cas d'erreur

```bash
curl -X DELETE http://localhost:3001/api/items/999
```

**❓ Questions :**

- Code de statut pour suppression réussie : ****\_\_\_****
- Code de statut pour ID inexistant : ****\_\_\_****

---

## 🔍 **Analyse du code**

### **Exercice 5 : Comprendre le flow**

#### 5.1 Tracer une requête POST

Suivez une requête `POST /api/items` à travers le code :

1. **Route** (`src/routes/items.routes.js`) :

   - Quelle ligne définit POST ? ****\_\_\_****
   - Quel middleware est appliqué ? ****\_\_\_****

2. **Controller** (`src/controllers/items.controller.js`) :

   - Quelle méthode gère POST ? ****\_\_\_****
   - Comment la validation est-elle intégrée ? ****\_\_\_****

3. **Service** (`src/services/items.service.js`) :
   - Quelle méthode crée un item ? ****\_\_\_****
   - Comment l'ID est-il généré ? ****\_\_\_****

#### 5.2 Analyser la gestion d'erreurs

Dans `src/controllers/items.controller.js` :

- Comment les erreurs sont-elles capturées ? ****\_\_\_****
- Quels codes de statut sont utilisés ? ****\_\_\_****

---

## 🛠️ **Modifications pratiques**

### **Exercice 6 : Personnaliser la validation**

#### 6.1 Ajouter une nouvelle catégorie

Dans `src/schemas/items.schema.js`, ajoutez "automotive" aux catégories :

```javascript
const validCategories = [
  "electronics",
  "books",
  "clothing",
  "home",
  "sports",
  "toys",
  "automotive", // ← Ajouter cette ligne
];
```

#### 6.2 Tester la nouvelle catégorie

Créez un item avec `"category": "automotive"` et vérifiez que ça fonctionne.

### **Exercice 7 : Modifier les données par défaut**

#### 7.1 Ajouter des items de test

Dans `src/services/items.service.js`, ajoutez 2 nouveaux items à `mockData` :

```javascript
{
  id: '4',
  name: 'Voiture Électrique',
  description: 'Tesla Model 3 d\'occasion',
  category: 'automotive',
  price: 35000,
  createdAt: new Date('2024-01-04').toISOString()
},
{
  id: '5',
  name: 'Livre de Programmation',
  description: 'Clean Code par Robert Martin',
  category: 'books',
  price: 45.99,
  createdAt: new Date('2024-01-05').toISOString()
}
```

#### 7.2 Vérifier les modifications

Redémarrez le serveur et vérifiez que :

- GET /api/items retourne 5 items
- Les nouveaux items ont les bonnes données

---

## 🧪 **Tests avancés**

### **Exercice 8 : Scénarios complexes**

#### 8.1 Test de workflow complet

1. Créez un item
2. Récupérez-le par son ID
3. Modifiez-le
4. Vérifiez les modifications
5. Supprimez-le
6. Vérifiez qu'il n'existe plus

#### 8.2 Test de concurrence (optionnel)

Essayez de :

- Créer plusieurs items rapidement
- Modifier le même item simultanément
- Observer le comportement

---

## 📊 **Validation des acquis**

### **Compréhension technique**

- [ ] Je comprends le cycle d'une requête HTTP
- [ ] Je sais créer des données via POST
- [ ] Je maîtrise la modification via PUT
- [ ] Je gère la suppression via DELETE
- [ ] Je comprends la validation Zod

### **Compétences pratiques**

- [ ] Je teste les APIs avec Swagger et curl
- [ ] Je trace les erreurs dans le code
- [ ] Je modifie les schémas de validation
- [ ] Je personnalise les données de test

### **Gestion d'erreurs**

- [ ] Je comprends les codes de statut HTTP
- [ ] Je sais interpréter les messages d'erreur
- [ ] Je teste les cas limites
- [ ] Je diagnostique les problèmes

---

## 🎯 **Quiz de validation**

### 1. Quel middleware valide les données POST ?

- [ ] cors
- [ ] validateSchema
- [ ] rateLimit
- [ ] auth

### 2. Comment est généré l'ID d'un nouvel item ?

- [ ] Auto-increment
- [ ] UUID
- [ ] Date timestamp
- [ ] Calcul manuel

### 3. Que retourne PUT avec un ID inexistant ?

- [ ] 200 et création
- [ ] 404 not found
- [ ] 400 bad request
- [ ] 500 server error

### 4. Quelle est la différence entre POST et PUT ?

- [ ] Aucune
- [ ] POST crée, PUT modifie
- [ ] POST modifie, PUT crée
- [ ] PUT est plus rapide

---

## ✅ **Checklist finale**

Avant de passer au TP 3, vérifiez :

- [ ] ✅ J'ai créé des items avec POST
- [ ] ✅ J'ai modifié des items avec PUT
- [ ] ✅ J'ai supprimé des items avec DELETE
- [ ] ✅ J'ai testé la validation des données
- [ ] ✅ J'ai tracé le flow d'une requête
- [ ] ✅ J'ai personnalisé les schémas
- [ ] ✅ J'ai ajouté des données de test
- [ ] ✅ Je comprends la gestion d'erreurs

---

## 🚀 **Prêt pour le niveau 3 ?**

Si toutes les cases sont cochées :

```bash
git add .
git commit -m "✅ TP2 terminé - Maîtrise du CRUD complet"
git checkout tp-03-validation
```

**🎯 Dans le prochain TP :**

- Validation avancée avec Zod
- Messages d'erreur personnalisés
- Validation conditionnelle
- Schémas complexes

---

## 💡 **Points clés à retenir**

### **🔄 Cycle de requête**

```
POST /api/items → Route → Middleware → Controller → Service → Response
```

### **🛡️ Validation**

- Zod valide automatiquement les données
- Messages d'erreur explicites
- Validation côté serveur obligatoire

### **📱 Codes de statut**

- `200` : Succès (GET, PUT)
- `201` : Créé (POST)
- `204` : Succès sans contenu (DELETE)
- `400` : Erreur de validation
- `404` : Ressource non trouvée

### **🔧 Bonnes pratiques**

- Toujours valider les entrées
- Retourner des erreurs explicites
- Tester tous les cas d'usage
- Séparer la logique métier (services)
