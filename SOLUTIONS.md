# 🔑 Solutions - TP Niveau 1 : Découverte

## 📋 **Solutions des exercices**

---

## 📚 **Exercice 1 : Installation et configuration**

### **1.1 Vérifier l'environnement**

```bash
# Versions minimales requises
node --version  # v18.0.0 ou supérieur
npm --version   # 9.0.0 ou supérieur
git --version   # 2.0.0 ou supérieur
```

### **1.2 Solutions des commandes**

```bash
# Installation (génère node_modules/)
npm install

# Configuration (crée .env)
cp .env.example .env

# Contenu attendu de .env
PORT=3001
FRAMEWORK=express
JWT_SECRET=your-secret-key-change-this-in-production
API_KEY=test-api-key-change-this-in-production
```

---

## 🚀 **Exercice 2 : Premier démarrage**

### **2.1 Logs de démarrage attendus**

```
🚀 Server started successfully on port 3001
📚 Swagger documentation available at: http://localhost:3001/docs
```

### **2.2 Réponses aux questions**

- **Port :** 3001
- **URL Swagger :** http://localhost:3001/docs
- **Framework :** express

---

## 🔍 **Exercice 3 : Explorer l'interface Swagger**

### **3.1 Analyse de l'interface**

**Réponses aux questions :**

1. **Nombre d'endpoints :** 5
2. **Liste des endpoints :**
   - GET /api/items
   - POST /api/items
   - GET /api/items/{id}
   - PUT /api/items/{id}
   - DELETE /api/items/{id}
3. **Codes de réponse pour GET /api/items :** 200, 500

---

## 🧪 **Exercice 4 : Tests avec Swagger UI**

### **4.1 Test GET /api/items**

**Réponse attendue :**

```json
[
  {
    "id": "1",
    "name": "Laptop",
    "description": "High-performance laptop for work and gaming",
    "category": "electronics",
    "price": 1299.99,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "2",
    "name": "Coffee Mug",
    "description": "Ceramic coffee mug with custom design",
    "category": "home",
    "price": 15.99,
    "createdAt": "2024-01-02T00:00:00.000Z"
  },
  {
    "id": "3",
    "name": "Wireless Headphones",
    "description": "Bluetooth headphones with noise cancellation",
    "category": "electronics",
    "price": 199.99,
    "createdAt": "2024-01-03T00:00:00.000Z"
  }
]
```

**Analyse :**

- Code de statut : **200**
- Nombre d'items : **3**
- Première propriété : **id**

### **4.2 Test GET /api/items/{id}**

**ID "1" (existant) :**

```json
{
  "id": "1",
  "name": "Laptop",
  "description": "High-performance laptop for work and gaming",
  "category": "electronics",
  "price": 1299.99,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

- Code : **200**

**ID "999" (inexistant) :**

```json
{
  "error": "Item not found"
}
```

- Code : **404**
- Message : **"Item not found"**

---

## 💻 **Exercice 5 : Tests en ligne de commande**

### **5.1 Commandes curl avec réponses**

```bash
# Test 1 : Tous les items
curl -X GET http://localhost:3001/api/items
# Retourne : Array de 3 items (même que Swagger)

# Test 2 : Item spécifique
curl -X GET http://localhost:3001/api/items/1
# Retourne : Object item avec ID "1"

# Test 3 : Item inexistant
curl -X GET http://localhost:3001/api/items/999
# Retourne : {"error":"Item not found"}
```

### **5.2 Différences Swagger vs curl**

- **Avantages Swagger :** Interface visuelle, documentation intégrée, formatage automatique
- **Avantages curl :** Scriptable, plus rapide, utilisable en production

---

## 📁 **Exercice 6 : Analyser la structure du code**

### **6.1 Service (items.service.js)**

**Réponses :**

1. **Nombre d'items :** 3 dans mockData
2. **Catégories :** "electronics", "home", "books", "clothing"
3. **Structure d'un item :**
   ```javascript
   {
     id: string,
     name: string,
     description: string,
     category: string, // enum
     price: number,
     createdAt: string // ISO date
   }
   ```

### **6.2 Routes (items.routes.js)**

**Réponses :**

1. **Méthodes HTTP :** GET, POST, PUT, DELETE
2. **Middleware :** `validateSchema` pour POST et PUT
3. **Paramètres :** Extraits via `req.params.id`

### **6.3 Contrôleur (items.controller.js)**

**Réponses :**

1. **Gestion d'erreurs :** Try-catch avec status codes appropriés
2. **getAllItems retourne :** `res.json(items)` avec status 200
3. **Validation :** Via middleware `validateSchema` avant le contrôleur

---

## 🎨 **Exercice 7 : Personnalisation simple**

### **7.1 Code à ajouter dans mockData**

```javascript
{
  id: '4',
  name: 'Mon Premier Item',
  description: 'Item ajouté pendant le TP',
  category: 'home',
  price: 25.50,
  createdAt: new Date().toISOString()
}
```

### **7.2 Validation**

Après redémarrage, GET /api/items doit retourner 4 items au lieu de 3.

---

## 🔧 **Exercice 8 : Dépannage**

### **8.1 Test arrêt/redémarrage**

✅ Comportement normal : Les données reviennent à l'état initial (3 items)
⚠️ **Important :** Les données sont en mémoire, elles ne persistent pas

### **8.2 Test changement de port**

- Modifier `.env` : `PORT=3002`
- Nouveau démarrage : "Server started successfully on port 3002"
- Nouvelle URL Swagger : http://localhost:3002/docs

---

## 🏆 **Quiz de validation - Réponses**

1. **Que signifie REST ?**
   ✅ **Representational State Transfer**

2. **Quel code HTTP indique un succès ?**
   ✅ **200**

3. **Que fait GET /api/items/1 ?**
   ✅ **Récupère l'item 1**

4. **Où sont stockées les données dans ce TP ?**
   ✅ **Mémoire (variable JavaScript)**

5. **Quel est le rôle de Swagger ?**
   ✅ **Documenter et tester l'API**

---

## 🔧 **Problèmes courants et solutions**

### **Erreur "EADDRINUSE" (port occupé)**

```bash
# Solution 1 : Changer le port
echo "PORT=3002" > .env

# Solution 2 : Tuer le processus
lsof -ti:3001 | xargs kill
```

### **Erreur "Cannot GET /"**

✅ **Normal !** La racine n'est pas définie. Utilisez `/api/items` ou `/docs`

### **Swagger ne s'affiche pas**

```bash
# Vérifications
curl http://localhost:3001/docs  # Doit retourner HTML
curl http://localhost:3001/api/items  # Doit retourner JSON
```

### **Module non trouvé**

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 **Points de contrôle réussite**

### **Niveau débutant (minimal)**

- [ ] Serveur démarre sans erreur
- [ ] Swagger accessible
- [ ] GET /api/items fonctionne

### **Niveau intermédiaire**

- [ ] Tous les endpoints testés
- [ ] Tests curl réussis
- [ ] Code source analysé

### **Niveau avancé**

- [ ] Données modifiées avec succès
- [ ] Dépannage maîtrisé
- [ ] Quiz 100% correct

---

## 🚀 **Prérequis pour le TP 2**

Avant de continuer, vous devez maîtriser :

✅ **Concepts**

- Architecture REST (GET, POST, PUT, DELETE)
- Codes de statut HTTP (200, 404, 500)
- Format JSON pour les échanges

✅ **Outils**

- Utilisation de Swagger UI
- Tests curl en ligne de commande
- Navigation dans le code source

✅ **Structure du projet**

- Rôle des dossiers (services, controllers, routes)
- Flow d'une requête (route → controller → service)
- Configuration avec variables d'environnement

**🎯 Si tout est acquis, passez au TP 2 !**

```bash
git checkout tp-02-premiers-pas
```
