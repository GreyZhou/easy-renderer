import '../utils/interface'
import { renderComponent } from './render'
import Observer from '../utils/observer'

class ERerComponentBase {
    public event:Observer  // 内部事件对象
    public methods:any = {}  // 方法合集
    public $slots:vnode[]   // slots 合集
    public props:any = {}   // 传参
    public $el:HTMLElement;  // 渲染后的 dom
    private timer:any;   // 定时器

    constructor(){
        this.event = new Observer();
    }

    render(){}
    data(){}
    created(){}
    mounted(){}

    $emit(name:string,...arg){
        this.event.trigger(name,...arg)
    }
    setProps( props = {},children ){
        this.$slots = children;
        this.props = {}
        console.log('setProps')
        Object.keys(props).forEach(key=>{
            if(/^\$\w+/.test(key) && typeof props[key] === 'function'){
                // console.log(key)
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
    setState(obj){
        console.log('setState')
        Object.assign(this,obj) // 更新数据
        renderComponent( this );
    }

}

// 生成组件类的工厂
const ERerFactory = function(options:componentOptions){
    class ERerComponent extends  ERerComponentBase {
        constructor(props,children){
            super()
            Object.assign(this,this.data())  // 合并 data 数据
            this.methods = options.methods || {};
            Object.assign(this,this.methods)  // 合并 method 方法
            this.setProps(props,children)  // 更新props
        }
        render(){
            return options.render && options.render.call(this);
        }
        data(){
            return options.data && options.data.call(this);
        }
        created(){
            return options.created && options.created.call(this);
        }
        mounted(){
            return options.mounted && options.mounted.call(this);
        }
    }
    // let ERerComponent = function(props,children){
    //     this.event = new Observer();
    //     Object.assign(this,this.data())  // 合并 data 数据
    //     Object.assign(this,this.methods)  // 合并 method 方法
    //     this.setProps(props,children)  // 更新props
    // }

    
    // ERerComponent.prototype.render = options.render || function(){}   // 渲染结果
    // ERerComponent.prototype.data = options.data || function(){}  // data 函数
    // ERerComponent.prototype.created = options.created || function(){}  // created 回调
    // ERerComponent.prototype.mounted = options.mounted || function(){}  // mounted 回调
    // ERerComponent.prototype.methods = options.methods || {}  // 方法 json
    //  // 触发事件
    // ERerComponent.prototype.$emit = function(name:string,...arg){
    //     this.event.trigger(name,...arg)
    // }  
    // // 更新props
    // ERerComponent.prototype.setProps = function( props = {},children ){
    //     this.$slots = children;
    //     this.props = {}
    //     Object.keys(props).forEach(key=>{
    //         if(/^\$\w+/.test(key) && typeof props[key] === 'function'){
    //             // console.log(key)
    //             this.event.listen(key.replace('$',''),props[key])
    //         }else{
    //             this.props[key] = props[key]
    //         }
    //     })
    //     if ( !this.$el ) {//第一次渲染
    //         this.created()
    //         renderComponent( this );
    //         this.mounted();
    //     }else{
    //         renderComponent( this )
    //     }
    // }
    // // 更新data
    // ERerComponent.prototype.setState = function(obj){
    //     Object.assign(this,obj) // 更新数据
    //     renderComponent( this );
    // }

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

// 判断是否是组件
export const isComponent = function(vnode:vnode){
    return typeof vnode.type == 'function'  && vnode.type instanceof ERerComponentBase
}
