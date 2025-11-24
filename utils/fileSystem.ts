import { FileSystemNode, TerminalOutput } from '../types';

// Helper to generate unique IDs
const uid = () => Math.random().toString(36).substring(2, 9);

export const DEFAULT_FS: FileSystemNode = {
  type: 'directory',
  name: 'root',
  permissions: 'drwxr-xr-x',
  owner: 'root',
  children: {
    'home': {
      type: 'directory',
      name: 'home',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      children: {
        'etudiant': {
          type: 'directory',
          name: 'etudiant',
          permissions: 'drwxr-xr-x',
          owner: 'etudiant',
          children: {
            'Documents': {
              type: 'directory',
              name: 'Documents',
              permissions: 'drwxr-xr-x',
              owner: 'etudiant',
              children: {}
            },
            '.bashrc': {
              type: 'file',
              name: '.bashrc',
              permissions: '-rw-r--r--',
              owner: 'etudiant',
              content: '# .bashrc configuration'
            },
            'notes.txt': {
              type: 'file',
              name: 'notes.txt',
              permissions: '-rw-r--r--',
              owner: 'etudiant',
              content: 'Bienvenue dans le cours R1.04\nSystème d\'Exploitation\nLinux est puissant\nIl faut pratiquer'
            },
            'todo.list': {
              type: 'file',
              name: 'todo.list',
              permissions: '-rw-r--r--',
              owner: 'etudiant',
              content: '1. Apprendre Linux\n2. Maîtriser le Terminal\n3. Dormir'
            }
          }
        }
      }
    },
    'bin': { type: 'directory', name: 'bin', permissions: 'drwxr-xr-x', owner: 'root', children: {} },
    'etc': { 
        type: 'directory', 
        name: 'etc', 
        permissions: 'drwxr-xr-x', 
        owner: 'root', 
        children: {
            'passwd': { type: 'file', name: 'passwd', permissions: '-rw-r--r--', owner: 'root', content: 'root:x:0:0:root:/root:/bin/bash\netudiant:x:1000:1000:Etudiant,,,:/home/etudiant:/bin/bash' }
        } 
    },
    'proc': {
        type: 'directory',
        name: 'proc',
        permissions: 'dr-xr-xr-x',
        owner: 'root',
        children: {
            'cpuinfo': {
                type: 'file',
                name: 'cpuinfo',
                permissions: '-r--r--r--',
                owner: 'root',
                content: 'processor\t: 0\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz\n\nprocessor\t: 1\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz\n\nprocessor\t: 2\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz\n\nprocessor\t: 3\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz'
            },
            'meminfo': {
                type: 'file',
                name: 'meminfo',
                permissions: '-r--r--r--',
                owner: 'root',
                content: 'MemTotal:       16306560 kB\nMemFree:         3245680 kB\nMemAvailable:   10234560 kB\nBuffers:          456120 kB\nCached:          5678900 kB'
            }
        }
    },
    'tmp': { type: 'directory', name: 'tmp', permissions: 'drwxrwxrwt', owner: 'root', children: {} }
  }
};

// Traverse path to get node
export const getNode = (root: FileSystemNode, path: string): FileSystemNode | null => {
  if (path === '/') return root;
  
  const parts = path.split('/').filter(p => p !== '');
  let current = root;
  
  for (const part of parts) {
    if (current.type !== 'directory' || !current.children || !current.children[part]) {
      return null;
    }
    current = current.children[part];
  }
  return current;
};

// Resolve path (handle ., .., and relative paths)
export const resolvePath = (cwd: string, target: string): string => {
  if (!target) return cwd;
  if (target.startsWith('/')) return target; // Absolute
  if (target === '~') return '/home/etudiant';
  
  const parts = cwd.split('/').filter(p => p !== '');
  const targetParts = target.split('/');

  for (const part of targetParts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      parts.pop();
    } else if (part === '~') {
        return '/home/etudiant';
    } else {
      parts.push(part);
    }
  }
  
  return '/' + parts.join('/');
};

// Helper: Check if a file is executable
const isExecutable = (permissions: string): boolean => {
    return permissions.includes('x');
};

// Helper: Check if user has write permission on a node
// Currently simulation assumes user is 'etudiant'
const canWrite = (node: FileSystemNode, user: string = 'etudiant'): boolean => {
    // Root bypass? No, we simulate permission denied for non-root users
    if (user === 'root') return true;

    // Check if 777 or rwx for all
    // drwxrwxrwx -> indices 2, 5, 8 are w.
    // permissions string format: [type][u_r][u_w][u_x][g_r][g_w][g_x][o_r][o_w][o_x]
    
    // Owner check
    if (node.owner === user) {
        return node.permissions[2] === 'w';
    }

    // Group check (Simplified: assume single group 'etudiant' matches owner)
    // If owner matches 'etudiant', it falls in above case.
    // If owner != etudiant, we might check 'others' or 'group' if we simulated groups better.
    // For now, assume etudiant is in 'others' category for root files.
    
    // Others check (index 8 is other write)
    if (node.permissions[8] === 'w') return true;

    return false;
};

// Helper: Variable substitution
const substituteVariables = (text: string, variables: Record<string, string>): string => {
    let result = text;
    for (const [key, val] of Object.entries(variables)) {
        // Replace $VAR
        result = result.replace(new RegExp(`\\$${key}`, 'g'), val);
        // Replace ${VAR}
        result = result.replace(new RegExp(`\\$\{${key}\}`, 'g'), val);
    }
    return result;
};

// Helper: Clone FS
const getClonedFs = (root: FileSystemNode) => JSON.parse(JSON.stringify(root));

// Helper: Get Parent and Name
const getParentAndName = (path: string, root: FileSystemNode): [FileSystemNode | null, string] => {
    const parts = path.split('/').filter(p => p !== '');
    const name = parts.pop();
    const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
    const parent = getNode(root, parentPath);
    return [parent, name || ''];
};

// Helper: Check if a param string contains a specific flag (e.g. "-la" contains "l" and "a")
const hasFlag = (params: string[], flagChar: string): boolean => {
    return params.some(p => p.startsWith('-') && p.includes(flagChar));
};

// Helper: Expand Glob Pattern
const expandGlob = (arg: string, cwd: string, root: FileSystemNode): string[] => {
    if (!arg.includes('*')) return [arg];
    
    // Resolve absolute path to the directory containing the glob
    const fullPathWithPattern = resolvePath(cwd, arg);
    const lastSlash = fullPathWithPattern.lastIndexOf('/');
    const dirPath = fullPathWithPattern.substring(0, lastSlash) || '/';
    const pattern = fullPathWithPattern.substring(lastSlash + 1);
    
    const dirNode = getNode(root, dirPath);
    if (!dirNode || dirNode.type !== 'directory' || !dirNode.children) {
        return [arg]; // Return literal if parent not found
    }
    
    // Regex for the pattern (escape dot, convert * to .*)
    const regex = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
    
    const matches = Object.keys(dirNode.children).filter(name => regex.test(name));
    
    if (matches.length === 0) return [arg];
    
    // Reconstruct path prefix
    const prefixIndex = arg.lastIndexOf('/');
    const prefix = prefixIndex !== -1 ? arg.substring(0, prefixIndex + 1) : '';
    
    return matches.sort().map(m => prefix + m);
};

// NEW: Save file directly
export const saveFile = (
  filepath: string,
  content: string,
  cwd: string,
  root: FileSystemNode,
  setFs: (newFs: FileSystemNode) => void,
  permissions?: string
): boolean => {
  const newFs = getClonedFs(root);
  const targetPath = resolvePath(cwd, filepath);
  const [parentNode, filename] = getParentAndName(targetPath, newFs);

  if (!parentNode || parentNode.type !== 'directory' || !filename) {
    return false;
  }

  // Permission check for saving
  if (!canWrite(parentNode)) {
      return false;
  }

  if (!parentNode.children) {
      parentNode.children = {};
  }

  // Update or Create file
  if (parentNode.children[filename]) {
      if (parentNode.children[filename].type === 'directory') return false;
      // Also check write permission on file itself if it exists
      if (!canWrite(parentNode.children[filename])) return false;
      
      parentNode.children[filename].content = content;
      if (permissions) {
          parentNode.children[filename].permissions = permissions;
      }
  } else {
      parentNode.children[filename] = {
          type: 'file',
          name: filename,
          permissions: permissions || '-rw-r--r--',
          owner: 'etudiant',
          content: content
      };
  }

  setFs(newFs);
  return true;
};

// Internal execution logic used by both executeCommand and recursive calls
const runSingleCommand = (
    cmd: string,
    params: string[],
    cwd: string,
    currentFs: FileSystemNode,
    setFs: (newFs: FileSystemNode) => void,
    inputString: string | null,
    isPiped: boolean = false
): TerminalOutput => {
    
    // --- Helper for text processing commands that take File OR Stdin ---
    const getTextContent = (fileParam: string | undefined): string | null => {
        if (fileParam) {
            const targetPath = resolvePath(cwd, fileParam);
            const node = getNode(currentFs, targetPath);
            if (!node || node.type !== 'file') return null; // Error handled by caller check
            return node.content || '';
        }
        return inputString;
    };

    switch (cmd) {
        case 'ls': {
            const showDetails = hasFlag(params, 'l');
            const showAll = hasFlag(params, 'a');
            const reverse = hasFlag(params, 'r');
            // We allow t and S flags to prevent errors, even if sim logic is basic
            const sortByTime = hasFlag(params, 't');
            const sortBySize = hasFlag(params, 'S');

            const pathArgs = params.filter(p => !p.startsWith('-'));
            
            // Helper to process one directory/file
            const getListing = (path: string, isArgument: boolean): string[] | string => {
                const targetPath = resolvePath(cwd, path);
                const node = getNode(currentFs, targetPath);
                
                if (!node) return `ls: impossible d'accéder à '${path}': Aucun fichier ou dossier de ce type`;
                
                if (node.type === 'file') {
                    if (showDetails) {
                        const size = node.content?.length || 0;
                        const perms = node.permissions;
                        return `${perms} 1 ${node.owner} ${node.owner} ${size.toString().padStart(5)} Jun 14 12:00 ${node.name}`;
                    }
                    return node.name;
                }
                
                // Directory
                if (node.children) {
                    let files = Object.keys(node.children);
                    
                    if (!showAll) {
                        files = files.filter(name => !name.startsWith('.'));
                    } else {
                        files = ['.', '..', ...files];
                    }
                    
                    // Simple Sort Logic
                    files.sort(); // default alpha
                    
                    if (sortBySize) {
                        files.sort((a, b) => {
                           // Mock size: Dir = 4096, File = content.length
                           const getNodeSize = (n: string) => {
                               if (n === '.' || n === '..') return 4096;
                               const child = node.children![n];
                               return child.type === 'directory' ? 4096 : (child.content?.length || 0);
                           };
                           return getNodeSize(b) - getNodeSize(a); // Descending
                        });
                    }
                    // Time sort is mocked to be same order or reverse of alpha in this basic sim

                    if (reverse) {
                        files.reverse();
                    }

                    if (showDetails) {
                        const lines = files.map(name => {
                            if (name === '.' || name === '..') return `drwxr-xr-x 1 etudiant etudiant 4096 Jun 14 12:00 ${name}`;
                            const child = node.children![name];
                            const size = child.type === 'directory' ? 4096 : (child.content?.length || 0);
                            const typeChar = child.type === 'directory' ? 'd' : '-';
                            const perms = child.permissions.startsWith(typeChar) ? child.permissions : typeChar + child.permissions.substring(1);
                            return `${perms} 1 ${child.owner} ${child.owner} ${size.toString().padStart(5)} Jun 14 12:00 ${name}`;
                        });
                        return (isArgument ? `${path}:\n` : '') + lines.join('\n');
                    }
                    // Handle piped output by using newlines instead of spaces
                    const separator = isPiped ? '\n' : '  ';
                    return (isArgument ? `${path}:\n` : '') + files.join(separator);
                }
                return '';
            };

            if (pathArgs.length === 0) {
                const output = getListing('', false);
                return { id: uid(), type: 'output', content: Array.isArray(output) ? output.join('\n') : output };
            }

            const results: string[] = [];
            for (const pathArg of pathArgs) {
                const output = getListing(pathArg, pathArgs.length > 1);
                results.push(Array.isArray(output) ? output.join('\n') : output);
            }
            
            return { id: uid(), type: 'output', content: results.join('\n\n') };
        }

        case 'pwd':
            return { id: uid(), type: 'output', content: cwd };

        case 'cd': {
            let targetParam = params[0];
            // Handle 'cd' alone -> cd ~
            if (!targetParam) targetParam = '~';
            // Handle 'cd -' (mocked to home/previous toggle logic)
            if (targetParam === '-') targetParam = '~'; // Simplified for this sim

            const targetPath = resolvePath(cwd, targetParam);
            const node = getNode(currentFs, targetPath);
            
            if (!node || node.type !== 'directory') {
                return { id: uid(), type: 'error', content: `cd: ${targetParam}: Aucun fichier ou dossier de ce type` };
            }
            return { id: uid(), type: 'success', content: '', cwd: targetPath };
        }

        case 'mkdir': {
            const createParents = hasFlag(params, 'p');
            const pathArgs = params.filter(p => !p.startsWith('-'));
            if (pathArgs.length === 0) return { id: uid(), type: 'error', content: 'mkdir: opérande manquant' };

            let lastError: TerminalOutput | null = null;

            for (const pathArg of pathArgs) {
                const targetPath = resolvePath(cwd, pathArg);
                
                if (createParents) {
                    const parts = targetPath.split('/').filter(p => p !== '');
                    let current = currentFs;
                    
                    for (let i = 0; i < parts.length; i++) {
                        const part = parts[i];
                        if (!current.children) current.children = {};
                        
                        if (!current.children[part]) {
                            // Permission check: Need write on current folder to create child
                            if (!canWrite(current)) {
                                lastError = { id: uid(), type: 'error', content: `mkdir: impossible de créer le répertoire '${pathArg}': Permission non accordée` };
                                break;
                            }

                            current.children[part] = {
                                type: 'directory',
                                name: part,
                                permissions: 'drwxr-xr-x',
                                owner: 'etudiant',
                                children: {}
                            };
                        }
                        
                        current = current.children[part];
                        if (current.type !== 'directory') {
                            lastError = { id: uid(), type: 'error', content: `mkdir: impossible de créer le répertoire '${pathArg}': '${part}' est un fichier` };
                            break;
                        }
                    }
                } else {
                    const [parent, name] = getParentAndName(targetPath, currentFs);

                    if (!parent || parent.type !== 'directory') {
                        lastError = { id: uid(), type: 'error', content: `mkdir: impossible de créer le répertoire '${pathArg}': Aucun fichier ou dossier de ce type` };
                        continue;
                    }
                    if (parent.children && parent.children[name]) {
                        lastError = { id: uid(), type: 'error', content: `mkdir: impossible de créer le répertoire '${pathArg}': Le fichier existe` };
                        continue;
                    }

                    // Permission check
                    if (!canWrite(parent)) {
                        lastError = { id: uid(), type: 'error', content: `mkdir: impossible de créer le répertoire '${pathArg}': Permission non accordée` };
                        continue;
                    }

                    if (parent.children) {
                        parent.children[name] = {
                            type: 'directory',
                            name: name,
                            permissions: 'drwxr-xr-x',
                            owner: 'etudiant',
                            children: {}
                        };
                    }
                }
            }
            
            if (lastError) return lastError;
            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'touch': {
            const files = params.filter(p => !p.startsWith('-'));
            if (files.length === 0) return { id: uid(), type: 'error', content: 'touch: opérande manquant' };

            for (const file of files) {
                const targetPath = resolvePath(cwd, file);
                const [parent, name] = getParentAndName(targetPath, currentFs);

                if (!parent || parent.type !== 'directory') {
                    return { id: uid(), type: 'error', content: `touch: impossible de faire un touch '${file}': Aucun fichier ou dossier de ce type` };
                }
                
                // Permission Check
                // 1. If file doesn't exist, we need Write on parent
                if (!parent.children || !parent.children[name]) {
                    if (!canWrite(parent)) {
                         return { id: uid(), type: 'error', content: `touch: impossible de faire un touch '${file}': Permission non accordée` };
                    }
                    
                    parent.children[name] = {
                        type: 'file',
                        name: name,
                        permissions: '-rw-r--r--',
                        owner: 'etudiant',
                        content: ''
                    };
                } else {
                    // 2. If file exists, check write permission
                    const existing = parent.children[name];
                    if (!canWrite(existing)) {
                         return { id: uid(), type: 'error', content: `touch: impossible de faire un touch '${file}': Permission non accordée` };
                    }
                }
            }
            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'cp': {
            const recursive = hasFlag(params, 'r') || hasFlag(params, 'R');
            const fileParams = params.filter(p => !p.startsWith('-'));
            if (fileParams.length < 2) return { id: uid(), type: 'error', content: 'cp: opérande manquant' };
            
            // Last arg is destination
            const destParam = fileParams[fileParams.length - 1];
            const sources = fileParams.slice(0, fileParams.length - 1);
            
            const destPath = resolvePath(cwd, destParam);
            const [destParent, destName] = getParentAndName(destPath, currentFs);
            const destNode = getNode(currentFs, destPath);

            // If multiple sources, dest MUST be a directory
            if (sources.length > 1 && (!destNode || destNode.type !== 'directory')) {
                return { id: uid(), type: 'error', content: `cp: la cible '${destParam}' n'est pas un répertoire` };
            }

            for (const source of sources) {
                 const srcPath = resolvePath(cwd, source);
                 const srcNode = getNode(currentFs, srcPath);
                 if (!srcNode) return { id: uid(), type: 'error', content: `cp: impossible d'évaluer '${source}': Aucun fichier ou dossier de ce type` };
                 
                 // Read permission on source needed
                 // (Simulated - often requires 'r' bit)

                 if (srcNode.type === 'directory' && !recursive) {
                    return { id: uid(), type: 'error', content: `cp: -r non spécifié ; omission du répertoire '${source}'` };
                 }

                 // Copy logic
                 if (destNode && destNode.type === 'directory') {
                     // Write permission on dest dir needed
                     if (!canWrite(destNode)) {
                         return { id: uid(), type: 'error', content: `cp: impossible de créer le fichier '${destParam}/${srcNode.name}': Permission non accordée` };
                     }

                     if (destNode.children) {
                         destNode.children[srcNode.name] = JSON.parse(JSON.stringify(srcNode));
                         // Reset ownership to current user
                         destNode.children[srcNode.name].owner = 'etudiant';
                     }
                 } else if (sources.length === 1 && destParent && destParent.type === 'directory') {
                     // Write permission on dest parent needed
                     if (!canWrite(destParent)) {
                         return { id: uid(), type: 'error', content: `cp: impossible de créer le fichier '${destParam}': Permission non accordée` };
                     }

                     // Single file rename/copy
                     if (destParent.children) {
                        destParent.children[destName] = JSON.parse(JSON.stringify(srcNode));
                        destParent.children[destName].name = destName;
                        destParent.children[destName].owner = 'etudiant';
                     }
                 } else {
                     return { id: uid(), type: 'error', content: `cp: impossible de créer le fichier '${destParam}': Aucun fichier ou dossier de ce type` };
                 }
            }

            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'mv': {
            const fileParams = params.filter(p => !p.startsWith('-'));
            if (fileParams.length < 2) return { id: uid(), type: 'error', content: 'mv: opérande manquant' };
            
            const destParam = fileParams[fileParams.length - 1];
            const sources = fileParams.slice(0, fileParams.length - 1);
            
            const destPath = resolvePath(cwd, destParam);
            const destNode = getNode(currentFs, destPath);
            const [destParent, destName] = getParentAndName(destPath, currentFs);

            // If multiple sources, dest MUST be a directory
            if (sources.length > 1 && (!destNode || destNode.type !== 'directory')) {
                 return { id: uid(), type: 'error', content: `mv: la cible '${destParam}' n'est pas un répertoire` };
            }

            for (const source of sources) {
                const srcPath = resolvePath(cwd, source);
                const [srcParent, srcName] = getParentAndName(srcPath, currentFs);
                if (!srcParent || !srcParent.children || !srcParent.children[srcName]) {
                    return { id: uid(), type: 'error', content: `mv: impossible d'évaluer '${source}': Aucun fichier ou dossier de ce type` };
                }
                const srcNode = srcParent.children[srcName];
                
                // Write permission on source parent needed to remove it
                if (!canWrite(srcParent)) {
                    return { id: uid(), type: 'error', content: `mv: impossible de déplacer '${source}': Permission non accordée (source)` };
                }

                if (destNode && destNode.type === 'directory' && destNode.children) {
                    // Write permission on dest dir needed
                    if (!canWrite(destNode)) {
                        return { id: uid(), type: 'error', content: `mv: impossible de déplacer '${source}': Permission non accordée (destination)` };
                    }
                    destNode.children[srcNode.name] = srcNode;
                    delete srcParent.children[srcName];
                } else if (sources.length === 1 && destParent && destParent.type === 'directory' && destParent.children) {
                    // Write permission on dest parent needed
                    if (!canWrite(destParent)) {
                        return { id: uid(), type: 'error', content: `mv: impossible de déplacer '${source}': Permission non accordée (destination)` };
                    }
                    destParent.children[destName] = srcNode;
                    destParent.children[destName].name = destName;
                    delete srcParent.children[srcName];
                } else {
                     return { id: uid(), type: 'error', content: `mv: impossible de déplacer '${source}' vers '${destParam}'` };
                }
            }

            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'rm': {
            const recursive = hasFlag(params, 'r') || hasFlag(params, 'R');
            const force = hasFlag(params, 'f');
            const files = params.filter(p => !p.startsWith('-'));
            
            if (files.length === 0 && !force) {
                return { id: uid(), type: 'error', content: 'rm: opérande manquant' };
            }

            for (const filename of files) {
                // Check internal wildcard logic for compat, though expandGlob typically handles it
                if (filename.includes('*')) {
                     // Fallback manual glob logic just in case expansion didn't happen (quoted?)
                     const [parent, pattern] = getParentAndName(resolvePath(cwd, filename), currentFs);
                     if (parent && parent.children) {
                         if (!canWrite(parent)) {
                              if (!force) return { id: uid(), type: 'error', content: `rm: impossible de supprimer '${filename}': Permission non accordée` };
                              continue;
                         }
                         const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                         Object.keys(parent.children).forEach(k => {
                             if (regex.test(k)) delete parent.children![k];
                         });
                     }
                     continue;
                }

                const targetPath = resolvePath(cwd, filename);
                const [parent, name] = getParentAndName(targetPath, currentFs);

                if (!parent || !parent.children || !parent.children[name]) {
                    if (!force) return { id: uid(), type: 'error', content: `rm: impossible de supprimer '${filename}': Aucun fichier ou dossier de ce type` };
                    continue;
                }

                // Check permissions on Parent Directory (need write to remove child)
                if (!canWrite(parent)) {
                    if (!force) return { id: uid(), type: 'error', content: `rm: impossible de supprimer '${filename}': Permission non accordée` };
                    continue;
                }

                const target = parent.children[name];
                if (target.type === 'directory' && !recursive) {
                    return { id: uid(), type: 'error', content: `rm: impossible de supprimer '${filename}': est un dossier` };
                }

                delete parent.children[name];
            }
            
            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'chmod': {
            // New logic to handle parsing correctly (especially for modes like -w and flags like -r)
            const paramsCopy = [...params];
            let recursive = false;
            let mode = '';
            let files = [];
            
            // 1. Extract Options
            // We support -R (standard) and -r (requested alias for recursive)
            const validFlags = ['-R', '-r', '--recursive'];
            
            const remainingParams = [];
            for (const p of paramsCopy) {
                if (validFlags.includes(p)) {
                    recursive = true;
                } else {
                    remainingParams.push(p);
                }
            }
            
            if (remainingParams.length < 2) {
                 if (remainingParams.length === 1) return { id: uid(), type: 'error', content: `chmod: opérande manquant après '${remainingParams[0]}'` };
                 return { id: uid(), type: 'error', content: 'chmod: mode manquant' };
            }

            // First remaining is mode, rest are files
            mode = remainingParams[0];
            files = remainingParams.slice(1);
            
            const modifyPermString = (currentPerms: string, operationMode: string, type: 'file' | 'directory'): string => {
                const typeChar = type === 'directory' ? 'd' : '-';
                
                // Octal mode
                if (/^[0-7]{3}$/.test(operationMode)) {
                    const octalMap: Record<string, string> = {
                        '0': '---', '1': '--x', '2': '-w-', '3': '-wx',
                        '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx'
                    };
                    const u = octalMap[operationMode[0]];
                    const g = octalMap[operationMode[1]];
                    const o = octalMap[operationMode[2]];
                    return typeChar + u + g + o;
                }
                
                // Symbolic mode (u+x, go-w, +x, -w)
                // Split current perms into parts: [type, u, g, o]
                let uArr = currentPerms.substring(1, 4).split('');
                let gArr = currentPerms.substring(4, 7).split('');
                let oArr = currentPerms.substring(7, 10).split('');
                
                // Regex to split: [who][op][perm] e.g. "u+x" or "+x" or "go-w" or "-w"
                let match = operationMode.match(/^([ugoa]*)([\+\-])([rwx]+)$/);
                
                // Handle case like "-w" where first group matches "-" (incorrectly by simple regex sometimes)
                // The regex ^([ugoa]*)([\+\-])([rwx]+)$ works for "-w":
                // Group 1: "" (empty string, means all/whoever)
                // Group 2: "-"
                // Group 3: "w"
                // So it works correctly.

                if (match) {
                    const who = match[1] || 'a'; // default all if empty
                    const op = match[2];
                    const perms = match[3];
                    
                    let targets: string[] = [];
                    // 'a' implies u,g,o. BUT if umask matters... here we apply to all if 'a' or empty.
                    if (who.includes('a') || who === '') targets = ['u', 'g', 'o'];
                    else {
                        if (who.includes('u')) targets.push('u');
                        if (who.includes('g')) targets.push('g');
                        if (who.includes('o')) targets.push('o');
                    }
                    
                    const applyChange = (arr: string[]) => {
                        if (perms.includes('r')) arr[0] = op === '+' ? 'r' : '-';
                        if (perms.includes('w')) arr[1] = op === '+' ? 'w' : '-';
                        if (perms.includes('x')) arr[2] = op === '+' ? 'x' : '-';
                    };

                    if (targets.includes('u')) applyChange(uArr);
                    if (targets.includes('g')) applyChange(gArr);
                    if (targets.includes('o')) applyChange(oArr);
                    
                    return typeChar + uArr.join('') + gArr.join('') + oArr.join('');
                }

                return currentPerms; // Fallback if parse fails
            };

            const updatePermsRecursively = (node: FileSystemNode) => {
                node.permissions = modifyPermString(node.permissions, mode, node.type);
                if (recursive && node.type === 'directory' && node.children) {
                    Object.values(node.children).forEach(child => updatePermsRecursively(child));
                }
            };

            for (const file of files) {
                const targetPath = resolvePath(cwd, file);
                const node = getNode(currentFs, targetPath);
                
                if (!node) return { id: uid(), type: 'error', content: `chmod: impossible d'accéder à '${file}': Aucun fichier ou dossier de ce type` };
                
                updatePermsRecursively(node);
            }
            
            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'cat': {
            const showLineNum = hasFlag(params, 'n');
            const fileParams = params.filter(p => !p.startsWith('-'));
            
            if (fileParams.length === 0 && inputString === null) {
                 return { id: uid(), type: 'error', content: 'cat: opérande manquant' };
            }

            let output = '';
            
            if (fileParams.length === 0) {
                // Use stdin
                 output = inputString || '';
            } else {
                for (const fileParam of fileParams) {
                    const content = getTextContent(fileParam);
                    if (content === null) {
                         return { id: uid(), type: 'error', content: `cat: ${fileParam}: Aucun fichier ou dossier de ce type` };
                    }
                    output += content + (fileParams.length > 1 ? '\n' : '');
                }
            }

            if (showLineNum) {
                const lines = output.split('\n');
                const numbered = lines.map((line, i) => `${(i + 1).toString().padStart(6)}  ${line}`).join('\n');
                return { id: uid(), type: 'output', content: numbered };
            }

            return { id: uid(), type: 'output', content: output };
        }

        case 'grep': {
            const ignoreCase = hasFlag(params, 'i');
            const invert = hasFlag(params, 'v');
            const showLineNum = hasFlag(params, 'n');
            
            const args = params.filter(p => !p.startsWith('-'));
            const termRaw = args[0]?.replace(/"/g, '').replace(/'/g, '');
            const fileParams = args.slice(1);
            
            if (!termRaw) return { id: uid(), type: 'error', content: 'grep: opérande manquant' };

            let contentToSearch = '';
            let prefixFile = false;

            if (fileParams.length === 0) {
                 contentToSearch = inputString || '';
            } else {
                 prefixFile = fileParams.length > 1;
                 for (const fileParam of fileParams) {
                    const c = getTextContent(fileParam);
                    if (c === null) return { id: uid(), type: 'error', content: `grep: ${fileParam}: Aucun fichier ou dossier de ce type` };
                    // Rough logic to attach filenames to lines if multiple files
                    if (prefixFile) {
                        contentToSearch += c.split('\n').map(l => `${fileParam}:${l}`).join('\n') + '\n';
                    } else {
                        contentToSearch += c + '\n';
                    }
                 }
            }

            const lines = contentToSearch.split('\n');
            let resultLines: string[] = [];

            lines.forEach((line, idx) => {
                // clean line if prefixed (complex logic simplified)
                // If we prefixed, the line is "filename:content". We search in "content" but return "filename:content".
                let searchSpace = line;
                let outputLine = line;

                if (prefixFile) {
                     const splitIdx = line.indexOf(':');
                     if (splitIdx !== -1) {
                         searchSpace = line.substring(splitIdx + 1);
                     }
                }
                
                if (!searchSpace) return; // skip empty ending lines

                let match = false;
                try {
                    // Use RegExp for grep. Handle termRaw as pattern.
                    // If ignoreCase, flag 'i'.
                    const regex = new RegExp(termRaw, ignoreCase ? 'i' : '');
                    match = regex.test(searchSpace);
                } catch (e) {
                    // Fallback to literal if invalid regex (though grep usually errors on invalid regex)
                    if (ignoreCase) {
                        match = searchSpace.toLowerCase().includes(termRaw.toLowerCase());
                    } else {
                        match = searchSpace.includes(termRaw);
                    }
                }

                if (invert) match = !match;

                if (match) {
                    if (showLineNum) {
                        outputLine = prefixFile ? outputLine.replace(':', `:${idx + 1}:`) : `${idx + 1}:${outputLine}`;
                    }
                    resultLines.push(outputLine);
                }
            });

            return { id: uid(), type: 'output', content: resultLines.join('\n') };
        }

        case 'wc': {
            const countLines = hasFlag(params, 'l');
            const countWords = hasFlag(params, 'w');
            const countChars = hasFlag(params, 'c');
            const noFlags = !countLines && !countWords && !countChars;
            const fileParam = params.find(p => !p.startsWith('-'));
            const content = getTextContent(fileParam);
            
            if (content === null) return { id: uid(), type: 'error', content: `wc: ${fileParam}: Aucun fichier de ce type` };
            
            const lines = content.split('\n');
            const lineCount = content === '' ? 0 : lines.length;
            const wordCount = content === '' ? 0 : content.trim().split(/\s+/).length;
            const charCount = content.length;

            if (noFlags) {
                return { id: uid(), type: 'output', content: `${lineCount} ${wordCount} ${charCount}` };
            }
            
            let outputParts = [];
            if (countLines) outputParts.push(lineCount);
            if (countWords) outputParts.push(wordCount);
            if (countChars) outputParts.push(charCount);
            
            return { id: uid(), type: 'output', content: outputParts.join(' ') };
        }

        case 'head': {
            const linesArgIdx = params.indexOf('-n');
            let count = 10;
            let fileParam = params.find(p => !p.startsWith('-') && p !== params[linesArgIdx + 1]);

            if (linesArgIdx !== -1 && params[linesArgIdx + 1]) {
                count = parseInt(params[linesArgIdx + 1]);
            } else {
                const numFlag = params.find(p => p.match(/^-\d+$/));
                if (numFlag) count = parseInt(numFlag.substring(1));
            }

            const content = getTextContent(fileParam);
            if (content === null) return { id: uid(), type: 'error', content: `head: ${fileParam}: Aucun fichier de ce type` };

            const lines = content.split('\n');
            return { id: uid(), type: 'output', content: lines.slice(0, count).join('\n') };
        }

        case 'tail': {
            const linesArgIdx = params.indexOf('-n');
            let count = 10;
            let fileParam = params.find(p => !p.startsWith('-') && p !== params[linesArgIdx + 1]);

            if (linesArgIdx !== -1 && params[linesArgIdx + 1]) {
                count = parseInt(params[linesArgIdx + 1]);
            } else {
                const numFlag = params.find(p => p.match(/^-\d+$/));
                if (numFlag) count = parseInt(numFlag.substring(1));
            }

            const content = getTextContent(fileParam);
            if (content === null) return { id: uid(), type: 'error', content: `tail: ${fileParam}: Aucun fichier de ce type` };

            const lines = content.split('\n');
            if (count === 0) return { id: uid(), type: 'output', content: '' };
            return { id: uid(), type: 'output', content: lines.slice(-count).join('\n') };
        }

        case 'sort': {
            const reverse = hasFlag(params, 'r');
            const numeric = hasFlag(params, 'n');
            // Mock support for -k
            const fileParam = params.find(p => !p.startsWith('-'));
            
            const content = getTextContent(fileParam);
            if (content === null) return { id: uid(), type: 'error', content: `sort: ${fileParam}: Aucun fichier de ce type` };

            let lines = content.split('\n').filter(l => l !== '');
            lines.sort();
            
            if (numeric) {
                // If numeric, try to find the first number in the line
                lines.sort((a, b) => {
                    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                    return numA - numB;
                });
            }
            if (reverse) {
                lines.reverse();
            }

            return { id: uid(), type: 'output', content: lines.join('\n') };
        }

        case 'ps': {
            return { 
                id: uid(), 
                type: 'output', 
                content: '  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 5678 pts/0    00:00:00 ps' 
            };
        }

        case 'kill': {
            if (!params[0]) return { id: uid(), type: 'error', content: 'kill: usage: kill pid' };
            return { id: uid(), type: 'success', content: '' };
        }

        case 'id':
            return { id: uid(), type: 'output', content: 'uid=1000(etudiant) gid=1000(etudiant) groups=1000(etudiant),4(adm),24(cdrom),27(sudo)' };

        case 'whoami':
            return { id: uid(), type: 'output', content: 'etudiant' };

        case 'date': {
            const now = new Date();
            // Basic support for +%s (timestamp)
            if (params[0] === '+%s') {
                return { id: uid(), type: 'output', content: Math.floor(now.getTime() / 1000).toString() };
            }
            return { id: uid(), type: 'output', content: now.toString() };
        }

        case 'help':
            return { id: uid(), type: 'output', content: 'Commandes supportées: ls, cd, pwd, mkdir, touch, cp, mv, rm, cat, echo, grep, wc, sort, head, tail, chmod, ps, kill, clear, id, whoami, date, ./script.sh' };

        case 'clear':
            return { id: uid(), type: 'output', content: '__CLEAR__' };

        case 'echo': {
            // Check for -e flag anywhere in params to enable escape interpretation
            const interpretEscapes = params.some(p => p.startsWith('-') && p.includes('e'));
            
            // Filter out any flag arguments (starting with -)
            const textParts = params.filter(p => !p.startsWith('-'));
            let text = textParts.join(' ');
            
            if (interpretEscapes) {
                // Manually handle the escapes. Note: the parser preserves literal backslashes from input
                text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
            }
            return { id: uid(), type: 'output', content: text };
        }

        case '':
            return { id: uid(), type: 'success', content: '' };

        default:
            return { id: uid(), type: 'error', content: `${cmd}: commande introuvable` };
    }
};

// Main Execution Entry Point
export const executeCommand = (
  cmdStr: string, 
  cwd: string, 
  root: FileSystemNode,
  setFs: (newFs: FileSystemNode) => void,
  variables: Record<string, string> = {}
): TerminalOutput => {
  const processedCmd = substituteVariables(cmdStr, variables);

  // 2. Script Execution (./script.sh)
  if (processedCmd.startsWith('./')) {
      const scriptName = processedCmd.substring(2);
      const targetPath = resolvePath(cwd, scriptName);
      const node = getNode(root, targetPath);

      if (!node) return { id: uid(), type: 'error', content: `bash: ${scriptName}: Aucun fichier ou dossier de ce type` };
      if (node.type === 'directory') return { id: uid(), type: 'error', content: `bash: ${scriptName}: est un dossier` };
      
      if (!isExecutable(node.permissions)) {
          return { id: uid(), type: 'error', content: `bash: ${scriptName}: Permission non accordée` };
      }

      const lines = (node.content || '').split('\n');
      let scriptOutput = '';
      let currentFs = JSON.parse(JSON.stringify(root)); 
      let scriptVars: Record<string, string> = { ...variables };

      const localSetFs = (newFs: FileSystemNode) => {
          currentFs = newFs;
          setFs(newFs); 
      };

      for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line || line.startsWith('#')) continue;

          if (line.includes('=') && !line.startsWith('if') && !line.startsWith('for')) {
              const [key, ...valParts] = line.split('=');
              const val = valParts.join('=').replace(/"/g, '').replace(/'/g, '');
              if (key && val) {
                  scriptVars[key.trim()] = val.trim();
                  continue;
              }
          }

          if (line.startsWith('for ')) {
              const forMatch = line.match(/for\s+(\w+)\s+in\s+(.+);?\s*do/);
              if (forMatch) {
                  const varName = forMatch[1];
                  const listStr = forMatch[2].replace(';', '');
                  let items: string[] = [];
                  if (listStr.includes('$(seq')) {
                      const seqMatch = listStr.match(/seq\s+(\d+)\s+(\d+)/);
                      if (seqMatch) {
                          const start = parseInt(seqMatch[1]);
                          const end = parseInt(seqMatch[2]);
                          for (let n = start; n <= end; n++) items.push(n.toString());
                      }
                  } else {
                      items = listStr.split(' ');
                  }

                  let bodyLines: string[] = [];
                  let j = i + 1;
                  let depth = 1;
                  while (j < lines.length && depth > 0) {
                      const bodyLine = lines[j].trim();
                      if (bodyLine === 'do') depth++;
                      if (bodyLine === 'done') depth--;
                      if (depth > 0) bodyLines.push(bodyLine);
                      j++;
                  }
                  
                  for (const item of items) {
                      const loopVars = { ...scriptVars, [varName]: item };
                      for (const bodyCmd of bodyLines) {
                          const res = executeCommand(bodyCmd, cwd, currentFs, localSetFs, loopVars);
                          if (res.content) scriptOutput += res.content + '\n';
                          if (res.type === 'error') scriptOutput += `Loop Error: ${res.content}\n`;
                      }
                  }
                  i = j - 1;
                  continue;
              }
          }

          const result = executeCommand(line, cwd, currentFs, localSetFs, scriptVars);
          if (result.content) scriptOutput += result.content + '\n';
          if (result.type === 'error') scriptOutput += `Error line ${i+1}: ${result.content}\n`;
      }

      return { id: uid(), type: 'success', content: scriptOutput.trim() };
  }

  // 3. Pipe Splitting
  const segments = processedCmd.split('|');
  let inputForNext = null;
  let finalResult: TerminalOutput = { id: uid(), type: 'success', content: '' };
  
  const currentFs = JSON.parse(JSON.stringify(root));

  for (let i = 0; i < segments.length; i++) {
      let segment = segments[i].trim();
      if (!segment) continue;

      const redirectIndex = segment.indexOf('>');
      let redirectFile = null;
      let isAppend = false;

      if (redirectIndex !== -1) {
          const isDouble = segment.charAt(redirectIndex + 1) === '>';
          redirectFile = segment.substring(redirectIndex + (isDouble ? 2 : 1)).trim();
          isAppend = isDouble;
          segment = segment.substring(0, redirectIndex).trim();
      }

      // IMPROVED: Argument parsing to handle single quotes too
      const argsRaw = segment.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      const argsParsed = argsRaw.map(arg => arg.replace(/"/g, '').replace(/'/g, ''));
      const cmd = argsParsed[0];
      const paramsParsed = argsParsed.slice(1);

      // GLOB EXPANSION
      const expandedParams: string[] = [];
      paramsParsed.forEach((clean, idx) => {
          const raw = argsRaw[idx + 1]; // +1 because cmd is at 0
          if ((raw.startsWith('"') || raw.startsWith("'")) && !raw.includes('*')) {
              expandedParams.push(clean);
          } else if (clean.includes('*') && !(raw.startsWith('"') || raw.startsWith("'"))) {
              expandedParams.push(...expandGlob(clean, cwd, currentFs));
          } else {
              expandedParams.push(clean);
          }
      });
      const params = expandedParams;
      
      const isPiped = i < segments.length - 1;

      const result = runSingleCommand(cmd, params, cwd, currentFs, setFs, inputForNext, isPiped);

      if (result.type === 'error') {
          return result;
      }

      if (redirectFile) {
          const targetPath = resolvePath(cwd, redirectFile);
          const [parent, name] = getParentAndName(targetPath, currentFs);
          
          if (parent && parent.children) {
              if (!canWrite(parent)) {
                   return { id: uid(), type: 'error', content: `bash: ${redirectFile}: Permission non accordée` };
              }
              const existing = parent.children[name];
              if (existing && !canWrite(existing)) {
                   return { id: uid(), type: 'error', content: `bash: ${redirectFile}: Permission non accordée` };
              }

              const contentToWrite = result.content;
              const newContent = (isAppend && existing?.content) ? existing.content + '\n' + contentToWrite : contentToWrite;
              
              parent.children[name] = {
                  type: 'file',
                  name: name,
                  permissions: existing ? existing.permissions : '-rw-r--r--',
                  owner: 'etudiant',
                  content: newContent
              };
              setFs(currentFs);
          } else {
              return { id: uid(), type: 'error', content: `bash: ${redirectFile}: Aucun fichier ou dossier de ce type` };
          }
          inputForNext = '';
          finalResult = { id: uid(), type: 'success', content: '' };
      } else {
          inputForNext = result.content;
          finalResult = result;
      }
      
      if (cmd === 'cd' && result.cwd) {
          finalResult.cwd = result.cwd;
      }
  }

  return finalResult;
};