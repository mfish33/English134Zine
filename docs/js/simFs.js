export default class FileSystem{

    constructor(fileSystem,path=[]) {
        this.fileSystem = fileSystem
        this.path = path
    }

    get cwd() {
        return this.path.join('/')
    }

    go(dir) {
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

    newFile(file) {
        if(this.path.length) {
            this._traverse()[file] = null   
        }else {
            this.fileSystem[file] = null
        }
        return this
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

    _traverse(obj = this.fileSystem,count = this.path.length) {
        if(this.path.length && count == 0) {
            return obj
        }
        return this._traverse(obj[this.path[this.path.length - count]],count-1)
    }
    
}