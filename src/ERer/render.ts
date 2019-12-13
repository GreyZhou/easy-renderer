import '../utils/interface'
import { createComponent } from './component'
import diff from './diff'
import patch from './patch'
import {RESERVED_PROPS,SPECIAL_PROPS } from './const'
 


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
    return transVnode({ type, props, children })
}

// 处理 vnode children   主要处理 undefined 和 数字型
const transVnode = function( vnode:vnode ):vnode{
    if( vnode.children && vnode.children.length ){
        vnode.children = vnode.children.map(item=>{
            if(item === undefined || item === null){
                return ''
            }else if( typeof item === 'number' ){
                return String(item)
            }
            return item
        })
    }
    return vnode
}


// vnode --> dom
export const _renderVnode = function(vnode:vnodeLike){
    // *** 特别情况处理 ***
    // 纯dom
    if(vnode instanceof HTMLElement){
        return vnode
    }
    // 纯文本
    if(typeof vnode === 'string') {
        // 生成文本节点
        return document.createTextNode(vnode as string);
    }
    // if(vnode instanceof Array){
    //     return vnode.map(item=>_renderVnode(item))
    // }

    
    // 组件
    if(typeof vnode.type === 'function'){
        let component = createComponent(vnode.type,vnode.props,vnode.children)
        vnode.instance = component  // 虚拟dom 保留实例
        return component.$el;
    }


    // 普通dom
    // 生成元素节点并设置属性
    const attributes = vnode.props || {};

    if( ['$if','If','_if'].some(key=>attributes.hasOwnProperty(key) && !!attributes[key]==false) ){
        return document.createTextNode('');
    }

    const node = document.createElement(vnode.type);
    Object.keys(attributes).forEach(key =>{
        if( SPECIAL_PROPS.hasOwnProperty(key) ){
            // 这里处理特殊属性
            // ...
            return;
        }

        setAttrs(node,key,attributes[key])
    });
    
    if (vnode.children) {
        // 递归调用render生成子节点
        vnode.children.forEach(child => node.appendChild(_renderVnode(child)));
    }
    
    return node;
}

// 设置原生dom属性
export const setAttrs = function(dom,name,value){
    // 事件
    if ( /^on\w+/.test( name ) && typeof value === 'function' ) {
        name = name.toLowerCase();
        dom[ name ] = value;
    // 如果属性名是style，则更新style对象
    } else if ( name === 'style' ) {
        if ( !value || typeof value === 'string' ) {
            dom.style.cssText = value || '';
        } else if ( value && typeof value === 'object' ) {
            for ( let name in value ) {
                // 可以通过style={ width: 20 }这种形式来设置样式，可以省略掉单位px
                dom.style[ name ] = typeof value[ name ] === 'number' ? value[ name ] + 'px' : value[ name ];
            }
        }
    // 普通属性
    } else {
        if ( name in dom ) {
            dom[ name ] = value || '';
        }
        // 调整属性名称
        switch ( name ) {
            case 'className':
                name = 'class'
                break;
        }

        if ( value ) {
            dom.setAttribute( name, value );
        } else {
            dom.removeAttribute( name, value );
        }
    }
}

// 渲染组件
export const renderComponent = function( component ){
    let $el;
    const vnode = component.render();  // 获取虚拟 dom    
    if(component.$el){
    
        console.log('start --------------')
        console.log(component.preVnodeTree,vnode)
        let patches = diff(component.preVnodeTree,vnode)
        console.log(patches)
        $el = patch( component.$el, patches )

        if($el !==  component.$el){
            let parent = component.$el.parentNode
            parent.insertBefore($el,component.$el)
            parent.removeChild(component.$el)
        }
    }else{
        $el = _renderVnode( vnode );
    }

    component.$el = $el;  // 真实 dom
    component.preVnodeTree = vnode; // 保存虚拟树，下次比对
}



// 插入dom
export const render = function(vnode:vnodeLike,container:HTMLElement,replaceFlag:boolean){
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
export const renderWrap = function(vnode:vnodeLike,child:HTMLElement){
    let parent:HTMLElement = child.parentElement;
    let insert:HTMLElement = document.createElement('div');
    parent.insertBefore(insert,child);
    let dom:HTMLElement = _renderVnode(vnode)
    parent.insertBefore(dom,insert)
    parent.removeChild(insert)
}



