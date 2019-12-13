import '../utils/interface'
import { _renderVnode,renderComponent } from './render'
import Observer from '../utils/observer'

// 生成组件类的工厂
const ERerFactory = function(options:componentOptions){
    let ERerComponent = function(props,children){
        this.$slots = children;
        this.event = new Observer();
        Object.assign(this,this.data())  // 合并 data 数据
        Object.assign(this,this.methods)  // 合并 method 方法
        this.setProps(props)  // 更新props
    }


    ERerComponent.prototype.methods = options.methods || {}  // 方法 json
    ERerComponent.prototype.data = options.data || function(){}  // data 函数
    ERerComponent.prototype.created = options.created || function(){}  // created 回调
    ERerComponent.prototype.mounted = options.mounted || function(){}  // mounted 回调
    ERerComponent.prototype.render = options.render || function(){}   // 渲染结果
     // 触发事件
    ERerComponent.prototype.$emit = function(name:string,...arg){
        this.event.trigger(name,...arg)
    }  
    // 更新props
    ERerComponent.prototype.setProps = function( props = {} ){
        this.props = {}
        Object.keys(props).forEach(key=>{
            if(/^\$\w+/.test(key) && typeof props[key] === 'function'){
                console.log(key)
                this.event.listen(key.replace('$',''),props[key])
            }else{
                this.props[key] = props[key]
            }
        })
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
