import {Terminal,config} from './terminal.js'

var main = (function () {   
    return {
        listener: function () {
            new Terminal(document,config)._init();
        }
    };
})();


window.onload = main.listener;

