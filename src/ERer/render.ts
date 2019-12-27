import '../utils/interface'
import { createComponent } from './component'
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

    // if(typeof vnode === 'string' || typeof vnode === 'number'){
    //     vnode = {
    //         type:'string',
    //         dom: document.createTextNode(vnode)
    //     }
    // }
    // else if(vnode instanceof HTMLElement){
    //     vnode = {
    //         type: 'element',
    //         dom: vnode
    //     }
    // }
    // else if( vnode === undefined || vnode === null){
    //     vnode = {
    //         type: null,
    //     }
    // }
    if( vnode.children && vnode.children.length ){
        vnode.children = vnode.children.map(item=>{
            if(item === undefined || item === null){
                return {
                    type: null,
                }
            }else if( typeof item === 'string' || typeof item === 'number' ){
                return {
                    type:'string',
                    text: item,
                }
            }else if( item instanceof  HTMLElement){
                return {
                    type: 'element',
                    dom: item
                }
            }
            return item
        })
    }
    return vnode
}


// vnode --> dom
export const _renderVnode = function(vnode:vnode){
    // *** 特别情况处理 ***
    // 纯dom
    if(vnode.type === 'element'){
        return vnode.dom
    }
    // 纯文本
    if( vnode.type === 'string') {
        // 生成文本节点
        // return document.createTextNode(vnode as string);
        vnode.dom  = document.createTextNode( vnode.text )
        return vnode.dom
    }
    // 空节点
    if( vnode.type === null ){
        vnode.dom = document.createComment('');
        return vnode.dom
    }
    // if(vnode instanceof Array){
    //     return vnode.map(item=>_renderVnode(item))
    // }

    
    // 组件
    if(typeof vnode.type === 'function'){
        let component = createComponent(vnode.type,vnode.props,vnode.children)
        vnode.instance = component  // 保留实例
        vnode.dom = component.$el
        console.log('render：',component.name)
        return component.$el;
    } 


    // 普通dom
    // 生成元素节点并设置属性
    const attributes = vnode.props || {};

    if( ['$if','If','_if'].some(key=>attributes.hasOwnProperty(key) && !!attributes[key]==false) ){
        return document.createTextNode('');
    }

    const node = document.createElement( vnode.type );
    vnode.dom = node;
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
        name = name.toLowerCase().replace(/^on/,'');
        dom.addEventListener(name,value)
    // 如果属性名是style，则更新style对象
    } else if ( name === 'style' ) {
        if ( !value || typeof value === 'string' ) {
            dom.style.cssText = value || '';
        } else if ( value && typeof value === 'object' ) {
            for ( let name in value ) {
                dom.style[ name ] =  value[ name ];
            }
        }
    // 普通属性
    } else if( name.indexOf('$-') === -1 ) {
        // dom 对象
        name = name === 'class' ? 'className' : name;   // 调整属性名称
        if ( name in dom ) {
            console.log(name,value)
            dom[ name ] = value || '';
        }

        // dom 属性
        name = name === 'className' ? 'class' : name;   // 调整属性名称
        if ( value ) {
            dom.setAttribute( name, value );
        } else {
            dom.removeAttribute( name, value );
        }
    // 特殊属性 $-
    }else{
        console.log(name)
        console.log(name.replace(/^\$-/,''))
        switch ( name.replace(/^\$-/,'') ) {
            // case 'model':
            //     dom.addEventListener('input',)
            //     break;
        
            default:
                break;
        }
    }
}

// 渲染组件
export const renderComponent = function( component ){
    const vnode = component.render();  // 获取虚拟 dom   
    console.log(vnode)
    let $el = _renderVnode( vnode );
    component.$el = $el;  // 真实 dom
    component.preVnodeTree = vnode; // 保存虚拟树，下次比对
}

// 更新对象
const update = {
    dirtyComponents:[],
    timer:'',
    start:false,
    updateComponent( component ){
        if(component.dirty_flag)return
        component.dirty_flag = true;
        this.dirtyComponents.push(component)
        if( this.start === false ){
            requestAnimationFrame(()=>{
                while(this.dirtyComponents.length !== 0){
                    let now_component = this.dirtyComponents.shift();
                    let vnode = now_component.render();
                    let patches = diff(now_component.preVnodeTree,vnode)
                    console.log(now_component.name,patches)
                    patch( now_component.preVnodeTree, patches )
                    now_component.dirty_flag = false;
                }
                // this.dirtyComponents.forEach(component=>{
                //     let vnode = component.render();
                //     console.log(component.name,vnode)
                //     let patches = diff(component.preVnodeTree,vnode)
                //     console.log(121212,patches)
                //     patch( component.preVnodeTree, patches )
                //     component.dirty_flag = false;
                // })
                // this.dirtyComponents = [];
                this.start = false;
            })
            this.start = true;
        }
    },
}
// 更新组件 
export const updateComponent = update.updateComponent.bind(update)


// 插入dom
export const render = function(vnode:vnode,container:HTMLElement,replaceFlag:boolean){
    console.log('first',vnode)
    let dom:HTMLElement = _renderVnode(vnode)
       

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
export const renderWrap = function(vnode:vnodeLike,child:HTMLElement){
    let parent:HTMLElement = child.parentElement;
    let insert:HTMLElement = document.createElement('div');
    parent.insertBefore(insert,child);
    let dom:HTMLElement = _renderVnode(vnode)
    parent.insertBefore(dom,insert)
    parent.removeChild(insert)
}



