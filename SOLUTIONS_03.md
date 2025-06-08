# 🔑 SOLUTIONS TP 3 - Validation Avancée

## 🎯 Solutions des exercices avec explications détaillées

---

## 📚 Solution Exercice 1 : Validation conditionnelle

### 🔍 Réponses

**Q1.1** - Quels champs supplémentaires sont requis pour un item de catégorie "electronics" ?

```
Réponse : warranty (garantie) et brand (marque)
```

**Q1.2** - Quelle est la valeur minimale autorisée pour la garantie (warranty) ?

```
Réponse : 0 (zéro mois minimum)
```

**Q1.3** - Quelle est la validation appliquée au champ "brand" ?

```
Réponse : String avec minimum 1 caractère (non vide)
```

**Q1.4** - Quelle erreur obtenez-vous et pourquoi ?

```
Réponse : Erreur 400 - "warranty" et "brand" sont requis pour les produits électroniques
Raison : Le schéma conditionnel impose ces champs pour category = "electronics"
```

### 💡 Explication technique

La validation conditionnelle utilise Zod avec cette logique :

```javascript
.superRefine((data, ctx) => {
  if (data.category === 'electronics') {
    if (!data.warranty && data.warranty !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La garantie est requise pour les produits électroniques',
        path: ['warranty']
      });
    }
  }
})
```

---

## 🔧 Solution Exercice 2 : Messages d'erreur personnalisés

### 💻 Code solution

```javascript
price: z.number().positive({
  message: "Le prix doit être un nombre positif supérieur à 0"
}),
```

### 🔍 Test et réponse

**Q2.1** - Quel message d'erreur obtenez-vous maintenant ?

```
Réponse : "Le prix doit être un nombre positif supérieur à 0"
```

### 💡 Explication

Les messages personnalisés Zod permettent :

- Meilleure UX avec messages en français
- Context spécifique à l'application
- Guidance claire pour l'utilisateur

**Syntaxe alternative :**

```javascript
price: z.number({
  required_error: "Le prix est obligatoire",
  invalid_type_error: "Le prix doit être un nombre",
}).positive({
  message: "Le prix doit être positif",
});
```

---

## 📊 Solution Exercice 3 : Validation de données métier

### 🔍 Réponses

**Q3.1** - Que fait la méthode `.refine()` ?

```
Réponse : Elle ajoute une validation personnalisée avec une fonction qui retourne true/false
```

**Q3.2** - Pourquoi utilise-t-on `path: ['expirationDate']` ?

```
Réponse : Pour associer l'erreur au champ spécifique dans la réponse JSON
```

**Q3.3** - Obtenez-vous l'erreur attendue ?

```
Réponse : Oui - "La date d'expiration doit être dans le futur pour les produits alimentaires"
```

### 💻 Code complet implémenté

```javascript
const itemSchema = z
  .object({
    // ... autres champs
  })
  .refine(
    (data) => {
      if (data.category === "food" && data.expirationDate) {
        return new Date(data.expirationDate) > new Date();
      }
      return true;
    },
    {
      message:
        "La date d'expiration doit être dans le futur pour les produits alimentaires",
      path: ["expirationDate"],
    }
  );
```

### 💡 Cas d'usage avancés

```javascript
// Validation multiple
.refine((data) => data.startDate < data.endDate, {
  message: "La date de fin doit être après la date de début",
  path: ['endDate']
})
.refine((data) => data.age >= 18 || data.parentConsent, {
  message: "Consentement parental requis pour les mineurs",
  path: ['parentConsent']
})
```

---

## 🔄 Solution Exercice 4 : Validation lors de la mise à jour

### 🔍 Réponses

**Q4.1** - Pourquoi utilise-t-on `.partial()` pour le schéma de mise à jour ?

```
Réponse : Pour rendre tous les champs optionnels lors d'un PATCH/PUT partiel
```

**Q4.2** - Quels champs deviennent optionnels lors d'un UPDATE ?

```
Réponse : Tous les champs (name, description, price, category, etc.)
```

**Q4.3** - La validation passe-t-elle ? Pourquoi ?

```
Réponse : Oui, car partial() permet de ne modifier qu'un seul champ
```

### 💻 Code technique

```javascript
// Schéma de création (strict)
export const createItemSchema = itemSchema;

// Schéma de mise à jour (flexible)
export const updateItemSchema = itemSchema.partial();

// Utilisation dans le contrôleur
if (req.method === "POST") {
  validatedData = createItemSchema.parse(req.body);
} else if (req.method === "PATCH") {
  validatedData = updateItemSchema.parse(req.body);
}
```

### 💡 Stratégies avancées

```javascript
// Mise à jour avec certains champs obligatoires
const updateItemSchema = itemSchema.partial().extend({
  id: z.string().uuid(), // ID toujours requis
  lastModified: z.date().default(new Date()), // Auto-généré
});

// Exclusion de champs lors de la mise à jour
const updateItemSchema = itemSchema
  .omit({
    createdAt: true,
    id: true,
  })
  .partial();
```

---

## 💡 Solution Exercice 5 : Validation complexe - Cohérence des données

### 💻 Code complet

```javascript
const itemSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    price: z.number().positive(),
    category: z.enum(["electronics", "clothing", "books", "food"]),
    originalPrice: z.number().positive().optional(),
    isOnSale: z.boolean().optional(),
    // ... autres champs
  })
  .refine(
    (data) => {
      if (data.isOnSale && data.originalPrice) {
        return data.price < data.originalPrice;
      }
      return true;
    },
    {
      message: "Le prix en promotion doit être inférieur au prix original",
      path: ["price"],
    }
  );
```

### 🔍 Réponses

**Q5.1** - Quelle erreur obtenez-vous ?

```
Réponse : "Le prix en promotion doit être inférieur au prix original"
Code : 400 Bad Request
```

**Q5.2** - Quelles valeurs permettent de passer la validation ?

```
Réponse : price: 30.00, originalPrice: 40.00, isOnSale: true
```

### 🧪 Tests de validation

```javascript
// ✅ Valide
{
  "price": 35.00,
  "originalPrice": 50.00,
  "isOnSale": true
}

// ❌ Invalide
{
  "price": 60.00,
  "originalPrice": 50.00,
  "isOnSale": true
}

// ✅ Valide (pas en promo)
{
  "price": 50.00,
  "originalPrice": 40.00,
  "isOnSale": false
}
```

---

## 🐛 Solution Exercice 6 : Débogage de validation

### 🔍 Réponses

**Q6.1** - Quel est le problème avec cette requête ?

```
Réponse : Le champ "warranty" attend un nombre (mois) mais reçoit une string "1 an"
```

**Q6.2** - Comment corriger cette requête ?

```json
{
  "name": "Ordinateur portable",
  "description": "Un excellent laptop",
  "price": 999.99,
  "category": "electronics",
  "warranty": 12,
  "brand": "Dell"
}
```

**Q6.3** - Quel type de données attend le champ "warranty" ?

```
Réponse : number (entier représentant les mois de garantie)
```

### 💡 Debug technique

```javascript
// Erreur Zod typique
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["warranty"],
      "message": "Expected number, received string"
    }
  ]
}
```

### 🔧 Stratégies de débogage

1. **Logs détaillés** : Activer les logs Zod complets
2. **Transformation** : Utiliser `.transform()` pour convertir
3. **Coercion** : Utiliser `.coerce.number()` pour auto-conversion

```javascript
// Solution robuste avec coercion
warranty: z.coerce.number().min(0).max(120),
```

---

## 🌟 Solution Exercice Bonus : Validation personnalisée avancée

### 💻 Code complet

```javascript
const forbiddenWords = ["spam", "fake", "scam", "arnaque", "contrefacon"];

const nameValidator = z
  .string()
  .min(1, "Le nom est requis")
  .max(100, "Le nom ne peut pas dépasser 100 caractères")
  .refine(
    (name) => {
      const lowercaseName = name.toLowerCase();
      return !forbiddenWords.some((word) => lowercaseName.includes(word));
    },
    {
      message: `Le nom ne peut pas contenir de mots interdits : ${forbiddenWords.join(
        ", "
      )}`,
    }
  );
```

### 🔍 Réponse

**QB.1** - Le validateur fonctionne-t-il correctement ?

```
Réponse : Oui, il rejette les noms contenant des mots interdits avec un message clair
```

### 🧪 Tests complets

```javascript
// ❌ Échec
nameValidator.parse("fake iPhone");
// Erreur: "Le nom ne peut pas contenir de mots interdits..."

// ✅ Succès
nameValidator.parse("iPhone 13 Pro");

// ❌ Échec (case insensitive)
nameValidator.parse("SPAM product");
```

### 💡 Extensions possibles

```javascript
// Validation avec expressions régulières
const nameValidator = z
  .string()
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Caractères alphanumériques uniquement")
  .refine(
    (name) => !forbiddenWords.some((word) => name.toLowerCase().includes(word)),
    {
      message: "Contenu inapproprié détecté",
    }
  );

// Validation asynchrone (base de données)
const nameValidator = z.string().refine(
  async (name) => {
    const exists = await checkNameInDatabase(name);
    return !exists;
  },
  {
    message: "Ce nom est déjà utilisé",
  }
);
```

---

## 📊 Récapitulatif des concepts maîtrisés

### 🥉 Niveau Bronze

- ✅ Validation conditionnelle avec `superRefine`
- ✅ Schémas Zod de base
- ✅ Messages d'erreur par défaut

### 🥈 Niveau Silver

- ✅ Messages d'erreur personnalisés
- ✅ Différence création/mise à jour avec `partial()`
- ✅ Débogage d'erreurs de validation

### 🥇 Niveau Gold

- ✅ Validations métier complexes avec `refine()`
- ✅ Cohérence entre champs multiples
- ✅ Validateurs personnalisés avancés

---

## 🚀 Techniques avancées découvertes

### 1. **Composition de schémas**

```javascript
const baseSchema = z.object({
  /* base */
});
const extendedSchema = baseSchema.extend({
  /* nouveaux champs */
});
const mergedSchema = baseSchema.merge(otherSchema);
```

### 2. **Transformations**

```javascript
const schema = z.string().transform((val) => val.toLowerCase().trim());
```

### 3. **Validation asynchrone**

```javascript
const schema = z.string().refine(async (val) => {
  return await validateInAPI(val);
});
```

### 4. **Union et intersection**

```javascript
const unionSchema = z.union([stringSchema, numberSchema]);
const intersectionSchema = z.intersection(baseSchema, extendedSchema);
```

---

## 🎓 Prochaines étapes

Maintenant que vous maîtrisez la validation avancée, vous êtes prêt pour :

- **TP 4 - Tests** : Tests unitaires et d'intégration
- **TP 5 - Sécurité** : Authentification et autorisation
- **TP 6 - Base de données** : Intégration avec MongoDB/PostgreSQL

**Excellent travail ! 🌟**
