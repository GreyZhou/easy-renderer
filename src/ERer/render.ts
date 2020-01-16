import '../utils/interface'
import { createComponent } from './component'
import transElement from './transElement'
import diff from './diff'
import patch from './patch'
import {RESERVED_PROPS,SPECIAL_PROPS } from './const'
 

const requestAnimationFrame = function(method){
    if(window.requestAnimationFrame){
        return window.requestAnimationFrame(method)
    }else{
        return setTimeout(method)
    }
}


// jsx --> vnode
export const createElement = function(type, config, ...children){
    children = children.length ? [].concat(...children) : null;
    const props:any = {};
    let key = null;
    let current_element;
    if( config ){
        for (let propName in config) {
            if (
                config.hasOwnProperty(propName) &&
                !RESERVED_PROPS.hasOwnProperty(propName)
            ) {
                props[propName] = config[propName];
            }
        }
        key = config.key || null
    }

    if(children){
        let indexCount = 0
        let cacheKeyMap = {}

        children = children.map( item => {
            if(typeof item !== 'object' || item instanceof HTMLElement ){
                let child_type,child_dom = null
                let self_props:any = {};
                if( item === undefined || item === null ){
                    child_type = 'null'
                }else if( typeof item === 'string' || typeof item === 'number'){
                    child_type = 'string'
                    self_props.text = item   // 先用纯文本占位
                }else if(item instanceof HTMLElement){
                    child_type = 'element'
                    child_dom = item
                }

                item = ERerElement( child_type, null, self_props, null, child_dom )
            }
            // item.parent = current_element

            if(item.key === null || cacheKeyMap[item.key] ){
                item.key = '.' + indexCount;
                indexCount++
            }
            cacheKeyMap[ item.key ] = true

            return item
        })
    }

    return ERerElement( type, key, props, children )
}

const ERerElement = function(type, key, props, children, dom = null){
    let instance = null;
    parent = null;

    let res = {
        type,
        key,
        props,
        children,
        dom,
        instance,
        parent,
    }
    return res;
}

// 插入dom
export const render = function(vnode:vnode,container:HTMLElement,replaceFlag:boolean){

    let dom:Node = transElement(vnode)
    if( replaceFlag ){
        let parent:HTMLElement = container.parentElement;
        parent.insertBefore(dom,container)
        parent.removeChild(container)
    }else{
        container.innerHTML = '';
        container.appendChild(dom)
    }
}

// 包裹dom
export const renderWrap = function(vnode:vnode,child:HTMLElement){
    let parent:HTMLElement = child.parentElement;
    let insert:HTMLElement = document.createElement('div');
    parent.insertBefore(insert,child);
    let dom:Node = transElement(vnode)
    parent.insertBefore(dom,insert)
    parent.removeChild(insert)
}


// // 处理 vnode children   主要处理 undefined 和 数字型
// const transVnode = function( vnode:vnode ):vnode{

//     // if(typeof vnode === 'string' || typeof vnode === 'number'){
//     //     vnode = {
//     //         type:'string',
//     //         dom: document.createTextNode(vnode)
//     //     }
//     // }
//     // else if(vnode instanceof HTMLElement){
//     //     vnode = {
//     //         type: 'element',
//     //         dom: vnode
//     //     }
//     // }
//     // else if( vnode === undefined || vnode === null){
//     //     vnode = {
//     //         type: null,
//     //     }
//     // }
//     if( vnode.children && vnode.children.length ){
//         let indexCount = 0
//         let cacheKeyMap = {}
//         vnode.children = vnode.children.map(item=>{

//             let res
//             if(item === undefined || item === null){
//                 res = {
//                     type: null,
//                 }
//             }else if( typeof item === 'string' || typeof item === 'number' ){
//                 res = {
//                     type:'string',
//                     text: item,
//                 }
//             }else if( item instanceof  HTMLElement){
//                 res = {
//                     type: 'element',
//                     dom: item
//                 }
//             }else{
//                 res = item
//             }

//             if(res.key === undefined || cacheKeyMap[res.key] ){
//                 res.key = '.' + indexCount;
//                 indexCount++
//             }

//             cacheKeyMap[ res.key ] = true
//             return res
//         })
//     }
//     return vnode
// }


// // vnode --> dom
// export const _renderVnode = function(vnode:vnode){
//     // *** 特别情况处理 ***
//     // 纯dom
//     if(vnode.type === 'element'){
//         return vnode.dom
//     }
//     // 纯文本
//     if( vnode.type === 'string') {
//         // 生成文本节点
//         // return document.createTextNode(vnode as string);
//         vnode.dom  = document.createTextNode( vnode.text )
//         return vnode.dom
//     }
//     // 空节点
//     if( vnode.type === null ){
//         vnode.dom = document.createComment('');
//         return vnode.dom
//     }
//     // if(vnode instanceof Array){
//     //     return vnode.map(item=>_renderVnode(item))
//     // }

    
//     // 组件
//     if(typeof vnode.type === 'function'){
//         let component = createComponent(vnode.type,vnode.props,vnode.children)
//         vnode.instance = component  // 保留实例
//         vnode.dom = component.$el
//         console.log(component.name,' key:',vnode.key)
//         console.log('render over：',component.name)
//         return component.$el;
//     } 


//     // 普通dom
//     // 生成元素节点并设置属性
//     const attributes = vnode.props || {};

//     if( ['$if','If','_if'].some(key=>attributes.hasOwnProperty(key) && !!attributes[key]==false) ){
//         return document.createTextNode('');
//     }

//     const node = document.createElement( vnode.type );
//     vnode.dom = node;
//     Object.keys(attributes).forEach(key =>{
//         if( SPECIAL_PROPS.hasOwnProperty(key) ){
//             // 这里处理特殊属性
//             // ...
//             return;
//         }

//         setAttrs(node,key,attributes[key])
//     });
    
//     if (vnode.children) {
//         // 递归调用render生成子节点
//         vnode.children.forEach(child => node.appendChild(_renderVnode(child)));
//     }
    
//     return node;
// }

// // 设置原生dom属性
// export const setAttrs = function(dom,name,value){
//     // 事件
//     if ( /^on\w+/.test( name ) && typeof value === 'function' ) {
//         name = name.toLowerCase().replace(/^on/,'');
//         dom.addEventListener(name,value)
//     // 如果属性名是style，则更新style对象
//     } else if ( name === 'style' ) {
//         if ( !value || typeof value === 'string' ) {
//             dom.style.cssText = value || '';
//         } else if ( value && typeof value === 'object' ) {
//             for ( let name in value ) {
//                 dom.style[ name ] =  value[ name ];
//             }
//         }
//     // 普通属性
//     } else if( name.indexOf('$-') === -1 ) {
//         // dom 对象
//         name = name === 'class' ? 'className' : name;   // 调整属性名称
//         if ( name in dom ) {
//             dom[ name ] = value || '';
//         }

//         // dom 属性
//         name = name === 'className' ? 'class' : name;   // 调整属性名称
//         if ( value ) {
//             dom.setAttribute( name, value );
//         } else {
//             dom.removeAttribute( name, value );
//         }
//     // 特殊属性 $-
//     }else{
//         console.log(name)
//         console.log(name.replace(/^\$-/,''))
//         switch ( name.replace(/^\$-/,'') ) {
//             // case 'model':
//             //     dom.addEventListener('input',)
//             //     break;
        
//             default:
//                 break;
//         }
//     }
// }







