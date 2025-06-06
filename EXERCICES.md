# 📝 Exercices - TP Niveau 1 : Découverte

## 🎯 **Objectif**

Se familiariser avec l'API REST et comprendre son fonctionnement de base.

---

## 📚 **Exercice 1 : Installation et configuration**

### **1.1 Vérifier l'environnement**

```bash
# Vérifier Node.js (doit être 18+)
node --version

# Vérifier npm
npm --version

# Vérifier Git
git --version
```

### **1.2 Installation du projet**

```bash
# Installer les dépendances
npm install

# Copier la configuration
cp .env.example .env

# Vérifier le contenu de .env
cat .env
```

**✅ Résultat attendu :**

- Toutes les commandes s'exécutent sans erreur
- Le fichier `.env` contient les bonnes variables

---

## 🚀 **Exercice 2 : Premier démarrage**

### **2.1 Démarrer le serveur**

```bash
npm start
```

### **2.2 Vérifier les logs**

**❓ Questions à répondre :**

1. Sur quel port le serveur démarre-t-il ?
2. Quelle est l'URL complète de la documentation Swagger ?
3. Quel framework est utilisé (Express/Fastify) ?

**📝 Notez vos réponses :**

- Port : ****\_\_\_****
- URL Swagger : ****\_\_\_****
- Framework : ****\_\_\_****

---

## 🔍 **Exercice 3 : Explorer l'interface Swagger**

### **3.1 Accéder à Swagger**

1. Ouvrez http://localhost:3001/docs dans votre navigateur
2. Explorez l'interface

### **3.2 Analyser la documentation**

**❓ Questions :**

1. Combien d'endpoints sont documentés ?
2. Quels sont les 5 endpoints disponibles ?
3. Quels codes de réponse HTTP sont possibles pour GET /api/items ?

**📝 Listez les endpoints :**

1. ***
2. ***
3. ***
4. ***
5. ***

---

## 🧪 **Exercice 4 : Tests avec Swagger UI**

### **4.1 Tester GET /api/items**

1. Cliquez sur `GET /api/items`
2. Cliquez sur "Try it out"
3. Cliquez sur "Execute"

**❓ Analysez la réponse :**

- Code de statut : ****\_\_\_****
- Nombre d'items retournés : ****\_\_\_****
- Première propriété d'un item : ****\_\_\_****

### **4.2 Tester GET /api/items/{id}**

1. Testez avec l'ID "1"
2. Testez avec l'ID "999" (qui n'existe pas)

**❓ Comparez les réponses :**

- Code pour ID existant : ****\_\_\_****
- Code pour ID inexistant : ****\_\_\_****
- Message d'erreur pour ID inexistant : ****\_\_\_****

---

## 💻 **Exercice 5 : Tests en ligne de commande**

### **5.1 Tests avec curl**

```bash
# Test 1 : Récupérer tous les items
curl -X GET http://localhost:3001/api/items

# Test 2 : Récupérer un item spécifique
curl -X GET http://localhost:3001/api/items/1

# Test 3 : Item inexistant
curl -X GET http://localhost:3001/api/items/999
```

### **5.2 Tests avec formatage JSON**

```bash
# Avec formatage JSON (si jq est installé)
curl -X GET http://localhost:3001/api/items | jq .

# Sinon, copier la réponse dans un formateur JSON en ligne
```

**📝 Notez les différences avec Swagger :**

- Avantages de Swagger : ****\_\_\_****
- Avantages de curl : ****\_\_\_****

---

## 📁 **Exercice 6 : Analyser la structure du code**

### **6.1 Examiner le service**

Ouvrez `src/services/items.service.js`

**❓ Questions :**

1. Combien d'items sont dans `mockData` ?
2. Quelles catégories sont disponibles ?
3. Quelle est la structure complète d'un item ?

### **6.2 Examiner les routes**

Ouvrez `src/routes/items.routes.js`

**❓ Questions :**

1. Quelles méthodes HTTP sont définies ?
2. Quel middleware est appliqué à POST et PUT ?
3. Comment les paramètres sont-ils extraits ?

### **6.3 Examiner le contrôleur**

Ouvrez `src/controllers/items.controller.js`

**❓ Questions :**

1. Comment les erreurs sont-elles gérées ?
2. Que retourne la méthode `getAllItems` ?
3. Comment la validation est-elle intégrée ?

---

## 🎨 **Exercice 7 : Personnalisation simple**

### **7.1 Modifier les données de test**

Dans `src/services/items.service.js`, ajoutez un nouvel item dans `mockData` :

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

### **7.2 Tester la modification**

1. Redémarrez le serveur : `npm start`
2. Testez `GET /api/items`
3. Vérifiez que votre item apparaît

**✅ Validation :**

- [ ] Le nouvel item apparaît dans la liste
- [ ] Il a bien l'ID "4"
- [ ] Tous les champs sont corrects

---

## 🔧 **Exercice 8 : Dépannage**

### **8.1 Test d'arrêt/redémarrage**

1. Arrêtez le serveur (Ctrl+C)
2. Redémarrez-le
3. Vérifiez que tout fonctionne encore

### **8.2 Test de changement de port**

1. Modifiez `PORT=3002` dans `.env`
2. Redémarrez le serveur
3. Testez la nouvelle URL

**❓ Questions :**

- Le serveur démarre-t-il sur le nouveau port ? ****\_\_\_****
- Swagger est-il accessible à la nouvelle adresse ? ****\_\_\_****

---

## 🏆 **Quiz de validation**

### **Questions de compréhension :**

1. **Que signifie REST ?**

   - [ ] Random State Transfer
   - [ ] Representational State Transfer
   - [ ] Real Estate Transfer
   - [ ] Responsive State Technology

2. **Quel code HTTP indique un succès ?**

   - [ ] 404
   - [ ] 500
   - [ ] 200
   - [ ] 400

3. **Que fait GET /api/items/1 ?**

   - [ ] Crée un item avec ID 1
   - [ ] Supprime l'item 1
   - [ ] Récupère l'item 1
   - [ ] Met à jour l'item 1

4. **Où sont stockées les données dans ce TP ?**

   - [ ] Base de données
   - [ ] Fichier JSON
   - [ ] Mémoire (variable JavaScript)
   - [ ] Cache Redis

5. **Quel est le rôle de Swagger ?**
   - [ ] Gérer la base de données
   - [ ] Documenter et tester l'API
   - [ ] Gérer l'authentification
   - [ ] Optimiser les performances

---

## ✅ **Checklist finale**

Avant de passer au TP suivant, assurez-vous d'avoir :

- [ ] ✅ Installé et configuré le projet
- [ ] ✅ Démarré le serveur avec succès
- [ ] ✅ Exploré l'interface Swagger
- [ ] ✅ Testé tous les endpoints GET
- [ ] ✅ Utilisé curl en ligne de commande
- [ ] ✅ Analysé la structure du code
- [ ] ✅ Modifié les données de test
- [ ] ✅ Compris les concepts REST de base
- [ ] ✅ Répondu au quiz de validation

---

## 🚀 **Prêt pour le niveau 2 ?**

Si vous avez coché toutes les cases, vous êtes prêt à passer au TP suivant :

```bash
git add .
git commit -m "✅ TP1 terminé - Découverte de l'API"
git checkout tp-02-premiers-pas
```

**🎯 Dans le prochain TP :**

- Création et modification d'items
- Compréhension du flow complet
- Introduction à la validation des données
- Tests d'erreurs et de cas limites
