# 🎯 Objectifs - TP Niveau 1 : Découverte

## 🎪 **Vue d'ensemble**

Ce premier TP vous fait découvrir les bases d'une API REST avec Node.js. À la fin de ce niveau, vous maîtriserez les concepts fondamentaux et saurez naviguer dans le projet.

---

## 🎯 **Objectifs pédagogiques**

### **🔍 Objectif 1 : Comprendre l'architecture REST**

**Compétences acquises :**

- [ ] Identifier les 5 opérations CRUD (Create, Read, Update, Delete)
- [ ] Associer les méthodes HTTP aux opérations (GET, POST, PUT, DELETE)
- [ ] Comprendre le concept de ressource (/api/items)
- [ ] Interpréter les codes de statut HTTP (200, 404, 500)

**Critères d'évaluation :**

- ✅ Peut expliquer ce que fait chaque endpoint
- ✅ Comprend la différence entre GET /items et GET /items/1
- ✅ Sait interpréter les réponses d'erreur

### **🛠️ Objectif 2 : Maîtriser les outils de développement**

**Compétences acquises :**

- [ ] Installer et configurer un projet Node.js
- [ ] Utiliser Swagger UI pour tester une API
- [ ] Exécuter des requêtes avec curl
- [ ] Lire et interpréter les logs serveur

**Critères d'évaluation :**

- ✅ Installe le projet sans assistance
- ✅ Navigue aisément dans Swagger UI
- ✅ Exécute des commandes curl correctes
- ✅ Diagnostique les erreurs de base

### **📁 Objectif 3 : Comprendre la structure du projet**

**Compétences acquises :**

- [ ] Identifier le rôle de chaque dossier (src/, config/, etc.)
- [ ] Comprendre le flow d'une requête HTTP
- [ ] Localiser les données et la logique métier
- [ ] Modifier des données de test

**Critères d'évaluation :**

- ✅ Peut expliquer le rôle de chaque dossier
- ✅ Trace une requête de A à Z (route → controller → service)
- ✅ Modifie les données mockées avec succès

---

## 📊 **Niveaux de maîtrise**

### **🥉 Niveau Bronze (Minimum requis)**

**Durée :** 30-45 minutes

**Compétences :**

- Installation réussie du projet
- Démarrage du serveur sans erreur
- Test basique avec Swagger UI

**Validation :**

- [ ] `npm start` fonctionne
- [ ] Swagger accessible à /docs
- [ ] GET /api/items retourne 3 items

### **🥈 Niveau Silver (Objectif recommandé)**

**Durée :** 1-1.5 heures

**Compétences :**

- Tous les tests Swagger réussis
- Utilisation de curl maîtrisée
- Compréhension de la structure de base

**Validation :**

- [ ] Tous les endpoints testés
- [ ] Tests curl exécutés
- [ ] Code source parcouru et compris

### **🥇 Niveau Gold (Excellence)**

**Durée :** 1.5-2 heures

**Compétences :**

- Modification des données réussie
- Dépannage autonome
- Quiz de validation 100%

**Validation :**

- [ ] Données personnalisées ajoutées
- [ ] Résolution de problèmes techniques
- [ ] Explication claire des concepts

---

## 📋 **Grille d'évaluation**

### **🔧 Compétences techniques (60%)**

| Critère          | Bronze                | Silver                | Gold                   |
| ---------------- | --------------------- | --------------------- | ---------------------- |
| **Installation** | Suit les instructions | Installation autonome | Résout les problèmes   |
| **Tests API**    | 1 endpoint testé      | Tous endpoints testés | Tests créatifs         |
| **Outils**       | Swagger seulement     | Swagger + curl        | Swagger + curl + debug |
| **Code**         | Lecture passive       | Analyse active        | Modification réussie   |

### **🧠 Compétences conceptuelles (40%)**

| Critère               | Bronze             | Silver              | Gold                |
| --------------------- | ------------------ | ------------------- | ------------------- |
| **Architecture REST** | Notions de base    | Concepts clairs     | Maîtrise complète   |
| **Flow requête**      | Vague idée         | Compréhension       | Explication claire  |
| **Structure projet**  | Vue globale        | Rôle des dossiers   | Navigation experte  |
| **Debugging**         | Assistance requise | Autonomie partielle | Résolution autonome |

---

## ✅ **Checklist de validation**

### **🚀 Avant de commencer**

- [ ] Node.js 18+ installé et vérifié
- [ ] Git installé et configuré
- [ ] Éditeur de code prêt (VS Code recommandé)
- [ ] Terminal/invite de commande accessible

### **💻 Pendant le TP**

- [ ] Projet cloné et installé (`npm install`)
- [ ] Configuration copiée (`.env` créé)
- [ ] Serveur démarré avec succès
- [ ] Swagger UI accessible et exploré
- [ ] Tous les endpoints GET testés
- [ ] Tests curl exécutés
- [ ] Structure du projet analysée
- [ ] Données de test modifiées (optionnel)

### **🎓 Fin du TP**

- [ ] Quiz de validation complété
- [ ] Concepts REST compris
- [ ] Outils de développement maîtrisés
- [ ] Prêt pour le TP niveau 2

---

## 🎯 **Indicateurs de réussite**

### **🟢 Réussite confirmée si :**

- Serveur démarre en moins de 30 secondes
- Interface Swagger s'affiche correctement
- GET /api/items retourne exactement 3 items
- Peut expliquer le rôle des dossiers src/
- Comprend la différence entre 200 et 404

### **🟡 Réussite partielle si :**

- Serveur démarre avec assistance
- Tests Swagger partiellement réussis
- Compréhension floue de l'architecture
- Besoin d'aide pour les tests curl

### **🔴 Réussite insuffisante si :**

- Impossible de démarrer le serveur
- Swagger inaccessible
- Aucune compréhension de REST
- Incapacité à naviguer dans le code

---

## 🚀 **Préparation au TP suivant**

### **🎯 Prérequis pour le TP 2**

- [ ] ✅ Maîtrise des opérations GET
- [ ] ✅ Compréhension du format JSON
- [ ] ✅ Utilisation de Swagger UI
- [ ] ✅ Navigation dans le code source

### **📈 Progression attendue**

**TP 1 → TP 2 :**

- Lecture seule → Écriture de données
- Tests GET → Tests POST/PUT/DELETE
- Interface Swagger → Tests programmatiques
- Données fixes → Données dynamiques

---

## 💡 **Conseils pour réussir**

### **⏱️ Gestion du temps**

- **30 min** : Installation et premier démarrage
- **45 min** : Exploration Swagger et tests de base
- **30 min** : Analyse du code et compréhension
- **15 min** : Quiz et validation

### **🎯 Stratégie d'apprentissage**

1. **Pratique d'abord** : Faites fonctionner avant de comprendre
2. **Questions fréquentes** : Notez ce qui vous interroge
3. **Expérimentation** : N'hésitez pas à tester différentes URL
4. **Documentation** : Lisez les commentaires dans le code

### **🔧 En cas de blocage**

1. Vérifiez les prérequis (Node.js, npm)
2. Relisez les messages d'erreur attentivement
3. Consultez la section "Problèmes courants"
4. Redémarrez le serveur si nécessaire

---

## 🎉 **Félicitations !**

Si vous atteignez ces objectifs, vous avez acquis les bases essentielles pour développer des APIs REST. Le TP niveau 2 vous permettra d'aller plus loin avec la création et modification de données.

**🚀 Prêt pour la suite ?**

```bash
git checkout tp-02-premiers-pas
```
