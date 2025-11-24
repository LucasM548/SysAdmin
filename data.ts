import { Chapter, CommandRef, FileSystemNode } from './types';
import { DEFAULT_FS } from './utils/fileSystem';

// Helper to create a specific FS state for chapters if needed
const getChapter1FS = (): FileSystemNode => JSON.parse(JSON.stringify(DEFAULT_FS));

export const CHAPTERS: Chapter[] = [
  {
    id: "chap1",
    title: "Chapitre 1 : Découverte du Système",
    description: "Navigation dans l'arborescence, listage avancé et chemins absolus/relatifs (Basé sur TP1).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "L'Arborescence & Navigation",
        content: [
          "La racine du système est `/`. Votre dossier personnel est représenté par `~` (/home/etudiant).",
          "`pwd` (Print Working Directory) : Affiche où vous êtes.",
          "`cd` sans argument ou `cd ~` ramène à la maison.",
          "`cd -` revient au répertoire précédent (très utile !).",
          "`cd ..` remonte d'un cran dans l'arborescence."
        ],
        code: "cd /etc\npwd\ncd ..\ncd ~"
      },
      {
        title: "Lister les fichiers (ls)",
        content: [
          "`ls` : Liste simple.",
          "`ls -a` : Affiche tout (all), y compris les fichiers cachés (commençant par `.`).",
          "`ls -l` : Liste détaillée (long listing).",
          "`ls -t` : Trie par date de modification (time).",
          "`ls -S` : Trie par taille (Size).",
          "`ls -r` : Inverse l'ordre de tri (reverse)."
        ],
        code: "ls -latr"
      }
    ],
    exercises: [
      {
        id: "ex1_1",
        question: "Affichez le contenu de votre répertoire home.",
        hint: "Utilisez la commande `ls` simplement.",
        validationType: 'command_success',
        validationValue: 'ls',
        completed: false
      },
      {
        id: "ex1_2",
        question: "Affichez tous les fichiers, y compris les cachés (commençant par .).",
        hint: "L'option -a est nécessaire : `ls -a`.",
        validationType: 'command_success',
        validationValue: 'ls -a',
        completed: false
      },
      {
        id: "ex1_3",
        question: "Allez à la racine du système directement.",
        hint: "La racine est représentée par le slash `/`.",
        validationType: 'cwd_check',
        validationValue: '/',
        completed: false
      },
      {
        id: "ex1_4",
        question: "Retournez dans votre home en une seule commande.",
        hint: "Tapez juste `cd` ou `cd ~`.",
        validationType: 'cwd_check',
        validationValue: '/home/etudiant',
        completed: false
      },
      {
        id: "ex1_5",
        question: "Listez les fichiers triés par taille décroissante (les plus gros en premier).",
        hint: "L'option majuscule -S permet de trier par taille : `ls -S`.",
        validationType: 'command_success',
        validationValue: 'ls -S',
        completed: false
      },
      {
        id: "ex1_6",
        question: "Affichez les fichiers triés par taille croissante (inverse).",
        hint: "Combinez le tri par taille (-S) et l'inversion (-r) : `ls -Sr`.",
        validationType: 'command_success',
        validationValue: 'ls -Sr',
        completed: false
      }
    ]
  },
  {
    id: "chap2",
    title: "Chapitre 2 : Gestion des Fichiers",
    description: "Création d'arborescence complexe, copie, déplacement et suppression (Basé sur TP Gestion des fichiers).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Création (mkdir, touch)",
        content: [
          "`mkdir dossier` : Crée un répertoire.",
          "`mkdir -p a/b/c` : Crée toute une arborescence (parents) d'un coup.",
          "`touch fichier` : Crée un fichier vide ou met à jour sa date."
        ],
        code: "mkdir -p Entreprise/Projet/Src"
      },
      {
        title: "Manipulation (cp, mv, rm)",
        content: [
          "`cp -r source dest` : Copie récursive (pour les dossiers).",
          "`mv source dest` : Déplace ou renomme.",
          "`rm -rf dossier` : Supprime un dossier et son contenu sans demander confirmation."
        ]
      }
    ],
    exercises: [
      {
        id: "ex2_1",
        question: "Créez l'arborescence suivante : un dossier `Entreprise` contenant `compta99`, `compta00` et `fact00` (fichiers).",
        hint: "mkdir Entreprise; cd Entreprise; touch compta99 compta00 fact00",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/Entreprise/fact00',
        completed: false
      },
      {
        id: "ex2_2",
        question: "Toujours dans `Entreprise`, créez le fichier `fact01`.",
        hint: "touch fact01 (assurez-vous d'être dans le dossier Entreprise)",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/Entreprise/fact01',
        completed: false
      },
      {
        id: "ex2_3",
        question: "Remontez dans votre home et créez le dossier `TP11`.",
        hint: "cd ..; mkdir TP11 (ou cd ~; mkdir TP11)",
        validationType: 'dir_exists',
        validationValue: '/home/etudiant/TP11',
        completed: false
      },
      {
        id: "ex2_4",
        question: "Copiez le fichier `fact00` (qui est dans Entreprise) vers le dossier `TP11` en utilisant un chemin absolu pour la source.",
        hint: "cp /home/etudiant/Entreprise/fact00 /home/etudiant/TP11/",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/TP11/fact00',
        completed: false
      },
      {
        id: "ex2_4b",
        question: "Copiez `fact01` vers `TP11` en utilisant un chemin relatif.",
        hint: "Depuis le home : cp Entreprise/fact01 TP11/",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/TP11/fact01',
        completed: false
      },
      {
        id: "ex2_4c",
        question: "Déplacez le fichier `compta99` dans le home, en utilisant des chemins relatifs.",
        hint: "mv Entreprise/compta99 .",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/compta99',
        completed: false
      },
      {
        id: "ex2_5",
        question: "Copiez le répertoire `TP11` vers un nouveau répertoire `cpTP11` dans `Entreprise`. Attention, c'est un dossier !",
        hint: "cp -r TP11 Entreprise/cpTP11 (N'oubliez pas le -r pour un dossier !)",
        validationType: 'dir_exists',
        validationValue: '/home/etudiant/Entreprise/cpTP11',
        completed: false
      },
      {
        id: "ex2_6",
        question: "Supprimez le répertoire `TP11` et son contenu.",
        hint: "rm -r TP11",
        validationType: 'command_success',
        validationValue: 'rm -r TP11',
        completed: false
      }
    ]
  },
  {
    id: "chap3",
    title: "Chapitre 3 : Commandes Évoluées",
    description: "Grep, Sort, Head, Tail et Pipes sur des fichiers de données (Basé sur TP Commandes évoluées).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Affichage partiel (head, tail)",
        content: [
          "`head -n 5` : Affiche les 5 premières lignes.",
          "`tail -n 3` : Affiche les 3 dernières lignes."
        ]
      },
      {
        title: "Tri (sort)",
        content: [
          "`sort` : Tri alphabétique.",
          "`sort -n` : Tri numérique (10 est plus grand que 2).",
          "`sort -r` : Tri inversé (reverse).",
          "`sort -k2` : Trie sur la 2ème colonne."
        ]
      },
      {
        title: "Filtres (grep, wc)",
        content: [
          "`grep 'motif'` : Affiche les lignes contenant le motif.",
          "`wc -l` : Compte le nombre de lignes.",
          "`|` (Pipe) : Envoie le résultat d'une commande vers une autre."
        ]
      }
    ],
    exercises: [
      {
        id: "ex3_1",
        question: "Créez un fichier `telephone.txt` contenant ces données :\narthur 8316\ntoto 8321\ntiti 8623\nzoe 8520",
        hint: "echo -e 'arthur 8316\\ntoto 8321\\ntiti 8623\\nzoe 8520' > telephone.txt",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/telephone.txt',
        completed: false
      },
      {
        id: "ex3_2",
        question: "Affichez la liste triée par nom (alphabétique).",
        hint: "sort telephone.txt",
        validationType: 'command_success',
        validationValue: 'sort telephone.txt',
        completed: false
      },
      {
        id: "ex3_3",
        question: "Affichez uniquement les lignes des personnes dont le numéro contient '83'.",
        hint: "grep '83' telephone.txt (ou cat telephone.txt | grep '83')",
        validationType: 'output_match',
        validationValue: "8316", // Checks if the output contains one of the phone numbers
        completed: false
      },
      {
        id: "ex3_4",
        question: "Comptez combien de personnes sont dans la liste (nombre de lignes).",
        hint: "wc -l telephone.txt",
        validationType: 'command_success',
        validationValue: "wc -l telephone.txt",
        completed: false
      },
      {
        id: "ex3_5",
        question: "Le fichier `/proc/meminfo` contient des infos mémoire. Affichez les 5 premières lignes.",
        hint: "head -n 5 /proc/meminfo",
        validationType: 'command_success',
        validationValue: "head -n 5 /proc/meminfo",
        completed: false
      },
      {
        id: "ex3_6",
        question: "Cherchez combien de processeurs sont déclarés dans `/proc/cpuinfo` (comptez les lignes contenant 'processor').",
        hint: "grep 'processor' /proc/cpuinfo | wc -l",
        validationType: 'output_match',
        validationValue: "4",
        completed: false
      }
    ]
  },
  {
    id: "chap4",
    title: "Chapitre 4 : Redirections & Wildcards",
    description: "Les caractères jokers (*, ?) et les redirections de flux (>, >>).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Caractères Jokers (Wildcards)",
        content: [
          "`*` : Remplace n'importe quelle suite de caractères.",
          "`?` : Remplace un seul caractère.",
          "`[a-z]` : Une plage de caractères.",
          "Exemple : `ls *.txt` liste tous les fichiers texte."
        ]
      },
      {
        title: "Redirections (Flux)",
        content: [
          "`commande > fichier` : Écrase le fichier avec le résultat.",
          "`commande >> fichier` : Ajoute à la fin du fichier sans écraser.",
          "`commande < fichier` : Lit l'entrée depuis un fichier."
        ]
      },
      {
        title: "Commande date",
        content: [
          "`date` affiche la date actuelle.",
          "`date +%s` affiche le timestamp (secondes depuis 1970)."
        ]
      }
    ],
    exercises: [
      {
        id: "ex4_1",
        question: "Créez 3 fichiers : `file1.txt`, `file2.txt` et `image.png`.",
        hint: "touch file1.txt file2.txt image.png",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/image.png',
        completed: false
      },
      {
        id: "ex4_2",
        question: "Listez uniquement les fichiers se terminant par `.txt`.",
        hint: "ls *.txt",
        validationType: 'command_success',
        validationValue: 'ls *.txt',
        completed: false
      },
      {
        id: "ex4_3",
        question: "Sauvegardez la liste des fichiers `.txt` dans un fichier nommé `liste.log`.",
        hint: "ls *.txt > liste.log",
        validationType: 'file_exists',
        validationValue: '/home/etudiant/liste.log',
        completed: false
      },
      {
        id: "ex4_4",
        question: "Ajoutez la date actuelle à la fin du fichier `liste.log`.",
        hint: "date >> liste.log",
        validationType: 'command_success',
        validationValue: 'date >> liste.log',
        completed: false
      }
    ]
  },
  {
    id: "chap5",
    title: "Chapitre 5 : Droits & Permissions",
    description: "Gestion des utilisateurs (chmod, id) et sécurité (Basé sur TP4).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Comprendre les droits",
        content: [
          "`r` (Read=4), `w` (Write=2), `x` (eXecute=1).",
          "Ordre : Propriétaire (u) / Groupe (g) / Autres (o).",
          "`drwxr-xr-x` : Dossier, rwx pour user, rx pour group, rx pour others."
        ]
      },
      {
        title: "Changer les droits (chmod)",
        content: [
          "Mode symbolique : `chmod u+x` (ajoute exécution au user), `chmod go-w` (enlève écriture au groupe/autres).",
          "Mode octal : `chmod 755` (rwx pour u, rx pour g/o), `chmod 600` (rw pour u uniquement)."
        ]
      }
    ],
    exercises: [
      {
        id: "ex5_1",
        question: "Affichez votre identifiant utilisateur (uid) et vos groupes.",
        hint: "Utilisez la commande `id`.",
        validationType: 'command_success',
        validationValue: 'id',
        completed: false
      },
      {
        id: "ex5_2",
        question: "Créez un dossier `Secret` et regardez ses droits par défaut.",
        hint: "mkdir Secret; ls -ld Secret",
        validationType: 'dir_exists',
        validationValue: '/home/etudiant/Secret',
        completed: false
      },
      {
        id: "ex5_3",
        question: "Enlevez le droit d'écriture sur `Secret` pour tout le monde (y compris vous).",
        hint: "chmod -w Secret (ou chmod 555 Secret)",
        validationType: 'file_permissions',
        validationValue: '/home/etudiant/Secret:dr-xr-xr-x',
        completed: false
      },
      {
        id: "ex5_4",
        question: "Essayez maintenant de créer un fichier dans `Secret` (Test d'interdiction).",
        hint: "touch Secret/test.txt (Cela devrait échouer !)",
        validationType: 'output_match',
        validationValue: 'Permission non accordée', // We now expect failure output
        completed: false
      },
      {
        id: "ex5_5",
        question: "Redonnez-vous le droit d'écriture sur `Secret`.",
        hint: "chmod u+w Secret (ou chmod 755 Secret)",
        validationType: 'file_permissions',
        validationValue: '/home/etudiant/Secret:drwxr-xr-x',
        completed: false
      },
      {
        id: "ex5_6",
        question: "Utilisez l'option récursive pour donner tous les droits (777) à `Secret` et son contenu.",
        hint: "chmod -R 777 Secret",
        validationType: 'file_permissions',
        validationValue: '/home/etudiant/Secret:drwxrwxrwx',
        completed: false
      }
    ]
  },
  {
    id: "chap6",
    title: "Chapitre 6 : Scripts Bash",
    description: "Variables, boucles et scripts automatisés (Basé sur TP6).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Structure d'un script",
        content: [
          "1ère ligne : `#!/bin/bash` (Shebang).",
          "Rendre exécutable : `chmod +x script.sh`.",
          "Exécuter : `./script.sh`."
        ],
        code: "#!/bin/bash\necho \"Mon premier script\""
      },
      {
        title: "Variables & Boucles",
        content: [
          "`NOM='Toto'` (pas d'espaces autour du =).",
          "`echo $NOM` pour utiliser.",
          "`for i in 1 2 3; do ... done` pour boucler."
        ],
        code: "for fichier in *.txt; do\n  echo \"Trouvé : $fichier\"\ndone"
      }
    ],
    exercises: [
      {
        id: "ex6_1",
        question: "Dans le 'Labo Script', créez `backup.sh`. Définissez `DIR='Sauvegarde'` et faites `mkdir -p $DIR`.",
        hint: "DIR='Sauvegarde'\nmkdir -p $DIR",
        validationType: 'file_content',
        validationValue: '/home/etudiant/backup.sh:mkdir -p $DIR',
        completed: false
      },
      {
        id: "ex6_3",
        question: "Exécutez le script pour créer le dossier.",
        hint: "./backup.sh",
        validationType: 'dir_exists',
        validationValue: '/home/etudiant/Sauvegarde',
        completed: false
      },
      {
        id: "ex6_4",
        question: "Créez un script `count.sh` qui boucle de 1 à 5 et affiche le chiffre.",
        hint: "for i in 1 2 3 4 5; do echo $i; done",
        validationType: 'file_content',
        validationValue: '/home/etudiant/count.sh:for',
        completed: false
      },
      {
        id: "ex6_5",
        question: "Exécutez `count.sh` et vérifiez la sortie.",
        hint: "./count.sh",
        validationType: 'command_success',
        validationValue: './count.sh',
        completed: false
      }
    ]
  },
  {
    id: "chap7",
    title: "Chapitre 7 : Processus",
    description: "Surveillance et gestion des processus (ps, kill).",
    initialFileSystem: getChapter1FS(),
    lessons: [
      {
        title: "Voir les Processus (ps, top)",
        content: [
          "`ps` : Affiche vos processus dans le terminal actuel.",
          "`ps -ef` ou `ps aux` : Affiche tous les processus du système.",
          "`top` : Affiche l'activité en temps réel."
        ],
        code: "ps -ef"
      },
      {
        title: "Arrêter un Processus (kill)",
        content: [
          "`kill PID` : Demande poliment l'arrêt du processus numéro PID.",
          "`kill -9 PID` : Force l'arrêt immédiat (SIGKILL)."
        ]
      }
    ],
    exercises: [
      {
        id: "ex7_1",
        question: "Affichez la liste de vos processus actuels.",
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
      },
      {
        id: "ex7_3",
        question: "Forcez l'arrêt brutal (kill -9) du processus 5678.",
        hint: "kill -9 5678",
        validationType: 'command_success',
        validationValue: 'kill -9 5678',
        completed: false
      }
    ]
  }
];

export const CHEAT_SHEET: CommandRef[] = [
  { command: "ls", description: "Lister. -l (détails), -a (cachés), -t (temps), -S (taille)", example: "ls -latr" },
  { command: "cd", description: "Changer de répertoire. cd - (précédent), cd .. (parent)", example: "cd /etc" },
  { command: "pwd", description: "Afficher le chemin courant", example: "pwd" },
  { command: "mkdir", description: "Créer dossier. -p (parents)", example: "mkdir -p a/b/c" },
  { command: "touch", description: "Créer fichier vide ou MàJ date", example: "touch f.txt" },
  { command: "cp", description: "Copier. -r (récursif pour dossiers)", example: "cp -r src dst" },
  { command: "mv", description: "Déplacer ou Renommer", example: "mv old new" },
  { command: "rm", description: "Supprimer. -r (dossier), -f (force)", example: "rm -rf dossier" },
  { command: "cat", description: "Afficher tout le contenu", example: "cat f.txt" },
  { command: "echo", description: "Afficher du texte. -e (interpréter \\n)", example: "echo -e 'Ligne1\\nLigne2'" },
  { command: "head", description: "Afficher le début (défaut 10 lignes)", example: "head -n 5 f.txt" },
  { command: "tail", description: "Afficher la fin (défaut 10 lignes)", example: "tail -n 5 f.txt" },
  { command: "grep", description: "Chercher un texte. -i (casse), -v (inverse)", example: "grep 'mot' f.txt" },
  { command: "wc", description: "Compter. -l (lignes)", example: "wc -l f.txt" },
  { command: "sort", description: "Trier. -n (numérique), -r (inverse)", example: "sort -n f.txt" },
  { command: "date", description: "Afficher la date et l'heure", example: "date" },
  { command: "id", description: "Voir mon identifiant et mes groupes", example: "id" },
  { command: "chmod", description: "Changer les permissions (u/g/o +/- r/w/x)", example: "chmod +x script.sh" },
  { command: "ps", description: "Lister les processus", example: "ps -ef" },
  { command: "kill", description: "Tuer un processus (PID)", example: "kill -9 1234" },
];