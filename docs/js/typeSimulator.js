export default class TypeSimulator {
    constructor(timer, output,document) {
        this.document = document
        var timer = parseInt(timer);
        if (timer === Number.NaN || timer < 0) {
            throw new Error("Invalid value " + timer + " for argument 'timer'.");
        }
        this.timer = timer;
        this.output = output;
    }

    type(text, callback) {
        text = typeof text == 'string' ? text : text.toString()
        var output = this.output;
        output.innerHTML += (text.replace(/\n/g, "<br/>")) + "<br/>";
        callback(); 
    }

    typeScroll(text,callback) {     
        let timeOffset = 0
        for(let char of text) {
            let isNewLine = char == '\n'
            isNewLine ? timeOffset += 2 : timeOffset++
            setTimeout(()=>output.innerHTML += isNewLine ? "<br/>" : char,this.timer * timeOffset)
            
        }
        setTimeout(() => callback(),this.timer * timeOffset)
        

    }

    scrollToBottom() {
        window.scrollTo(0, this.document.body.scrollHeight);
    }
};
