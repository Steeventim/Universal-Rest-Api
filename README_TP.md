# 🔰 TP Niveau 1 : Découverte

## 🎯 **Objectifs**

- Comprendre la structure du projet
- Faire fonctionner l'API de base
- Explorer l'interface Swagger
- Tester les endpoints avec des outils

## ⏱️ **Durée estimée :** 1-2 heures

---

## 📋 **Prérequis**

### Logiciels nécessaires

- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Un éditeur de code ([VS Code](https://code.visualstudio.com/) recommandé)

### Connaissances requises

- Bases de JavaScript
- Utilisation du terminal/ligne de commande
- Notions de base des APIs REST

---

## 🚀 **Installation et démarrage**

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration

```bash
# Copier le fichier de configuration
cp .env.example .env

# Le fichier .env contient :
# PORT=3001
# FRAMEWORK=express
# JWT_SECRET=your-secret-key
```

### 3. Démarrage du serveur

```bash
npm start
```

Vous devriez voir :

```
🚀 Server started successfully on port 3001
📚 Swagger documentation available at: http://localhost:3001/docs
```

### 4. Vérification

Ouvrez votre navigateur à l'adresse : http://localhost:3001/docs

---

## 🏗️ **Structure du projet**

```
src/
├── config/           # Configuration (variables d'environnement)
├── controllers/      # Logique de contrôle des endpoints
├── framework/        # Adaptateurs pour différents frameworks
├── middleware/       # Middlewares (auth, validation, etc.)
├── routes/          # Définition des routes
├── schemas/         # Schémas de validation des données
├── services/        # Logique métier
└── swagger/         # Configuration de la documentation
```

---

## 🧪 **Exercices pratiques**

### **Exercice 1 : Explorer l'interface Swagger**

1. Accédez à http://localhost:3001/docs
2. Observez la liste des endpoints disponibles
3. Notez les différentes méthodes HTTP (GET, POST, PUT, DELETE)

**❓ Questions :**

- Combien d'endpoints sont disponibles ?
- Quels sont les différents codes de réponse possibles ?

### **Exercice 2 : Tester l'endpoint GET /api/items**

1. Dans Swagger, cliquez sur `GET /api/items`
2. Cliquez sur "Try it out"
3. Cliquez sur "Execute"

**❓ Questions :**

- Combien d'items sont retournés ?
- Quelle est la structure d'un item ?

### **Exercice 3 : Tester avec curl**

```bash
# Récupérer tous les items
curl http://localhost:3001/api/items

# Récupérer un item spécifique
curl http://localhost:3001/api/items/1
```

### **Exercice 4 : Analyser le code**

1. Ouvrez le fichier `src/services/items.service.js`
2. Regardez les données de test dans `mockData`

**❓ Questions :**

- Combien d'items sont définis par défaut ?
- Quelles sont les propriétés d'un item ?

---

## 🔍 **Points clés à retenir**

### **Architecture REST**

- `GET /api/items` : Récupère tous les items
- `GET /api/items/:id` : Récupère un item spécifique
- `POST /api/items` : Crée un nouvel item
- `PUT /api/items/:id` : Met à jour un item
- `DELETE /api/items/:id` : Supprime un item

### **Codes de réponse HTTP**

- `200` : Succès
- `201` : Créé avec succès
- `400` : Erreur de validation
- `404` : Ressource non trouvée
- `500` : Erreur serveur

### **Format des données**

Tous les échanges se font en JSON avec la structure :

```json
{
  "id": "1",
  "name": "Item 1",
  "description": "Description de l'item",
  "category": "electronics",
  "price": 99.99,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## ✅ **Validation des acquis**

Cochez les cases une fois que vous avez accompli chaque tâche :

- [ ] ✅ J'ai installé les dépendances avec `npm install`
- [ ] ✅ J'ai démarré le serveur avec `npm start`
- [ ] ✅ J'ai accédé à l'interface Swagger
- [ ] ✅ J'ai testé l'endpoint GET /api/items dans Swagger
- [ ] ✅ J'ai testé avec curl en ligne de commande
- [ ] ✅ J'ai analysé la structure du projet
- [ ] ✅ Je comprends les 5 opérations CRUD de base

---

## 🎯 **Critères de réussite**

Pour passer au niveau suivant, vous devez :

1. **Serveur fonctionnel** : Le serveur démarre sans erreur
2. **Swagger accessible** : L'interface de documentation s'affiche
3. **Tests API réussis** : Tous les endpoints répondent correctement
4. **Compréhension** : Vous pouvez expliquer le rôle de chaque dossier

---

## 🚀 **Prêt pour la suite ?**

Une fois ces objectifs atteints, passez au niveau suivant :

```bash
git checkout tp-02-premiers-pas
```

**📝 Dans le prochain TP, vous apprendrez à :**

- Modifier les données existantes
- Ajouter de nouveaux items
- Comprendre le flow complet d'une requête
- Analyser les réponses en détail

---

## 💡 **Besoin d'aide ?**

### **Problèmes courants**

**Le serveur ne démarre pas :**

```bash
# Vérifier la version de Node.js
node --version
# Doit être 18+

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

**Port déjà utilisé :**

```bash
# Changer le port dans .env
PORT=3002
```

**Documentation Swagger inaccessible :**

- Vérifiez que le serveur est bien démarré
- Essayez en navigation privée
- Vérifiez l'URL : http://localhost:3001/docs

### **Ressources utiles**

- [Guide des APIs REST](https://restfulapi.net/)
- [Documentation Express.js](https://expressjs.com/)
- [OpenAPI/Swagger](https://swagger.io/specification/)
