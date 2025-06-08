# 📝 Exercices - TP Niveau 5 : Sécurité et Authentification

## 🎯 **Objectif**

Maîtriser l'authentification JWT et API Key, protéger des endpoints et implémenter les bonnes pratiques de sécurité.

---

## 🔐 **Exercice 1 : Analyse du système d'authentification**

### **1.1 Comprendre l'architecture de sécurité**

Examinez les fichiers suivants et complétez l'analyse :

**Fichier :** `src/middleware/auth.middleware.js`

```bash
# Ouvrir le fichier
cat src/middleware/auth.middleware.js
```

**❓ Questions d'analyse :**

1. Quels sont les deux types d'authentification supportés ?

   - Type 1 : ****\_\_\_****
   - Type 2 : ****\_\_\_****

2. Dans quel ordre sont-ils vérifiés ?

   - Premier : ****\_\_\_****
   - Deuxième : ****\_\_\_****

3. Que contient l'objet `req.user` après authentification JWT réussie ?

   ```json
   {
     "userId": "___________",
     "email": "___________",
     "role": "___________",
     "iat": "___________",
     "exp": "___________"
   }
   ```

4. Quels codes d'erreur HTTP sont retournés ?
   - Token manquant : ****\_\_\_****
   - Token invalide : ****\_\_\_****
   - API Key incorrecte : ****\_\_\_****

### **1.2 Analyser la configuration Swagger**

**Fichier :** `src/swagger/swagger.config.js`

**❓ Questions :**

1. Quels schémas de sécurité sont définis ?

   - Schéma 1 : ****\_\_\_****
   - Schéma 2 : ****\_\_\_****

2. Comment l'API Key doit-elle être envoyée ?
   - En-tête : ****\_\_\_****
   - Valeur : ****\_\_\_****

---

## 🧪 **Exercice 2 : Tests d'authentification basiques**

### **2.1 Test sans authentification**

```bash
# Test 1 : Récupérer tous les items (non protégé)
curl -X GET http://localhost:3001/api/items

# Test 2 : Créer un item (peut être protégé selon configuration)
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test sans auth",
    "description": "Test de sécurité",
    "category": "electronics",
    "price": 99.99
  }'
```

**📝 Résultats :**

- Test 1 - Code de statut : ****\_\_\_****
- Test 1 - Nombre d'items retournés : ****\_\_\_****
- Test 2 - Code de statut : ****\_\_\_****
- Test 2 - Message d'erreur (si applicable) : ****\_\_\_****

### **2.2 Test avec API Key valide**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Item avec API Key",
    "description": "Créé avec authentification API Key",
    "category": "books",
    "price": 25.99
  }'
```

**📝 Résultats :**

- Code de statut : ****\_\_\_****
- ID de l'item créé : ****\_\_\_****
- L'item apparaît-il dans GET /api/items ? ****\_\_\_****

### **2.3 Test avec API Key invalide**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: fake-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test echec",
    "category": "electronics",
    "price": 10
  }'
```

**📝 Résultats :**

- Code de statut : ****\_\_\_****
- Message d'erreur : ****\_\_\_****

---

## 🎫 **Exercice 3 : Authentification JWT**

### **3.1 Générer un token JWT de test**

Créez un fichier `generate-jwt.js` :

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
```

```bash
# Exécuter le script
node generate-jwt.js
```

**📝 Token généré :**

```
___________________________________________
```

### **3.2 Tester avec le token JWT**

```bash
# Remplacez YOUR_JWT_TOKEN par le token généré
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Item avec JWT",
    "description": "Créé avec token JWT",
    "category": "electronics",
    "price": 199.99
  }'
```

**📝 Résultats :**

- Code de statut : ****\_\_\_****
- Item créé avec succès ? ****\_\_\_****

### **3.3 Tester avec un token malformé**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer token.invalide.test" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test token invalide",
    "category": "electronics",
    "price": 10
  }'
```

**📝 Résultats :**

- Code de statut : ****\_\_\_****
- Message d'erreur : ****\_\_\_****

---

## 🛡️ **Exercice 4 : Protection des endpoints**

### **4.1 Identifier les endpoints protégés**

Examinez `src/routes/items.routes.js` :

**❓ Questions :**

1. Quels endpoints utilisent le middleware `authMiddleware` ?

   - ***
   - ***
   - ***

2. Quels endpoints sont accessibles sans authentification ?
   - ***
   - ***

### **4.2 Modifier la protection des endpoints**

**Mission :** Protéger l'endpoint PUT /api/items/:id

1. Ouvrez `src/routes/items.routes.js`
2. Trouvez la ligne du PUT
3. Ajoutez `authMiddleware` si ce n'est pas déjà fait

**Code avant modification :**

```javascript
router.put(
  "/:id",
  validateSchema(updateItemSchema),
  itemsController.updateItem
);
```

**Code après modification :**

```javascript
router.put(
  "/:id",
  authMiddleware,
  validateSchema(updateItemSchema),
  itemsController.updateItem
);
```

### **4.3 Tester la protection ajoutée**

```bash
# Test sans auth - doit échouer
curl -X PUT http://localhost:3001/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Modification sans auth",
    "price": 999.99
  }'

# Test avec auth - doit réussir
curl -X PUT http://localhost:3001/api/items/1 \
  -H "X-API-Key: test-api-key-change-this-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Modification avec auth",
    "price": 899.99
  }'
```

**📝 Résultats :**

- Sans auth - Code : ****\_\_\_****
- Avec auth - Code : ****\_\_\_****
- Modification appliquée ? ****\_\_\_****

---

## 📊 **Exercice 5 : Tests avec Swagger UI**

### **5.1 Configuration de l'authentification dans Swagger**

1. Accédez à http://localhost:3001/docs
2. Cherchez le bouton "Authorize" (🔒)
3. Cliquez dessus

**❓ Questions :**

- Le bouton "Authorize" est-il visible ? ****\_\_\_****
- Quels types d'auth sont proposés ? ****\_\_\_****

### **5.2 Test avec API Key via Swagger**

1. Dans la popup "Authorize"
2. Section "apiKeyAuth"
3. Entrez : `test-api-key-change-this-in-production`
4. Cliquez "Authorize"
5. Testez POST /api/items

**📝 Résultats :**

- Authentification configurée avec succès ? ****\_\_\_****
- POST /api/items fonctionne ? ****\_\_\_****

### **5.3 Test avec JWT via Swagger**

1. Générez un JWT (exercice 3.1)
2. Dans "Authorize", section "bearerAuth"
3. Entrez le token (sans "Bearer ")
4. Testez un endpoint protégé

**📝 Résultats :**

- JWT accepté ? ****\_\_\_****
- Endpoint protégé accessible ? ****\_\_\_****

---

## 🔍 **Exercice 6 : Analyse des logs de sécurité**

### **6.1 Ajouter des logs personnalisés**

Modifiez `src/middleware/auth.middleware.js` pour ajouter des logs :

```javascript
// Après une authentification réussie
console.log(
  `[AUTH SUCCESS] ${req.user?.email || "API Key"} accessed ${req.method} ${
    req.path
  }`
);

// Après un échec d'authentification
console.log(
  `[AUTH FAILED] Unauthorized access attempt to ${req.method} ${req.path} from ${req.ip}`
);
```

### **6.2 Générer des logs**

Faites plusieurs requêtes et observez les logs :

```bash
# Requête réussie
curl -X GET http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production"

# Requête échouée
curl -X POST http://localhost:3001/api/items \
  -H "X-API-Key: wrong-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "electronics", "price": 10}'
```

**📝 Logs observés :**

- Log succès : ****\_\_\_****
- Log échec : ****\_\_\_****

---

## 🧪 **Exercice 7 : Tests de sécurité avancés**

### **7.1 Test de token expiré**

Créez un token expiré :

```javascript
// Dans generate-jwt.js, modifier l'expiration
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "-1h" }); // Expiré
```

Testez avec ce token :

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer EXPIRED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test expired", "category": "electronics", "price": 10}'
```

**📝 Résultats :**

- Code de statut : ****\_\_\_****
- Message d'erreur : ****\_\_\_****

### **7.2 Test d'injection dans les headers**

```bash
curl -X GET http://localhost:3001/api/items \
  -H "Authorization: Bearer <script>alert('xss')</script>" \
  -H "X-API-Key: ; rm -rf /"
```

**❓ Questions :**

- Y a-t-il une validation des headers ? ****\_\_\_****
- Comment améliorer la sécurité ? ****\_\_\_****

### **7.3 Test de brute force**

Script de test de force brute :

```bash
# Test multiple API keys
for key in "key1" "key2" "admin" "test" "password"; do
  echo "Testing with key: $key"
  curl -s -X GET http://localhost:3001/api/items \
    -H "X-API-Key: $key" \
    -w "Status: %{http_code}\n" \
    -o /dev/null
done
```

**📝 Observations :**

- Y a-t-il un rate limiting ? ****\_\_\_****
- Après combien de tentatives êtes-vous bloqué ? ****\_\_\_****

---

## 📈 **Exercice 8 : Performance et monitoring**

### **8.1 Mesurer l'impact de l'authentification**

Testez la performance avec et sans auth :

```bash
# Sans auth (endpoint public)
time curl -X GET http://localhost:3001/api/items

# Avec auth
time curl -X GET http://localhost:3001/api/items \
  -H "X-API-Key: test-api-key-change-this-in-production"
```

**📝 Temps de réponse :**

- Sans auth : ****\_\_\_****ms
- Avec auth : ****\_\_\_****ms
- Différence : ****\_\_\_****ms

### **8.2 Test de charge avec authentification**

```bash
# Test de charge simple
for i in {1..50}; do
  curl -s -X GET http://localhost:3001/api/items \
    -H "X-API-Key: test-api-key-change-this-in-production" &
done
wait
```

**❓ Questions :**

- Toutes les requêtes ont-elles réussi ? ****\_\_\_****
- Y a-t-il eu des timeouts ? ****\_\_\_****

---

## 🔧 **Exercice 9 : Configuration de sécurité**

### **9.1 Vérifier les variables d'environnement**

```bash
# Vérifier les secrets
echo "JWT_SECRET: $JWT_SECRET"
echo "API_KEY: $API_KEY"
```

**❓ Questions :**

- Les secrets sont-ils assez complexes ? ****\_\_\_****
- Que devriez-vous changer en production ? ****\_\_\_****

### **9.2 Tester différents secrets**

1. Modifiez `JWT_SECRET` dans `.env`
2. Redémarrez le serveur
3. Testez avec un ancien token JWT

**📝 Résultats :**

- L'ancien token fonctionne-t-il ? ****\_\_\_****
- Pourquoi ? ****\_\_\_****

### **9.3 Audit de sécurité rapide**

```bash
# Chercher des secrets dans le code
grep -r "password\|secret\|key" src/ --exclude="*.md"

# Vérifier les dépendances vulnérables
npm audit
```

**📝 Trouvailles :**

- Secrets en dur trouvés ? ****\_\_\_****
- Vulnérabilités npm ? ****\_\_\_****

---

## 🎯 **Exercice 10 : Scénarios réels**

### **10.1 Scénario : Application mobile**

Une app mobile doit :

1. S'authentifier avec API Key
2. Créer des items
3. Consulter ses propres items

Implémentez ce workflow :

```bash
# 1. Auth avec API Key
# 2. Créer un item
# 3. Récupérer l'item créé
```

### **10.2 Scénario : Dashboard admin**

Un dashboard web doit :

1. Login avec JWT
2. Voir tous les items
3. Modifier/supprimer des items

Testez ce workflow avec Swagger.

### **10.3 Scénario : API publique**

Une API publique doit :

1. Lecture libre (sans auth)
2. Écriture avec API Key seulement

Configurez les routes selon ce modèle.

---

## ✅ **Validation finale**

### **Quiz de compréhension**

**1. Différence entre authentification et autorisation ?**

- [ ] Pas de différence
- [ ] Auth = qui vous êtes, Authz = ce que vous pouvez faire
- [ ] Auth = côté client, Authz = côté serveur
- [ ] Auth = JWT, Authz = API Key

**2. Avantage du JWT sur les sessions ?**

- [ ] Plus sécurisé
- [ ] Stateless (sans état serveur)
- [ ] Plus rapide
- [ ] Plus simple

**3. Où stocker un JWT côté client ?**

- [ ] Base de données
- [ ] Cookie HttpOnly ou localStorage
- [ ] URL
- [ ] Session serveur

**4. Que contient un JWT ?**

- [ ] Seulement l'ID utilisateur
- [ ] Header + Payload + Signature
- [ ] Mot de passe chiffré
- [ ] Clé API

**5. Code HTTP pour "non autorisé" ?**

- [ ] 400
- [ ] 401
- [ ] 403
- [ ] 404

### **Checklist pratique**

- [ ] ✅ J'ai testé l'auth JWT et API Key
- [ ] ✅ J'ai protégé des endpoints avec authMiddleware
- [ ] ✅ J'ai configuré l'auth dans Swagger
- [ ] ✅ J'ai généré des tokens JWT personnalisés
- [ ] ✅ J'ai testé les cas d'erreur d'authentification
- [ ] ✅ J'ai ajouté des logs de sécurité
- [ ] ✅ J'ai testé les vulnérabilités basiques
- [ ] ✅ J'ai vérifié la configuration de sécurité

### **Défis bonus**

- [ ] 🏆 Implémenter un refresh token
- [ ] 🏆 Ajouter la validation de rôles
- [ ] 🏆 Créer un endpoint de révocation de token
- [ ] 🏆 Implémenter un rate limiting avancé

---

## 🚀 **Prêt pour le TP suivant ?**

Si vous avez complété tous les exercices avec succès :

```bash
git add .
git commit -m "🔐 TP5 - Sécurité: Exercices complets et tests d'authentification"
git checkout tp-06-database
```

**🎯 Le prochain TP vous apprendra :**

- Intégration d'une vraie base de données
- Migration des données en mémoire
- Optimisation des performances
- Gestion des transactions
