const bel = require('bel')
const csjs = require('csjs-inject')
const button = require('datdot-ui-button')
const svg = require('datdot-ui-graphic')
const path = require('path')
const filename = path.basename(__filename)

module.exports = filterOption

function filterOption ({page, flow, name, data}, protocol) {
    const widget = 'ui-filter-option'
    const send2Parent = protocol( receive )
    send2Parent({page, from: name, flow: flow ? `${flow}/${widget}` : widget, type: 'init', filename, line: 13})
    let recipients = []
    // icon
    const iconOption = svg( { css: `${css.icon} ${css['icon-option']}`, path: 'assets/option.svg' })
    // button
    const filterOption = button({page, flow: flow ? `${flow}/${widget}` : widget,  name: 'filter-option', content: iconOption, style: 'default', color: 'fill-grey'}, optionProtocol('filter-option'))
    const optionAction = bel`<div class="${css.action} ${css.option}">${filterOption}</div>`
    // filter option
    const optionList = bel`<ul class="${css['option-list']}" onclick=${(e) => actionOptionList(e)}></ul>`
    // get lits
    const statusList = optionListRender(data).then( buttons => {
        buttons.map( item => { 
            const li = bel`<li>${item}</li>`
            optionList.append(li) 
        })
        return buttons
    })

    window.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', (event) => {
            const target = event.target
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
                recipients[name]({page, from: name, flow: flow ? `${flow}/${widget}` : widget, type: 'remove-active', filename, line: 50})
                return send2Parent({page, from: name, flow: flow ? `${flow}/${widget}` : widget, type: 'remove-active', filename, line: 51})
            }
        })
    })

    return optionAction

    /*************************
    * ------- Actions --------
    *************************/
    function actionOptionList (event) {
        event.stopPropagation()
        const target = event.target
        const classList = [...target.classList]
        const listStyle = classList.filter( style => style.includes('btn'))
        if (!target.classList.contains(listStyle)) return
        // for recipients[name] using
        const name = `option-${target.innerText.toLowerCase().split(' ').join('')}`
        // if icon is not contained css.hide then do toggling it on unchecked/checked 
        const type = target.classList.contains(css.checked) ? 'unchecked' : 'checked'
        target.classList.toggle(css.checked)
        const message = {page: 'demo', from: target.innerText, flow: `${flow}/option-list`, type, body: name, filename, line: 72}
        return send2Parent(message)
    }

    function displayOptionList (message) {
        const {page, from, flow, type, body, action} = message
        let log = {page, from, flow, type: 'active', body, filename, line: 78}
        recipients[from](log)
        optionAction.append(optionList)
        if (optionList.children.length > 0) optionList.classList.remove(css.hide)
        return send2Parent(log)
    }

    function hideOptionList (message) {
        const {page, from, flow, type, body, action} = message
        let log = {page, from, flow, type, body, filename, line: 87}
        recipients[from](log)
        optionList.classList.add(css.hide)
        // remove optionList when add css.hide
        optionList.classList.add(css.hide)
        setTimeout( () => optionList.remove(), 500)
        return send2Parent(log)
    }

    function actionFilterOption (message) {
        const { type } = message
        if (type === 'self-active') displayOptionList(message)
        if (type === 'remove-active') hideOptionList(message)
    }

    /*************************
    * ------- Protocol --------
    *************************/
    function optionProtocol (name) {
        return send => {
            recipients[name] = send
            return receive
        }
    }

    /*************************
    * ------ Receivers -------
    *************************/
    function receive (message) {
        const {page, flow, from, type, action, body} = message
        if (type === 'click') {
            
        }
        if ( from === 'filter-option') actionFilterOption(message)
        return send2Parent(message)
    }

    /*********************************
    * ------ Promise() Element -------
    *********************************/
    async function optionListRender (data) {
        return await new Promise((resolve, reject) => {
            if (data === undefined) reject( )
            const lists = data.map( item => {
                let style
                const check = svg( { css: `${css.icon} ${css['icon-check']} ${css.checked}`, path: 'assets/check.svg' })
                if (item === 'Available') style = css.online
                if (item === 'Not available') style = css.offline
                if (item === 'Hypercore') style = css.core
                if (item === 'Hyperdrive') style = css.drive
                if (item === 'Cabal') style = css.cabal
                const content = bel`<div class=${css.status}>${check}<span class="${css.circle} ${style}"></span>${item}</div>`
                const btn = button({page, flow: flow ? `${flow}/${widget}` : widget, name: item, content, style: 'link', color: 'link-white', custom: [css.checked]}, optionProtocol(`option-${item.toLowerCase().split(' ').join('')}`))
                return btn
            })
            return resolve(lists)
        }).catch( err => { throw new Error(err)} )
    }
}

const css = csjs`
.option {
    position: relative;
    display: grid;
    justify-items: right;
}
.option > button[class^="btn"] {
    position: relative;
    z-index: 3;
    margin-right: 0;
}
.option-list {
    position: absolute;
    z-index: 2;
    right: 0;
    width: 160px;
    animation: showup .25s linear forwards;
}
.option-list, .option-list li  { 
    margin: 0; 
    padding: 0;
    list-style: none;
}
.option-list li > button {
    background-color: #000;
    margin: 0;
    padding: 0;
    width: 100%;
    text-align: left;
    transition: background-color 0.3s linear;
}
.option-list li:first-child > button {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}
.option-list li:last-child > button {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}
.option-list li > button:hover {
    color: #fff;
    background-color: #666;
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
.online {
    background-color: #109B36;
}
.offline {
    background-color: #D9D9D9;
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