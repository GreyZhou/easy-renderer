import { component } from './ERer/component'
import { createElement,render,renderWrap } from './ERer/render'

let github = 'https://github.com/jiangzhenfei/simple-react/blob/master/js/render.js'



const ERer =  {
    createElement,
    component,
    render,
    renderWrap,
}

window.ERer = ERer

export default ERer