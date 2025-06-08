# 🎯 Objectifs - TP Niveau 2 : Premiers pas

## 🎪 **Vue d'ensemble**

Ce deuxième TP vous fait découvrir les opérations CRUD complètes (Create, Read, Update, Delete) et le cycle complet d'une requête HTTP. À la fin de ce niveau, vous maîtriserez la création, modification et suppression de données via une API REST.

---

## 🎯 **Objectifs pédagogiques**

### **🔄 Objectif 1 : Maîtriser le cycle complet d'une requête**
**Compétences acquises :**
- [ ] Tracer une requête de bout en bout (Route → Controller → Service)
- [ ] Comprendre le rôle de chaque couche (middleware, validation, logique)
- [ ] Identifier les points de transformation des données
- [ ] Gérer les réponses et codes de statut appropriés

**Critères d'évaluation :**
- ✅ Peut expliquer le flow d'une requête POST complète
- ✅ Identifie où s'applique la validation dans le processus
- ✅ Comprend la séparation Controller/Service
- ✅ Maîtrise les codes de statut (200, 201, 204, 400, 404)

### **🛠️ Objectif 2 : Réaliser des opérations CRUD complètes**
**Compétences acquises :**
- [ ] Créer des ressources avec POST et validation
- [ ] Modifier des ressources avec PUT (complète et partielle)
- [ ] Supprimer des ressources avec DELETE
- [ ] Gérer les cas d'erreur (ID inexistant, données invalides)

**Critères d'évaluation :**
- ✅ Crée des items valides via POST
- ✅ Modifie des items existants via PUT
- ✅ Supprime des items via DELETE
- ✅ Gère les erreurs 404 et 400 correctement

### **✅ Objectif 3 : Maîtriser la validation des données**
**Compétences acquises :**
- [ ] Comprendre les schémas Zod et leur application
- [ ] Interpréter les messages d'erreur de validation
- [ ] Tester des cas de validation (données manquantes, incorrectes)
- [ ] Modifier les schémas pour ajouter des validations

**Critères d'évaluation :**
- ✅ Identifie les règles de validation existantes
- ✅ Teste volontairement des données invalides
- ✅ Comprend les messages d'erreur Zod
- ✅ Modifie avec succès les schémas de validation

---

## 📊 **Niveaux de maîtrise**

### **🥉 Niveau Bronze (Minimum requis)**
**Durée :** 1-1.5 heures

**Compétences :**
- Création d'items via POST réussie
- Tests de base des opérations CRUD
- Compréhension des codes de statut principaux

**Validation :**
- [ ] POST /api/items fonctionne avec données valides
- [ ] PUT /api/items/:id modifie un item existant
- [ ] DELETE /api/items/:id supprime un item
- [ ] Comprend les réponses 200, 201, 404

### **🥈 Niveau Silver (Objectif recommandé)**
**Durée :** 2-2.5 heures

**Compétences :**
- Toutes les opérations CRUD maîtrisées
- Validation des données comprise et testée
- Workflow complet d'un item (création → modification → suppression)

**Validation :**
- [ ] Tests de validation avec données invalides
- [ ] Modification partielle via PUT réussie
- [ ] Flow de requête tracé dans le code
- [ ] Gestion d'erreurs comprise

### **🥇 Niveau Gold (Excellence)**
**Durée :** 2.5-3 heures

**Compétences :**
- Modifications du code réussies (schémas, données)
- Débogage autonome des erreurs
- Tests de performance et cas limites

**Validation :**
- [ ] Nouvelles catégories ajoutées et testées
- [ ] Données de test personnalisées
- [ ] Tests de performance réalisés
- [ ] Analyse critique du code et propositions d'amélioration

---

## 📋 **Grille d'évaluation**

### **🔧 Compétences techniques (70%)**

| Critère | Bronze | Silver | Gold |
|---------|--------|--------|------|
| **CRUD** | POST fonctionne | Toutes opérations | + Workflow complet |
| **Validation** | Comprend les erreurs | Teste cas invalides | Modifie les schémas |
| **Codes HTTP** | 200, 404 | 200, 201, 204, 400, 404 | + Cas limites |
| **Débogage** | Assistance requise | Erreurs courantes | Autonomie complète |

### **🧠 Compétences conceptuelles (30%)**

| Critère | Bronze | Silver | Gold |
|---------|--------|--------|------|
| **Flow requête** | Vue globale | Traçage détaillé | Optimisations |
| **Architecture** | Controller/Service | + Middleware | + Séparation claire |
| **Validation** | Utilise Zod | Comprend les schémas | Crée des schémas |
| **Bonnes pratiques** | Suit les exemples | Les identifie | Les applique |

---

## ✅ **Checklist de validation**

### **🚀 Avant de commencer**
- [ ] TP 1 réussi (GET endpoints maîtrisés)
- [ ] Swagger UI utilisé avec aisance
- [ ] Concepts REST de base acquis
- [ ] Serveur démarre sans erreur

### **💻 Pendant le TP**

#### **Créations (POST)**
- [ ] Item créé avec tous les champs obligatoires
- [ ] Code 201 reçu avec item complet en réponse
- [ ] ID généré automatiquement
- [ ] createdAt ajouté automatiquement
- [ ] Tests avec curl réussis

#### **Validations**
- [ ] Erreur 400 pour prix négatif
- [ ] Erreur 400 pour catégorie invalide
- [ ] Erreur 400 pour nom manquant
- [ ] Messages d'erreur Zod compris
- [ ] Schémas analysés dans le code

#### **Modifications (PUT)**
- [ ] Modification complète réussie (code 200)
- [ ] Modification partielle réussie
- [ ] createdAt préservé lors des modifications
- [ ] Erreur 404 pour ID inexistant
- [ ] Validation appliquée aux modifications

#### **Suppressions (DELETE)**
- [ ] Suppression réussie (code 204)
- [ ] Item supprimé de la liste
- [ ] Erreur 404 pour ID inexistant
- [ ] Pas d'effet de bord sur autres items

#### **Analyse du code**
- [ ] Flow POST tracé dans le code
- [ ] Rôle des middlewares identifié
- [ ] Méthodes du service comprises
- [ ] Gestion d'erreurs analysée

### **🎓 Fin du TP**
- [ ] Workflow complet réalisé (création → modification → suppression)
- [ ] Quiz de validation complété
- [ ] Modifications de code tentées
- [ ] Prêt pour validation avancée (TP 3)

---

## 🎯 **Indicateurs de réussite**

### **🟢 Réussite confirmée si :**
- Toutes les opérations CRUD fonctionnent sans assistance
- Validation des données comprise et testée
- Flow de requête expliqué clairement
- Codes de statut HTTP maîtrisés
- Peut modifier le code avec succès

### **🟡 Réussite partielle si :**
- CRUD de base fonctionne mais avec assistance
- Validation comprise mais pas testée en détail
- Flow de requête vaguement compris
- Quelques codes de statut maîtrisés

### **🔴 Réussite insuffisante si :**
- POST ne fonctionne pas
- Validation incomprise
- Aucune modification de code réussie
- Codes de statut confus

---

## 🚀 **Préparation au TP suivant**

### **🎯 Prérequis pour le TP 3**
- [ ] ✅ CRUD complet maîtrisé
- [ ] ✅ Validation Zod comprise
- [ ] ✅ Modifications de schémas réussies
- [ ] ✅ Gestion d'erreurs claire

### **📈 Progression attendue**
**TP 2 → TP 3 :**
- Validation simple → Validation avancée
- Schémas fixes → Schémas dynamiques
- Erreurs basiques → Messages personnalisés
- Tests manuels → Tests automatisés

---

## 💡 **Conseils pour réussir**

### **⏱️ Gestion du temps**
- **45 min** : Maîtrise des opérations CRUD
- **45 min** : Tests de validation et gestion d'erreurs
- **30 min** : Analyse du code et traçage
- **30 min** : Modifications pratiques et workflow
- **30 min** : Tests avancés et validation

### **🎯 Stratégie d'apprentissage**
1. **CRUD d'abord** : Maîtrisez POST, PUT, DELETE avant l'analyse
2. **Testez les erreurs** : Provoquez volontairement des erreurs pour comprendre
3. **Suivez le code** : Tracez au moins une requête complètement
4. **Modifiez progressivement** : Commencez par des changements simples

### **🔧 En cas de blocage**
1. **Retour aux bases** : Relisez le TP 1 si les concepts REST sont flous
2. **Swagger first** : Utilisez l'interface avant curl
3. **Un endpoint à la fois** : Ne mélangez pas POST et PUT
4. **Logs du serveur** : Observez les messages d'erreur côté serveur

---

## 📊 **Métriques de progression**

### **Temps de réalisation cible**
- **Débutant** : 3-4 heures
- **Intermédiaire** : 2-3 heures  
- **Avancé** : 1.5-2 heures

### **Taux de réussite attendu**
- **Exercices obligatoires** : 100%
- **Exercices optionnels** : 70%
- **Quiz final** : 80%
- **Modifications de code** : 60%

### **Indicateurs qualité**
- Comprend pourquoi utiliser PUT vs POST
- Explique l'intérêt de la validation côté serveur
- Identifie les avantages de la séparation Controller/Service
- Propose des améliorations (même simples)

---

## 🎉 **Félicitations !**

Si vous atteignez ces objectifs, vous maîtrisez les fondamentaux des APIs REST modernes avec validation. Le TP niveau 3 vous permettra d'approfondir la validation avec des cas plus complexes et des messages personnalisés.

**🚀 Prêt pour la validation avancée ?**
```bash
git checkout tp-03-validation
```
