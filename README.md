# SysAdmin 101 - Apprentissage Interactif de Linux

Bienvenue sur **SysAdmin 101**, une plateforme web interactive conçue pour l'apprentissage de l'administration système Linux (Module R1.04). Ce projet permet aux étudiants de pratiquer les commandes Linux directement dans leur navigateur grâce à un terminal simulé.

## 📋 Description

Ce projet est une application React qui simule un environnement Linux. Il guide l'utilisateur à travers plusieurs chapitres, allant de la découverte du système de fichiers à l'écriture de scripts Bash complexes. L'objectif est de fournir un environnement sûr et accessible pour maîtriser les bases de l'administration système sans avoir besoin d'installer une machine virtuelle.

## ✨ Fonctionnalités

- **Terminal Interactif** : Un émulateur de terminal intégré supportant les commandes Linux essentielles (`ls`, `cd`, `mkdir`, `touch`, `cp`, `mv`, `rm`, `grep`, `cat`, `chmod`, etc.).
- **Progression Sauvegardée** : Votre avancement dans les exercices est automatiquement sauvegardé dans le navigateur (localStorage).
- **Chapitres Structurés** :
  - Chapitre 1 : Découverte du Système (Navigation, ls)
  - Chapitre 2 : Gestion des Fichiers (mkdir, cp, mv, rm)
  - Chapitre 3 : Commandes Évoluées (grep, sort, head, tail, pipes)
  - Chapitre 4 : Redirections & Wildcards
  - Chapitre 5 : Droits & Permissions (chmod, id)
  - Chapitre 6 : Scripts Bash (Variables, Boucles, Tests)
  - Chapitre 7 : Processus (ps, kill)
  - Chapitre 8 : Préparation Examen (Révisions intensives)
- **Validation Automatique** : Les exercices sont validés automatiquement en temps réel en analysant l'état du système de fichiers virtuel ou les commandes saisies.
- **Aide-mémoire (Cheatsheet)** : Une référence rapide des commandes Bash avec des exemples et une fonction de recherche.
- **Design Moderne** : Interface utilisateur soignée, responsive et agréable (Glassmorphism, Dark Mode).

## 🛠️ Technologies Utilisées

- **Frontend** : [React](https://react.dev/) (v19) avec [TypeScript](https://www.typescriptlang.org/)
- **Build Tool** : [Vite](https://vitejs.dev/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Déploiement** : GitHub Pages

## 🚀 Installation et Démarrage

Pour lancer le projet localement sur votre machine :

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/LucasM548/SysAdmin.git
    cd SysAdmin
    ```

2.  **Installer les dépendances** :
    Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé.
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    L'application sera accessible à l'adresse `http://localhost:5173`.

4.  **Construire pour la production** :
    Pour générer les fichiers statiques dans le dossier `dist` :
    ```bash
    npm run build
    ```

## 📖 Utilisation

1.  Ouvrez l'application dans votre navigateur.
2.  Sur le tableau de bord, sélectionnez un chapitre pour commencer.
3.  Lisez les leçons théoriques à gauche.
4.  Utilisez le terminal à droite pour réaliser les exercices demandés.
5.  Une fois un exercice réussi, il sera marqué comme complété et vous pourrez passer au suivant.
6.  Consultez l'aide-mémoire si vous avez un doute sur une commande.

## 📄 Contexte

Ce projet a été réalisé en "vibe coding" pour m'aider à apprendre et maîtriser ces concepts. Il a été développé avec l'assistance d'une Intelligence Artificielle.