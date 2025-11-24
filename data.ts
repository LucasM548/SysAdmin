import { Chapter, CommandRef, FileSystemNode } from './types';
import { DEFAULT_FS } from './utils/fileSystem';

// Helper to create a specific FS state for chapters if needed
const getChapter1FS = (): FileSystemNode => JSON.parse(JSON.stringify(DEFAULT_FS));

export const CHAPTERS: Chapter[] = [
  {
    id: "chap1",
    title: "Chapitre 1 : Découverte",
    description: "Apprenez à naviguer dans le système de fichiers Linux avec le terminal.",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "L'Arborescence des Fichiers",
        content: [
          "Sous Linux, tout commence à la racine, représentée par un slash `/`.",
          "Contrairement à Windows (C:\\), il y a un arbre unique.",
          "Vos fichiers personnels sont dans `/home/etudiant`."
        ],
        code: "cd / \nls"
      },
      {
        title: "Navigation & Listing (ls)",
        content: [
          "`pwd` : Affiche le chemin absolu actuel.",
          "`ls` : Liste simple des fichiers.",
          "`ls -l` : Liste détaillée (droits, propriétaire, taille, date).",
          "`ls -a` : Affiche les fichiers cachés (ceux commençant par `.`).",
          "`ls -la` : Combine les options pour tout voir en détail."
        ],
        code: "pwd\nls -la"
      },
      {
        title: "Se Déplacer (cd)",
        content: [
          "`cd dossier` : Entre dans un dossier.",
          "`cd ..` : Remonte au dossier parent.",
          "`cd ~` (ou juste `cd`) : Retourne à votre dossier personnel (home).",
          "`cd -` : Retourne au dossier précédent."
        ],
        code: "cd Documents\ncd .."
      }
    ],
    exercises: [
      {
        id: "ex1_1",
        question: "Affichez le contenu de votre répertoire home.",
        hint: "Utilisez `ls`.",
        validationType: 'command_success',
        validationValue: 'ls',
        completed: false
      },
      {
        id: "ex1_2",
        question: "Distinguez les fichiers cachés. Affichez tout le contenu.",
        hint: "Utilisez `ls -a`.",
        validationType: 'command_success',
        validationValue: 'ls -a',
        completed: false
      },
      {
        id: "ex1_3",
        question: "Allez à la racine du système.",
        hint: "Utilisez `cd /`.",
        validationType: 'cwd_check',
        validationValue: '/',
        completed: false
      },
      {
        id: "ex1_4",
        question: "Retournez dans votre home.",
        hint: "Tapez juste `cd`.",
        validationType: 'cwd_check',
        validationValue: '/home/etudiant',
        completed: false
      },
      {
        id: "ex1_5",
        question: "Allez dans le dossier 'etc' situé à la racine.",
        hint: "`cd /etc`",
        validationType: 'cwd_check',
        validationValue: '/etc',
        completed: false
      }
    ]
  },
  {
    id: "chap2",
    title: "Chapitre 2 : Gestion des Fichiers",
    description: "Créer, déplacer et supprimer des fichiers et répertoires avec options.",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Création (mkdir, touch)",
        content: [
          "`touch fichier` : Crée un fichier vide.",
          "`mkdir dossier` : Crée un nouveau répertoire.",
          "`mkdir -p a/b/c` : Option **-p** (parents). Crée toute l'arborescence d'un coup."
        ],
        code: "touch mon_fichier.txt\nmkdir -p Projet/Src/Assets"
      },
      {
        title: "Suppression (rm)",
        content: [
          "`rm fichier` : Supprime un fichier.",
          "`rm -r dossier` : Option **-r** (récursif). Supprime un dossier et son contenu.",
          "`rm -f fichier` : Option **-f** (force). Supprime sans confirmation (même si protégé).",
          "`rm -rf dossier` : Le combo pour supprimer un dossier sans poser de questions."
        ]
      }
    ],
    exercises: [
      {
        id: "ex2_1",
        question: "Créez un répertoire nommé `TP1` dans votre home.",
        hint: "Utilisez `mkdir TP1`.",
        validationType: 'dir_exists',
        validationValue: '/home/etudiant/TP1',
        completed: false
      },
      {
        id: "ex2_2",
        question: "Allez dans `TP1` et créez un fichier `test.c`.",
        hint: "cd TP1; touch test.c",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/TP1/test.c',
        completed: false
      },
      {
        id: "ex2_3",
        question: "Créez l'arborescence `Projet/Src` en une seule commande.",
        hint: "Utilisez l'option -p : `mkdir -p Projet/Src`.",
        validationType: 'dir_exists',
        validationValue: '/home/etudiant/Projet/Src',
        completed: false
      },
      {
        id: "ex2_4",
        question: "Supprimez le fichier `todo.list` de votre home.",
        hint: "Revenez au home, puis `rm todo.list`.",
        validationType: 'command_success',
        validationValue: 'rm todo.list',
        completed: false
      },
      {
        id: "ex2_5",
        question: "Supprimez le dossier `Projet` et tout son contenu.",
        hint: "Utilisez `rm -r Projet` (ou -rf).",
        validationType: 'command_success',
        validationValue: 'rm -r Projet',
        completed: false
      }
    ]
  },
  {
    id: "chap3",
    title: "Chapitre 3 : Commandes Avancées",
    description: "Copie, déplacement, renommage et jokers.",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Copie (cp)",
        content: [
          "`cp source dest` : Copie un fichier.",
          "`cp -r dossier_source dossier_dest` : Copie récursive pour les dossiers."
        ],
        code: "cp notes.txt notes.bak\ncp -r Projet ProjetBackup"
      },
      {
        title: "Déplacement & Renommage (mv)",
        content: [
          "`mv source dest` : Déplace un fichier ou un dossier.",
          "Si la destination n'existe pas, cela *renomme* la source."
        ]
      },
      {
        title: "Caractères Joker (Wildcards)",
        content: [
          "`*` : Remplace n'importe quelle chaîne de caractères.",
          "`?` : Remplace un seul caractère.",
          "`ls *.txt` : Liste tous les fichiers texte."
        ]
      }
    ],
    exercises: [
      {
        id: "ex3_1",
        question: "Copiez `notes.txt` vers `notes.bak`.",
        hint: "Utilisez `cp notes.txt notes.bak`.",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/notes.bak',
        completed: false
      },
      {
        id: "ex3_2",
        question: "Renommez `notes.bak` en `backup.txt`.",
        hint: "Utilisez `mv`.",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/backup.txt',
        completed: false
      },
      {
        id: "ex3_3",
        question: "Créez `file1.txt` et `file2.txt`, puis listez les fichiers `.txt`.",
        hint: "`touch file1.txt file2.txt` puis `ls *.txt`.",
        validationType: 'command_success',
        validationValue: 'ls *.txt',
        completed: false
      },
      {
        id: "ex3_4",
        question: "Déplacez tous les fichiers `.txt` dans `Documents`.",
        hint: "`mv *.txt Documents`.",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/Documents/notes.txt',
        completed: false
      }
    ]
  },
  {
    id: "chap4",
    title: "Chapitre 4 : Filtres & Pipes",
    description: "Manipuler et filtrer le contenu des fichiers avec options.",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Redirections",
        content: [
          "`>` : Redirige la sortie vers un fichier (écrase).",
          "`>>` : Redirige vers un fichier (ajoute à la fin).",
          "`echo 'bonjour' > fichier`"
        ]
      },
      {
        title: "Affichage (cat, head, tail)",
        content: [
          "`cat -n fichier` : Affiche avec les numéros de ligne.",
          "`head -n 5 fichier` : Affiche les 5 premières lignes.",
          "`tail -n 5 fichier` : Affiche les 5 dernières lignes."
        ]
      },
      {
        title: "Recherche (grep)",
        content: [
          "`grep 'mot'` : Filtre les lignes contenant 'mot'.",
          "`grep -i` : Insensible à la casse (majuscules/minuscules).",
          "`grep -v` : Inverse la sélection (lignes SANS 'mot').",
          "`grep -n` : Affiche les numéros de ligne."
        ]
      },
      {
        title: "Tri et Comptage (sort, wc)",
        content: [
          "`wc -l` : Compte les lignes.",
          "`sort -r` : Trie en ordre inverse.",
          "`sort -n` : Trie numérique."
        ]
      }
    ],
    exercises: [
      {
        id: "ex4_1",
        question: "Créez `bonjour.txt` contenant 'Salut Linux'.",
        hint: "echo 'Salut Linux' > bonjour.txt",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/bonjour.txt',
        completed: false
      },
      {
        id: "ex4_2",
        question: "Ajoutez 'Au revoir' à la fin de `bonjour.txt`.",
        hint: "echo 'Au revoir' >> bonjour.txt",
        validationType: 'command_success',
        validationValue: "echo 'Au revoir' >> bonjour.txt",
        completed: false
      },
      {
        id: "ex4_3",
        question: "Cherchez 'linux' dans `bonjour.txt` sans faire attention à la casse.",
        hint: "grep -i 'linux' bonjour.txt",
        validationType: 'command_success',
        validationValue: "grep -i 'linux' bonjour.txt",
        completed: false
      },
      {
        id: "ex4_4",
        question: "Comptez le nombre de lignes dans `bonjour.txt`.",
        hint: "wc -l bonjour.txt",
        validationType: 'command_success',
        validationValue: "wc -l bonjour.txt",
        completed: false
      },
      {
        id: "ex4_5",
        question: "Affichez les 5 premières lignes de `/etc/passwd`.",
        hint: "head -n 5 /etc/passwd",
        validationType: 'command_success',
        validationValue: "head -n 5 /etc/passwd",
        completed: false
      }
    ]
  },
  {
    id: "chap5",
    title: "Chapitre 5 : Droits & Permissions",
    description: "Utilisateurs, groupes et droits d'accès (chmod).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Lire les Droits",
        content: [
          "`ls -l` affiche les droits comme `-rwxr-xr-x`.",
          "Propriétaire (u), Groupe (g), Autres (o).",
          "Lecture (r=4), Écriture (w=2), Exécution (x=1)."
        ]
      },
      {
        title: "Modifier les Droits (chmod)",
        content: [
          "`chmod 755 fichier` : u=rwx, g=rx, o=rx.",
          "`chmod +x fichier` : Ajoute le droit d'exécution.",
          "`chmod u-w fichier` : Enlève l'écriture au propriétaire."
        ]
      }
    ],
    exercises: [
      {
        id: "ex5_1",
        question: "Vérifiez les droits de `notes.txt`.",
        hint: "ls -l notes.txt",
        validationType: 'command_success',
        validationValue: 'ls -l notes.txt',
        completed: false
      },
      {
        id: "ex5_2",
        question: "Rendez `notes.txt` exécutable pour tout le monde.",
        hint: "chmod +x notes.txt",
        validationType: 'command_success',
        validationValue: 'chmod +x notes.txt',
        completed: false
      },
      {
        id: "ex5_3",
        question: "Mettez les droits 777 (accès total) sur `notes.txt`.",
        hint: "chmod 777 notes.txt",
        validationType: 'command_success',
        validationValue: 'chmod 777 notes.txt',
        completed: false
      },
      {
        id: "ex5_4",
        question: "Enlevez le droit de lecture pour les 'autres' sur `notes.txt`.",
        hint: "chmod o-r notes.txt (Simulé en chmod 640 notes.txt pour l'exercice)",
        validationType: 'command_success',
        validationValue: 'chmod 640 notes.txt', // Simplified check
        completed: false
      }
    ]
  },
  {
    id: "chap6",
    title: "Chapitre 6 : Scripts Bash",
    description: "Algorithmes, variables et boucles.",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Shebang & Exécution",
        content: [
          "Un script commence par `#!/bin/bash`.",
          "Il doit être exécutable : `chmod +x script.sh`.",
          "Lancer le script : `./script.sh`."
        ],
        code: "#!/bin/bash\necho 'Bonjour le Monde'"
      },
      {
        title: "Variables",
        content: [
          "Définition : `NOM='Jean'` (Pas d'espace autour du =).",
          "Utilisation : `echo $NOM` ou `echo ${NOM}`."
        ]
      },
      {
        title: "Boucles (For)",
        content: [
          "Itérer sur une liste.",
          "Syntaxe : `for i in 1 2 3; do ... done`."
        ],
        code: "for i in 1 2 3; do\n  echo \"Numéro $i\"\ndone"
      }
    ],
    exercises: [
      {
        id: "ex6_1",
        question: "Dans l'onglet 'Labo Script', écrivez un script `salut.sh`. Définissez `NOM='Etudiant'` et affichez `Salut $NOM`.",
        hint: "NOM='Etudiant'\necho \"Salut $NOM\"",
        validationType: 'file_content',
        validationValue: '/home/etudiant/salut.sh:Salut $NOM',
        completed: false
      },
      {
        id: "ex6_2",
        question: "Exécutez votre script `salut.sh`.",
        hint: "./salut.sh",
        validationType: 'command_success',
        validationValue: './salut.sh',
        completed: false
      },
      {
        id: "ex6_3",
        question: "Écrivez un script `boucle.sh` qui compte de 1 à 5.",
        hint: "for i in 1 2 3 4 5; do echo $i; done",
        validationType: 'file_content',
        validationValue: '/home/etudiant/boucle.sh:for',
        completed: false
      },
      {
        id: "ex6_4",
        question: "Utilisez `seq` dans un script `seqloop.sh` : `for i in $(seq 1 3); do ...`",
        hint: "for i in $(seq 1 3); do echo $i; done",
        validationType: 'file_content',
        validationValue: '/home/etudiant/seqloop.sh:seq',
        completed: false
      }
    ]
  },
  {
    id: "chap7",
    title: "Chapitre 7 : Processus",
    description: "Gérer les programmes en cours d'exécution.",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Voir les Processus",
        content: [
          "`ps` : Affiche vos processus courants.",
          "`top` : Vue temps réel (touche 'q' pour quitter).",
          "Chaque processus a un PID (Process ID)."
        ],
        code: "ps"
      },
      {
        title: "Tuer un Processus",
        content: [
          "`kill PID` : Envoie un signal d'arrêt.",
          "`kill -9 PID` : Arrêt forcé (Kill immédiat).",
          "`Ctrl+C` : Tue le processus en premier plan."
        ]
      }
    ],
    exercises: [
      {
        id: "ex7_1",
        question: "Listez les processus actuels.",
        hint: "Utilisez `ps`.",
        validationType: 'command_success',
        validationValue: 'ps',
        completed: false
      },
      {
        id: "ex7_2",
        question: "Simulez l'arrêt du processus avec le PID 1234.",
        hint: "kill 1234",
        validationType: 'command_success',
        validationValue: 'kill 1234',
        completed: false
      }
    ]
  }
];

export const CHEAT_SHEET: CommandRef[] = [
  { command: "ls", description: "Lister. -l (détails), -a (cachés), -la (tout)", example: "ls -la" },
  { command: "cd", description: "Changer de répertoire", example: "cd /home" },
  { command: "pwd", description: "Afficher le chemin absolu", example: "pwd" },
  { command: "mkdir", description: "Créer dossier. -p (parents)", example: "mkdir -p a/b/c" },
  { command: "touch", description: "Créer fichier / MàJ date", example: "touch f.txt" },
  { command: "cp", description: "Copier. -r (récursif)", example: "cp -r src dst" },
  { command: "mv", description: "Déplacer ou Renommer", example: "mv old new" },
  { command: "rm", description: "Supprimer. -r (dossier), -f (force)", example: "rm -rf dossier" },
  { command: "cat", description: "Afficher contenu. -n (numéros)", example: "cat -n f.txt" },
  { command: "grep", description: "Chercher. -i (casse), -v (inv), -n (ligne)", example: "grep -i 'mot' f.txt" },
  { command: "wc", description: "Compter. -l (lignes), -w (mots), -c (octets)", example: "wc -l f.txt" },
  { command: "sort", description: "Trier. -n (numérique), -r (inverse)", example: "sort -n f.txt" },
  { command: "head", description: "Début fichier. -n X (lignes)", example: "head -n 5 f.txt" },
  { command: "tail", description: "Fin fichier. -n X (lignes)", example: "tail -n 5 f.txt" },
  { command: "chmod", description: "Permissions (+x, 755, 644)", example: "chmod +x script.sh" },
  { command: "ps", description: "Lister les processus", example: "ps" },
  { command: "kill", description: "Tuer un processus (PID)", example: "kill 1234" },
  { command: "clear", description: "Effacer l'écran du terminal", example: "clear" },
];