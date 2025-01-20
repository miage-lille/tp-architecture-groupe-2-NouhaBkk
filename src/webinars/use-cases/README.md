# **Webinar Management Application**

## **Description**
Ce projet implémente une application de gestion de webinaires en suivant l'architecture **Ports / Adapters**. L'objectif principal est de fournir une application extensible, maintenable et testable en isolant les responsabilités techniques et métier.

### **Cas d'utilisation ajouté : Réserver une place**
Une nouvelle fonctionnalité a été ajoutée pour permettre à un utilisateur de réserver une place à un webinaire existant. Cette fonctionnalité comprend :
- Vérification des règles métier (places disponibles, inscription déjà effectuée).
- Notification par e-mail à l'organisateur en cas de nouvelle réservation.
- Tests unitaires pour valider le fonctionnement global et les cas d'erreur.

---

## **Nouveautés par rapport à l'état initial**

### **1. Classes ajoutées**

#### **Users**
- **`InMemoryUserRepository`** (dans `src/users/adapters/user-repository.in-memory.ts`) :
  - Référentiel en mémoire pour gérer les utilisateurs (CRUD).
  - Permet de stocker et de récupérer des utilisateurs pendant les tests.

#### **Webinars**
- **`InMemoryParticipationRepository`** (dans `src/webinars/adapters/participation-repository.in-memory.ts`) :
  - Référentiel en mémoire pour gérer les participations des utilisateurs à un webinaire.
- **`Participation`** (dans `src/webinars/entities/participation.entity.ts`) :
  - Entité représentant une inscription d'utilisateur à un webinaire.
- **Cas d'utilisation `BookSeat`** (dans `src/webinars/use-cases/book-seat.ts`) :
  - Permet à un utilisateur de réserver une place à un webinaire.
  - Implémente les règles métier :
    - Vérifier les places disponibles.
    - Empêcher une double inscription.
  - Notification par e-mail à l'organisateur en cas de succès.

### **2. Tests ajoutés**

#### **Cas d'utilisation `BookSeat`**
- Tests unitaires dans `src/webinars/use-cases/book-seat.test.ts` pour valider :
  - Le chemin heureux (réservation réussie).
  - Les cas d'échec (pas de places, double inscription, webinaire inexistant).

#### **Référentiels en mémoire**
- Tests pour valider les référentiels en mémoire :
  - **`InMemoryUserRepository`** : Ajout, mise à jour, suppression, et récupération d'utilisateurs.
  - **`InMemoryParticipationRepository`** : Gestion des inscriptions.

---

## **Structure du projet après modifications**
```
📦 src
 ┣ 📂 core
 ┃ ┣ 📂 adapters
 ┃ ┃ ┗ 📜 in-memory-mailer.ts
 ┃ ┗ 📂 ports
 ┃ ┃ ┗ 📜 mailer.interface.ts
 ┣ 📂 shared
 ┃ ┣ 📜 entity.ts
 ┃ ┗ 📜 executable.ts
 ┣ 📂 users
 ┃ ┣ 📂 adapters
 ┃ ┃ ┗ 📜 user-repository.in-memory.ts
 ┃ ┣ 📂 entities
 ┃ ┃ ┗ 📜 user.entity.ts
 ┃ ┗ 📂 ports
 ┃ ┃ ┗ 📜 user-repository.interface.ts
 ┣ 📂 webinars
 ┃ ┣ 📂 adapters
 ┃ ┃ ┣ 📜 webinar-repository.in-memory.ts
 ┃ ┃ ┗ 📜 participation-repository.in-memory.ts
 ┃ ┣ 📂 entities
 ┃ ┃ ┣ 📜 webinar.entity.ts
 ┃ ┃ ┗ 📜 participation.entity.ts
 ┃ ┣ 📂 exceptions
 ┃ ┃ ┣ 📜 webinar-dates-too-soon.ts
 ┃ ┃ ┣ 📜 webinar-not-enough-seats.ts
 ┃ ┃ ┗ 📜 webinar-too-many-seats.ts
 ┃ ┣ 📂 ports
 ┃ ┃ ┣ 📜 webinar-repository.interface.ts
 ┃ ┃ ┗ 📜 participation-repository.interface.ts
 ┃ ┗ 📂 use-cases
 ┃ ┃ ┣ 📜 organize-webinar.ts
 ┃ ┃ ┣ 📜 book-seat.ts
 ┃ ┃ ┣ 📜 organize-webinar.test.ts
 ┃ ┃ ┗ 📜 book-seat.test.ts
```

## **Lancer les tests**
Il faut mettre en commentaire cette ligne de configuration :
  `//testRegex: '^((?!int|e2e).)*.test.ts$'`
Et run ensuite la commande suivante: `npm run test:watch`