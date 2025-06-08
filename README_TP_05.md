# 🔐 TP Niveau 5 : Sécurité et Authentification

## 🎯 **Objectifs**

- Comprendre l'authentification JWT et API Key
- Protéger des endpoints avec des middlewares
- Gérer les rôles et permissions utilisateurs
- Implémenter les bonnes pratiques de sécurité

## ⏱️ **Durée estimée :** 5-6 heures

---

## 📋 **Prérequis**

### Ce que vous devez maîtriser

- ✅ CRUD complet avec validation (TPs 1-3)
- ✅ Tests unitaires et d'intégration (TP 4)
- ✅ Middleware et architecture Express
- ✅ Concepts de base HTTP et REST

### Concepts de sécurité à connaître

- **Authentification** : Vérifier l'identité (qui êtes-vous ?)
- **Autorisation** : Vérifier les permissions (que pouvez-vous faire ?)
- **JWT** : JSON Web Token pour l'authentification stateless
- **API Key** : Clé simple pour authentifier les applications

---

## 🚀 **Configuration initiale**

### 1. Installation et démarrage

```bash
# Récupérer le code
git checkout tp-05-securite
npm install
npm start
```

### 2. Variables d'environnement

Le fichier `.env` contient maintenant :

```bash
PORT=3001
FRAMEWORK=express
JWT_SECRET=your-secret-key-change-this-in-production
API_KEY=test-api-key-change-this-in-production
```

### 3. Vérification

```bash
# Tester l'API sans authentification
curl http://localhost:3001/api/items
# Doit fonctionner normalement
```

---

## 🔐 **Concepts de sécurité**

### **🎫 JWT (JSON Web Token)**

#### Structure d'un JWT

```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0...
```

#### Contenu du payload

```json
{
  "userId": "123",
  "email": "user@example.com",
  "role": "user",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### **🔑 API Key**

```bash
# En-tête HTTP
X-API-Key: test-api-key-change-this-in-production
```

### **🛡️ Middleware d'authentification**

Le middleware vérifie l'authentification avant d'exécuter les contrôleurs.

---

## 🧪 **Exercices pratiques**

### **Exercice 1 : Comprendre l'authentification actuelle**

#### 1.1 Analyser le middleware d'authentification

Ouvrez `src/middleware/auth.middleware.js` et examinez :

**❓ Questions :**

- Quels types d'authentification sont supportés ? ****\_\_\_****
- Comment le JWT est-il extrait de la requête ? ****\_\_\_****
- Que contient `req.user` après authentification ? ****\_\_\_****

#### 1.2 Tester l'API sans authentification

```bash
# Ces endpoints fonctionnent sans auth
curl http://localhost:3001/api/items
curl http://localhost:3001/api/items/1
```

### **Exercice 2 : Activer l'authentification**

#### 2.1 Protéger les endpoints de modification

Dans `src/routes/items.routes.js`, vous verrez que certains endpoints peuvent être protégés.

Examinez la configuration actuelle :

```javascript
// Endpoints protégés (commentés pour ce TP)
// router.post('/', authMiddleware, validateSchema(createItemSchema), itemsController.createItem);
```

#### 2.2 Tester avec authentification JWT

**Générer un token :**

```bash
# Via un endpoint de test (si disponible)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

**Utiliser le token :**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Item sécurisé", "category": "electronics", "price": 99.99}'
```

### **Exercice 3 : Authentification avec API Key**

#### 3.1 Tester avec API Key

```bash
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production" \
  -H "Content-Type: application/json" \
  -d '{"name": "Item via API Key", "category": "books", "price": 29.99}'
```

#### 3.2 Tester les cas d'erreur

```bash
# API Key invalide
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: invalid-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'

# Sans authentification
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'
```

**❓ Questions :**

- Code d'erreur pour API Key invalide : ****\_\_\_****
- Message d'erreur retourné : ****\_\_\_****

---

## 🔍 **Analyse du code de sécurité**

### **Exercice 4 : Comprendre le middleware d'authentification**

#### 4.1 Structure du middleware

Dans `src/middleware/auth.middleware.js`, analysez :

```javascript
export const authMiddleware = async (req, res, next) => {
  // 1. Extraction du token
  // 2. Vérification JWT ou API Key
  // 3. Ajout de req.user
  // 4. Appel de next() ou erreur
};
```

**❓ Questions :**

- Dans quel ordre les méthodes d'auth sont-elles testées ? ****\_\_\_****
- Que contient `req.user` après auth JWT ? ****\_\_\_****
- Comment différencier l'auth JWT de l'API Key ? ****\_\_\_****

#### 4.2 Gestion des erreurs

Analysez les différents codes d'erreur :

- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Token valide mais permissions insuffisantes

### **Exercice 5 : Tester les permissions et rôles**

#### 5.1 Comprendre les rôles

Si implémenté, le système peut avoir des rôles :

- `admin` : Tous les droits
- `user` : Lecture et création
- `guest` : Lecture seule

#### 5.2 Créer des tokens de test

```javascript
// Token admin (exemple)
const jwt = require("jsonwebtoken");
const adminToken = jwt.sign(
  { userId: "1", email: "admin@example.com", role: "admin" },
  "your-secret-key",
  { expiresIn: "24h" }
);
```

---

## 🛠️ **Modifications pratiques**

### **Exercice 6 : Personnaliser l'authentification**

#### 6.1 Modifier les endpoints protégés

Dans `src/routes/items.routes.js`, décommentez les lignes pour activer l'auth :

```javascript
// Avant (sans auth)
router.post("/", validateSchema(createItemSchema), itemsController.createItem);

// Après (avec auth)
router.post(
  "/",
  authMiddleware,
  validateSchema(createItemSchema),
  itemsController.createItem
);
```

#### 6.2 Protéger d'autres endpoints

Ajoutez l'authentification à d'autres opérations :

```javascript
router.put(
  "/:id",
  authMiddleware,
  validateSchema(updateItemSchema),
  itemsController.updateItem
);
router.delete("/:id", authMiddleware, itemsController.deleteItem);
```

#### 6.3 Tester les modifications

Redémarrez le serveur et testez :

```bash
# Sans auth - doit échouer
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'

# Avec auth - doit réussir
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'
```

### **Exercice 7 : Ajouter des logs de sécurité**

#### 7.1 Logger les tentatives d'authentification

Dans `src/middleware/auth.middleware.js`, ajoutez des logs :

```javascript
// Tentative d'accès non autorisé
console.log(
  `[SECURITY] Unauthorized access attempt from ${req.ip} to ${req.path}`
);

// Authentification réussie
console.log(`[SECURITY] User ${req.user.email} authenticated for ${req.path}`);
```

#### 7.2 Tester les logs

Faites des requêtes et observez les logs dans la console du serveur.

---

## 🧪 **Tests de sécurité**

### **Exercice 8 : Scénarios de sécurité**

#### 8.1 Test de contournement

Essayez de contourner l'authentification :

```bash
# Modifier les en-têtes
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer fake-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'

# Token expiré (si vous en avez un)
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer EXPIRED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'
```

#### 8.2 Test d'injection

Testez avec des données malveillantes :

```bash
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production" \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(\"XSS\")</script>", "category": "electronics", "price": 10}'
```

**❓ Questions :**

- Les données malveillantes sont-elles filtrées ? ****\_\_\_****
- Comment pourriez-vous améliorer la sécurité ? ****\_\_\_****

---

## 📊 **Swagger avec authentification**

### **Exercice 9 : Configurer Swagger pour l'auth**

#### 9.1 Interface Swagger avec authentification

Accédez à http://localhost:3001/docs et observez :

- Y a-t-il un bouton "Authorize" ? ****\_\_\_****
- Quels types d'auth sont configurés ? ****\_\_\_****

#### 9.2 Tester via Swagger

1. Cliquez sur "Authorize"
2. Entrez l'API Key : `test-api-key-change-this-in-production`
3. Testez un endpoint protégé

#### 9.3 Analyser la configuration Swagger

Dans `src/swagger/swagger.config.js`, examinez :

```javascript
components: {
  securitySchemes: {
    bearerAuth: { ... },
    apiKeyAuth: { ... }
  }
}
```

---

## 🔧 **Sécurité avancée**

### **Exercice 10 : Bonnes pratiques de sécurité**

#### 10.1 Variables d'environnement

Vérifiez que les secrets ne sont pas en dur dans le code :

```bash
# Chercher des secrets potentiels
grep -r "secret\|password\|key" src/ --exclude-dir=node_modules
```

#### 10.2 Validation des tokens

Testez la robustesse des tokens :

```bash
# Token malformé
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer not.a.valid.jwt" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'
```

#### 10.3 Rate limiting

Testez les limites de débit :

```bash
# Faire plusieurs requêtes rapidement
for i in {1..20}; do
  curl -X GET http://localhost:3001/api/items
done
```

**❓ Questions :**

- Y a-t-il une limitation du nombre de requêtes ? ****\_\_\_****
- Après combien de requêtes êtes-vous bloqué ? ****\_\_\_****

---

## 📋 **Validation des acquis**

### **Compréhension des concepts**

- [ ] Je comprends la différence entre authentification et autorisation
- [ ] Je sais ce qu'est un JWT et son contenu
- [ ] Je connais les avantages/inconvénients des API Keys
- [ ] Je comprends le rôle des middlewares de sécurité

### **Compétences pratiques**

- [ ] Je sais protéger des endpoints avec des middlewares
- [ ] Je peux tester l'authentification avec différents outils
- [ ] Je sais configurer Swagger pour l'authentification
- [ ] Je peux analyser et déboguer les problèmes d'auth

### **Sécurité appliquée**

- [ ] Je connais les bonnes pratiques de stockage des secrets
- [ ] Je sais tester les vulnérabilités basiques
- [ ] Je comprends l'importance du rate limiting
- [ ] Je peux implémenter des logs de sécurité

---

## 🎯 **Quiz de validation**

### 1. Qu'est-ce qu'un JWT ?

- [ ] Un cookie sécurisé
- [ ] Un token JSON signé
- [ ] Une clé API
- [ ] Un hash de mot de passe

### 2. Où est stocké le JWT côté client ?

- [ ] Base de données
- [ ] Cookie/LocalStorage
- [ ] Session serveur
- [ ] Fichier temporaire

### 3. Que signifie le code 401 ?

- [ ] Forbidden
- [ ] Not Found
- [ ] Unauthorized
- [ ] Bad Request

### 4. Différence entre authentification et autorisation ?

- [ ] Aucune différence
- [ ] Auth = qui êtes-vous, Authz = que pouvez-vous faire
- [ ] Auth = côté client, Authz = côté serveur
- [ ] Auth = JWT, Authz = API Key

---

## ✅ **Checklist finale**

Avant de passer au TP 6, vérifiez :

- [ ] ✅ J'ai testé l'authentification JWT et API Key
- [ ] ✅ J'ai protégé des endpoints avec des middlewares
- [ ] ✅ J'ai configuré Swagger pour l'authentification
- [ ] ✅ J'ai testé les cas d'erreur d'authentification
- [ ] ✅ J'ai analysé le code des middlewares de sécurité
- [ ] ✅ J'ai implémenté des logs de sécurité
- [ ] ✅ Je comprends les bonnes pratiques de sécurité
- [ ] ✅ J'ai testé les vulnérabilités basiques

---

## 🚀 **Prêt pour le niveau 6 ?**

Si toutes les cases sont cochées :

```bash
git add .
git commit -m "✅ TP5 terminé - Sécurité et authentification maîtrisées"
git checkout tp-06-database
```

**🎯 Dans le prochain TP :**

- Intégration d'une base de données (MongoDB/PostgreSQL)
- Migration des données en mémoire vers la DB
- Gestion des connexions et transactions
- Performance et optimisation des requêtes

---

## 💡 **Points clés à retenir**

### **🔐 Sécurité multicouche**

- Authentification (qui ?)
- Autorisation (quoi ?)
- Validation (comment ?)
- Logging (quand ?)

### **🎫 JWT vs API Key**

- **JWT** : Stateless, expiration, payload riche
- **API Key** : Simple, stateful, révocable

### **🛡️ Bonnes pratiques**

- Secrets en variables d'environnement
- Tokens avec expiration courte
- Rate limiting actif
- Logs de sécurité détaillés

### **⚡ Middleware Express**

```javascript
app.use("/api/items", authMiddleware, itemsRoutes);
// Auth appliquée à toutes les routes /api/items
```
