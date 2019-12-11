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
        this.fs = new FileSystem(JSON.parse(JSON.stringify(defaultFileSystem)))
    }

    get completePrompt() {
        return `${this.config.user}@${this.config.host}:~${this.fs.cwd}$`   
    }

    _type(text, callback) {
        this.typeSimulator.type(text, callback);
    };

    _typeScroll(text, callback) {
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
        this._lock(); // Need to lock here since the sidenav elements were just added
        document.body.addEventListener("click", this._focus.bind(this));
        this.cmdLine.addEventListener("keydown", function (event) {
            if (event.which === 13 || event.keyCode === 13) {
                this._handleCmd();
                this._ignoreEvent(event);
            } else if (event.which === 9 || event.keyCode === 9) {
                this._ignoreEvent(event);
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
        var cmdComponents = this.cmdLine.value.trim().split(" ");
        let [command] = cmdComponents
        this._lock();
        if(command.charAt(0) != '_' && this[command] && this[command]().command) {
            this[command]().command(cmdComponents)
        } else {
            this._invalidCommand(cmdComponents)
        }
    };

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
        this.fs = new FileSystem(JSON.parse(JSON.stringify(defaultFileSystem)))
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
            this._type(command == '' ? '' : `${command}: command not found.`, this._unlock.bind(this));
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
            },
            help: 'Reboot the system.'
        }
    };
}