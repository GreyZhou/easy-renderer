import { component } from './ERer/component'
import { createElement,render,renderWrap } from './ERer/render'




const ERer =  {
    createElement,
    component,
    render,
    renderWrap,
}

window.ERer = ERer

export default ERer