const bel = require('bel')
const csjs = require('csjs-inject')
const path = require('path')
const filename = path.basename(__filename)
const option = require('..')
const domlog = require('ui-domlog')

function demoComponent() {
    let recipients = []
    const data = [
        {id: 1, status: "Available", active: true}, 
        {id: 2, status: "Not available", active: false}, 
        {id: 3, status: "Hypercore", active: true},
        {id: 4, status: "Hyperdrive", active: false},
        {id: 5, status: "Cabal", active: true}
    ]

    // content
    const content = bel`
    <div class=${css.content}>
        ${option({page: 'demo', flow: 'filter', name: 'filter-option', data}, protocol('filter-option'))}
    </div>`
    
    // show logs
    let terminal = bel`<div class=${css.terminal}></div>`
    // container
    const container = wrap(content, terminal)
    return container

    function wrap (content) {
        const container = bel`
        <div class=${css.wrap}>
            <section class=${css.container}>
                ${content}
            </section>
            ${terminal}
        </div>
        `
        return container
    }

    /*************************
    * ------- Actions --------
    *************************/
    function activeOption (message) {
        const { page, from, flow } = message
        let state = recipients[from].state
        if (state === undefined) recipients[from].state = 'self-active'
        if (state === 'self-active') recipients[from].state = 'remove-active'
        if (state === 'remove-active') recipients[from].state = 'self-active'
        recipients[from]({page, from, flow, type: recipients[from].state, filename, line: 51})
    }

    function actionToggleCheck (message) {
        const { body } = message
        data.map( item => { 
            // * better to use return item for add more conditions
            if (item.id === body ) item.active = !item.active 
            return item
        })
        showLog({...message, filename, line: 61})
    }

     /*************************
    * ------- Protocol --------
    *************************/
    function protocol (name) {
        return send => {
            recipients[name] = send
            return receive
        }
    }

    /*************************
    * ------ Receivers -------
    *************************/
    function receive (message) {
        const { page, from, flow, type, action, body } = message
        showLog(message)
        if (type === 'init') showLog({page: 'demo', from, flow, type: 'ready', body, filename, line: 80})
        if (type === 'click') { 
            if (from === 'filter-option') activeOption(message)
        }
        // close dropdown menu of filter-option  when document.body clicked
        if (type === 'remove-active') {
            recipients[from].state = type
        }
        if (type === 'unchecked') actionToggleCheck(message)
        if (type === 'checked') actionToggleCheck(message)
    }

    // keep the scroll on bottom when the log displayed on the terminal
    function showLog (message) { 
        sendMessage(message)
        .then( log => {
            terminal.append(log)
            terminal.scrollTop = terminal.scrollHeight
        }
    )}

    /*********************************
    * ------ Promise() Element -------
    *********************************/
    async function sendMessage (message) {
        return await new Promise( (resolve, reject) => {
            if (message === undefined) reject('no message import')
            const log = domlog(message)
            return resolve(log)
        }).catch( err => { throw new Error(err) } )
    }
    
}

const css = csjs`
*, *:before, *:after {
    box-sizing: inherit;
}
html {
    box-sizing: border-box;
    height: 100%;
}
body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    background-color: rgba(0, 0, 0, .1);
    height: 100%;
}
.wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 75% 25%;
    height: 100%;
}
.container {
    padding: 25px;
    overflow-y: auto;
}
.container > div {
    margin-bottom: 20px;
}
.content {
    width: 150px;
}
.content > div button {
    margin-right: 10px;
}
.terminal {
    background-color: #212121;
    color: #f2f2f2;
    font-size: 13px;
    overflow-y: auto;
}
.hide {
    animation: disppear .5s linear forwards;
}
@keyframes disppear {
    0% {
        opacity: 1;
        top: 53px;
    }
    100% {
        opacity: 0;
        top: 45px;
    }
}
`

document.body.append( demoComponent() )