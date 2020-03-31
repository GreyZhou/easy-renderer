import { component } from './src/ERer/component'
import { createElement,render,renderWrap } from './src/ERer/render'
import { setDirective } from './src/ERer/directive'


const ERer =  {
    createElement,
    component,
    render,
    renderWrap,
    directive: setDirective,
}

window.ERer = ERer

export default ERer