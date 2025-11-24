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
const canWrite = (node: FileSystemNode, user: string = 'etudiant'): boolean => {
    if (user === 'root') return true;
    if (node.owner === user) {
        return node.permissions[2] === 'w';
    }
    if (node.permissions[8] === 'w') return true;
    return false;
};

// Helper: Variable substitution
const substituteVariables = (text: string, variables: Record<string, string>): string => {
    let result = text;
    for (const [key, val] of Object.entries(variables)) {
        // Safe regex escape for key
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Replace $VAR
        result = result.replace(new RegExp(`\\$${escapedKey}\\b`, 'g'), val);
        // Replace ${VAR}
        result = result.replace(new RegExp(`\\$\\{${escapedKey}\\}`, 'g'), val);
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

// Helper: Check if a param string contains a specific flag
const hasFlag = (params: string[], flagChar: string): boolean => {
    return params.some(p => p.startsWith('-') && p.includes(flagChar));
};

// Helper: Expand Glob Pattern
const expandGlob = (arg: string, cwd: string, root: FileSystemNode): string[] => {
    if (!arg.includes('*')) return [arg];
    
    const fullPathWithPattern = resolvePath(cwd, arg);
    const lastSlash = fullPathWithPattern.lastIndexOf('/');
    const dirPath = fullPathWithPattern.substring(0, lastSlash) || '/';
    const pattern = fullPathWithPattern.substring(lastSlash + 1);
    
    const dirNode = getNode(root, dirPath);
    if (!dirNode || dirNode.type !== 'directory' || !dirNode.children) {
        return [arg]; 
    }
    
    const regex = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
    const matches = Object.keys(dirNode.children).filter(name => regex.test(name));
    
    if (matches.length === 0) return [arg];
    
    const prefixIndex = arg.lastIndexOf('/');
    const prefix = prefixIndex !== -1 ? arg.substring(0, prefixIndex + 1) : '';
    
    return matches.sort().map(m => prefix + m);
};

// Save file directly
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

  if (!canWrite(parentNode)) {
      return false;
  }

  if (!parentNode.children) {
      parentNode.children = {};
  }

  if (parentNode.children[filename]) {
      if (parentNode.children[filename].type === 'directory') return false;
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

// --- Script Execution Engine ---
const runScriptLines = (
    lines: string[],
    args: string[],
    cwd: string,
    fs: FileSystemNode,
    setFs: (fs: FileSystemNode) => void,
    baseVars: Record<string, string>
): TerminalOutput => {
    let output = '';
    let currentFs = fs; 
    let scriptVars: Record<string, string> = { ...baseVars };

    // Map args to $1, $2, etc.
    args.forEach((arg, i) => {
        scriptVars[(i + 1).toString()] = arg;
    });

    const localSetFs = (newFs: FileSystemNode) => {
        currentFs = newFs;
        setFs(newFs); 
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        // Check for inline variable assignment: VAR=val cmd or VAR=val
        const assignmentMatch = line.match(/^([a-zA-Z_]\w*)=(.*)$/);
        if (assignmentMatch && !line.startsWith('if') && !line.startsWith('for')) {
            const varName = assignmentMatch[1];
            let rest = assignmentMatch[2]; 
            
            // Substitute vars in the value part (RHS) before assigning
            rest = substituteVariables(rest, scriptVars);

            let value = '';
            let cmdToRun = '';
            
            // Parse value - check for quotes
            if (rest.startsWith("'")) {
                    const endQ = rest.indexOf("'", 1);
                    if (endQ !== -1) {
                        value = rest.substring(1, endQ);
                        cmdToRun = rest.substring(endQ + 1).trim();
                    } else {
                        value = rest.substring(1); 
                    }
            } else if (rest.startsWith('"')) {
                    const endQ = rest.indexOf('"', 1);
                    if (endQ !== -1) {
                        value = rest.substring(1, endQ);
                        cmdToRun = rest.substring(endQ + 1).trim();
                    } else {
                        value = rest.substring(1);
                    }
            } else {
                    const spaceIdx = rest.search(/\s/);
                    if (spaceIdx !== -1) {
                        value = rest.substring(0, spaceIdx);
                        cmdToRun = rest.substring(spaceIdx).trim();
                    } else {
                        value = rest;
                    }
            }
            
            if (cmdToRun) {
                // Temporary assignment for this command only
                const tempVars = { ...scriptVars, [varName]: value };
                const res = executeCommand(cmdToRun, cwd, currentFs, localSetFs, tempVars);
                if (res.content) output += res.content + '\n';
                if (res.type === 'error') output += `Error line ${i+1}: ${res.content}\n`;
            } else {
                // Permanent assignment
                scriptVars[varName] = value;
            }
            continue; 
        }

        // Before loop processing, substitute variables in the line (e.g. for `seq $1`)
        const processedLine = substituteVariables(line, scriptVars);

        if (processedLine.startsWith('for ')) {
            // Updated Regex to be non-greedy and support different separators
            const oneLineMatch = processedLine.match(/^for\s+(\w+)\s+in\s+(.+?)(?:;\s*|\s+)do\s+(.+?)(?:;\s*|\s+)done$/);
            
            if (oneLineMatch) {
                const varName = oneLineMatch[1];
                const listStr = oneLineMatch[2];
                const cmdBody = oneLineMatch[3];

                let items: string[] = [];
                if (listStr.includes('$(seq')) {
                    const seqMatch = listStr.match(/seq\s+(?:(\d+)\s+)?(\d+)/);
                    if (seqMatch) {
                        // if only one arg, it's end. if two, start and end.
                        const start = seqMatch[2] ? (seqMatch[1] ? parseInt(seqMatch[1]) : 1) : 1;
                        const end = seqMatch[2] ? parseInt(seqMatch[2]) : parseInt(seqMatch[1]);
                        
                        for (let n = start; n <= end; n++) items.push(n.toString());
                    }
                } else {
                    // Filter empty strings from extra spaces
                    items = listStr.split(' ').filter(s => s.trim() !== '');
                }

                for (const item of items) {
                    const loopVars = { ...scriptVars, [varName]: item };
                    const res = executeCommand(cmdBody, cwd, currentFs, localSetFs, loopVars);
                    // Append output if exists
                    if (res.content || res.content === '') output += res.content + '\n';
                    if (res.type === 'error') output += `Loop Error: ${res.content}\n`;
                }
                continue; 
            }

            // Multi-line loop
            const forMatch = processedLine.match(/for\s+(\w+)\s+in\s+(.+?)(?:;|\s*$)/);
            if (forMatch) {
                const varName = forMatch[1];
                const listStr = forMatch[2];
                let items: string[] = [];
                if (listStr.includes('$(seq')) {
                    const seqMatch = listStr.match(/seq\s+(?:(\d+)\s+)?(\d+)/);
                    if (seqMatch) {
                        const start = seqMatch[2] ? (seqMatch[1] ? parseInt(seqMatch[1]) : 1) : 1;
                        const end = seqMatch[2] ? parseInt(seqMatch[2]) : parseInt(seqMatch[1]);
                        for (let n = start; n <= end; n++) items.push(n.toString());
                    }
                } else {
                    items = listStr.split(' ').filter(s => s.trim() !== '');
                }

                let bodyLines: string[] = [];
                let j = i + 1;
                let depth = 1;
                while (j < lines.length && depth > 0) {
                    const bodyLine = lines[j].trim();
                    if (bodyLine.startsWith('for ')) depth++; // Nested loops not fully parsed but tracking depth
                    if (bodyLine === 'do') {
                         // 'do' might be on the same line as 'for', already handled above? 
                         // No, if multi-line, 'do' is usually next line or after ;
                    }
                    if (bodyLine === 'done') depth--;
                    
                    if (bodyLine !== 'do' && bodyLine !== 'done' && depth > 0) {
                        // Handle 'do' on separate line
                         bodyLines.push(bodyLine);
                    } else if (bodyLine === 'do' && depth > 1) {
                         bodyLines.push(bodyLine);
                    } else if (bodyLine === 'done' && depth > 0) {
                         bodyLines.push(bodyLine);
                    }
                    j++;
                }
                
                // Simple multi-line body extraction
                // Refetch clean body
                bodyLines = [];
                j = i + 1;
                while(j < lines.length) {
                    const bl = lines[j].trim();
                    if (bl === 'done') break;
                    if (bl !== 'do') bodyLines.push(lines[j]); // Keep original indentation/content
                    j++;
                }

                for (const item of items) {
                    const loopVars = { ...scriptVars, [varName]: item };
                    const res = runScriptLines(bodyLines, [], cwd, currentFs, localSetFs, loopVars);
                    if (res.content) output += res.content + '\n';
                }
                i = j; // skip lines
                continue;
            }
        }

        const result = executeCommand(line, cwd, currentFs, localSetFs, scriptVars);
        if (result.content) output += result.content + '\n';
        if (result.type === 'error') output += `Error line ${i+1}: ${result.content}\n`;
    }

    // IMPORTANT: Return type 'output' if there is content, so Terminal displays it.
    // 'success' is usually ignored by Terminal rendering unless it changes state.
    const finalOutput = output.trim();
    return { 
        id: uid(), 
        type: finalOutput ? 'output' : 'success', 
        content: finalOutput 
    };
};

// Internal execution logic
const runSingleCommand = (
    cmd: string,
    params: string[],
    cwd: string,
    currentFs: FileSystemNode,
    setFs: (newFs: FileSystemNode) => void,
    inputString: string | null,
    isPiped: boolean = false
): TerminalOutput => {
    
    const getTextContent = (fileParam: string | undefined): string | null => {
        if (fileParam) {
            const targetPath = resolvePath(cwd, fileParam);
            const node = getNode(currentFs, targetPath);
            if (!node || node.type !== 'file') return null; 
            return node.content || '';
        }
        return inputString;
    };

    switch (cmd) {
        case 'ls': {
            const showDetails = hasFlag(params, 'l');
            const showAll = hasFlag(params, 'a');
            const reverse = hasFlag(params, 'r');
            const sortBySize = hasFlag(params, 'S');
            const pathArgs = params.filter(p => !p.startsWith('-'));
            
            const getListing = (path: string, isArgument: boolean): string[] | string => {
                const targetPath = resolvePath(cwd, path);
                const node = getNode(currentFs, targetPath);
                if (!node) return `ls: impossible d'accéder à '${path}': Aucun fichier ou dossier de ce type`;
                
                if (node.type === 'file') {
                    if (showDetails) {
                        const size = node.content?.length || 0;
                        return `${node.permissions} 1 ${node.owner} ${node.owner} ${size.toString().padStart(5)} Jun 14 12:00 ${node.name}`;
                    }
                    return node.name;
                }
                
                if (node.children) {
                    let files = Object.keys(node.children);
                    if (!showAll) files = files.filter(name => !name.startsWith('.'));
                    else files = ['.', '..', ...files];
                    
                    files.sort(); 
                    if (sortBySize) {
                        files.sort((a, b) => {
                           const getNodeSize = (n: string) => {
                               if (n === '.' || n === '..') return 4096;
                               const child = node.children![n];
                               return child.type === 'directory' ? 4096 : (child.content?.length || 0);
                           };
                           return getNodeSize(b) - getNodeSize(a); 
                        });
                    }
                    if (reverse) files.reverse();

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
            if (!targetParam || targetParam === '-') targetParam = '~'; 
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
                            if (!canWrite(current)) {
                                lastError = { id: uid(), type: 'error', content: `mkdir: impossible de créer le répertoire '${pathArg}': Permission non accordée` };
                                break;
                            }
                            current.children[part] = { type: 'directory', name: part, permissions: 'drwxr-xr-x', owner: 'etudiant', children: {} };
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
                    if (!canWrite(parent)) {
                        lastError = { id: uid(), type: 'error', content: `mkdir: impossible de créer le répertoire '${pathArg}': Permission non accordée` };
                        continue;
                    }
                    if (parent.children) parent.children[name] = { type: 'directory', name: name, permissions: 'drwxr-xr-x', owner: 'etudiant', children: {} };
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
                if (!parent || parent.type !== 'directory') return { id: uid(), type: 'error', content: `touch: impossible de faire un touch '${file}': Aucun fichier ou dossier de ce type` };
                
                if (!parent.children || !parent.children[name]) {
                    if (!canWrite(parent)) return { id: uid(), type: 'error', content: `touch: impossible de faire un touch '${file}': Permission non accordée` };
                    parent.children[name] = { type: 'file', name: name, permissions: '-rw-r--r--', owner: 'etudiant', content: '' };
                } else {
                    const existing = parent.children[name];
                    if (!canWrite(existing)) return { id: uid(), type: 'error', content: `touch: impossible de faire un touch '${file}': Permission non accordée` };
                }
            }
            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'cp': {
            const recursive = hasFlag(params, 'r') || hasFlag(params, 'R');
            const fileParams = params.filter(p => !p.startsWith('-'));
            if (fileParams.length < 2) return { id: uid(), type: 'error', content: 'cp: opérande manquant' };
            const destParam = fileParams[fileParams.length - 1];
            const sources = fileParams.slice(0, fileParams.length - 1);
            const destPath = resolvePath(cwd, destParam);
            const [destParent, destName] = getParentAndName(destPath, currentFs);
            const destNode = getNode(currentFs, destPath);

            if (sources.length > 1 && (!destNode || destNode.type !== 'directory')) return { id: uid(), type: 'error', content: `cp: la cible '${destParam}' n'est pas un répertoire` };

            for (const source of sources) {
                 const srcPath = resolvePath(cwd, source);
                 const srcNode = getNode(currentFs, srcPath);
                 if (!srcNode) return { id: uid(), type: 'error', content: `cp: impossible d'évaluer '${source}': Aucun fichier ou dossier de ce type` };
                 if (srcNode.type === 'directory' && !recursive) return { id: uid(), type: 'error', content: `cp: -r non spécifié ; omission du répertoire '${source}'` };

                 if (destNode && destNode.type === 'directory') {
                     if (!canWrite(destNode)) return { id: uid(), type: 'error', content: `cp: impossible de créer le fichier '${destParam}/${srcNode.name}': Permission non accordée` };
                     if (destNode.children) {
                         destNode.children[srcNode.name] = JSON.parse(JSON.stringify(srcNode));
                         destNode.children[srcNode.name].owner = 'etudiant';
                     }
                 } else if (sources.length === 1 && destParent && destParent.type === 'directory') {
                     if (!canWrite(destParent)) return { id: uid(), type: 'error', content: `cp: impossible de créer le fichier '${destParam}': Permission non accordée` };
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

            if (sources.length > 1 && (!destNode || destNode.type !== 'directory')) return { id: uid(), type: 'error', content: `mv: la cible '${destParam}' n'est pas un répertoire` };

            for (const source of sources) {
                const srcPath = resolvePath(cwd, source);
                const [srcParent, srcName] = getParentAndName(srcPath, currentFs);
                if (!srcParent || !srcParent.children || !srcParent.children[srcName]) return { id: uid(), type: 'error', content: `mv: impossible d'évaluer '${source}': Aucun fichier ou dossier de ce type` };
                const srcNode = srcParent.children[srcName];
                
                if (!canWrite(srcParent)) return { id: uid(), type: 'error', content: `mv: impossible de déplacer '${source}': Permission non accordée (source)` };

                if (destNode && destNode.type === 'directory' && destNode.children) {
                    if (!canWrite(destNode)) return { id: uid(), type: 'error', content: `mv: impossible de déplacer '${source}': Permission non accordée (destination)` };
                    destNode.children[srcNode.name] = srcNode;
                    delete srcParent.children[srcName];
                } else if (sources.length === 1 && destParent && destParent.type === 'directory' && destParent.children) {
                    if (!canWrite(destParent)) return { id: uid(), type: 'error', content: `mv: impossible de déplacer '${source}': Permission non accordée (destination)` };
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
            if (files.length === 0 && !force) return { id: uid(), type: 'error', content: 'rm: opérande manquant' };

            for (const filename of files) {
                if (filename.includes('*')) {
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
                if (!canWrite(parent)) {
                    if (!force) return { id: uid(), type: 'error', content: `rm: impossible de supprimer '${filename}': Permission non accordée` };
                    continue;
                }
                const target = parent.children[name];
                if (target.type === 'directory' && !recursive) return { id: uid(), type: 'error', content: `rm: impossible de supprimer '${filename}': est un dossier` };
                delete parent.children[name];
            }
            setFs(currentFs);
            return { id: uid(), type: 'success', content: '' };
        }

        case 'chmod': {
            const paramsCopy = [...params];
            let recursive = false;
            let mode = '';
            let files = [];
            const validFlags = ['-R', '-r', '--recursive'];
            const remainingParams = [];
            for (const p of paramsCopy) {
                if (validFlags.includes(p)) recursive = true;
                else remainingParams.push(p);
            }
            if (remainingParams.length < 2) {
                 if (remainingParams.length === 1) return { id: uid(), type: 'error', content: `chmod: opérande manquant après '${remainingParams[0]}'` };
                 return { id: uid(), type: 'error', content: 'chmod: mode manquant' };
            }
            mode = remainingParams[0];
            files = remainingParams.slice(1);
            
            const modifyPermString = (currentPerms: string, operationMode: string, type: 'file' | 'directory'): string => {
                const typeChar = type === 'directory' ? 'd' : '-';
                if (/^[0-7]{3}$/.test(operationMode)) {
                    const octalMap: Record<string, string> = { '0': '---', '1': '--x', '2': '-w-', '3': '-wx', '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx' };
                    const u = octalMap[operationMode[0]];
                    const g = octalMap[operationMode[1]];
                    const o = octalMap[operationMode[2]];
                    return typeChar + u + g + o;
                }
                let uArr = currentPerms.substring(1, 4).split('');
                let gArr = currentPerms.substring(4, 7).split('');
                let oArr = currentPerms.substring(7, 10).split('');
                let match = operationMode.match(/^([ugoa]*)([\+\-])([rwx]+)$/);
                if (match) {
                    const who = match[1] || 'a';
                    const op = match[2];
                    const perms = match[3];
                    let targets: string[] = [];
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
                return currentPerms;
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
            if (fileParams.length === 0 && inputString === null) return { id: uid(), type: 'error', content: 'cat: opérande manquant' };

            let output = '';
            if (fileParams.length === 0) output = inputString || '';
            else {
                for (const fileParam of fileParams) {
                    const content = getTextContent(fileParam);
                    if (content === null) return { id: uid(), type: 'error', content: `cat: ${fileParam}: Aucun fichier ou dossier de ce type` };
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
            if (fileParams.length === 0) contentToSearch = inputString || '';
            else {
                 prefixFile = fileParams.length > 1;
                 for (const fileParam of fileParams) {
                    const c = getTextContent(fileParam);
                    if (c === null) return { id: uid(), type: 'error', content: `grep: ${fileParam}: Aucun fichier ou dossier de ce type` };
                    if (prefixFile) contentToSearch += c.split('\n').map(l => `${fileParam}:${l}`).join('\n') + '\n';
                    else contentToSearch += c + '\n';
                 }
            }
            const lines = contentToSearch.split('\n');
            let resultLines: string[] = [];
            lines.forEach((line, idx) => {
                let searchSpace = line;
                let outputLine = line;
                if (prefixFile) {
                     const splitIdx = line.indexOf(':');
                     if (splitIdx !== -1) searchSpace = line.substring(splitIdx + 1);
                }
                if (!searchSpace) return;
                let match = false;
                try {
                    const regex = new RegExp(termRaw, ignoreCase ? 'i' : '');
                    match = regex.test(searchSpace);
                } catch (e) {
                    if (ignoreCase) match = searchSpace.toLowerCase().includes(termRaw.toLowerCase());
                    else match = searchSpace.includes(termRaw);
                }
                if (invert) match = !match;
                if (match) {
                    if (showLineNum) outputLine = prefixFile ? outputLine.replace(':', `:${idx + 1}:`) : `${idx + 1}:${outputLine}`;
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
            if (noFlags) return { id: uid(), type: 'output', content: `${lineCount} ${wordCount} ${charCount}` };
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
            if (linesArgIdx !== -1 && params[linesArgIdx + 1]) count = parseInt(params[linesArgIdx + 1]);
            else {
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
            if (linesArgIdx !== -1 && params[linesArgIdx + 1]) count = parseInt(params[linesArgIdx + 1]);
            else {
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
            const fileParam = params.find(p => !p.startsWith('-'));
            const content = getTextContent(fileParam);
            if (content === null) return { id: uid(), type: 'error', content: `sort: ${fileParam}: Aucun fichier de ce type` };
            let lines = content.split('\n').filter(l => l !== '');
            lines.sort();
            if (numeric) {
                lines.sort((a, b) => {
                    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                    return numA - numB;
                });
            }
            if (reverse) lines.reverse();
            return { id: uid(), type: 'output', content: lines.join('\n') };
        }

        case 'ps':
            return { id: uid(), type: 'output', content: '  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 5678 pts/0    00:00:00 ps' };

        case 'kill':
            if (!params[0]) return { id: uid(), type: 'error', content: 'kill: usage: kill pid' };
            return { id: uid(), type: 'success', content: '' };

        case 'id':
            return { id: uid(), type: 'output', content: 'uid=1000(etudiant) gid=1000(etudiant) groups=1000(etudiant),4(adm),24(cdrom),27(sudo)' };

        case 'whoami':
            return { id: uid(), type: 'output', content: 'etudiant' };

        case 'date': {
            const now = new Date();
            if (params[0] === '+%s') return { id: uid(), type: 'output', content: Math.floor(now.getTime() / 1000).toString() };
            return { id: uid(), type: 'output', content: now.toString() };
        }

        case 'help':
            return { id: uid(), type: 'output', content: 'Commandes supportées: ls, cd, pwd, mkdir, touch, cp, mv, rm, cat, echo, grep, wc, sort, head, tail, chmod, ps, kill, clear, id, whoami, date, bash, ./script.sh' };

        case 'clear':
            return { id: uid(), type: 'output', content: '__CLEAR__' };

        case 'echo': {
            const interpretEscapes = params.some(p => p.startsWith('-') && p.includes('e'));
            const textParts = params.filter(p => !p.startsWith('-'));
            let text = textParts.join(' ');
            if (interpretEscapes) text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
            return { id: uid(), type: 'output', content: text };
        }

        case '':
            return { id: uid(), type: 'success', content: '' };

        case 'bash':
        case 'sh': {
            const scriptFile = params[0];
            const scriptArgs = params.slice(1);
            if (!scriptFile) return { id: uid(), type: 'error', content: `${cmd}: nom de fichier manquant` };

            const content = getTextContent(scriptFile);
            if (content === null) return { id: uid(), type: 'error', content: `${cmd}: ${scriptFile}: Aucun fichier ou dossier de ce type` };
            
            return runScriptLines(content.split('\n'), scriptArgs, cwd, currentFs, setFs, {});
        }

        default:
             // Handle ./script.sh directly here as a fallback command
             if (cmd.startsWith('./')) {
                const scriptFile = cmd.substring(2);
                const scriptArgs = params;
                const targetPath = resolvePath(cwd, scriptFile);
                const node = getNode(currentFs, targetPath);

                if (!node) return { id: uid(), type: 'error', content: `bash: ${scriptFile}: Aucun fichier ou dossier de ce type` };
                if (node.type === 'directory') return { id: uid(), type: 'error', content: `bash: ${scriptFile}: est un dossier` };
                
                if (!isExecutable(node.permissions)) {
                    return { id: uid(), type: 'error', content: `bash: ${scriptFile}: Permission non accordée` };
                }

                return runScriptLines((node.content || '').split('\n'), scriptArgs, cwd, currentFs, setFs, {});
             }
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

  // Pipe Splitting
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

      const argsRaw = segment.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      const argsParsed = argsRaw.map(arg => arg.replace(/"/g, '').replace(/'/g, ''));
      const cmd = argsParsed[0];
      const paramsParsed = argsParsed.slice(1);

      const expandedParams: string[] = [];
      paramsParsed.forEach((clean, idx) => {
          const raw = argsRaw[idx + 1]; 
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