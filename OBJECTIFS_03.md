# 🎯 OBJECTIFS TP 3 - Validation Avancée

## 📋 Grille d'évaluation - Validation avec Zod

---

## 🥉 Niveau Bronze - Compréhension de base
**Durée estimée : 1h - 1h30**

### 📚 Critères de validation

#### ✅ Compréhension conceptuelle (40%)
- [ ] **Validation conditionnelle** : Comprend comment appliquer des règles selon la catégorie d'item
- [ ] **Champs obligatoires** : Identifie les champs requis pour chaque type de produit
- [ ] **Types de données** : Reconnaît les types attendus (string, number, boolean)
- [ ] **Messages d'erreur** : Interprète correctement les erreurs de validation

#### ✅ Tests pratiques (35%)
- [ ] **Swagger/API** : Teste avec succès les endpoints via l'interface
- [ ] **Cas d'erreur** : Provoque intentionnellement des erreurs de validation
- [ ] **Données valides** : Crée des requêtes qui passent la validation
- [ ] **Catégories** : Teste différentes catégories (electronics, food, books, clothing)

#### ✅ Analyse (25%)
- [ ] **Débogage simple** : Identifie pourquoi une requête échoue
- [ ] **Schéma Zod** : Lit et comprend la structure du schéma
- [ ] **Flow de validation** : Comprend quand la validation est appliquée

### 📊 Questions Bronze (réponses attendues)

**Q1** : Quels champs sont requis pour "electronics" ?
- ✅ `warranty` et `brand`

**Q2** : Que valide `z.number().positive()` ?
- ✅ Un nombre supérieur à 0

**Q3** : Pourquoi cette requête échoue : `{"price": "50"}` ?
- ✅ Price doit être un number, pas une string

---

## 🥈 Niveau Silver - Application pratique
**Durée estimée : 2h - 2h30**

### 📚 Critères de validation

#### ✅ Personnalisation (40%)
- [ ] **Messages personnalisés** : Ajoute des messages d'erreur en français
- [ ] **Modification de schéma** : Édite correctement les fichiers de validation
- [ ] **Syntaxe Zod** : Utilise la syntaxe Zod sans erreurs
- [ ] **Context métier** : Adapte les messages au domaine de l'application

#### ✅ Différenciation CREATE/UPDATE (30%)
- [ ] **Schema.partial()** : Comprend l'utilité des champs optionnels
- [ ] **PATCH vs POST** : Différencie les besoins de validation
- [ ] **Tests CRUD** : Valide les opérations de mise à jour
- [ ] **Flexibilité** : Apprécie les avantages de la validation adaptative

#### ✅ Débogage avancé (30%)
- [ ] **Analyse d'erreur** : Résout des problèmes de type de données
- [ ] **Transformation** : Propose des solutions de conversion
- [ ] **Logs** : Utilise les informations de debug efficacement
- [ ] **Documentation** : Consulte la doc Zod pour résoudre des problèmes

### 📊 Questions Silver (réponses attendues)

**Q1** : Comment ajouter un message personnalisé pour `price` ?
- ✅ `z.number().positive({ message: "Prix positif requis" })`

**Q2** : Différence entre `createItemSchema` et `updateItemSchema` ?
- ✅ Update utilise `.partial()` pour rendre tous les champs optionnels

**Q3** : Pourquoi "warranty": "1 an" échoue ?
- ✅ Warranty attend un number (mois), pas une string

---

## 🥇 Niveau Gold - Maîtrise avancée
**Durée estimée : 3h - 4h**

### 📚 Critères de validation

#### ✅ Validations métier complexes (45%)
- [ ] **Règles conditionnelles** : Implémente des validations avec `.refine()`
- [ ] **Cohérence de données** : Valide la logique entre plusieurs champs
- [ ] **Dates et temporalité** : Gère les validations de dates futures/passées
- [ ] **Business logic** : Traduit des règles métier en code de validation

#### ✅ Validateurs personnalisés (35%)
- [ ] **Fonctions custom** : Crée des validateurs réutilisables
- [ ] **Expressions régulières** : Utilise regex dans la validation
- [ ] **Tableaux de mots interdits** : Implémente des filtres de contenu
- [ ] **Performance** : Optimise les validations pour la performance

#### ✅ Architecture avancée (20%)
- [ ] **Composition** : Combine plusieurs schémas efficacement
- [ ] **Réutilisabilité** : Créé des composants de validation modulaires
- [ ] **Tests unitaires** : Écrit des tests pour les validateurs
- [ ] **Documentation** : Documente les règles de validation complexes

### 📊 Questions Gold (réponses attendues)

**Q1** : Comment valider qu'une date d'expiration est future ?
- ✅ `.refine((data) => new Date(data.expirationDate) > new Date())`

**Q2** : Validation prix promotion < prix original ?
- ✅ Refinement comparant `data.price < data.originalPrice` si `isOnSale`

**Q3** : Créer un validateur de noms interdits ?
- ✅ Fonction avec tableau + `.some()` + `.includes()` insensible à la casse

---

## 🚀 Compétences transversales développées

### 🧠 Concepts techniques maîtrisés
- **Zod Library** : Syntaxe et API complète
- **Type Safety** : Validation runtime + types TypeScript
- **Error Handling** : Messages d'erreur structurés et informatifs
- **Schema Composition** : Techniques de composition et réutilisation

### 🔧 Compétences pratiques
- **API Testing** : Test de validation via Swagger/Postman
- **Code Debugging** : Résolution d'erreurs de validation
- **Code Quality** : Écriture de validateurs maintenables
- **User Experience** : Messages d'erreur utilisateur-friendly

### 🎯 Soft skills
- **Attention aux détails** : Précision dans les types et contraintes
- **Pensée logique** : Traduction de règles métier en code
- **Créativité** : Solutions innovantes pour validations complexes
- **Communication** : Messages d'erreur clairs et documentation

---

## 📈 Progression pédagogique

### 🎓 De Bronze à Silver
**Focus** : Passer de la compréhension à l'application
- Manipulation active du code
- Personnalisation des comportements
- Résolution autonome de problèmes

### 🎓 De Silver à Gold  
**Focus** : Maîtrise des concepts avancés
- Création de solutions originales
- Architectures complexes et réutilisables
- Optimisation et bonnes pratiques

### 🎓 Au-delà du Gold
**Préparation pour** :
- Tests automatisés des validations
- Intégration avec bases de données
- Validation asynchrone avancée
- Sécurité et sanitisation

---

## 🎯 Auto-évaluation

### ✅ Checklist personnelle

**Je maîtrise le niveau Bronze si :**
- [ ] Je comprends les erreurs de validation Zod
- [ ] Je peux tester une API avec différents types de données
- [ ] Je reconnais les problèmes de types dans les requêtes

**Je maîtrise le niveau Silver si :**
- [ ] Je modifie les schémas de validation sans aide
- [ ] Je crée des messages d'erreur personnalisés pertinents
- [ ] Je débogue efficacement les erreurs de validation

**Je maîtrise le niveau Gold si :**
- [ ] Je conçois des validations métier complexes
- [ ] Je crée des validateurs réutilisables et modulaires
- [ ] J'optimise les performances de validation

---

## 📚 Ressources pour aller plus loin

### 📖 Documentation officielle
- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [TypeScript Integration](https://zod.dev/docs/typescript)

### 🎥 Tutoriels avancés
- Validation asynchrone avec Zod
- Intégration Zod + Prisma
- Performance optimization
- Error reporting strategies

### 🛠️ Outils complémentaires
- **zod-to-json-schema** : Génération de JSON Schema
- **@hookform/resolvers** : Intégration React Hook Form
- **trpc-zod** : Validation côté client/serveur

---

## ⏱️ Temps de validation par niveau

| Niveau | Durée Exercices | Durée Review | Total |
|--------|----------------|--------------|-------|
| 🥉 Bronze | 45 min | 15 min | 1h |
| 🥈 Silver | 1h30 | 30 min | 2h |
| 🥇 Gold | 2h30 | 30 min | 3h |

**Total TP 3 : 2-6 heures selon niveau visé**

---

## 🏆 Certification des acquis

### 📜 Niveau atteint

**🥉 Bronze** : Bases de la validation acquises
- ✅ Prêt pour TP 4 (Tests)

**🥈 Silver** : Application pratique maîtrisée  
- ✅ Prêt pour développement API robuste

**🥇 Gold** : Expertise validation avancée
- ✅ Prêt pour architectures enterprise
- ✅ Capable de former d'autres développeurs

**Félicitations pour votre progression ! 🎉**
