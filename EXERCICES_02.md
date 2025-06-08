# 📝 Exercices - TP Niveau 2 : Premiers pas

## 🎯 **Objectif**

Maîtriser les opérations CRUD complètes et comprendre le flow d'une requête HTTP.

---

## 🚀 **Exercice 1 : Création d'items (POST)**

### **1.1 Premier item via Swagger**

1. Démarrez le serveur : `npm start`
2. Accédez à http://localhost:3001/docs
3. Testez `POST /api/items` avec :

```json
{
  "name": "Smartphone Galaxy",
  "description": "Téléphone Android dernière génération",
  "category": "electronics",
  "price": 799.99
}
```

**📝 Résultats attendus :**

- Code de statut : `201`
- Response contient un ID généré
- `createdAt` est automatiquement ajouté

### **1.2 Création via curl**

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

**❓ Questions de validation :**

1. L'item est-il visible dans `GET /api/items` ? ****\_\_\_****
2. L'ID est-il unique et séquentiel ? ****\_\_\_****
3. Tous les champs sont-ils présents ? ****\_\_\_****

---

## ⚠️ **Exercice 2 : Tests de validation**

### **2.1 Erreurs de validation**

Testez ces cas d'erreur et notez les réponses :

#### Test A : Prix négatif

```json
{
  "name": "Test Prix",
  "category": "electronics",
  "price": -50
}
```

**Résultat :** Code **\_**, Message : ********\_\_\_********

#### Test B : Catégorie invalide

```json
{
  "name": "Test Catégorie",
  "category": "invalid",
  "price": 25
}
```

**Résultat :** Code **\_**, Message : ********\_\_\_********

#### Test C : Nom vide

```json
{
  "name": "",
  "category": "books",
  "price": 15
}
```

**Résultat :** Code **\_**, Message : ********\_\_\_********

#### Test D : Prix manquant

```json
{
  "name": "Test Sans Prix",
  "category": "home"
}
```

**Résultat :** Code **\_**, Message : ********\_\_\_********

### **2.2 Analyse des schémas**

Ouvrez `src/schemas/items.schema.js` et répondez :

1. **Quelles catégories sont autorisées ?**

   ***

2. **Quelle validation s'applique au prix ?**

   ***

3. **Quels champs sont obligatoires ?**
   ***

---

## 🔄 **Exercice 3 : Modification d'items (PUT)**

### **3.1 Modification complète**

1. Récupérez l'item ID "1" : `GET /api/items/1`
2. Modifiez-le entièrement avec `PUT /api/items/1` :

```json
{
  "name": "Laptop Pro Modifié",
  "description": "Ordinateur portable haute performance - MODIFIÉ",
  "category": "electronics",
  "price": 1599.99
}
```

**✅ Vérifications :**

- [ ] Code de statut 200
- [ ] Tous les champs modifiés
- [ ] `createdAt` inchangé
- [ ] Item visible dans la liste

### **3.2 Modification partielle**

Testez une modification partielle :

```json
{
  "price": 1299.99
}
```

**❓ Questions :**

- La modification partielle fonctionne-t-elle ? ****\_\_\_****
- Les autres champs restent-ils inchangés ? ****\_\_\_****

### **3.3 Test d'erreur - ID inexistant**

```bash
curl -X PUT http://localhost:3001/api/items/999 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "books", "price": 10}'
```

**Résultat attendu :** Code **\_**, Message : ****\_\_\_****

---

## 🗑️ **Exercice 4 : Suppression d'items (DELETE)**

### **4.1 Suppression normale**

1. Listez les items : `GET /api/items`
2. Supprimez l'item ID "3" : `DELETE /api/items/3`
3. Vérifiez la suppression : `GET /api/items`

**✅ Résultat attendu :**

- Code de statut : `204` (No Content)
- Item absent de la liste

### **4.2 Test d'erreur**

```bash
curl -X DELETE http://localhost:3001/api/items/999
```

**Résultat :** Code **\_**, Message : ****\_\_\_****

---

## 🔍 **Exercice 5 : Traçage du flow**

### **5.1 Suivre une requête POST**

Pour `POST /api/items`, tracez le chemin dans le code :

1. **Point d'entrée** (`src/routes/items.routes.js`) :

   - Ligne du POST : ****\_\_\_****
   - Middleware appliqué : ****\_\_\_****

2. **Validation** (`src/middleware/validation.middleware.js`) :

   - Schéma utilisé : ****\_\_\_****
   - Que se passe-t-il en cas d'erreur ? ****\_\_\_****

3. **Contrôleur** (`src/controllers/items.controller.js`) :

   - Méthode appelée : ****\_\_\_****
   - Code de statut retourné : ****\_\_\_****

4. **Service** (`src/services/items.service.js`) :
   - Méthode du service : ****\_\_\_****
   - Comment l'ID est généré : ****\_\_\_****

### **5.2 Tracer une erreur 404**

Pour `GET /api/items/999` :

1. Où l'erreur est-elle détectée ? ****\_\_\_****
2. Comment le code 404 est-il retourné ? ****\_\_\_****

---

## 🛠️ **Exercice 6 : Modifications du code**

### **6.1 Ajouter une catégorie**

Modifiez `src/schemas/items.schema.js` pour ajouter "automotive" :

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

**Test :** Créez un item avec `"category": "automotive"` et vérifiez que ça fonctionne.

### **6.2 Ajouter des données de test**

Dans `src/services/items.service.js`, ajoutez à `mockData` :

```javascript
{
  id: '4',
  name: 'Tesla Model 3',
  description: 'Voiture électrique autonome',
  category: 'automotive',
  price: 45000,
  createdAt: new Date('2024-01-04').toISOString()
},
{
  id: '5',
  name: 'Clean Code',
  description: 'Livre sur les bonnes pratiques',
  category: 'books',
  price: 42.99,
  createdAt: new Date('2024-01-05').toISOString()
}
```

**✅ Validation :**

- [ ] Redémarrage du serveur
- [ ] GET /api/items retourne 5 items
- [ ] Les nouveaux items sont corrects

---

## 🧪 **Exercice 7 : Workflow complet**

### **7.1 Scénario de test complet**

Réalisez ce workflow sans interruption :

1. **Créer** un item "Casque Audio" (category: electronics, price: 150)
2. **Récupérer** l'item par son ID
3. **Modifier** le prix à 129.99
4. **Vérifier** la modification
5. **Supprimer** l'item
6. **Vérifier** la suppression

**📝 Notez les codes de statut à chaque étape :**

- Création : **\_**
- Récupération : **\_**
- Modification : **\_**
- Suppression : **\_**
- Vérification finale : **\_**

### **7.2 Test de performance**

Créez 10 items rapidement et observez :

- Le serveur reste-t-il réactif ? ****\_\_\_****
- Les IDs sont-ils bien séquentiels ? ****\_\_\_****

---

## 🎯 **Exercice 8 : Débogage**

### **8.1 Provoquer des erreurs**

Testez ces scénarios et trouvez les solutions :

1. **Serveur qui plante :**

   ```json
   {
     "name": null,
     "category": "electronics",
     "price": "not-a-number"
   }
   ```

2. **Mémoire qui déborde :**
   - Créez 1000 items très rapidement
   - Que se passe-t-il ?

### **8.2 Analyser les logs**

Observez les logs du serveur et notez :

- Types de messages affichés : ****\_\_\_****
- Informations d'erreur : ****\_\_\_****

---

## 🏆 **Quiz de compréhension**

### **1. Dans quel ordre s'exécutent ces éléments ?**

Numérotez de 1 à 5 :

- [ ] Controller
- [ ] Route
- [ ] Middleware de validation
- [ ] Service
- [ ] Réponse client

### **2. Que fait le middleware `validateSchema` ?**

- [ ] Vérifie l'authentification
- [ ] Valide le format JSON
- [ ] Applique les règles Zod
- [ ] Gère les erreurs

### **3. Où sont stockées les données dans ce TP ?**

- [ ] Base de données SQLite
- [ ] Fichier JSON
- [ ] Variable JavaScript en mémoire
- [ ] Cache Redis

### **4. Que retourne `createItem` en cas de succès ?**

- [ ] True/False
- [ ] L'ID seulement
- [ ] L'objet item complet
- [ ] Un message de confirmation

### **5. Comment l'ID est-il généré ?**

- [ ] UUID aléatoire
- [ ] Auto-increment de BD
- [ ] Timestamp
- [ ] Calcul sur la longueur du tableau

---

## ✅ **Checklist de validation**

### **Créations (POST)**

- [ ] Item créé avec tous les champs
- [ ] Item créé avec champs optionnels seulement
- [ ] Erreurs de validation capturées
- [ ] ID généré automatiquement

### **Lectures (GET)**

- [ ] Liste tous les items
- [ ] Récupère un item par ID
- [ ] Gère les IDs inexistants
- [ ] Format JSON correct

### **Modifications (PUT)**

- [ ] Modification complète réussie
- [ ] Modification partielle réussie
- [ ] Validation appliquée
- [ ] Erreur 404 pour ID inexistant

### **Suppressions (DELETE)**

- [ ] Suppression réussie (204)
- [ ] Item supprimé de la liste
- [ ] Erreur 404 pour ID inexistant
- [ ] Pas d'effet de bord

### **Compréhension**

- [ ] Flow de requête tracé
- [ ] Code de validation analysé
- [ ] Erreurs comprises et gérées
- [ ] Modifications du code réussies

---

## 🚀 **Passage au TP 3**

Toutes les cases cochées ? Passez au niveau suivant :

```bash
git add .
git commit -m "✅ TP2 - CRUD complet maîtrisé"
git checkout tp-03-validation
```

Dans le TP 3, vous découvrirez :

- Validation avancée et conditionnelle
- Messages d'erreur personnalisés
- Schémas complexes avec relations
- Validation côté client
