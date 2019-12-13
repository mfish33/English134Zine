import BaseTerminal from './baseTerminal.js'

const config = {
    general_help: "Below there's a list of commands that you can use.",
    welcome: "Welcome to the Maker Madness blog to build the blog please use the terminal\n type help for more info",
    host: "MakerMadness.com",
    user: "guest",
    scrollingTypeDelay: 20
}

class Terminal extends BaseTerminal{
    constructor(document,config) {
        super(document,config)
        this.ngBuilt = false
    }

    /*
    DEFAULT COMMANDS:
    help - displays all help feilds for all functions
    clear - clears the terminal display
    reboot - clears the display. Shows welcome message. Resets Filesystem.
    */

    cat() {
        return {
            command: (cmdComponents) => {
                let [,filePath] = cmdComponents
                let file = this.fs.retrieveFile(filePath)
                file = file == '' ? '\n' : file
                file ? this._type(file) : this._type('Not a valid file name');
                
            },
            help: 'Read FILE(s) content and print it to the standard output (screen).'
        }
    };

    ls() {
        return{
            command: () => {
                let result = Object.keys(this.fs.currentDIR()).join('\n')
                this._type(result.trim());
            },
            help: 'List information about the files and folders (the current directory by default).'
        }
        
    };

    node() {
        return {
            command: (cmdComponents) => {
                let [,filePath] = cmdComponents
                filePath = filePath && !filePath.match(/[\w/]+.js/) && filePath.match(/[\w/]+/) ? `${filePath}.js` : filePath
                let file = this.fs.retrieveFile(filePath)
                if(file) {
                    try{
                        eval(this._jsParse(file))
                        this._unlock();
                    } catch(e) {
                        this._type(e);
                    }           
                } else {
                    this._type('Not a valid file name');
                }
            },
            help:'execute javascript file. Usage: node filename'
        }
        
    };

    _jsParse(file) {
        let consoleLogs = file.match(/console\.log\([^;]*/g)
        if(consoleLogs) {
            for(let log of consoleLogs) {
                file = file.replace(log,`this._type(${log.replace('console.log(','').slice(0,-1)})`)
            }
        }
        return file
    }

    cd() {
        return {
            command: (cmdComponents) => {
                let [,dir] = cmdComponents
                if(!dir) {
                    this.fs.path = []
                    this._unlock();
                }else if(dir == '..') {
                    this.fs.up()
                    this._unlock();
                } else {
                    this.fs.go(dir) ? this._unlock() : this._type('The system cannot find the path specified.');
                }   
            },
            help: 'Change the current working directory.'
        }
    
    };

    mkdir() {
        return {
            command: (cmdComponents) => {
                let [dir] = cmdComponents
                this.fs.mkdir(dir)
                this._unlock();
            },
            help: 'Make a directory.'
        }
        
    };

    rmdir() {
        return {
            command: (cmdComponents) => {
                let [,dir] = cmdComponents
                if(this.fs.currentDIR()[dir] && typeof this.fs.currentDIR()[dir] != 'string') {
                    this.fs.rmdir(dir)
                    this._unlock();
                } else {
                    this._type('The system cannot find the path specified.');
                }   
            },
            help: 'Remove directory'
        }
        
    };

    rm() {
        return {
            command: (cmdComponents) => {
                let [dir] = cmdComponents 
                if(typeof this.fs.currentDIR()[dir] == 'string') {
                    this.fs.rmdir(dir)
                    this._unlock();
                } else {
                    this._type('The system cannot find the file specified.');
                }   
            },
            help: 'Remove files'
        }
        
    };

    tree() {
        return {
            command: () => {
                this._type(this.fs.getTree().substring(1));
            },
            help: 'Show tree of current directory.'
        }      
        
    };

    touch() { 
        return {
            command: (cmdComponents) => {
                let [,filePath] = cmdComponents 
                this.fs.newFile(filePath)  ? this._unlock() : this._type('Not a valid file name')
            },
            help: 'Change file timestamps. If the file doesn\'t exist, it\'s created an empty one.'
        }
        
    };

    setFile() {
        return {
            command: (cmdComponents) => {
                let [,filePath,...data] = cmdComponents
                this.fs.setFile(filePath,data.join(' ')) ? this._unlock() : this._type('Not a valid file name');
            },
            help: 'set a desired file. Usage: setFile filename data'
        }
    
    };

    ng() {
        let bar = '||||||||||||||||||||||||||||\n';
        return{
            command: (cmdComponents) => {
                let [,ngComand] = cmdComponents
                let questionFunction = this.ng()[ngComand]
                if(typeof questionFunction == 'function' && ngComand != 'command') {
                    questionFunction()
                } else {
                    this._type(`${ngComand} is not a command of ng`);
                }
            },
            build: () => {
                this._typeScroll(`Building Website:

                Building Homepage
                ${bar}
                Loading images
                ${bar}
                Making blog pages
                ${bar}
                `);
                this.ngBuilt = true
            },
            deploy: () => {
                if(this.ngBuilt) {
                    this._typeScroll(`Deploying Website:
    
                    Making routes
                    ${bar}
                    Loading Domain
                    ${bar}
                    Minifying Code
                    ${bar}
                    `);
                    document.cookie = "terminalOver=true";
                    setTimeout(()=>window.location.replace('https://maxmfishernj.wixsite.com/mysite'),5500)
                } else {
                    this._type('You neeed to build the website before you can deploy it');
                }
            },
            help: 'ng build - Compile Website \n ng deploy - Deploy website'
        }
    
    };

    sudo() {
        return {
            command: () => {
                this._type('Unable to sudo using a web client.');
            },
            help: 'Execute a command as the superuser.'
        }
        
    }

    whoami() {
        return {
            command: () => {
                var result = "Username: " + this.config.user + "\nHost: " + this.config.host + "\nPlatform: " + navigator.platform + "\nAccessible cores: " + navigator.hardwareConcurrency + "\nLanguage: " + navigator.language;
                this._type(result);
            },
            help: 'Print the user name associated with the current effective user ID and more info.'
        }
        
    };

    date() {
        return {
            command: () => {
                this._type(new Date());
            },
            help: 'Print the system date and time.'
        }
    };
        
}

export{Terminal,config}