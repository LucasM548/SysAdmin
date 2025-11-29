import { Chapter, CommandRef, FileSystemNode } from './types';
import { DEFAULT_FS } from './utils/fileSystem';

// Helper to create a specific FS state for chapters if needed
const getChapter1FS = (): FileSystemNode => JSON.parse(JSON.stringify(DEFAULT_FS));

// Chapter 8 specific FS: Includes regex word lists and permission scenarios
const getChapter8FS = (): FileSystemNode => {
  const fs = JSON.parse(JSON.stringify(DEFAULT_FS));

  // Setup for Regex exercises (dico.txt based on DS Part 2)
  fs.children['home'].children['etudiant'].children['dico.txt'] = {
    type: 'file',
    name: 'dico.txt',
    permissions: '-rw-r--r--',
    owner: 'etudiant',
    content: [
      'table', 'tache', 'tg', 'th', 'tc', 'tcaaaaabz', 'tchoupy',
      'td1234ba', 'teaaaaayk', 'tfzzzztz', 'tg1234bk', 'tata',
      'abc', 'fin', 'tcaaaabk' // 'tcaaaabk' matches pattern ^t[c-h].{4}[by][^c-h]$
    ].join('\n')
  };

  // Setup for Permission logic (Deleting file in read-only dir - DS Part 5)
  fs.children['home'].children['etudiant'].children['Exam'] = {
    type: 'directory',
    name: 'Exam',
    permissions: 'dr-xr-xr-x', // User has NO Write right (cannot delete files inside)
    owner: 'etudiant',
    children: {
      'sujet.pdf': {
        type: 'file',
        name: 'sujet.pdf',
        permissions: '-rw-r--r--', // User has Write right on file (can edit content)
        owner: 'etudiant',
        content: 'Sujet confidentiel du 30 novembre 2021.'
      }
    }
  };

  // Setup for Globbing exercises (DS Part 1)
  fs.children['home'].children['etudiant'].children['Glob'] = {
    type: 'directory',
    name: 'Glob',
    permissions: 'drwxr-xr-x',
    owner: 'etudiant',
    children: {
      'a': { type: 'file', name: 'a', permissions: '-rw-r--r--', owner: 'etudiant', content: '' },
      'aa': { type: 'file', name: 'aa', permissions: '-rw-r--r--', owner: 'etudiant', content: '' },
      'aaa': { type: 'file', name: 'aaa', permissions: '-rw-r--r--', owner: 'etudiant', content: '' },
      'ab': { type: 'file', name: 'ab', permissions: '-rw-r--r--', owner: 'etudiant', content: '' },
      'ac': { type: 'file', name: 'ac', permissions: '-rw-r--r--', owner: 'etudiant', content: '' },
      'ba': { type: 'file', name: 'ba', permissions: '-rw-r--r--', owner: 'etudiant', content: '' }
    }
  };

  return fs;
};

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
        validationValue: 'regexCmd:^ls(\\s+.*)?$',
        completed: false
      },
      {
        id: "ex1_2",
        question: "Affichez tous les fichiers, y compris les fichiers cachés (commençant par .).",
        hint: "L'option -a est nécessaire : `ls -a`.",
        validationValue: 'regexCmd:^ls\\s+.*-a.*$',
        completed: false
      },
      {
        id: "ex1_3",
        question: "Allez à la racine du système directement.",
        hint: "La racine est représentée par le slash `/`.",
        validationValue: 'cwd:/',
        completed: false
      },
      {
        id: "ex1_4",
        question: "Retournez dans votre home en une seule commande.",
        hint: "Tapez juste `cd` ou `cd ~`.",
        validationValue: 'cwd:/home/etudiant',
        completed: false
      },
      {
        id: "ex1_5",
        question: "Listez les fichiers triés par taille décroissante (les plus gros en premier).",
        hint: "L'option majuscule -S permet de trier par taille : `ls -S`.",
        validationValue: 'regexCmd:^ls\\s+.*-S.*$',
        completed: false
      },
      {
        id: "ex1_6",
        question: "Affichez les fichiers triés par taille croissante (inverse).",
        hint: "Combinez le tri par taille (-S) et l'inversion (-r) : `ls -Sr`.",
        validationValue: 'regexCmd:^ls\\s+.*-S.*r.*$||regexCmd:^ls\\s+.*-r.*S.*$',
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
        validationValue: 'dir:/home/etudiant/Entreprise|file:/home/etudiant/Entreprise/compta99|file:/home/etudiant/Entreprise/compta00|file:/home/etudiant/Entreprise/fact00',
        completed: false
      },
      {
        id: "ex2_2",
        question: "Toujours dans `Entreprise`, créez le fichier `fact01`.",
        hint: "touch fact01 (assurez-vous d'être dans le dossier Entreprise)",
        validationValue: 'file:/home/etudiant/Entreprise/fact01|type:file',
        completed: false
      },
      {
        id: "ex2_3",
        question: "Remontez dans votre home et créez le dossier `TP11`.",
        hint: "cd ..; mkdir TP11 (ou cd ~; mkdir TP11)",
        validationValue: 'dir:/home/etudiant/TP11|type:directory',
        completed: false
      },
      {
        id: "ex2_4",
        question: "Copiez le fichier `fact00` (qui est dans Entreprise) vers le dossier `TP11` en utilisant un chemin absolu pour la source.",
        hint: "cp /home/etudiant/Entreprise/fact00 /home/etudiant/TP11/",
        validationValue: 'file:/home/etudiant/TP11/fact00|file:/home/etudiant/Entreprise/fact00',
        completed: false
      },
      {
        id: "ex2_4b",
        question: "Copiez `fact01` vers `TP11` en utilisant un chemin relatif.",
        hint: "Depuis le home : cp Entreprise/fact01 TP11/",
        validationValue: 'file:/home/etudiant/TP11/fact01',
        completed: false
      },
      {
        id: "ex2_4c",
        question: "Déplacez le fichier `compta99` dans le home, en utilisant des chemins relatifs.",
        hint: "mv Entreprise/compta99 .",
        validationValue: 'file:/home/etudiant/compta99|missing:/home/etudiant/Entreprise/compta99',
        completed: false
      },
      {
        id: "ex2_5",
        question: "Copiez le répertoire `TP11` vers un nouveau répertoire `cpTP11` dans `Entreprise`. Attention, c'est un dossier !",
        hint: "cp -r TP11 Entreprise/cpTP11 (N'oubliez pas le -r pour un dossier !)",
        validationValue: 'dir:/home/etudiant/Entreprise/cpTP11|type:directory',
        completed: false
      },
      {
        id: "ex2_6",
        question: "Supprimez le répertoire `TP11` et son contenu.",
        hint: "rm -r TP11",
        validationValue: 'missing:/home/etudiant/TP11',
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
        question: "Créez un fichier `telephone.txt` contenant ces données, avec chaque entrée sur une ligne séparée :\narthur 8316\ntoto 8321\ntiti 8623\nzoe 8520", hint: "echo -e 'arthur 8316\\ntoto 8321\\ntiti 8623\\nzoe 8520' > telephone.txt",
        validationValue: 'file:/home/etudiant/telephone.txt|content:regex:8316[\\s\\S]*toto',
        completed: false
      },
      {
        id: "ex3_2",
        question: "Affichez la liste triée par nom (alphabétique).",
        hint: "sort telephone.txt",
        validationValue: 'regexCmd:^sort\\s+telephone\\.txt$||regexCmd:cat.*telephone\\.txt.*sort',
        completed: false
      },
      {
        id: "ex3_3",
        question: "Affichez uniquement les lignes des personnes dont le numéro contient '83'.",
        hint: "grep '83' telephone.txt (ou cat telephone.txt | grep '83')",
        validationValue: 'regexCmd:grep.*83.*telephone\\.txt|output:arthur 8316||regexCmd:cat.*telephone\\.txt.*grep.*83|output:arthur 8316',
        completed: false
      },
      {
        id: "ex3_4",
        question: "Comptez combien de personnes sont dans la liste (nombre de lignes).",
        hint: "wc -l telephone.txt",
        validationValue: 'regexCmd:wc.*telephone\\.txt|output:4||regexCmd:cat.*telephone\\.txt.*wc.*-l|output:4',
        completed: false
      },
      {
        id: "ex3_5",
        question: "Le fichier `/proc/meminfo` contient des infos mémoire. Affichez les 5 premières lignes.",
        hint: "head -n 5 /proc/meminfo",
        validationValue: 'regexCmd:head.*\\/proc\\/meminfo|output:MemTotal',
        completed: false
      },
      {
        id: "ex3_6",
        question: "Cherchez combien de processeurs sont déclarés dans `/proc/cpuinfo` (comptez les lignes contenant 'processor').",
        hint: "grep 'processor' /proc/cpuinfo | wc -l",
        validationValue: 'regexCmd:grep.*processor.*\\/proc\\/cpuinfo.*|output:4',
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
        validationValue: 'file:/home/etudiant/file1.txt|type:file',
        completed: false
      },
      {
        id: "ex4_2",
        question: "Listez uniquement les fichiers se terminant par `.txt`.",
        hint: "ls *.txt",
        validationValue: 'regexCmd:^ls.*\\.txt$|output:file1.txt',
        completed: false
      },
      {
        id: "ex4_3",
        question: "Sauvegardez la liste des fichiers `.txt` dans un fichier nommé `liste.log`.",
        hint: "ls *.txt > liste.log",
        validationValue: 'file:/home/etudiant/liste.log|type:file',
        completed: false
      },
      {
        id: "ex4_4",
        question: "Ajoutez la date actuelle à la fin du fichier `liste.log`.",
        hint: "date >> liste.log",
        validationValue: 'regexCmd:^date\\s+>>\\s+liste\\.log$',
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
        validationValue: 'regexCmd:^id$',
        completed: false
      },
      {
        id: "ex5_2",
        question: "Créez un dossier `Secret` et regardez ses droits par défaut.",
        hint: "mkdir Secret; ls -ld Secret",
        validationValue: 'dir:/home/etudiant/Secret|type:directory',
        completed: false
      },
      {
        id: "ex5_3",
        question: "Enlevez le droit d'écriture sur `Secret` pour tout le monde (y compris vous).",
        hint: "chmod -w Secret (ou chmod 555 Secret)",
        validationValue: 'file:/home/etudiant/Secret|perms:dr-xr-xr-x',
        completed: false
      },
      {
        id: "ex5_4",
        question: "Essayez maintenant de créer un fichier dans `Secret` (Test d'interdiction).",
        hint: "touch Secret/test.txt (Cela devrait échouer !)",
        validationValue: 'regexCmd:^touch\\s+Secret\\/test\\.txt$|output:Permission non accordée',
        completed: false
      },
      {
        id: "ex5_5",
        question: "Redonnez-vous le droit d'écriture sur `Secret`.",
        hint: "chmod u+w Secret (ou chmod 755 Secret)",
        validationValue: 'file:/home/etudiant/Secret|perms:drwxr-xr-x',
        completed: false
      },
      {
        id: "ex5_6",
        question: "Utilisez l'option récursive pour donner tous les droits (777) à `Secret` et son contenu.",
        hint: "chmod -R 777 Secret",
        validationValue: 'file:/home/etudiant/Secret|perms:drwxrwxrwx',
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
          "1ère ligne : `#!/bin/bash` (Shebang - indique l'interpréteur).",
          "Rendre exécutable : `chmod +x script.sh`.",
          "Exécuter : `./script.sh` ou `bash script.sh`.",
          "Un script = automatisation de commandes."
        ],
        code: "#!/bin/bash\necho \"Mon premier script\""
      },
      {
        title: "Variables & FOR",
        content: [
          "`VAR='valeur'` : Définir (AUCUN espace autour du =).",
          "`echo $VAR` ou `${VAR}` : Utiliser.",
          "`for VAR in LISTE; do CMD; done` : Boucle.",
          "Listes : `1 2 3`, `$(seq 1 10)`, `*.txt`"
        ],
        code: "for i in 1 2 3; do\n  echo \"Nombre: $i\"\ndone"
      },
      {
        title: "Paramètres",
        content: [
          "`$0` : Nom du script.",
          "`$1, $2, $3...` : Arguments 1, 2, 3.",
          "`$#` : Nombre d'arguments.",
          "`$?` : Code retour (0=succès).",
          "`exit N` : Quitter avec code N."
        ],
        code: "if [ $# -ne 1 ]; then\n  echo \"Usage: $0 arg\"\n  exit 1\nfi"
      },
      {
        title: "IF & Tests [ ]",
        content: [
          "`if [ COND ]; then CMD; fi`",
          "`if [ C ]; then CMD1; else CMD2; fi`",
          "Numériques : `-eq`, `-ne`, `-lt`, `-le`, `-gt`, `-ge`",
          "Chaînes : `=`, `!=`, `-z` (vide), `-n` (non-vide)",
          "Fichiers : `-f` (existe), `-d` (dossier)"
        ],
        code: "if [ $# -eq 0 ]; then\n  echo \"Aucun arg\"\nfi"
      },
      {
        title: "Tests [[ ]] & Regex",
        content: [
          "`[[ CONDITION ]]` : Version avancée.",
          "`[[ $var =~ REGEX ]]` : Test regex.",
          "Exemple: `[[ $1 =~ ^[0-9]+$ ]]` pour nombre.",
          "`&&` (ET), `||` (OU) utilisables dedans."
        ],
        code: "if [[ $1 =~ ^[0-9]+$ ]]; then\n  echo \"Nombre\"\nfi"
      },
      {
        title: "WHILE",
        content: [
          "`while [ COND ]; do CMD; done`",
          "`while true; do ... done` : Infinie.",
          "`break` : Sortir. `continue` : Suivant.",
          "Utile pour surveillance, répétitions."
        ],
        code: "i=0\nwhile [ $i -lt 5 ]; do\n  echo $i\n  i=$((i+1))\ndone"
      },
      {
        title: "FOR Arithmétique",
        content: [
          "`for ((INIT; COND; INCR)); do CMD; done`",
          "Exemple: `for ((i=0; i<10; i++))`",
          "Opérateurs: `++`, `--`, `+=`, `-=`",
          "Style C, très utile pour compteurs."
        ],
        code: "for ((i=1; i<=5; i++)); do\n  echo $i\ndone"
      },
      {
        title: "Arithmétique",
        content: [
          "`$((EXPR))` : Évalue expression.",
          "Exemples: `sum=$((a+b))`, `n=$((n*2))`",
          "Opérateurs: `+`, `-`, `*`, `/`, `%`, `**`",
          "`((VAR++))` équivaut à `VAR=$((VAR+1))`"
        ],
        code: "n=5\nfact=1\nfor ((i=1; i<=n; i++)); do\n  fact=$((fact*i))\ndone"
      },
      {
        title: "CASE",
        content: [
          "`case $VAR in PAT) CMD ;; esac`",
          "Patterns: `val)`, `v1|v2)` (OU), `*)` (défaut)",
          "Terminer par `;;`",
          "Utile: menus, validation multi-choix."
        ],
        code: "case $1 in\n  start) echo \"GO\" ;;\n  *) echo \"?\" ;;\nesac"
      },
      {
        title: "READ (Lecture)",
        content: [
          "`read VAR` : Lit entrée dans VAR.",
          "`read -p \"Prompt: \" VAR` : Avec prompt.",
          "`read -s VAR` : Silencieux (mot de passe).",
          "Scripts interactifs, confirmations."
        ],
        code: "read -p \"Nom: \" nom\necho \"Bonjour $nom\""
      },
      {
        title: "Outils Texte",
        content: [
          "`grep -w MOT` : Mot entier.",
          "`awk '{print $1}'` : Colonne 1.",
          "`cut -d':' -f2` : Champ 2.",
          "`tr -s ' '` : Compresse espaces.",
          "`sort -n` : Tri numérique."
        ],
        code: "grep pattern file | cut -d':' -f2"
      },
      {
        title: "Redirections",
        content: [
          "`CMD &> /dev/null` : Ignore tout.",
          "`CMD 2>&1` : stderr vers stdout.",
          "`CMD; if [ $? -eq 0 ]` : Test retour.",
          "`|| true` : Ignore erreurs."
        ],
        code: "grep x f &> /dev/null\nif [ $? -eq 0 ]; then\n  echo \"OK\"\nfi"
      }
    ],
    exercises: [
      {
        id: "ex6_1",
        question: "Créez un script `hello.sh` qui affiche 'Bonjour!' à l'écran. N'oubliez pas le shebang en première ligne.",
        hint: "#!/bin/bash\necho 'Bonjour!'",
        validationValue: 'file:/home/etudiant/hello.sh|content:regex:^#!/bin/bash',
        completed: false
      },
      {
        id: "ex6_2",
        question: "Créez `variables.sh` qui définit une variable NOM avec la valeur 'Linux' et affiche 'Salut' suivi de cette variable.",
        hint: "#!/bin/bash\nNOM='Linux'\necho \"Salut $NOM\"",
        validationValue: 'file:/home/etudiant/variables.sh|content:regex:NOM=',
        completed: false
      },
      {
        id: "ex6_3",
        question: "Créez `loop.sh` qui utilise une boucle for pour afficher les nombres de 1 à 5 (un par ligne).",
        hint: "#!/bin/bash\nfor i in 1 2 3 4 5; do\n  echo $i\ndone",
        validationValue: 'file:/home/etudiant/loop.sh|content:regex:for\\s+i\\s+in',
        completed: false
      },
      {
        id: "ex6_4",
        question: "Créez `check_arg.sh` qui vérifie que exactement un argument est passé. Si ce n'est pas le cas, affichez un message d'usage et quittez avec exit 1.",
        hint: "#!/bin/bash\nif [ $# -ne 1 ]; then\n  echo \"Usage: $0 arg\"\n  exit 1\nfi\necho \"Arg: $1\"",
        validationValue: 'file:/home/etudiant/check_arg.sh|content:regex:\\$#\\s+-ne\\s+1',
        completed: false
      },
      {
        id: "ex6_5",
        question: "Créez `test_num.sh` qui teste si le premier argument est un nombre entier. Utilisez une regex pour vérifier. Affichez 'Nombre' ou 'Pas nombre'.",
        hint: "#!/bin/bash\nif [[ $1 =~ ^[0-9]+$ ]]; then\n  echo \"Nombre\"\nelse\n  echo \"Pas nombre\"\nfi",
        validationValue: 'file:/home/etudiant/test_num.sh|content:regex:=~\\s*\\^\\[0-9\\]\\+\\$',
        completed: false
      },
      {
        id: "ex6_6",
        question: "Créez `while_count.sh` qui utilise une boucle while pour compter de 0 à 4. Initialisez i à 0 et incrémentez avec une expression arithmétique.",
        hint: "#!/bin/bash\ni=0\nwhile [ $i -lt 5 ]; do\n  echo $i\n  i=$((i+1))\ndone",
        validationValue: 'file:/home/etudiant/while_count.sh|content:regex:while\\s*\\[',
        completed: false
      },
      {
        id: "ex6_7",
        question: "Créez `for_arith.sh` qui utilise une boucle for arithmétique (style C) pour afficher les nombres de 1 à 10.",
        hint: "#!/bin/bash\nfor ((i=1; i<=10; i++)); do\n  echo $i\ndone",
        validationValue: 'file:/home/etudiant/for_arith.sh|content:regex:for\\s*\\(\\(',
        completed: false
      },
      {
        id: "ex6_8",
        question: "Créez `facto.sh` qui calcule la factorielle du premier argument. Utilisez une boucle for arithmétique et une multiplication avec $((...)). Affichez le résultat au format 'N! = résultat'.",
        hint: "#!/bin/bash\nn=$1\nfact=1\nfor ((i=1; i<=n; i++)); do\n  fact=$((fact*i))\ndone\necho \"$n! = $fact\"",
        validationValue: 'file:/home/etudiant/facto.sh|content:regex:fact=\\$\\(\\(fact',
        completed: false
      },
      {
        id: "ex6_9",
        question: "Créez `menu.sh` qui utilise une structure case pour gérer 3 cas : 'start' affiche GO, 'stop' affiche STOP, et tout autre cas affiche un point d'interrogation.",
        hint: "#!/bin/bash\ncase $1 in\n  start) echo \"GO\" ;;\n  stop) echo \"STOP\" ;;\n  *) echo \"?\" ;;\nesac",
        validationValue: 'file:/home/etudiant/menu.sh|content:regex:case\\s+\\$1\\s+in',
        completed: false
      },
      {
        id: "ex6_10",
        question: "Créez `ask.sh` qui demande le nom de l'utilisateur avec un prompt 'Nom: ', puis affiche 'Bonjour' suivi du nom saisi.",
        hint: "#!/bin/bash\nread -p \"Nom: \" nom\necho \"Bonjour $nom!\"",
        validationValue: 'file:/home/etudiant/ask.sh|content:regex:read\\s+-p',
        completed: false
      },
      {
        id: "ex6_11",
        question: "Créez `sum.sh` qui demande deux nombres à l'utilisateur (avec read), calcule leur somme avec une expression arithmétique, et affiche le résultat.",
        hint: "#!/bin/bash\nread -p \"a: \" a\nread -p \"b: \" b\nsum=$((a+b))\necho \"$sum\"",
        validationValue: 'file:/home/etudiant/sum.sh|content:regex:sum=\\$\\(\\(a\\+b\\)\\)',
        completed: false
      },
      {
        id: "ex6_12",
        question: "Créez `check_file.sh` qui teste si le fichier passé en argument existe. Affichez 'Existe' si le fichier existe, 'Non' sinon.",
        hint: "#!/bin/bash\nif [ -f \"$1\" ]; then\n  echo \"Existe\"\nelse\n  echo \"Non\"\nfi",
        validationValue: 'file:/home/etudiant/check_file.sh|content:regex:-f',
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
        validationValue: 'regexCmd:^ps(\\s+.*)?$',
        completed: false
      },
      {
        id: "ex7_2",
        question: "Simulez l'arrêt du processus avec le PID 1234.",
        hint: "kill 1234",
        validationValue: 'regexCmd:^kill\\s+1234$',
        completed: false
      },
      {
        id: "ex7_3",
        question: "Forcez l'arrêt brutal du processus 5678.",
        hint: "kill -9 5678",
        validationValue: 'regexCmd:^kill\\s+-9\\s+5678$',
        completed: false
      }
    ]
  },
  {
    id: "chap8",
    title: "Chapitre 8 : Préparation Examen (DS)",
    description: "Révision intensive basée sur les annales : Regex complexes, Globbing, Scripting avancé et Permissions.",
    initialFileSystem: getChapter8FS(),
    lessons: [
      {
        title: "Globbing Avancé (Partie 1)",
        content: [
          "`*` : Remplace n'importe quelle suite de caractères.",
          "`?` : Remplace exactement un caractère.",
          "Attention avec `echo` : le shell remplace les jokers *avant* d'exécuter la commande. `echo ls *` affiche littéralement 'ls' suivi des fichiers.",
          "Exercice : `echo ??` affiche tous les fichiers de exactement 2 lettres."
        ],
        code: "ls ??\necho *[0-9]*"
      },
      {
        title: "Subtilité de l'Expressions Régulières Étendues (ERE)",
        content: [
          "`.` : Remplace n'importe quel caractère.",
          "`?` : Rend l'élément qui le précède optionnel"
        ],
        code: "grep -E \"colou?r\" fichier.txt //correspond à color et colour \ngrep -E \"a.c\" fichier.txt //correspond à abc, axc, a3c"
      },
      {
        title: "Expressions Régulières (Partie 2)",
        content: [
          "Utilisées avec `grep -E` (Extended).",
          "`^` (début de ligne), `$` (fin de ligne), `.` (n'importe quel caractère).",
          "`[abc]` (a, b ou c), `[^abc]` (tout sauf a, b, c).",
          "`{n}` (exactement n fois).",
          "Exemple DS : `^t[c-h].{4}[by][^c-h]$` (Commence par t, 2e lettre c-h, 4 chars, avant-dernier b/y, dernier sauf c-h)."
        ],
        code: "grep -E \"^t[c-h]\" fichier"
      },
      {
        title: "Scripting : Shift & Args (Partie 4)",
        content: [
          "`$#` : Nombre d'arguments passés au script.",
          "`shift` : Décale les arguments vers la gauche ($2 devient $1). Indispensable pour traiter une liste indéfinie d'arguments.",
          "`exit 1` : Quitte le script avec un code d'erreur.",
          "Structure type : Vérification `$#`, initialisation, boucle `for` ou `while` avec `shift`."
        ],
        code: "while [ $# -gt 0 ]; do\n  echo \"Traitement: $1\"\n  shift\ndone"
      },
      {
        title: "Permissions : Piège de la Suppression (Partie 5)",
        content: [
          "Règle d'or : Pour SUPPRIMER un fichier, il faut avoir le droit d'écriture (`w`) sur le DOSSIER PARENT.",
          "Les droits sur le fichier lui-même (même `r--`) n'empêchent pas sa suppression si on contrôle le dossier.",
          "Inversement, si le dossier est en lecture seule (`r-x`), impossible de supprimer un fichier dedans, même si on est propriétaire."
        ]
      }
    ],
    exercises: [
      {
        id: "ex8_1",
        question: "Listez les fichiers du dossier `Glob` qui ont exactement 2 caractères.",
        hint: "Vous pouvez aller dans le dossier (`cd Glob`) puis faire `ls ??` ou utiliser un chemin relatif (`ls Glob/??`).",
        validationValue: 'regexCmd:^ls.*|output:aa',
        completed: false
      },
      {
        id: "ex8_2",
        question: "Dans `dico.txt`, utilisez grep pour trouver le mot qui correspond au motif du DS : commence par t, 2e lettre entre c et h, suivi de 4 caractères, avant-dernier b ou y, dernier caractère PAS entre c et h.",
        hint: "grep -E \"^t[c-h].{4}[by][^c-h]$\" dico.txt",
        validationValue: 'regexCmd:^grep.*dico\\.txt|output:tcaaaabk',
        completed: false
      },
      {
        id: "ex8_3",
        question: "Créez le script `somprod.sh`. Il doit vérifier qu'il y a au moins 3 arguments (`$#`). Si ce n'est pas le cas, affichez une erreur et quittez. (Utilisez l'onglet LABO).",
        hint: "#!/bin/bash\nif [ $# -lt 3 ]; then\n  echo \"Usage: somprod.sh op arg1 arg2...\"\n  exit 1\nfi",
        validationValue: 'file:/home/etudiant/somprod.sh|content:regex:\\$#\\s+-lt\\s+3',
        completed: false
      },
      {
        id: "ex8_4",
        question: "Allez dans le dossier `Exam`. Tentez de supprimer le fichier `sujet.pdf`. Cela doit échouer car le dossier est protégé en écriture.",
        hint: "cd Exam; rm sujet.pdf",
        validationValue: 'regexCmd:^rm.*sujet\\.pdf|output:Permission non accordée',
        completed: false
      },
      {
        id: "ex8_5",
        question: "Corrigez les droits du dossier `Exam` pour vous donner le droit d'écriture, puis supprimez le fichier `sujet.pdf`.",
        hint: "chmod u+w .; rm sujet.pdf",
        validationValue: 'missing:/home/etudiant/Exam/sujet.pdf',
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
  { command: "grep", description: "Chercher un texte. -i (casse), -v (inverse), -E (étendu)", example: "grep -E '^a.*z$' f.txt" },
  { command: "wc", description: "Compter. -l (lignes)", example: "wc -l f.txt" },
  { command: "sort", description: "Trier. -n (numérique), -r (inverse)", example: "sort -n f.txt" },
  { command: "date", description: "Afficher la date et l'heure", example: "date" },
  { command: "id", description: "Voir mon identifiant et mes groupes", example: "id" },
  { command: "chmod", description: "Changer les permissions (u/g/o +/- r/w/x)", example: "chmod +x script.sh" },
  { command: "ps", description: "Lister les processus", example: "ps -ef" },
  { command: "kill", description: "Tuer un processus (PID)", example: "kill -9 1234" },
  { command: "shift", description: "Décaler les arguments d'un script", example: "shift" },
  { command: "exit", description: "Quitter le script (avec code erreur)", example: "exit 1" },
];