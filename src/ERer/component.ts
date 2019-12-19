import '../utils/interface'
import { renderComponent, updateComponent } from './render'
import Observer from '../utils/observer'

class ERerComponentBase {
    public event:Observer  // 内部事件对象
    public methods:any = {}  // 方法合集
    public $slots:vnode[]   // slots 合集
    public props:any = {}   // 传参
    // public state:any = {}   // 数据
    public $el:HTMLElement;  // 渲染后的 dom
    public destroyed_flag:boolean; // 已销毁标识
    public dirty_flag:boolean;  // 更新标识
    // public nextStore:any = {   // 更新集合
    //     state:{},
    //     props:{},
    //     children:null,
    // } 

    constructor(){
        this.event = new Observer();
    }

    render(){}
    data(){}
    created(){}
    mounted(){}

    // // 延迟到一帧渲染
    // delayRender(){
    //     if(this.destroyed_flag)return
    //     cancelAnimationFrame(this.timer)
    //     this.timer = requestAnimationFrame(()=>{
    //         if(this.destroyed_flag)return
    //         renderComponent( this );
    //     })  
    // }
    unmounted(){
        this.$el.parentNode.removeChild(this.$el)
        this.destroyed_flag = true;
    }

    $emit(name:string,...arg){
        this.event.trigger(name,...arg)
    }
    // 调整属性
    multiProps(key,value){
        if(/^\$\w+/.test(key) && typeof value === 'function'){
            // console.log(key)
            this.event.listen(key.replace('$',''),value)
        }else{
            this.props[key] = value
        }
    }
    setProps( props = {},children ){
        console.log(props)
        console.log(this.props)
        if( 
            JSON.stringify(props) === JSON.stringify(this.props) &&
            JSON.stringify(children) === JSON.stringify(this.$slots)
        ){
            return;
        }
        Object.keys(props).forEach(key=>{
            this.props[key] = props[key]
        })
        this.$slots = children;

        updateComponent( this )

        // if ( !this.$el ) {//第一次渲染
        //     console.log('setProps[first render]')
        //     this.created()
        //     renderComponent( this );
        //     this.mounted();
        //     console.log(this.$el)
        // }else{
        //     console.log('setProps[fresh props]')
        //     this.delayRender()
        //     console.log(this.$el)
        // }
    }
    // 更新data
    setState(nextState){
        let flag = false;
        Object.keys(nextState).forEach(key=>{
            // if(typeof this[key] === 'object' || this[key] instanceof Array ){
            //     if( JSON.stringify(this[key]) !== JSON.stringify(nextState[key]) ){
            //         flag = true;
            //         this[key] = nextState[key]
            //     }
            // }
            // else 
            if(this[key] !== nextState[key]){
                flag = true;
                this[key] = nextState[key]
            }
        })
        if( flag ){
            updateComponent( this )
        }
    }

}

// 生成组件类的工厂
const ERerFactory = function(options:componentOptions){
    class ERerComponent extends  ERerComponentBase {
        private name:string = options.name; // 组件名称
        constructor(props,children){
            super()
            // Object.assign(this.state,this.data())  // 合并 data 数据
            // Object.assign(this,this.state);
            Object.assign(this,this.data());
            this.methods = options.methods || {};
            Object.assign(this,this.methods)  // 合并 method 方法
            this.$slots = children;    // 塞入 slot
            this.props = {}
            // 拆分属性及事件
            Object.keys(props).forEach(key=>{
                this.multiProps(key, props[key])
            })
            this.created()
            renderComponent( this )
            this.mounted();
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
    return typeof vnode.type == 'function'  && vnode.type.prototype instanceof ERerComponentBase
}
