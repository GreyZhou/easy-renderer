import '../utils/interface'
import { createComponent } from './component'

// 保留属性
const RESERVED_PROPS = {
    // key:true,
    // $ref:true,
    $el:true,
    preVnodeTree:true,
}

// jsx --> vnode
export const createElement = function(type, config, ...children){
    children = children.length ? [].concat(...children) : null;
    const props = {};
    if( config ){
        for (let propName in config) {
            if (
                config.hasOwnProperty(propName) &&
                !RESERVED_PROPS.hasOwnProperty(propName)
            ) {
                props[propName] = config[propName];
            }
        }
    }
    return { type, props, children }
}

// 插入dom
export const render = function(vnode:vnode,container:HTMLElement,replaceFlag:boolean){
    console.log(vnode)
    let dom:HTMLElement = _renderVnode(vnode)
    if( replaceFlag ){
        let parent:HTMLElement = container.parentElement;
        parent.insertBefore(dom,container)
        parent.removeChild(container)
    }else{
        container.innerHTML = ""
        container.appendChild(dom)
    }
}

// 包裹dom
export const renderWrap = function(vnode:vnode,child:HTMLElement){
    let parent:HTMLElement = child.parentElement;
    let insert:HTMLElement = document.createElement('div');
    parent.insertBefore(insert,child);
    let dom:HTMLElement = _renderVnode(vnode)
    parent.insertBefore(dom,insert)
    parent.removeChild(insert)
}

// vnode --> dom
export const _renderVnode = function(vnode:vnode){

    if(vnode instanceof HTMLElement){
        return vnode
    }
    if( vnode === undefined || vnode === null ){
        return document.createTextNode('');
    }
    if(vnode instanceof Array){
        return vnode.map(item=>_renderVnode(item))
    }
    if(typeof vnode === 'string' || !vnode.type) {
        // 生成文本节点
        return document.createTextNode(vnode as string);
    }

    let github = 'https://github.com/jiangzhenfei/simple-react/blob/master/js/render.js'
    
    // 组件
    if(typeof vnode.type === 'function'){
        let component = createComponent(vnode.type,vnode.props,vnode.children)
        // let node = 
        
        return component.$el;
    }

    // 生成元素节点并设置属性
    const attributes = vnode.props || {};
    if( ['$if','If','_if'].some(key=>attributes.hasOwnProperty(key) && !!attributes[key]==false) ){
        return document.createTextNode('');
    }

    const node = document.createElement(vnode.type);
    Object.keys(attributes).forEach(key =>{
        if( ['$if','If','_if'].some(str=>str===key) ){
            return;
        }
        else if( typeof attributes[key] === 'function'){
            node[key] = attributes[key]
        }
        else if( key === '$Node' || key === 'Node' ||key === '_node' ){  // node 处理
            this[attributes[key]] = node;
        }
        else{
            node.setAttribute(key, attributes[key])
        }
    });
    
    if (vnode.children) {
        // 递归调用render生成子节点
        vnode.children.forEach(child => node.appendChild(_renderVnode(child)));
    }
    
    return node;
}
