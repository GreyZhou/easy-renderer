import '../utils/interface'
import { _renderVnode } from './render'

// 制造组件类的工厂
const ERerFactory = function(options:componentOptions){
    let ERerComponent = function(props,children){
        this.$slots = children;
        Object.assign(this,this.data())  // 合并 data 数据
        Object.assign(this,this.methods)  // 合并 method 方法
        this.setProps(props)  // 更新props
    }


    ERerComponent.prototype.methods = options.methods || {}  // 方法 json
    ERerComponent.prototype.data = options.data || function(){}  // data 函数
    ERerComponent.prototype.created = options.created || function(){}  // created 回调
    ERerComponent.prototype.mounted = options.mounted || function(){}  // mounted 回调
    ERerComponent.prototype.render = options.render || function(){}   // 渲染结果
    // 更新props
    ERerComponent.prototype.setProps = function( props = {} ){
        this.props = props;
        if ( !this.$el ) {//第一次渲染
            this.created()
            renderComponent( this );
            this.mounted();
        }else{
            renderComponent( this )
        }
    }
    // 更新data
    ERerComponent.prototype.setState = function(obj){
        Object.assign(this,obj) // 更新数据
        renderComponent( this );
    }

    return ERerComponent
}

// 生成组件工厂函数
export const component = function(name,options:componentOptions){
    options.name = name
    return ERerFactory(options)
}

// 实例化组件
export const createComponent = function(componentFunc,props?,children?){
    return new componentFunc(props,children)
}

// 渲染组件
export const renderComponent = function( component ){
    let $el;
    const vnode = component.render();  // 获取虚拟 dom
    
    $el = _renderVnode( vnode );
    
    component.preVnodeTree = vnode; // 保存虚拟树，下次比对
    if(component.$el){
        let parent = component.$el.parentNode
        parent.insertBefore($el,component.$el)
        parent.removeChild(component.$el)
    }
    component.$el = $el;  // 真实 dom
}