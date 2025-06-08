# 🔑 Solutions - TP Niveau 5 : Sécurité et Authentification

## 📋 **Solutions détaillées des exercices**

---

## 🔐 **Exercice 1 : Analyse du système d'authentification**

### **1.1 Architecture de sécurité - Solutions**

**Types d'authentification supportés :**

- Type 1 : **JWT (JSON Web Token)**
- Type 2 : **API Key**

**Ordre de vérification :**

- Premier : **JWT** (Bearer token dans Authorization header)
- Deuxième : **API Key** (X-API-Key header)

**Contenu de req.user après auth JWT :**

```json
{
  "userId": "string (ex: '1')",
  "email": "string (ex: 'admin@example.com')",
  "role": "string (ex: 'admin')",
  "iat": "number (timestamp de création)",
  "exp": "number (timestamp d'expiration)"
}
```

**Codes d'erreur HTTP :**

- Token manquant : **401**
- Token invalide : **401**
- API Key incorrecte : **401**

### **1.2 Configuration Swagger - Solutions**

**Schémas de sécurité définis :**

- Schéma 1 : **bearerAuth** (JWT)
- Schéma 2 : **apiKeyAuth** (API Key)

**Envoi de l'API Key :**

- En-tête : **X-API-Key**
- Valeur : **test-api-key-change-this-in-production**

---

## 🧪 **Exercice 2 : Tests d'authentification basiques**

### **2.1 Test sans authentification - Solutions**

```bash
# Test 1 : GET /api/items
curl -X GET http://localhost:3001/api/items
```

**Résultats attendus :**

- Code de statut : **200**
- Nombre d'items : **3** (selon données de base)

```bash
# Test 2 : POST /api/items
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test sans auth", "description": "Test", "category": "electronics", "price": 99.99}'
```

**Résultats attendus :**

- Code de statut : **401** (si protection activée) ou **201** (si pas de protection)
- Message d'erreur : **"Unauthorized - No token provided"**

### **2.2 Test avec API Key valide - Solutions**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production" \
  -H "Content-Type: application/json" \
  -d '{"name": "Item avec API Key", "description": "Créé avec auth", "category": "books", "price": 25.99}'
```

**Résultats attendus :**

- Code de statut : **201**
- ID de l'item créé : **"4"** (ou suivant disponible)
- Apparition dans GET : **Oui**

### **2.3 Test avec API Key invalide - Solutions**

**Résultats attendus :**

- Code de statut : **401**
- Message d'erreur : **"Unauthorized - Invalid API key"**

---

## 🎫 **Exercice 3 : Authentification JWT**

### **3.1 Script generate-jwt.js - Solution complète**

```javascript
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const payload = {
  userId: "1",
  email: "admin@example.com",
  role: "admin",
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
console.log("JWT Token:");
console.log(token);

// Optionnel : décoder pour vérification
const decoded = jwt.decode(token);
console.log("\nPayload décodé:");
console.log(JSON.stringify(decoded, null, 2));
```

**Token exemple :**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQxMDgxNjAwfQ.signature
```

### **3.2 Test avec JWT - Solutions**

**Résultats attendus :**

- Code de statut : **201**
- Item créé : **Oui**

### **3.3 Token malformé - Solutions**

**Résultats attendus :**

- Code de statut : **401**
- Message d'erreur : **"Unauthorized - Invalid token"**

---

## 🛡️ **Exercice 4 : Protection des endpoints**

### **4.1 Endpoints protégés - Solutions**

**Endpoints AVEC authMiddleware :**

- `POST /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

**Endpoints SANS authentification :**

- `GET /api/items`
- `GET /api/items/:id`

### **4.2 Code modifié - Solution**

**Avant :**

```javascript
router.put(
  "/:id",
  validateSchema(updateItemSchema),
  itemsController.updateItem
);
```

**Après :**

```javascript
router.put(
  "/:id",
  authMiddleware,
  validateSchema(updateItemSchema),
  itemsController.updateItem
);
```

### **4.3 Test de protection - Solutions**

**Sans auth :**

- Code : **401**

**Avec auth :**

- Code : **200**
- Modification appliquée : **Oui**

---

## 📊 **Exercice 5 : Tests avec Swagger UI**

### **5.1 Configuration Swagger - Solutions**

**Réponses :**

- Bouton "Authorize" visible : **Oui** (🔒 en haut à droite)
- Types d'auth proposés : **bearerAuth (JWT)** et **apiKeyAuth (API Key)**

### **5.2 Test API Key Swagger - Solutions**

**Procédure :**

1. Cliquer sur "Authorize"
2. Section "apiKeyAuth (X-API-Key)"
3. Entrer : `test-api-key-change-this-in-production`
4. Cliquer "Authorize" puis "Close"
5. Tester POST /api/items

**Résultats :**

- Auth configurée : **Oui**
- POST fonctionne : **Oui**

### **5.3 Test JWT Swagger - Solutions**

**Procédure :**

1. Générer JWT avec script
2. Dans "Authorize", section "bearerAuth (http, Bearer)"
3. Entrer le token SANS "Bearer " au début
4. Tester endpoint protégé

**Résultats :**

- JWT accepté : **Oui**
- Endpoint accessible : **Oui**

---

## 🔍 **Exercice 6 : Logs de sécurité**

### **6.1 Code des logs - Solution**

```javascript
export const authMiddleware = async (req, res, next) => {
  try {
    // ... logique d'authentification ...

    // Après succès
    if (req.user) {
      console.log(
        `[AUTH SUCCESS] ${req.user.email || "API Key"} accessed ${req.method} ${
          req.path
        } from ${req.ip}`
      );
    }

    next();
  } catch (error) {
    // Après échec
    console.log(
      `[AUTH FAILED] Unauthorized access attempt to ${req.method} ${
        req.path
      } from ${req.ip || "unknown"}`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }
};
```

### **6.2 Logs observés - Solutions**

**Log succès :**

```
[AUTH SUCCESS] API Key accessed GET /api/items from ::1
```

**Log échec :**

```
[AUTH FAILED] Unauthorized access attempt to POST /api/items from ::1
```

---

## 🧪 **Exercice 7 : Tests de sécurité avancés**

### **7.1 Token expiré - Solution**

**Script modifié :**

```javascript
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "-1h" });
```

**Résultats :**

- Code de statut : **401**
- Message d'erreur : **"Unauthorized - Token expired"**

### **7.2 Injection headers - Solutions**

**Observations :**

- Validation des headers : **Basique** (JWT vérifie le format)
- Améliorations : Sanitisation, validation stricte, rate limiting

### **7.3 Brute force - Solutions**

**Script complet :**

```bash
#!/bin/bash
echo "Testing API Key brute force..."
for key in "key1" "key2" "admin" "test" "password" "api" "secret"; do
  echo -n "Testing '$key': "
  status=$(curl -s -X GET http://localhost:3001/api/items \
    -H "X-API-Key: $key" \
    -w "%{http_code}" \
    -o /dev/null)
  echo "Status $status"
  sleep 0.1
done
```

**Observations :**

- Rate limiting : **Dépend de la configuration**
- Blocage après : **Variable selon middleware**

---

## 📈 **Exercice 8 : Performance et monitoring**

### **8.1 Impact performance - Solutions**

**Temps de réponse typiques :**

- Sans auth : **10-50ms**
- Avec auth : **15-60ms**
- Différence : **5-10ms** (overhead de vérification JWT/API Key)

### **8.2 Test de charge - Solutions**

**Script optimisé :**

```bash
#!/bin/bash
echo "Starting load test..."
start_time=$(date +%s)

for i in {1..50}; do
  curl -s -X GET http://localhost:3001/api/items \
    -H "X-API-Key: test-api-key-change-this-in-production" \
    -w "Request $i: %{http_code} (%{time_total}s)\n" \
    -o /dev/null &
done

wait
end_time=$(date +%s)
echo "Test completed in $((end_time - start_time)) seconds"
```

**Observations typiques :**

- Toutes réussies : **Généralement oui**
- Timeouts : **Rares sur localhost**

---

## 🔧 **Exercice 9 : Configuration de sécurité**

### **9.1 Vérification secrets - Solutions**

**Secrets par défaut :**

```bash
JWT_SECRET=your-secret-key-change-this-in-production
API_KEY=test-api-key-change-this-in-production
```

**Évaluation sécurité :**

- Complexité : **Insuffisante pour production**
- À changer : **Tout** - utiliser des générateurs de secrets

**Générateur de secrets sécurisés :**

```bash
# JWT Secret (256 bits)
openssl rand -base64 32

# API Key (128 bits)
openssl rand -hex 16
```

### **9.2 Test rotation secrets - Solutions**

**Procédure :**

1. Générer token avec ancien secret
2. Changer JWT_SECRET dans .env
3. Redémarrer serveur
4. Tester token

**Résultats :**

- Ancien token fonctionne : **Non**
- Pourquoi : **Signature invalide avec nouveau secret**

### **9.3 Audit sécurité - Solutions**

**Commandes d'audit :**

```bash
# Recherche de secrets
grep -r "password\|secret\|key" src/ --exclude="*.md" --exclude-dir=node_modules

# Audit npm
npm audit --audit-level=moderate

# Vérification de configuration
cat .env | grep -E "(SECRET|KEY|PASSWORD)"
```

**Trouvailles communes :**

- Secrets en dur : **Variables d'environnement référencées**
- Vulnérabilités npm : **Dépend des versions**

---

## 🎯 **Exercice 10 : Scénarios réels**

### **10.1 Scénario mobile - Solution**

```bash
#!/bin/bash
echo "=== Workflow Application Mobile ==="

# 1. Auth avec API Key
echo "1. Authentification..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Photo depuis mobile",
    "description": "Uploadée depuis app mobile",
    "category": "electronics",
    "price": 599.99
  }')

echo "Réponse: $RESPONSE"

# 2. Extraire ID (supposant format JSON)
ITEM_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Item créé avec ID: $ITEM_ID"

# 3. Récupérer l'item
echo "3. Récupération de l'item..."
curl -X GET http://localhost:3001/api/items/$ITEM_ID \
  -H "X-API-Key: test-api-key-change-this-in-production"
```

### **10.2 Dashboard admin - Solution**

**Workflow Swagger :**

1. **Login JWT :**

   - Générer token avec `node generate-jwt.js`
   - Configurer dans Swagger Authorize

2. **Consultation :**

   - GET /api/items → Voir tous les items

3. **Modification :**
   - PUT /api/items/1 → Modifier un item existant
   - DELETE /api/items/2 → Supprimer un item

### **10.3 API publique - Solution**

**Configuration recommandée dans routes :**

```javascript
// Lecture libre (sans auth)
router.get("/", itemsController.getAllItems);
router.get("/:id", itemsController.getItemById);

// Écriture avec API Key seulement
router.post(
  "/",
  authMiddleware,
  validateSchema(createItemSchema),
  itemsController.createItem
);
router.put(
  "/:id",
  authMiddleware,
  validateSchema(updateItemSchema),
  itemsController.updateItem
);
router.delete("/:id", authMiddleware, itemsController.deleteItem);
```

---

## ✅ **Solutions du Quiz final**

### **Réponses correctes :**

**1. Différence entre authentification et autorisation ?**
✅ **Auth = qui vous êtes, Authz = ce que vous pouvez faire**

**2. Avantage du JWT sur les sessions ?**
✅ **Stateless (sans état serveur)**

**3. Où stocker un JWT côté client ?**
✅ **Cookie HttpOnly ou localStorage**

**4. Que contient un JWT ?**
✅ **Header + Payload + Signature**

**5. Code HTTP pour "non autorisé" ?**
✅ **401**

---

## 🚀 **Solutions des défis bonus**

### **🏆 Refresh Token - Solution**

```javascript
// Endpoint refresh token
router.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    // Vérifier refresh token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Générer nouveau access token
    const newToken = jwt.sign(
      { userId: payload.userId, email: payload.email, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});
```

### **🏆 Validation de rôles - Solution**

```javascript
// Middleware de rôles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Usage
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin"]),
  itemsController.deleteItem
);
```

### **🏆 Rate limiting avancé - Solution**

```javascript
import rateLimit from "express-rate-limit";

// Rate limiting par endpoint
const createItemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: "Too many items created, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting par utilisateur authentifié
const userBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // Plus de requêtes pour les admins
    return req.user?.role === "admin" ? 1000 : 100;
  },
  keyGenerator: (req) => {
    // Utiliser l'ID utilisateur au lieu de l'IP
    return req.user?.userId || req.ip;
  },
});
```

---

## 📚 **Ressources complémentaires**

### **Documentation avancée**

- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### **Outils de sécurité**

- **helmet.js** : Headers de sécurité
- **express-rate-limit** : Rate limiting avancé
- **express-validator** : Validation et sanitisation
- **bcrypt** : Hachage de mots de passe

### **Tests de sécurité automatisés**

```javascript
// Exemple de test de sécurité avec Node.js Test Runner
import { test } from "node:test";
import assert from "node:assert";

test("should reject invalid JWT", async () => {
  const response = await fetch("http://localhost:3001/api/items", {
    method: "POST",
    headers: {
      Authorization: "Bearer invalid.jwt.token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Test", category: "electronics", price: 10 }),
  });

  assert.strictEqual(response.status, 401);
});
```

**🎉 Félicitations ! Vous maîtrisez maintenant les aspects fondamentaux de la sécurité API !**
