# 📝 EXERCICES TP 3 - Validation Avancée

## 🎯 Objectifs

- Maîtriser la validation conditionnelle avec Zod
- Personnaliser les messages d'erreur
- Implémenter des règles métier complexes
- Créer des validateurs personnalisés

---

## 📚 Exercice 1 : Validation conditionnelle (Niveau Bronze)

### 📖 Contexte

Analysez le schéma de validation conditionnelle dans `src/schemas/items.schema.js` pour les items de catégorie "electronics".

### 🔍 Questions à remplir

**Q1.1** - Quels champs supplémentaires sont requis pour un item de catégorie "electronics" ?

```
Réponse : ________________________________
```

**Q1.2** - Quelle est la valeur minimale autorisée pour la garantie (warranty) ?

```
Réponse : ________________________________
```

**Q1.3** - Quelle est la validation appliquée au champ "brand" ?

```
Réponse : ________________________________
```

### 🛠️ Test pratique

Testez cette requête POST avec Swagger ou curl :

```json
{
  "name": "Smartphone",
  "description": "Un excellent smartphone",
  "price": 599.99,
  "category": "electronics"
}
```

**Q1.4** - Quelle erreur obtenez-vous et pourquoi ?

```
Réponse : ________________________________
```

---

## 🔧 Exercice 2 : Messages d'erreur personnalisés (Niveau Silver)

### 📖 Contexte

Observez les messages d'erreur personnalisés définis dans le schéma Zod.

### 🛠️ Modification de code

Ajoutez un message d'erreur personnalisé pour le champ `price` dans `src/schemas/items.schema.js` :

1. Trouvez la validation du prix
2. Ajoutez un message personnalisé en français pour les prix négatifs

**Code à modifier :**

```javascript
// Cherchez cette ligne et modifiez-la
price: z.number().positive(),
```

**Nouveau code à écrire :**

```javascript
// Votre code ici :
price: ________________________________;
```

### 🔍 Test

Testez avec un prix négatif et notez le nouveau message d'erreur.

**Q2.1** - Quel message d'erreur obtenez-vous maintenant ?

```
Réponse : ________________________________
```

---

## 📊 Exercice 3 : Validation de données métier (Niveau Gold)

### 📖 Contexte

Créez une validation personnalisée pour s'assurer que les items "food" ont une date d'expiration future.

### 🛠️ Implémentation

Dans `src/schemas/items.schema.js`, ajoutez un raffinement pour la catégorie "food" :

```javascript
// Ajoutez ce code dans le schéma conditionnel pour "food"
.refine((data) => {
  if (data.category === 'food' && data.expirationDate) {
    return new Date(data.expirationDate) > new Date();
  }
  return true;
}, {
  message: "La date d'expiration doit être dans le futur pour les produits alimentaires",
  path: ['expirationDate']
})
```

### 🔍 Questions

**Q3.1** - Que fait la méthode `.refine()` ?

```
Réponse : ________________________________
```

**Q3.2** - Pourquoi utilise-t-on `path: ['expirationDate']` ?

```
Réponse : ________________________________
```

### 🧪 Test

Testez avec cette requête (date passée) :

```json
{
  "name": "Pain",
  "description": "Pain de mie",
  "price": 2.5,
  "category": "food",
  "expirationDate": "2023-01-01"
}
```

**Q3.3** - Obtenez-vous l'erreur attendue ?

```
Réponse : ________________________________
```

---

## 🔄 Exercice 4 : Validation lors de la mise à jour (Niveau Silver)

### 📖 Contexte

Analysez la différence entre `createItemSchema` et `updateItemSchema`.

### 🔍 Questions

**Q4.1** - Pourquoi utilise-t-on `.partial()` pour le schéma de mise à jour ?

```
Réponse : ________________________________
```

**Q4.2** - Quels champs deviennent optionnels lors d'un UPDATE ?

```
Réponse : ________________________________
```

### 🛠️ Test pratique

Testez un PATCH avec seulement le prix :

```json
{
  "price": 99.99
}
```

**Q4.3** - La validation passe-t-elle ? Pourquoi ?

```
Réponse : ________________________________
```

---

## 💡 Exercice 5 : Validation complexe - Cohérence des données (Niveau Gold)

### 📖 Contexte

Implémentez une validation qui s'assure que les items en promotion ont un prix inférieur au prix normal.

### 🛠️ Implémentation avancée

Modifiez le schéma pour ajouter ces champs et leur validation :

```javascript
// Dans src/schemas/items.schema.js, ajoutez ces champs
originalPrice: z.number().positive().optional(),
isOnSale: z.boolean().optional(),

// Puis ajoutez cette validation finale
.refine((data) => {
  if (data.isOnSale && data.originalPrice) {
    return data.price < data.originalPrice;
  }
  return true;
}, {
  message: "Le prix en promotion doit être inférieur au prix original",
  path: ['price']
})
```

### 🧪 Test d'erreur

Testez avec ces données incohérentes :

```json
{
  "name": "Livre",
  "description": "Livre technique",
  "price": 50.0,
  "originalPrice": 40.0,
  "isOnSale": true,
  "category": "books"
}
```

**Q5.1** - Quelle erreur obtenez-vous ?

```
Réponse : ________________________________
```

### 🧪 Test de succès

Corrigez les données et testez à nouveau.

**Q5.2** - Quelles valeurs permettent de passer la validation ?

```
Réponse : ________________________________
```

---

## 🐛 Exercice 6 : Débogage de validation (Niveau Silver)

### 📖 Contexte

Un développeur junior rapporte que cette requête échoue mais il ne comprend pas pourquoi :

```json
{
  "name": "Ordinateur portable",
  "description": "Un excellent laptop",
  "price": 999.99,
  "category": "electronics",
  "warranty": "1 an"
}
```

### 🔍 Analyse

**Q6.1** - Quel est le problème avec cette requête ?

```
Réponse : ________________________________
```

**Q6.2** - Comment corriger cette requête ?

```
Réponse JSON corrigée :
{
  ________________________________
}
```

**Q6.3** - Quel type de données attend le champ "warranty" ?

```
Réponse : ________________________________
```

---

## 🌟 Exercice Bonus : Validation personnalisée avancée (Niveau Gold)

### 📖 Défi

Créez un validateur personnalisé qui vérifie que le nom de l'item ne contient pas de mots interdits.

### 🛠️ Implémentation

```javascript
// Ajoutez cette fonction avant le schéma
const forbiddenWords = ['spam', 'fake', 'scam'];

const nameValidator = z.string()
  .min(1, "Le nom est requis")
  .refine((name) => {
    const lowercaseName = name.toLowerCase();
    return !forbiddenWords.some(word => lowercaseName.includes(word));
  }, {
    message: "Le nom ne peut pas contenir de mots interdits (spam, fake, scam)"
  });

// Puis remplacez dans le schéma :
name: nameValidator,
```

### 🧪 Test

Testez avec un nom contenant "fake" et vérifiez le message d'erreur.

**QB.1** - Le validateur fonctionne-t-il correctement ?

```
Réponse : ________________________________
```

---

## ✅ Checklist de validation

### 🥉 Niveau Bronze

- [ ] J'ai compris la validation conditionnelle pour "electronics"
- [ ] J'ai testé avec succès les champs obligatoires
- [ ] J'ai identifié les erreurs de validation manquantes

### 🥈 Niveau Silver

- [ ] J'ai ajouté des messages d'erreur personnalisés
- [ ] J'ai compris la différence entre création et mise à jour
- [ ] J'ai débogué une requête de validation échouée

### 🥇 Niveau Gold

- [ ] J'ai implémenté une validation métier avec `.refine()`
- [ ] J'ai créé une validation de cohérence des données
- [ ] J'ai développé un validateur personnalisé avancé

---

## 📞 Aide et ressources

### 🔗 Documentation Zod

- [Guide officiel Zod](https://zod.dev/)
- [API Reference](https://zod.dev/docs/API)

### 💬 Questions fréquentes

**Q: Ma validation ne fonctionne pas, que faire ?**
R: Vérifiez la syntaxe Zod et consultez les logs d'erreur détaillés dans la console.

**Q: Comment tester une validation spécifique ?**
R: Utilisez Swagger UI à `http://localhost:3001/docs` ou des tests unitaires.

**Q: Puis-je combiner plusieurs validations ?**
R: Oui, avec `.and()`, `.or()` et les raffinements multiples.

---

## ⏱️ Temps estimé : 2-3 heures

**Bonne validation ! 🚀**
