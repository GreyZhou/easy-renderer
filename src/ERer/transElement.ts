// ERerElement ---> dom
import {SPECIAL_PROPS } from './const'
import { createComponent } from './component'

const transElement = function(vnode:vnode){
    // 特殊属性
    if( vnode.props['$if'] === false ){
        return document.createComment('');
    }

    // 纯dom
    if(vnode.type === 'element'){
        return vnode.dom
    }
    // 纯文本
    if( vnode.type === 'string') {
        // 生成文本节点
        // return document.createTextNode(vnode as string);
        vnode.dom  = document.createTextNode( vnode.dom  ) 
        return vnode.dom
    }
    // 空节点
    if( vnode.type === 'null' ){
        vnode.dom = document.createComment('');
        return vnode.dom
    }
    // if(vnode instanceof Array){
    //     return vnode.map(item=>transElement(item))
    // }

    
    // 组件
    if(typeof vnode.type === 'function'){
        let component = createComponent(vnode.type,vnode.props)
        vnode.instance = component  // 保留实例
        vnode.dom = component.$el
        console.log(component.name,' key:',vnode.key)
        console.log('render over：',component.name)
        return vnode.dom;
    }else{
        // 普通dom
        // 生成元素节点并设置属性
        const attributes = vnode.props || {};
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
        
        if (vnode.props && vnode.props.children) {
            // 递归调用render生成子节点
            vnode.props.children.forEach(child => node.appendChild(transElement(child)));
        }
        
        return node;
    }


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

export default transElement