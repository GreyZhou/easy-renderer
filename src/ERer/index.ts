interface componentOptions {
    render:Function
    name:string
    created?:Function
    mounted?:Function
    data?:Function
}


// 保留属性
const RESERVED_PROPS = {
    key:true,
    ref:true,
}

// jsx --> vnode 预处理
const createElement = function(type, config, ...children){
    // 使用concat是为了扁平化args，因为args数组里面的元素可能也是数组
    // h('div', {}, [1, 2, 3])  h('d', {}, 1, 2, 3) 都是合法的调用

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
    // return ERerElement({ type, props, children });
    return { type, props, children }
}

// // 生成虚拟dom
// const ERerElement = function(options){
//     let vnode = {
//         type: options.type,
//         props: options.props,
//         children: options.children,
//     }
//     console.log(vnode)
//     console.log(vnode.type)
//     console.log(typeof vnode.type)
//     console.log(vnode.type instanceof Function)
//     return vnode
// }

// 制造组件类的工厂
const ERerFactory = function(options:componentOptions){
    let ERerComponent = function(props){
        console.log('组件options',options)
    }

    ERerComponent.prototype.created = options.created || function(){}
    ERerComponent.prototype.mounted = options.mounted || function(){}
    ERerComponent.prototype.render = options.render || function(){}
    // 更新props
    ERerComponent.prototype.setProps = function(){}
    // 更新data
    ERerComponent.prototype.setState = function(){}

    return ERerComponent
}

// 生成组件工厂函数
const component = function(name,options:componentOptions){
    console.log('component')
    options.name = name
    return ERerFactory(options)
}


const ERer = {
    createElement,
    component,
}

export default ERer
