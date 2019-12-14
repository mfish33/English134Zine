export default class TypeSimulator {
    constructor(timer, output) {
        if (timer === Number.NaN || timer < 0) {
            throw new Error(`Invalid value ${timer} for timer config'.`);
        }
        this.timer = timer;
        this.output = output;
    }

    type(text, callback) {
        text = typeof text == 'string' ? text : text.toString()
        if(text) {
            this.output.innerHTML += (text.replace(/\n/g, "<br/>")) + "<br/>";
        }
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
