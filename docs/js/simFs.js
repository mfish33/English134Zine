export default class FileSystem{

    constructor(fileSystem,path=[]) {
        this.fileSystem = fileSystem
        this.path = path
    }

    get cwd() {
        return this.path.join('/')
    }

    _go(dir) {
        this.path.push(dir)
        if(this._traverse()==null) {
            return null
        }
        return this
    }

    up() {
        if(this.path.length) {
            this.path.pop()
            return this
        }
        return null
    }

    currentDIR() {
        if(this.path.length) {
            return this._traverse()
        }
        return this.fileSystem
    }

    mkdir(dir) {
        if(this.path.length)
        {
            this._traverse()[dir] = {}
        }else {
            this.fileSystem[dir] = {}
        }
        
        return this
    }

    rmdir(dir) {
        if(this.path.length)
        {
            delete this._traverse()[dir]
        }else {
            delete this.fileSystem[dir]
        }
        return this
    }

    newFile(filePath) {
        let path = filePath.split('/')
        let fileName = path.pop()
        let questionPath = path.reduce((acc,curr) => acc && acc[curr] ? acc[curr] : null,this.currentDIR())
        if(questionPath[fileName]) {
            return true
        } else if(questionPath) {
            questionPath[fileName] = ''
            return true
        }
        return false
    }

    getTree(obj = this.currentDIR(),level = 0) {
        let indent = level? '>' : ''
        for(let i = 0; i< level; i++){
            indent = `---${indent}`
        }
        return Object.keys(obj).reduce((acc,curr) => {
            if(typeof obj[curr] != 'string') {
                return acc += `\n${indent}${curr}${this.getTree(obj[curr],level+1)}`
            }
            return acc += `\n${indent}${curr}`
        },'')
    }

    _traverse() {
        return this.path.reduce((acc,curr) => acc[curr],this.fileSystem)
    }


    go(path) {
        let oldPath = [...this.path]
        let questionPath = path.split('/').reduce((acc,curr) => acc && acc.currentDIR()[curr] ? acc._go(curr) : null,this)
        if(!questionPath) {
            this.path = oldPath
            return false
        }
        return true
    }

    retrieveFile(path) {
        let questionFile = path.split('/').reduce((acc,curr) => acc && (acc[curr] || acc[curr] == '') ? acc[curr] : null,this.currentDIR())
        return typeof questionFile == 'string' ? questionFile : null
    }

    setFile(path,data) {
        let pathSplit = path.split('/')
        let fileName = pathSplit.pop()
        let questionDir = pathSplit.reduce((acc,curr) => acc && acc[curr] ? acc[curr] : null,this.currentDIR())
        if(typeof questionDir[fileName] == 'string') {
            questionDir[fileName] = data
            return true
        }
        return false
    }
    
}