import { component } from './src/ERer/component'
import { createElement,render,renderWrap } from './src/ERer/render'



const ERer =  {
    createElement,
    component,
    render,
    renderWrap,
}

window.ERer = ERer

export default ERer