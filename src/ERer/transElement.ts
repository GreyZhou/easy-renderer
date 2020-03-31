// ERerElement ---> dom
import { SPECIAL_PROPS } from './const'
import { createComponent } from './component'
import { dealDirective } from './directive'


interface transConfig{
    parentInstance?:any // 父组件实例
    signName?:string   // 触发时的标志，用于指令函数
}

const transElement = function(vnode:vnode, config:transConfig = {}):Node{
    // // 特殊属性
    // if( vnode.props['$-if'] === false ){
    //     return document.createComment('');
    // }
    
    // 纯dom
    if(vnode.type === 'element'){
        return vnode.dom
    }

    // 纯文本
    if( vnode.type === 'string') {
        // 生成文本节点
        // return document.createTextNode(vnode as string);
        vnode.dom  = document.createTextNode( vnode.props.text  ) 
        return vnode.dom
    }
    // 空节点
    if( vnode.type === 'null'){
        vnode.dom = document.createComment('');
        return vnode.dom
    }
    // if(vnode instanceof Array){
    //     return vnode.map(item=>transElement(item))
    // }

    
    // 组件
    if(typeof vnode.type === 'function'){
        let component = createComponent(vnode.type, {
            props: vnode.props, 
            children: vnode.children, 
            parent: config.parentInstance
        })
        vnode.instance = component  // 保留实例
        vnode.dom = component.$el
        dealDirective(vnode, config.signName)
        // console.log(component.name,' key:',vnode.key)
        // console.log('render over：',component.name)
        return vnode.dom;
    }else{
        // 普通dom
        // 生成元素节点并设置属性
        let attributes = vnode.props || {};
        const node = document.createElement( vnode.type );
        vnode.dom = node;
        Object.keys(attributes).forEach(key =>{
            setAttrs(vnode, key, attributes[key])
        });
        if ( vnode.children ) {
            // 递归调用render生成子节点
            vnode.children.forEach(child => {
                node.appendChild(transElement(child, config))
            });
        }
        dealDirective(vnode, config.signName)        
        return vnode.dom;
    }
}

// 设置原生dom属性
export const setAttrs = function(vnode, name, value){
    let dom = vnode.dom;
    // 事件
    if ( typeof value === 'function' || /^on\w+/.test( name ) ) {
        // name = name.toLowerCase().replace(/^on/,'');
        // dom.addEventListener(name,value)
        dom[name] = value
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
    } else if( !SPECIAL_PROPS.hasOwnProperty(name) ) {
        // dom 对象
        name = name === 'class' ? 'className' : name;   // 调整属性名称
        if ( name in dom ) {
            dom[ name ] = value || '';
        }

        // dom 属性
        name = name === 'className' ? 'class' : name;   // 调整属性名称
        if ( value ) {
            dom.setAttribute && dom.setAttribute( name, value );
        } else {
            dom.removeAttribute && dom.removeAttribute( name, value );
        }
    
    }
}

export default transElement