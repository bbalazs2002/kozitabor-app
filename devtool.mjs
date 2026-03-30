import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib'; // Built-in module, no installation required
import { pipeline } from 'stream';
import { promisify } from 'util';
import readline from 'readline';

const pipe = promisify(pipeline);
const args = process.argv.slice(2);
const fullInput = args.join(' ');

/**
 * Helper function to run synchronous commands with error handling
 */
const runStep = (message, cmd, dir = '.') => {
    console.log(`\n--- ${message} ---`);
    try {
        execSync(cmd, { 
            cwd: path.join(process.cwd(), dir), 
            stdio: 'inherit', 
            shell: true 
        });
    } catch (error) {
        console.error(`❌ Error during: ${message}`);
        process.exit(1); 
    }
};
const ensureLogDir = () => {
    if (!fs.existsSync('./log')) fs.mkdirSync('./log');
};
/**
 * Scans a log file for a URL/Port pattern
 */
const detectPortFromLog = async (logPath, fallbackPort) => {
    const logFile = path.join(process.cwd(), logPath);
    let attempts = 0;
    const maxAttempts = 20; // ~10 seconds

    while (attempts < maxAttempts) {
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf8');
            // Regex to find: http://localhost:5173 or similar
            const match = content.match(/http:\/\/localhost:(\d+)/);
            if (match) return match[1];
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }
    return fallbackPort; // Return default if detection fails
};
/**
 * Scrapes a specific key's value from an .env file using Regex
 */
const getEnvValue = (dir, key, defaultValue = 'N/A') => {
    try {
        const filePath = path.join(process.cwd(), dir, '.env.development');
        if (!fs.existsSync(filePath)) return defaultValue;
        
        const content = fs.readFileSync(filePath, 'utf8');
        // Matches KEY=VALUE or KEY="VALUE"
        const regex = new RegExp(`^${key}\\s*=\\s*["']?([^"'\\s#]+)["']?`, 'm');
        const match = content.match(regex);
        
        return match ? match[1] : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};
const writeActiveServiceList = (services = ['db', 'api', 'react'], detectedPorts = {}) => {
    console.log('\n' + '='.repeat(78));
    console.log(`
    ██╗  ██╗ ██████╗ ███████╗██╗████████╗ █████╗ ██████╗  ██████╗ ██████╗ 
    ██║ ██╔╝██╔═══██╗╚══███╔╝██║╚══██╔══╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
    █████╔╝ ██║   ██║  ███╔╝ ██║   ██║   ███████║██████╔╝██║   ██║██████╔╝
    ██╔═██╗ ██║   ██║ ███╔╝  ██║   ██║   ██╔══██║██╔══██╗██║   ██║██╔══██╗
    ██║  ██╗╚██████╔╝███████╗██║   ██║   ██║  ██║██████╔╝╚██████╔╝██║  ██║
    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝
    `);
    console.log('='.repeat(78));
    console.log('\n🚀 SERVICES AVAILABILITY:');

    if (services.includes('react')) {
        const port = detectedPorts.react || '5173';
        console.log(`
        💻 FRONTEND (React)
           URL:      http://localhost:${port}/kozitabor/
        `);
    }

    if (services.includes('api')) {
        const port = detectedPorts.api || getEnvValue('kozitabor-api', 'API_PORT', '5000');
        console.log(`
        🔥 BACKEND (Node.js API)
           URL:      http://localhost:${port}
        `);
    }

    if (services.includes('db')) {
        const dbUrl = getEnvValue('kozitabor-api', 'DATABASE_URL', '');
        
        // Parse the DATABASE_URL string: postgresql://user:pass@host:port/db
        const dbMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
        
        const [ , user, pass, host, port, dbName ] = dbMatch || ['','N/A','N/A','N/A','N/A','N/A'];

        console.log(`
        🐘 DATABASE (PostgreSQL)
           Host:     ${host}:${port}
           DB Name:  ${dbName}
           User:     ${user}
           Pass:     ${pass}
        `);
    }
    
    console.log('='.repeat(78));
    console.log('💡 Tip: Use the "stop" command to shut down the environment.');
    console.log('='.repeat(78) + '\n');
};
/**
 * Promise-based interactive prompt
 */
const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
};

// seeders
const seedCore = () => {
    runStep('Seeding Core Data', 'npx dotenv -e .env.development npm run seed', 'kozitabor-api')
};
const seedUser = () => {
    runStep('Seeding Test Users', 'npx dotenv -e .env.development npm run seedUser', 'kozitabor-api')
};

// initialization
const init = async () => {
    console.log('🚀 Starting environment initialization...');

    // 1. Dependencies
    runStep('Installing API dependencies', 'npm install --legacy-peer-deps', 'kozitabor-api');
    runStep('Installing React dependencies', 'npm install --legacy-peer-deps', 'kozitabor-react');

    // 2. Database for Prisma (Temporary start)
    console.log('\n--- 🐘 Database Setup (Temporary) ---');
    runDB(); // Using your refactored runDB() function

    runStep('Waiting for database to be ready (5s)', 'node -e "setTimeout(() => {}, 5000)"');

    // 3. Prisma & Seed
    runStep('Generating Prisma Client', 'npx dotenv -e .env.development npx prisma generate', 'kozitabor-api');
    runStep('Running database migrations', 'npx dotenv -e .env.development npx prisma migrate dev --name init --skip-seed', 'kozitabor-api');

    // 4. Cleanup (Closing the database)
    console.log('\n--- 🧊 Cleaning up initialization resources ---');
    try {
        // We use 'stop' instead of 'down' here to keep the volumes/network intact 
        // but free up the RAM/CPU.
        runStep('Stopping Database', 'docker-compose stop', 'development-db');
    } catch (e) {
        console.log('⚠️ Note: Database was already stopped or failed to stop.');
    }

    console.log('\n✅ Initialization complete!');
    console.log('💡 All dependencies installed and DB schema is ready.');
    console.log('👉 Use "run" to start the development environment.\n');
};

// run dev
const runDB = async () => {
    runStep('Starting Database', 'docker-compose up -d', 'development-db');
};
const runAPI = () => {
    ensureLogDir();
    const apiLog = fs.openSync('./log/api.log', 'w');
    const api = spawn('npm', ['run', 'dev'], {
        detached: true,
        shell: true,
        windowsHide: true,
        cwd: path.join(process.cwd(), 'kozitabor-api'),
        stdio: ['ignore', apiLog, apiLog] // Visszaállítva a fájl-leíróra
    });
    api.unref();
    console.log('🔥 API started in background (see log/api.log)');
};
const runReact = () => {
    ensureLogDir();
    const reactLog = fs.openSync('./log/react.log', 'w');
    const react = spawn('npm', ['run', 'dev'], {
        detached: true,
        shell: true,
        windowsHide: true,
        cwd: path.join(process.cwd(), 'kozitabor-react'),
        stdio: ['ignore', reactLog, reactLog] // Visszaállítva a fájl-leíróra
    });
    react.unref();
    console.log('💻 React started in background (see log/react.log)');
};

// deploy
const readRemoteServerData = async () => {
    const configPath = path.join(process.cwd(), '.deploy.json');
    let config = { server: '', user: 'root', port: '22', key: '', targetDir: '/var/kozitabor' };

    if (fs.existsSync(configPath)) {
        try {
            const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config = { ...config, ...savedConfig };
        } catch (e) { }
    }

    console.log('\n--- 🚀 Deployment Setup ---');
    const server = await askQuestion(`🌐 Server IP [${config.server}]: `) || config.server;
    const user = await askQuestion(`👤 User [${config.user}]: `) || config.user;
    const port = await askQuestion(`🔌 Port [${config.port}]: `) || config.port;
    const keyPath = await askQuestion(`🔑 Key [${config.key || 'default'}]: `) || config.key;
    const targetDir = await askQuestion(`📂 Target [${config.targetDir}]: `) || config.targetDir;

    if (!server) {
        console.log('❌ Server required!');
        process.exit(1);
        return;
    }
    fs.writeFileSync(configPath, JSON.stringify({ server, user, port, key: keyPath, targetDir }, null, 2));

    return {server: server, user: user, port: port, keyPath: keyPath, targetDir: targetDir};
};
const checkRemoteDirBackup = async ({server, user, port, keyPath, targetDir}) => {
    // --- 1. TÁVOLI ELŐKÉSZÍTÉS (Mappa létrehozás + Backup) ---
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = `backup-${timestamp}.tar.gz`;
    const parentDir = path.posix.dirname(targetDir);

    const sshOpts = '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null';

    const localBashScript = `
        mkdir -p "${targetDir}"
        if [ -d "${targetDir}" ] && [ -n "$(ls -A "${targetDir}" 2>/dev/null)" ]; then
            tar -czf "${parentDir}/${backupName}" -C "${targetDir}" .
            echo "✅ Backup created: ${parentDir}/${backupName}"
        else
            echo "ℹ️ No existing files to backup or directory is new."
        fi
        exit
    `.trim();

    console.log(`\n🔍 Preparing remote environment...`);

    const sshArgs = [
        ...sshOpts.split(' '),
        port !== '22' ? '-p' : '', port !== '22' ? port : '',
        keyPath ? '-i' : '', keyPath ? keyPath : '',
        `${user}@${server}`,
        'bash'
    ].filter(arg => arg !== '');

    const executeRemoteScript = () => {
        return new Promise((resolve, reject) => {
            const ssh = spawn('ssh', sshArgs, { shell: true });

            // Betoljuk a scriptet az SSH bemenetére
            ssh.stdin.write(localBashScript);
            ssh.stdin.end();

            ssh.stdout.on('data', (data) => console.log(`  [Remote]: ${data.toString().trim()}`));
            ssh.stderr.on('data', (data) => {
                const msg = data.toString();
                if (!msg.includes('Warning: Permanently added')) {
                    console.error(`  [SSH Error]: ${msg.trim()}`);
                }
            });

            ssh.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`SSH exited with code ${code}`));
            });
        });
    };
    
    try {
        await executeRemoteScript();
        console.log('\n✨ Backup sequence finished!');
        return true;
    } catch (err) {
        console.error('❌ Remote preparation failed.');
        return false;
    }
};
const uploadFilesToRemote = async ({server, user, port, keyPath, targetDir}) => {
    const filesToUpload = [
        './build/api.tar.gz',
        './build/react.tar.gz',
        './docker-compose.yml',
        './nginx.conf'
    ];

    const keyFlag = keyPath ? `-i "${keyPath.replace(/\\/g, '/')}"` : '';
    const scpPortFlag = port !== '22' ? `-P ${port}` : '';

    console.log(`\n📦 Uploading files to ${targetDir}...`);
    
    let filesOK = true;
    for (const file of filesToUpload) {
        if (fs.existsSync(file)) {
            const fileName = path.basename(file);
            const scpCmd = `scp ${scpPortFlag} ${keyFlag} "${file}" ${user}@${server}:${targetDir}/${fileName}`;
            runStep(`Uploading ${fileName}`, scpCmd);
        } else {
            console.log(`⚠️ Warning: ${file} not found! Skipping.`);
            filesOK = false;
        }
    }

    console.log('\n✨ Upload sequence finished!');
    return filesOK;
};
const startRemoteServer = async ({server, user, port, keyPath, targetDir}) => {
    console.log('\n🏗️  Starting remote Docker services...');

    const dockerLaunchScript = `
        cd "${targetDir}" || { echo "❌ Folder not found"; exit 1; }

        echo "📦 Loading images from tarballs..."
        # A '-i' kapcsolóval fájlból töltünk be, nem a stdin-ről!
        docker load -i api.tar.gz
        docker load -i react.tar.gz

        echo "🚀 Starting services..."
        # Próbáljuk a modern 'docker compose'-t, ha nincs, a régit
        docker compose up -d || docker-compose up -d

        echo "✅ Deployment successful!"
        exit
    `.trim();

    const sshOpts = '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null';
    const sshArgs = [
        ...sshOpts.split(' '),
        port !== '22' ? '-p' : '', port !== '22' ? port : '',
        keyPath ? '-i' : '', keyPath ? keyPath : '',
        `${user}@${server}`,
        'bash'
    ].filter(arg => arg !== '');

    const executeDockerScript = () => {
        return new Promise((resolve, reject) => {
            const ssh = spawn('ssh', sshArgs, { shell: true });

            ssh.stdin.write(dockerLaunchScript);
            ssh.stdin.end();

            ssh.stdout.on('data', (data) => console.log(`  [Remote]: ${data.toString().trim()}`));
            ssh.stderr.on('data', (data) => {
                const msg = data.toString();
                // Szűrjük a Docker progress bar-okat és az ismert SSH warningokat
                if (!msg.includes('Warning: Permanently added') && !msg.includes('Loaded image')) {
                    console.log(`  [Log]: ${msg.trim()}`);
                }
            });

            ssh.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Docker launch failed (code ${code})`));
            });
        });
    };

    try {
        await executeDockerScript();
        console.log('\n✨ ALL DONE! Deployment successfully completed. ✨');
        console.log(`🌍 URL: https://${server}`); // Vagy ahol elérhető
        return true;
    } catch (err) {
        console.error('❌ Failed to start Docker services.');
        return false;
    }
};
const deploy = async () => {
    const conf = await readRemoteServerData();
    if (!await checkRemoteDirBackup(conf)) {
        return;
    }
    if (!await uploadFilesToRemote(conf)) {
        return;
    }
    await startRemoteServer(conf)
};

const commands = [
    {   // init
        pattern: /^init$/i,
        name: 'init',
        desc: 'Install deps and setup DB schema (leaves system stopped)',
        exec: async () => await init()
    },
    {   // seed data
        pattern: /^seed\s+data$/i,
        name: 'seed data',
        desc: 'Seed core application data',
        exec: () => seedCore()
    },
    {   // seed user
        pattern: /^seed\s+user$/i,
        name: 'seed user',
        desc: 'Seed admin user',
        exec: () => seedUser()
    },
    {   // seed
        pattern: /^seed$/i,
        name: 'seed',
        desc: 'Seed both core data and admin users',
        exec: () => {
            seedCore();
            seedUser();
        }
    },
    {   // stop|down|exit
        pattern: /^(stop|down|exit)$/i,
        name: 'stop',
        desc: 'Stop all services (aliases: down, exit)',
        exec: () => {
            console.log('\n🛑 Shutdown process started...');

            // 1. Docker
            try {
                runStep('Stopping Docker containers', 'docker-compose down', 'development-db');
            } catch (e) {
                console.log('⚠️ Docker shutdown failed or containers are not running.');
            }

            // 2. Clear Ports
            const ports = [5000, 5173];
            console.log(`\n--- 🧹 Freeing ports: ${ports.join(', ')} ---`);

            if (process.platform === 'win32') {
                ports.forEach(port => {
                    try {
                        const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
                        const pids = [...new Set(stdout.split('\n')
                            .map(line => line.trim().split(/\s+/).pop())
                            .filter(pid => pid && !isNaN(pid) && pid !== '0'))];
                        
                        pids.forEach(pid => {
                            console.log(`   👉 Terminating PID ${pid} on port ${port}...`);
                            execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
                        });
                    } catch (e) { /* Port already clear */ }
                });
            } else {
                try {
                    execSync('lsof -ti:5000,5173 | xargs kill -9', { stdio: 'ignore' });
                } catch (e) { }
            }

            console.log('\n✅ Everything stopped. Terminal is clean.');
        }
    },
    {   // run db
        pattern: /^run\s+db$/i,
        name: 'run db',
        desc: 'Start the Docker database container',
        exec: async () => {
            await runDB();
            writeActiveServiceList(['db']);
        }
    },
    {   // run api
        pattern: /^run\s+api$/i,
        name: 'run api',
        desc: 'Start the Backend API in the background',
        exec: async () => {
            const apiPort = await runAPI();
            writeActiveServiceList(['api'], {api: apiPort});
        }
    },
    {   // run react
        pattern: /^run\s+react$/i,
        name: 'run react',
        desc: 'Start the Frontend React app in the background',
        exec: async () => {
            const reactPort = await runReact();
            writeActiveServiceList(['react'], {react: reactPort});
        }
    },
    {   // run (all)
        pattern: /^run$/i,
        name: 'run',
        desc: 'Start all services (DB, API, React)',
        exec: async () => {
            console.log('🚀 Starting all services...');

            await runDB();
            const apiPort = await runAPI();
            const reactPort = await runReact();
            
            writeActiveServiceList(['db', 'api', 'react'], { 
                api: apiPort, 
                react: reactPort 
            });
        }
    },
    {   // build
        pattern: /^build$/i,
        name: 'build',
        desc: 'Build and export Docker images (using zlib)',
        exec: async () => {
            console.log('🏗️ Starting build process (Production)...');

            // 1. Extract VITE_API_BASE_URL from the root .env file
            let viteUrl = "/kozitabor/api"; 
            try {
                const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
                const match = envContent.match(/VITE_API_BASE_URL=["']?([^"'\s]+)["']?/);
                if (match) viteUrl = match[1];
                console.log(`ℹ️ Using VITE_API_BASE_URL from .env: ${viteUrl}`);
            } catch (e) {
                console.log('⚠️ Root .env file not found, using default URL.');
            }

            // 2. Prepare build directory
            if (!fs.existsSync('./build')) fs.mkdirSync('./build');

            // 3. Docker Build
            runStep('API Docker Build', 
                `docker build --platform linux/amd64 -t kozitabor-api:latest ./kozitabor-api`, '.');
            
            runStep('React Docker Build', 
                `docker build --platform linux/amd64 --build-arg VITE_API_BASE_URL="${viteUrl}" -t kozitabor-react:latest ./kozitabor-react`, '.');

            // 4. Export using Node.js streams and Zlib
            const exportImage = async (imageName, fileName) => {
                console.log(`   📦 Exporting and compressing ${imageName}...`);
                
                const dockerSave = spawn('docker', ['save', `${imageName}:latest`]);
                const gzip = zlib.createGzip();
                const destination = fs.createWriteStream(path.join('./build', `${fileName}.tar.gz`));

                try {
                    await pipe(dockerSave.stdout, gzip, destination);
                    console.log(`      ✅ ${fileName}.tar.gz created successfully.`);
                } catch (err) {
                    console.error(`      ❌ Error exporting ${fileName}:`, err.message);
                }
            };

            await exportImage('kozitabor-api', 'api');
            await exportImage('kozitabor-react', 'react');

            console.log('\n✨ Build completed successfully!');
        }
    },
    {   // deploy
        pattern: /^deploy$/i,
        name: 'deploy',
        desc: 'Backup remote, upload builds & configs to remote server via SCP',
        exec: async () => deploy()
    },
    {   // status
        pattern: /^status$/i,
        name: 'status',
        desc: 'Check the status of remote Docker containers',
        exec: async () => {
            const configPath = path.join(process.cwd(), '.deploy.json');
            if (!fs.existsSync(configPath)) {
                console.log('❌ No deployment config found. Run "deploy" first.');
                return;
            }

            const { server, user, port, key: keyPath, targetDir } = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const keyFlag = keyPath ? `-i "${keyPath.replace(/\\/g, '/')}"` : '';
            const sshPortFlag = port !== '22' ? `-p ${port}` : '';
            const sshOpts = '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null';

            console.log(`\n🔍 Fetching status from ${server}...`);
            
            // Lekérjük a ps-t és a logok utolsó sorait
            const statusCmd = `ssh ${sshOpts} ${sshPortFlag} ${keyFlag} ${user}@${server} "cd ${targetDir} && echo '--- Containers ---' && docker compose ps && echo '\n--- Resource Usage ---' && docker stats --no-stream"`;

            try {
                const output = execSync(statusCmd, { encoding: 'utf8' });
                console.log('\n' + output);
            } catch (err) {
                console.error('❌ Could not fetch status. Check your connection.');
            }
        }
    },
];

// Command search and execution logic
const findAndRun = async (input) => {
    if (!input) return false;

    for (const cmd of commands) {
        if (cmd.pattern.test(input)) {
            // Ensure we await the execution for async commands like 'build'
            await cmd.exec();
            return true;
        }
    }
    return false;
};

// --- MAIN ENTRY POINT ---

console.clear();
const isRunOK = await findAndRun(fullInput);

if (!isRunOK) {
    if (fullInput) {
        console.log(`\n❌ Unknown command: "${fullInput}"`);
    } else {
        console.log(`\n👋 Welcome to the Kozitabor DevTool!`);
    }

    console.log('\nAvailable commands:');
    console.log('-'.repeat(81));
    
    // List commands in a clean, aligned table
    commands.forEach(c => {
        // .padEnd(15) ensures descriptions align in a single column
        console.log(`  ${c.name.padEnd(15)} | ${c.desc}`);
    });

    console.log('-'.repeat(81));
    console.log('💡 Tip: Commands use regex, so "seed", "seed data", or "down" will work.');
    console.log('   Example: node dev-tool.mjs init\n');
    
    process.exit(0);
}