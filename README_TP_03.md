# ⚡ TP Niveau 3 : Validation avancée

## 🎯 **Objectifs**

- Maîtriser la validation avancée avec Zod
- Créer des schémas complexes et conditionnels
- Personnaliser les messages d'erreur
- Implémenter des validations métier

## ⏱️ **Durée estimée :** 3-4 heures

---

## 📋 **Prérequis**

### Ce que vous devez maîtriser

- ✅ CRUD complet avec POST, PUT, DELETE (TP 2)
- ✅ Validation de base avec Zod
- ✅ Gestion des codes de statut HTTP
- ✅ Modifications des schémas existants

### Vérification rapide

```bash
# Test de base
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"electronics","price":10}'

# Doit retourner 201 avec l'item créé
```

---

## 🚀 **Nouveaux concepts**

### **🧩 Validation conditionnelle**

Validation qui dépend d'autres champs :

```javascript
// Si category = "electronics", warranty requis
z.object({
  category: z.string(),
  warranty: z.string().optional(),
}).refine(
  (data) => {
    if (data.category === "electronics") {
      return data.warranty !== undefined;
    }
    return true;
  },
  { message: "Warranty required for electronics" }
);
```

### **🎨 Messages personnalisés**

```javascript
z.string().min(3, "Le nom doit contenir au moins 3 caractères");
z.number().max(10000, "Prix maximum: 10 000€");
```

### **🔗 Schémas composés**

```javascript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postal: z.string().regex(/^\d{5}$/),
});

const userSchema = z.object({
  name: z.string(),
  address: addressSchema, // Schéma imbriqué
});
```

### **📊 Validation de tableaux**

```javascript
z.array(z.string()).min(1, "Au moins un tag requis");
z.array(itemSchema).max(100, "Maximum 100 items");
```

---

## 🧪 **Exercices pratiques**

### **Exercice 1 : Améliorer le schéma des items**

#### 1.1 Ajouter des champs optionnels

Modifiez `src/schemas/items.schema.js` pour ajouter :

```javascript
const itemSchema = z.object({
  // Champs existants...
  tags: z.array(z.string()).optional().default([]),
  inStock: z.boolean().default(true),
  discount: z.number().min(0).max(100).optional(),
  weight: z.number().positive().optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
});
```

#### 1.2 Tester les nouveaux champs

Créez un item avec la structure étendue :

```json
{
  "name": "Smartphone Pro",
  "description": "Dernier modèle avec 5G",
  "category": "electronics",
  "price": 899.99,
  "tags": ["5G", "premium", "waterproof"],
  "inStock": true,
  "discount": 10,
  "weight": 0.185,
  "dimensions": {
    "length": 15.7,
    "width": 7.8,
    "height": 0.89
  }
}
```

### **Exercice 2 : Validation conditionnelle**

#### 2.1 Garantie obligatoire pour l'électronique

Ajoutez une règle : les produits électroniques doivent avoir une garantie.

```javascript
export const createItemSchema = itemSchema.omit({ id: true }).refine(
  (data) => {
    if (data.category === "electronics") {
      return data.warranty !== undefined && data.warranty.length > 0;
    }
    return true;
  },
  {
    message: "La garantie est obligatoire pour les produits électroniques",
    path: ["warranty"],
  }
);
```

N'oubliez pas d'ajouter `warranty` au schéma de base :

```javascript
warranty: z.string().optional();
```

#### 2.2 Tester la validation conditionnelle

**Test 1 - Electronics sans garantie (doit échouer) :**

```json
{
  "name": "Laptop",
  "category": "electronics",
  "price": 1200
}
```

**Test 2 - Electronics avec garantie (doit réussir) :**

```json
{
  "name": "Laptop",
  "category": "electronics",
  "price": 1200,
  "warranty": "2 ans constructeur"
}
```

**Test 3 - Books sans garantie (doit réussir) :**

```json
{
  "name": "Roman",
  "category": "books",
  "price": 15
}
```

### **Exercice 3 : Messages d'erreur personnalisés**

#### 3.1 Personnaliser tous les messages

Remplacez les validations par des messages en français :

```javascript
const itemSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est obligatoire")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),

  price: z
    .number({
      required_error: "Le prix est obligatoire",
      invalid_type_error: "Le prix doit être un nombre",
    })
    .positive("Le prix doit être positif")
    .max(100000, "Prix maximum: 100 000€"),

  category: z.enum(validCategories, {
    errorMap: () => ({
      message: `La catégorie doit être: ${validCategories.join(", ")}`,
    }),
  }),

  tags: z
    .array(z.string().min(1, "Les tags ne peuvent pas être vides"))
    .max(10, "Maximum 10 tags autorisés")
    .optional()
    .default([]),

  inStock: z
    .boolean({
      invalid_type_error: "inStock doit être true ou false",
    })
    .default(true),
});
```

#### 3.2 Tester les messages personnalisés

Testez ces cas d'erreur et vérifiez les messages :

```json
// Prix négatif
{"name": "Test", "category": "books", "price": -10}

// Nom trop long
{"name": "A".repeat(101), "category": "books", "price": 10}

// Trop de tags
{"name": "Test", "category": "books", "price": 10, "tags": ["1","2","3","4","5","6","7","8","9","10","11"]}
```

### **Exercice 4 : Validation de relations**

#### 4.1 Créer un schéma de catégorie

Créez `src/schemas/category.schema.js` :

```javascript
import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nom de catégorie requis"),
  description: z.string().optional(),
  parentId: z.string().optional(), // Catégorie parente
  allowedFields: z.array(z.string()).default([]),
});

// Exemples de catégories avec champs spécifiques
const categoryRules = {
  electronics: ["warranty", "brand", "model"],
  books: ["author", "isbn", "publisher"],
  clothing: ["size", "color", "material"],
  home: ["room", "material"],
};
```

#### 4.2 Validation dynamique selon la catégorie

Modifiez le schéma des items pour valider selon la catégorie :

```javascript
export const createItemSchema = itemSchema
  .omit({ id: true })
  .superRefine((data, ctx) => {
    // Validation garantie pour electronics
    if (data.category === "electronics" && !data.warranty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Garantie obligatoire pour l'électronique",
        path: ["warranty"],
      });
    }

    // Validation ISBN pour books
    if (data.category === "books" && data.isbn) {
      const isbnRegex =
        /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
      if (!isbnRegex.test(data.isbn)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format ISBN invalide",
          path: ["isbn"],
        });
      }
    }
  });
```

### **Exercice 5 : Validation de business rules**

#### 5.1 Règles métier complexes

Ajoutez des validations business :

```javascript
export const createItemSchema = itemSchema
  .omit({ id: true })
  .superRefine((data, ctx) => {
    // Règle 1: Discount seulement si prix > 50€
    if (data.discount && data.discount > 0 && data.price <= 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remise disponible seulement pour les articles > 50€",
        path: ["discount"],
      });
    }

    // Règle 2: Produits lourds doivent avoir des dimensions
    if (data.weight && data.weight > 10 && !data.dimensions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dimensions obligatoires pour les produits > 10kg",
        path: ["dimensions"],
      });
    }

    // Règle 3: Tags pertinents selon catégorie
    if (data.tags && data.tags.length > 0) {
      const categoryTags = {
        electronics: ["bluetooth", "wifi", "4k", "hd", "wireless"],
        books: ["fiction", "non-fiction", "hardcover", "paperback"],
        clothing: ["cotton", "polyester", "small", "medium", "large"],
        home: ["wood", "metal", "plastic", "ceramic"],
      };

      const validTags = categoryTags[data.category] || [];
      const invalidTags = data.tags.filter(
        (tag) => validTags.length > 0 && !validTags.includes(tag.toLowerCase())
      );

      if (invalidTags.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tags non pertinents pour ${
            data.category
          }: ${invalidTags.join(", ")}`,
          path: ["tags"],
        });
      }
    }
  });
```

#### 5.2 Tester les règles métier

**Test A - Discount sur produit pas cher :**

```json
{
  "name": "Livre pas cher",
  "category": "books",
  "price": 15,
  "discount": 20
}
```

**Test B - Produit lourd sans dimensions :**

```json
{
  "name": "Machine lourde",
  "category": "home",
  "price": 500,
  "weight": 25
}
```

**Test C - Tags non pertinents :**

```json
{
  "name": "Roman",
  "category": "books",
  "price": 20,
  "tags": ["bluetooth", "wifi"]
}
```

---

## 🔧 **Validation côté service**

### **Exercice 6 : Validation dans les services**

#### 6.1 Ajouter des validations métier dans le service

Modifiez `src/services/items.service.js` :

```javascript
class ItemsService {
  // Validation business avant création
  async validateBusinessRules(itemData) {
    const errors = [];

    // Vérifier unicité du nom
    const existingItem = this.mockData.find(
      (item) => item.name.toLowerCase() === itemData.name.toLowerCase()
    );
    if (existingItem) {
      errors.push("Un produit avec ce nom existe déjà");
    }

    // Vérifier cohérence prix/catégorie
    const categoryPriceRanges = {
      electronics: { min: 10, max: 50000 },
      books: { min: 5, max: 200 },
      clothing: { min: 10, max: 1000 },
      home: { min: 5, max: 10000 },
    };

    const range = categoryPriceRanges[itemData.category];
    if (range && (itemData.price < range.min || itemData.price > range.max)) {
      errors.push(
        `Prix incohérent pour ${itemData.category}: attendu entre ${range.min}€ et ${range.max}€`
      );
    }

    return errors;
  }

  async createItem(itemData) {
    // Validation business
    const businessErrors = await this.validateBusinessRules(itemData);
    if (businessErrors.length > 0) {
      throw new Error(`Erreurs métier: ${businessErrors.join(", ")}`);
    }

    // Création normale
    const newItem = {
      id: String(this.mockData.length + 1),
      ...itemData,
      createdAt: new Date().toISOString(),
    };

    this.mockData.push(newItem);
    return newItem;
  }
}
```

#### 6.2 Gérer les erreurs métier dans le controller

Modifiez `src/controllers/items.controller.js` :

```javascript
async createItem(req, res) {
  try {
    const item = await itemsService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    if (error.message.startsWith("Erreurs métier:")) {
      return res.status(422).json({
        error: "Validation métier échouée",
        details: error.message.replace("Erreurs métier: ", "")
      });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}
```

---

## 📊 **Tests et validation**

### **Exercice 7 : Créer des tests de validation**

#### 7.1 Tests unitaires pour les schémas

Créez `tests/validation.test.js` :

```javascript
import { describe, it } from "node:test";
import assert from "node:assert";
import { createItemSchema } from "../src/schemas/items.schema.js";

describe("Validation des items", () => {
  it("devrait accepter un item valide", () => {
    const validItem = {
      name: "Test Product",
      category: "electronics",
      price: 100,
      warranty: "1 an",
    };

    const result = createItemSchema.safeParse(validItem);
    assert.strictEqual(result.success, true);
  });

  it("devrait rejeter un item électronique sans garantie", () => {
    const invalidItem = {
      name: "Test Product",
      category: "electronics",
      price: 100,
    };

    const result = createItemSchema.safeParse(invalidItem);
    assert.strictEqual(result.success, false);
    assert.ok(
      result.error.errors.some((err) => err.message.includes("garantie"))
    );
  });
});
```

#### 7.2 Exécuter les tests

```bash
npm test
```

---

## 🎯 **Validation des acquis**

### **Quiz avancé**

#### 1. Quelle est la différence entre `.refine()` et `.superRefine()` ?

- [ ] Aucune différence
- [ ] superRefine permet plusieurs erreurs
- [ ] refine est plus performant
- [ ] superRefine est deprecated

#### 2. Comment valider qu'un champ est requis seulement si un autre a une valeur spécifique ?

- [ ] Avec z.conditional()
- [ ] Avec .refine()
- [ ] Avec .when()
- [ ] Impossible avec Zod

#### 3. Quel code de statut pour une erreur de business rules ?

- [ ] 400 Bad Request
- [ ] 422 Unprocessable Entity
- [ ] 409 Conflict
- [ ] 500 Server Error

---

## ✅ **Checklist finale**

### **Schémas avancés**

- [ ] ✅ Champs optionnels avec valeurs par défaut
- [ ] ✅ Validation conditionnelle implémentée
- [ ] ✅ Messages d'erreur personnalisés
- [ ] ✅ Schémas composés utilisés

### **Validation métier**

- [ ] ✅ Règles business implémentées
- [ ] ✅ Validation dans les services
- [ ] ✅ Gestion des erreurs 422
- [ ] ✅ Tests de validation créés

### **Cas d'usage complexes**

- [ ] ✅ Validation selon catégorie
- [ ] ✅ Règles prix/remise
- [ ] ✅ Validation unicité
- [ ] ✅ Cohérence des données

---

## 🚀 **Prêt pour le niveau 4 ?**

Si toutes les cases sont cochées :

```bash
git add .
git commit -m "✅ TP3 terminé - Validation avancée maîtrisée"
git checkout tp-04-tests
```

**🎯 Dans le prochain TP :**

- Tests unitaires et d'intégration
- Mocking et stubbing
- Tests de performance
- Couverture de code

---

## 💡 **Points clés à retenir**

### **🎨 Validation avancée**

- `refine()` pour une validation simple
- `superRefine()` pour des validations multiples
- Messages personnalisés pour UX
- Validation conditionnelle selon contexte

### **🏢 Règles métier**

- Validation au niveau service
- Codes 422 pour erreurs business
- Séparation validation technique/métier
- Tests spécifiques aux règles

### **⚡ Performance**

- Validation lazy quand possible
- Early return sur erreurs
- Cache des schémas compilés
- Optimisation des regex complexes
