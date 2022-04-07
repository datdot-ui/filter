const bel = require('bel')
const csjs = require('csjs-inject')
const path = require('path')
const filename = path.basename(__filename)
const option = require('..')
const message_maker = require('message-maker')

var id = 0

function demo() {
// ---------------------------------------------------------------
    const myaddress = `demo-${id++}`
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const names = {}
    const message_id = to => ( outbox[to] = 1 + (outbox[to]||0) )

    function make_protocol (name) {
        return function protocol (address, notify) {
            names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
            return { notify: listen, address: myaddress }
        }
    }
    function listen (msg) {
        console.log('Demo receives', { msg })
        const { head, refs, type, data, meta } = msg // receive msg
        inbox[head.join('/')] = msg                  // store msg
        const [from] = head
        const name = names[from].name
        // handlers
        if (type === 'click') { 
            if (name === 'filter-option') activeOption(name)
        }
        // close dropdown menu of filter-option  when document.body clicked
        if (type === 'remove-active') {
            state[name] = type
        }
        if (type === 'unchecked') actionToggleCheck(message)
        if (type === 'checked') actionToggleCheck(message)
    }
// ---------------------------------------------------------------
    const state = {}
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
        ${option({ name: 'filter-option', data }, make_protocol('filter-option'))}
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
    function activeOption (name) {
        let old_state = state[name]
        if (old_state === undefined) state[name] = 'self-active'
        if (old_state === 'self-active') state[name] = 'remove-active'
        if (old_state === 'remove-active') state[name] = 'self-active'
        const { notify: name_notify, make: name_make, address: name_address } = recipients[name]
        name_notify(name_make({ to: name_address, type: state[name], data: {filename, line: 51} }))
    }

    function actionToggleCheck (message) {
        const { body } = message
        data.map( item => { 
            // * better to use return item for add more conditions
            if (item.id === body ) item.active = !item.active 
            return item
        })
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

document.body.append(demo())