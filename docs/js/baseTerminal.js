import TypeSimulator from './typeSimulator.js'
import FileSystem from './simFs.js'
import defaultFileSystem from './defaultfs.js'

export default class BaseTerminal {
    constructor (document, config) { 
        this.prompt = document.getElementById("prompt")
        this.cmdLine = document.getElementById("cmdline")
        this.output = document.getElementById("output"),
        this.config = config
        this.typeSimulator = new TypeSimulator(config.scrollingTypeDelay, output);
        this.fs = new FileSystem(Object.assign({},defaultFileSystem))
        this.history = []
        this.historyCounter = -1
    }

    get completePrompt() {
        return `${this.config.user}@${this.config.host}:~${this.fs.cwd}$`   
    }

    _type(text, callback = this._unlock.bind(this)) {
        this.typeSimulator.type(text, callback);
    };

    _typeScroll(text, callback = this._unlock.bind(this)) {
        this.typeSimulator.typeScroll(text, callback)
    }

    _exec() {
        var command = this.cmdLine.value;
        this.cmdLine.value = "";
        this.prompt.textContent = "";
        this.output.innerHTML += "<span class=\"prompt-color\">" + this.completePrompt + "</span> " + command + "<br/>";
    };

    _init() {
        this.cmdLine.disabled = true;
        document.body.addEventListener("click", this._focus.bind(this));
        this.cmdLine.addEventListener("keydown", function (event) {
            if (event.which === 13 || event.keyCode === 13) {
                this._handleCmd();
                this._ignoreEvent(event);
            } else if (event.which === 9 || event.keyCode === 9) {
                this._ignoreEvent(event);
            } else if(event.keyCode == 38) {
                this._upHistory()
            } else if(event.keyCode == 40) {
                this._downHistory()
            }
        }.bind(this));
        this._reset();
    };


    _lock() {
        this._exec();
        this.cmdLine.blur();
        this.cmdLine.disabled = true;
    };

    _unlock() {
        this.cmdLine.disabled = false;
        this.prompt.textContent = this.completePrompt
        this._scrollToBottom();
        this._focus();
    };


    _handleCmd() {
        this.cmdLine.value ? this.history.push(this.cmdLine.value) : null
        this.historyCounter = -1
        let rawData = this.cmdLine.value
        //console.log(rawData)
        let cmdComponents = this.cmdLine.value.trim().split(" ");
        let [command] = cmdComponents
        this._lock();
        if(command.charAt(0) != '_' && this[command] && this[command]().command) {
            this[command]().command(cmdComponents,rawData)
        } else {
            this._invalidCommand(cmdComponents)
        }
    };

    _upHistory() {
        if(this.historyCounter == -1) {
            this.historyCounter = this.history.length
        }
        this.historyCounter --
        let command = this.history[this.historyCounter]
        if(command) {
            this.cmdLine.value = command
        } else {
            this.historyCounter = 1
        }
    }

    _downHistory() {
        this.historyCounter ++
        let command = this.history[this.historyCounter]
        if(command) {
            this.cmdLine.value = command
        } else {
            this.historyCounter = this.history.length-1
        }
    }

    _scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    _ignoreEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    _reset() {
        this.output.textContent = "";
        this.prompt.textContent = "";
        this._type(this.config.welcome ,() => this._unlock());
    }

    _focus() {
        this.cmdLine.focus();
    }

    _resetfs() {
        this.fs = new FileSystem(Object.assign({},defaultFileSystem))
    }

    _getAllMethodNames(obj) {
        let methods = new Set();
        while (obj = Reflect.getPrototypeOf(obj)) {
        let keys = Reflect.ownKeys(obj)
        keys.forEach((k) => methods.add(k));
        }
        return methods;
    }

    _invalidCommand(cmdComponents) {
            let [command] = cmdComponents
            command == '' ? this._unlock() : this._type(`${command}: command not found.`)
    }   

    //DEFAULT COMMANDS

    help() {
        return {
            command: () => {
                let defaultHelp = this.config.general_help + "\n\n";
                let commandHelp =  Array.from(this._getAllMethodNames(this))
                    .filter(item => item!='constructor' && item != 'valueOf' && item.charAt(0)!='_' && item != 'completePrompt') //have to filter completePrompt because it's a getter
                    .map(cmd => this[cmd]().help ? `${cmd} - ${this[cmd]().help}\n`: '').join('')
                this._type(defaultHelp+commandHelp, this._unlock.bind(this));
            },
            help: 'Print this menu.'
        }
    }

    clear() {
        return {
            command: () => {
                this.output.textContent = "";
                this.prompt.textContent = "";
                this.prompt.textContent = this.completePrompt;
                this._unlock();
            },
            help: 'Clear the terminal screen.'
        }
        
    }

    reboot() {
        return {
            command: () => {
                this._resetfs()
                this._typeScroll('Preparing to reboot...\n\n3...\n\n2...\n\n1...\n\nRebooting...\n\n', this._reset.bind(this));
                this.history = []
                this.historyCounter = -1
            },
            help: 'Reboot the system.'
        }
    };

}