import BaseTerminal from './baseTerminal.js'

const config = {
    general_help: "Below there's a list of commands that you can use.\nYou can use autofill by pressing the TAB key, autocompleting if there's only 1 possibility, or showing you a list of possibilities.",
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
                let fileName = cmdComponents[1]
                if(typeof this.fs.currentDIR()[fileName] == 'string') {
                    this._type(this.fs.currentDIR()[fileName], this._unlock.bind(this));
                } else {
                    this._type('Not a valid file name', this._unlock.bind(this));
                }
            },
            help: 'Read FILE(s) content and print it to the standard output (screen).'
        }
    };

    ls() {
        return{
            command: () => {
                let result = Object.keys(this.fs.currentDIR()).join('\n')
                this._type(result.trim(), this._unlock.bind(this));
            },
            help: 'List information about the files and folders (the current directory by default).'
        }
        
    };

    node() {
        return {
            command: (cmdComponents) => {
                let fileName = cmdComponents[1]
                if(fileName && fileName.match(/\w+\.js/) && typeof this.fs.currentDIR()[fileName] == 'string') {
                    eval(this._jsParse(this.fs.currentDIR()[fileName]))
                    this._type('', this._unlock.bind(this));
                } else if(fileName && fileName.match(/\w+/) && typeof this.fs.currentDIR()[`${fileName}.js`] == 'string'){
                    eval(this._jsParse(this.fs.currentDIR()[`${fileName}.js`]))
                    this._type('', this._unlock.bind(this));
                } else {
                    this._type('Not a valid file name', this._unlock.bind(this));
                }
            },
            help:'execute javascript file. Usage: node filename'
        }
        
    };

    _jsParse(file) {
        let consoleLogs = file.match(/console\.log\([^;]*/g)
        if(consoleLogs) {
            for(let log of consoleLogs) {
                file = file.replace(log,`this._type(${log.replace('console.log(','').slice(0,-1)}, this._unlock.bind(this))`)
            }
        }
        return file
    }

    cd() {
        return {
            command: (cmdComponents) => {
                let dir = cmdComponents[1] //zero is the comand issued
                if(!dir) {
                    this.fs.path = []
                    this._type('', this._unlock.bind(this));
                }else if(dir == '..') {
                    this.fs.up()
                    this._type('', this._unlock.bind(this));
                } else {
                    let splitPath = dir.split('/')
                    if(splitPath.reduce((acc,curr) => acc && acc[curr] ? acc[curr] : null,this.fs.currentDIR())) {
                        splitPath.forEach(dir => this.fs.go(dir))
                        this._type('', this._unlock.bind(this));
                    } else {
                        this._type('The system cannot find the path specified.', this._unlock.bind(this));
                    }
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
                this._type('', this._unlock.bind(this));
            },
            help: 'Make a directory.'
        }
        
    };

    rmdir() {
        return {
            command: (cmdComponents) => {
                let dir = cmdComponents[1] //zero is the comand issued
                if(this.fs.currentDIR()[dir] && typeof this.fs.currentDIR()[dir] != 'string') {
                    this.fs.rmdir(dir)
                    this._type('', this._unlock.bind(this));
                } else {
                    this._type('The system cannot find the path specified.', this._unlock.bind(this));
                }   
            },
            help: 'Remove directory'
        }
        
    };

    rm() {
        return {
            command: (cmdComponents) => {
                let dir = cmdComponents[1] //zero is the comand issued
                if(typeof this.fs.currentDIR()[dir] == 'string') {
                    this.fs.rmdir(dir)
                    this._type('', this._unlock.bind(this));
                } else {
                    this._type('The system cannot find the file specified.', this._unlock.bind(this));
                }   
            },
            help: 'Remove files'
        }
        
    };

    tree() {
        return {
            command: () => {
                this._type(this.fs.getTree().substring(1), this._unlock.bind(this));
            },
            help: 'Show tree of current directory.'
        }      
        
    };

    touch() { 
        return {
            command: (cmdComponents) => {
                let [,fileName] = cmdComponents
                this.fs.newFile(fileName)  
                fileName.match(/\w+\.\w+/g) ? this._type('', this._unlock.bind(this)) : this._type('Not a valid file name', this._unlock.bind(this))
            },
            help: 'Change file timestamps. If the file doesn\'t exist, it\'s created an empty one.'
        }
        
    };

    setFile() {
        return {
            command: (cmdComponents) => {
                let [_,fileName,...data] = cmdComponents
                if(Object.keys(this.fs.currentDIR()).includes(fileName) && fileName.match(/\w+\.\w+/g)) {
                    this.fs.currentDIR()[fileName] = Array.isArray(data) ? data.join(' ') : data
                    this._type('', this._unlock.bind(this))
                } else {
                    this._type('Not a valid file name', this._unlock.bind(this))
                }
            },
            help: 'set a desired file. Usage: setFile filename data'
        }
    
    };

    ng() {
        return{
            command: (cmdComponents) => {
                let ngComand = cmdComponents[1]
                let bar = '||||||||||||||||||||||||||||\n';
                if(ngComand == 'deploy'){
                    if(this.ngBuilt) {
                        this._typeScroll(`Deploying Website:
        
                        Making routes
                        ${bar}
                        Loading Domain
                        ${bar}
                        Minifying Code
                        ${bar}
                        `, this._unlock.bind(this),true);
                        document.cookie = "terminalOver=true";
                        setTimeout(()=>window.location.replace('https://maxmfishernj.wixsite.com/mysite'),5500)
                    } else {
                        this._type('You neeed to build the website before you can deploy it', this._unlock.bind(this));
                    }
                }else if(ngComand == 'build') {
                    this._typeScroll(`Building Website:
        
                    Building Homepage
                    ${bar}
                    Loading images
                    ${bar}
                    Making blog pages
                    ${bar}
                    `, this._unlock.bind(this),true);
                    this.ngBuilt = true
                } else {
                    this._type(`ng ${ngComand}:command not found`, this._unlock.bind(this));
                }
            },
            help: 'ng build - Compile Website \n ng deploy - Deploy website'
        }
    
    };

    sudo() {
        return {
            command: () => {
                this._type('Unable to sudo using a web client.', this._unlock.bind(this));
            },
            help: 'Execute a command as the superuser.'
        }
        
    }

    whoami() {
        return {
            command: () => {
                var result = "Username: " + this.config.user + "\nHost: " + this.config.host + "\nPlatform: " + navigator.platform + "\nAccessible cores: " + navigator.hardwareConcurrency + "\nLanguage: " + navigator.language;
                this._type(result, this._unlock.bind(this));
            },
            help: 'Print the user name associated with the current effective user ID and more info.'
        }
        
    };

    date() {
        return {
            command: () => {
                this._type(new Date().toString(), this._unlock.bind(this));
            },
            help: 'Print the system date and time.'
        }
    };
        
}

export{Terminal,config}