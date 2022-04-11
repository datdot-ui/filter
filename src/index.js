const bel = require('bel')
const csjs = require('csjs-inject')
const button = require('datdot-ui-button')
const icon = require('datdot-ui-icon')
const path = require('path')
const filename = path.basename(__filename)
const message_maker = require('message-maker')

var id = 0
var count = 0

module.exports = filterOption

function filterOption ({ name, data }, parent_protocol) {

// ---------------------------------------------------------------
    const myaddress = `${__filename}-${id++}`
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const names = {}
    const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

    const {notify, address} = parent_protocol(myaddress, listen)
    names[address] = recipients['parent'] = { name: 'parent', notify, address, make: message_maker(myaddress) }
    notify(recipients['parent'].make({ to: address, type: 'ready', refs: ['old_logs', 'new_logs'] }))

    function make_protocol (name) {
        return function protocol (address, notify) {
            names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
            return { notify: listen, address: myaddress }
        }
    }

    function listen (msg) {
        const {head, refs, type, data, meta } = msg
        inbox[head.join('/')] = msg                  // store msg
        const [from, to, msg_id] = head    
        console.log('Index receives', { msg })
        const { make } = recipients['parent']
        // handlers
        if (type === 'ready') return
        if (type ==='click' && names[from].name.includes('filter-option')) actionFilterOption(msg)
        notify(make({ to: address, type, data }))
    }
// ---------------------------------------------------------------  

    // icon
    // const iconOption = icon({ theme: { style: `${css.icon}` }, path: './src/svg', name: 'option' }, make_protocol(`icon-${count++}`))
    // button
    const theme1 = {
        style: `
            ${css['filter-option-button']} ${css['option-list']}
        `
    }
    const filterOption = button({ role: 'listbox', theme: theme1, classlist: `${css['filter-option-button']}`, name: 'filter-option', icons: {icon: { name: 'option', is_shadow: true, theme: {props: { fill: 'white'}}} } }, make_protocol(`filter-option-${count++}`))
    const optionAction = bel`<div class="${css.action} ${css.option}">${filterOption}</div>`
    // filter option
    const optionList = bel`<ul class="${css['option-list']}" onclick=${(e) => actionOptionList(e)}></ul>`
    // get lits
    optionListRender(data).then( buttons => {
        buttons.map( (item, i) => { 
            const li = bel`<li>${item}</li>`
            // need to set an id to button for toggle using, because Safari cannot compare body or from (string issue)
            item.setAttribute('id', i+1)
            optionList.append(li) 
        })
        return buttons
    })

    // ! use window.onload is not worked
    document.addEventListener('DOMContentloaded', triggerOptionInactive())

    return optionAction

    /*************************
    * ------- Actions --------
    *************************/
    function triggerOptionInactive () {
        document.body.addEventListener('click', (event) => {
            const target = event.target
            const name = target.ariaLabel
            // * if target is same as filterOption, then keep optionList opening
            if (target === filterOption) return
            // * find css name first of filterOption button
            let style = [...filterOption.classList].filter( className => className.includes('active'))
            // if class name condition is true
            if (filterOption.classList.contains(style)) {
                // * remove optionList when add css.hide
                // ! cannot use function to repeat using, because it's loaded from document.body
                // ! cannot read page, flow, name properties
                optionList.classList.add(css.hide)
                setTimeout( () => optionList.remove(), 500)
                /* 
                * filter-option button needs to send 'remove-active' for 
                * main component and button component to check recipients[from].state 
                * and remove active status 
                */
                const { make } = recipients['parent']
                const { notify: name_notify, make: name_make, address: name_address } = recipients[name]
                name_notify(name_make({ to: name_address, type: 'remove-active' }))
                notify(make({ to: address, type: 'remove-active' }))
            }
        })
    }

    function actionOptionList (event) {
        event.stopPropagation()
        const target = event.target
        const classList = [...target.classList]
        const listStyle = classList.filter( style => style.includes('btn'))
        if (!target.classList.contains(listStyle)) return
        // for recipients[name] using
        const id = target.id
        // if icon is not contained css.hide then do toggling it on unchecked/checked 
        const type = target.classList.contains(css.checked) ? 'unchecked' : 'checked'
        target.classList.toggle(css.checked)

        const { make } = recipients['parent']
        notify(make({ to: address, type, data: { id: Number(id)} }))
    }

    function displayOptionList (msg) {
        optionAction.append(optionList)
        if (optionList.children.length > 0) optionList.classList.remove(css.hide)
    }

    function hideOptionList (msg) {
        optionList.classList.add(css.hide)
        // remove optionList when add css.hide
        optionList.classList.add(css.hide)
        setTimeout( () => optionList.remove(), 500)
    }

    function actionFilterOption (msg) {
        const { type, data: { expanded } } = msg
        if (expanded) displayOptionList(msg)
        else if (!expanded) hideOptionList(msg)
    }


    /*********************************
    * ------ Promise() Element -------
    *********************************/


    async function optionListRender (data) {
        const theme2 = {
            style: `
             ${css.icon} ${css.circle} ${css['option-list-el']}
            `
        }
        
        return await new Promise((resolve, reject) => {
            if (data === undefined) reject( )
            const lists = data.map( item => {
                let style
                const check = icon({ theme: { style: `${css.icon}` }, name: 'check', path: './src/svg' }, make_protocol(`icon-${count++}`))
                const circle = bel`<span class=${css.circle}></span>`
                if (item.status === 'Available') style = css.on
                if (item.status === 'Not available')  style = css.off
                if (item.status === 'Hypercore') style = css.core
                if (item.status === 'Hyperdrive') style = css.drive
                if (item.status === 'Cabal') style = css.cabal
                circle.classList.add(style)
                const btn = button({ theme: theme2 , classlist: `${css['option-list-el']}`, role: 'button', name: item.status, icons: { icon: { name: 'check', classlist: `${css.icon}`, is_shadow: true, theme: {props: { fill: 'white'}} }, select: { name: 'check' } }, body: item.status }, make_protocol(`${item.status}-${count++}`))
                return btn
            })
            return resolve(lists)
        }).catch( err => { throw new Error(err)} )
    }
}

const css = csjs`
.filter-option-button {
    background-color: black;
    border-radius: 8px;
    color: #707070;
    color: white;
    padding: 0;
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.filter-option-button:hover {
    color: black;
    transition: background-color 0.3s linear;
    background-color: #707070;
}
.option-list-el {
    margin: 0 10px 0 0;
    width: 100%;
    text-align: left;
    transition: background-color 0.3s linear;
    color: white;
}
.option-list-el:hover {
    background-color: #707070;
    transition: background-color 0.3s linear;
    color: black;
}
.option {
    position: relative;
    display: grid;
    justify-items: right;
    animation: showup .25s linear forwards;
    margin: 0; 
}
.option-list {
    margin: 0;
    padding: 0;
    list-style: none;
}
.option-list li  { 
    margin: 0; 
    padding: 0;
    list-style: none;
    background-color: #000;
    margin: 0;
    padding: 0;
    width: 100%;
    text-align: left;
    transition: background-color 0.3s linear;
}
.option-list li:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}
.option-list li:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}
.option-list li > button .icon-check {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s linear;
}
.option-list .icon-check svg path {
    stroke: #fff;
}
.option-list li > button.checked .icon-check {
    opacity: 1;
}
.status {
    display: grid;
    grid-template-rows: 32px;
    grid-template-columns: 18px 27px auto;
    padding: 0 10px;
    align-items: center;
    pointer-events: none;
}
.circle {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #000;
    justify-self: center;
    pointer-events: none;
}
.on {
    background-color: #109B36;
}
.off {
    background-color: #d9d9d9;
}
.core {
    background-color: #BCE0FD;
}
.drive {
    background-color: #FFDFA2;
}
.cabal {
    background-color: #E9D3FD;
}
.icon {
    width: 16px;
    pointer-events: none;
    opacity: 1;
}
.icon-check {}
.icon-option {}
.hide {
    animation: disappear .25s linear forwards;
}
@keyframes showup {
    0% {
        opacity: 0;
        top: 45px;
    }
    100% {
        opacity: 1;
        top: 53px;
    }
}
@keyframes disappear {
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