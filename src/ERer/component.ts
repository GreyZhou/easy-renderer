import '../utils/interface'
import { createElement } from './render'
import transElement from './transElement'
import Observer from '../utils/observer'
import diff from './diff'
import patch from './patch'
import Watcher from '../utils/watcher'
import { dealDirective } from './directive'
import { DIRECTIVE_CYCLE } from './const'


// 空节点
class NullNode {

}
// 文本节点
class TextNode { 

}
// dom 节点
class DomNode {

}
// 标签节点
class TagNode {

}

// 组件原始类
class ERerComponentBase {
    public event:Observer  // 内部事件对象
    public watch:any = {} // 监听合集
    public methods:any = {}  // 方法合集
    public $slots:vnode[]   // slots 合集
    public $componentName:string   // 组件名称
    public $props:any = {}   // 传参
    public $refs:any = {}   // dom 或 组件实体
    public $parent:ERerComponentBase = null// 父组件
    public $children:ERerComponentBase[] = []// 子组件
    // public state:any = {}   // 数据
    public $el:HTMLElement;  // 渲染后的 dom
    public destroyed_flag:boolean; // 已销毁标识
    public dirty_flag:boolean;  // 更新标识
    public preVnodeTree:vnode;  // 存储vnode树
    public cacheVnode:vnode;  // 缓存待 diff 的vnode树
    public cachePatches:patchOptions[];  // 缓存待执行 patch

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
            let name = key.replace('$','');
            if(this.event.hasEvent(name)){
                this.event.clean(name)
            }
            // this.event.hasEvent(key) && this.event.clean(key)
            this.event.listen(name,value)
            // console.log(this.event)
        }else{
            this.$props[key] = value
        }
    }

    // dom 化children
    multiChildren(arr){
        return arr && arr.map(item=>item.dom)
    }

    setProps( config:updateOPtions ){
        let { props, children } = config;
        // console.log(props)
        // console.log(this.props)
        let filter_props = Object.keys(props).reduce((res,key)=>{
            if(typeof props[key] === 'function'){
                this.multiProps(key,props[key])
                delete res[key]
            }
            return res
        },props)

        if(
            // !Object.keys(props).some(key=>typeof props[key] === 'function') &&
            JSON.stringify(filter_props) === JSON.stringify(this.$props) &&
            JSON.stringify(children) === JSON.stringify(this.$slots)
        ){
            return;
        }
        // 拆分属性及事件
        Object.keys(filter_props).forEach(key=>{
            this.multiProps(key, filter_props[key])
        })
        console.log('-- setProps --')
        console.log('props 变化', JSON.stringify(filter_props) === JSON.stringify(this.$props))
        console.log('children 变化', JSON.stringify(children) === JSON.stringify(this.$slots), children, this.$slots)
        // this.$slots = children;
        this.$slots = children;
        update.updateComponent( this )
        
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
    $setState(nextState){        
        Object.keys(nextState).forEach(key=>{
            // if(typeof this[key] === 'object' || this[key] instanceof Array ){
            //     if( JSON.stringify(this[key]) !== JSON.stringify(nextState[key]) ){
            //         flag = true;
            //         this[key] = nextState[key]
            //     }
            // }
            // else 
            if(this[key] !== nextState[key]){
                this[key] = nextState[key]
            }
        })
        console.log('-- setState --')
        update.updateComponent( this )
    }

    // 递归虚拟 dom 树, 进行一些处理，同时返回标记 ref 的 vnode 合集
    deepVnodes(vnode, func ){
        func && func(vnode)

        if(vnode.children){
            for(let child of vnode.children){
                this.deepVnodes(child, func)
            }
        }
    }
}

// 生成组件类的工厂
const ERerFactory = (function(){
    // let componentsMap = {}  // 组件合集
    return function(options:componentOptions){
        class ERerComponent extends  ERerComponentBase {
            private name:string = options.name; // 组件名称
            private _note_ref_vnodes:vnode[] = [];  // 临时记录ref vnode数组
            private _note_child_vnodes:vnode[] = [];  // 临时记录子组件 vnode数组

            constructor(config){
                super()
                let { props, children, parent = null } = config
                // Object.assign(this.state,this.data())  // 合并 data 数据
                // Object.assign(this,this.state);
                Object.assign(this,this.data());
                this.$componentName = options.name;
                this.methods = options.methods || {};
                this.watch = options.watch || {};
                Object.assign(this,this.methods)  // 合并 method 方法
                this.$slots = children;    // 塞入 slot
                this.$parent = parent;  // 指定父组件
                this.$props = {}
                // 拆分属性及事件
                Object.keys(props).forEach(key=>{
                    this.multiProps(key, props[key])
                })


                this.created()
                renderComponent( this )

                // 监听
                let watcher = new Watcher(this,{lazy:true})
                for(let name in this.data()){
                    watcher.$watch(name,(val)=>{
                        this.$setState({
                            [name]:val
                        })
                        if(this.watch[name]){
                            let func = this.watch[name].bind(this)
                            func(val)
                        }
                    })
                }
                this.mounted();
            }

            updateRender(){
                let vnode = this.render()
                this.cachePatches = diff(this.preVnodeTree, vnode)
            }

            render(firstFlag = false){
                let vnode = options.render && (options.render.call(this,createElement) || createElement(null))
                this._note_ref_vnodes = []  // ref 记录
                this._note_child_vnodes = []  // 子组件 记录
                // 递归处理值
                this.deepVnodes(vnode,(_node)=>{
                    if( firstFlag ){
                        // 初次渲染，执行 bind 钩子
                        dealDirective(_node, DIRECTIVE_CYCLE.BIND)
                    }
                    console.log('--include--',include(_node,this.$slots))
                    console.log(_node,this.$slots)
                    if(_node.ref && !include(_node, this.$slots)){
                        this._note_ref_vnodes.push(_node)
                    }
                    if( isComponent(_node) ){
                        this._note_child_vnodes.push(_node)
                    }
                });
                this.cacheVnode = vnode
                return vnode;
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

     
            
            // 更新 refs
            private freshRefs(){
                // 更新 $refs
                this.$refs = this._note_ref_vnodes.reduce((res,noteVnode)=>{
                    res[noteVnode.ref] = typeof noteVnode.type === 'function'
                        ? noteVnode.instance  // 组件
                        : noteVnode.dom  // 原生dom 
                    return res
                },{})
                console.log('$refs', this.$refs, this._note_ref_vnodes)
            }

            // 更新 子组件
            private freshChild(){
                this.$children = this._note_child_vnodes.map((vnode)=>{
                    return vnode.instance
                })
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
        // ERerComponent.prototype.$setState = function(obj){
        //     Object.assign(this,obj) // 更新数据
        //     renderComponent( this );
        // }
    
        return ERerComponent
    }
})()


// 判断是否是组件
export const isComponent = function(vnode:vnode){
    return typeof vnode.type == 'function'  && vnode.type.prototype instanceof ERerComponentBase
}

// 判断是否树内部是否包含
const include = function(obj,item){
    if(item instanceof Array){
        return item.some(_obj=>{
            return include(obj,_obj)
        })
    }else{
        if(obj == item){
            return true
        }
        if(item && item.children){
            return include(obj,item.children)
        }
    }
    return false
}

// 渲染组件
const renderComponent = function( component ){
    const vnode = component.render(true)  // 初次渲染 获取虚拟 dom   
    // console.log('--renderComponent--',vnode)
    let $el = transElement( vnode, {parentInstance:component,signName:'inserted'});
    component.$el = $el;  // 真实 dom
    component.preVnodeTree = vnode; // 保存虚拟树，下次比对
    component.freshRefs()
    component.freshChild()
    // console.log('子组件',component.$children)
}

// 更新对象
const update = {
    dirtyComponents:[],
    timer:'',
    start:false,
    updateComponent( component ){
        console.log('--更新 updateRender--', component);
        component.updateRender();
        // component.$children.forEach( child =>{
        //     update.updateComponent(child)
        // })

        if(component.dirty_flag)return
        component.dirty_flag = true;
        this.dirtyComponents.push(component)
        if( this.start === false ){
            requestAnimationFrame(()=>{
                console.log('--开始 patch--')
                // console.time('update')
                while(this.dirtyComponents.length !== 0){
                    let now_component = this.dirtyComponents.shift();
               
                    // if(!vnode){
                    //     vnode = createElement(vnode)
                    // }
                   
                    let patches = now_component.cachePatches.filter(item=>{
                        if( item.dom ){
                            return item.dom.parentNode
                        }else if( item.parentDom ){
                            return item.parentDom.parentNode
                        }else if( item.beforeDom ){
                            return item.beforeDom.parentNode
                        }else{
                            return true
                        }
                    })
                    // console.log('update',now_component.name,patches)
                    now_component.preVnodeTree = now_component.cacheVnode
                    patch( now_component.preVnodeTree, patches )
                    now_component.freshRefs()
                    now_component.freshChild()
                    if( now_component.$parent ){
                        now_component.$parent.freshRefs();
                        now_component.$parent.freshChild();
                    }
                    now_component.dirty_flag = false;
                }
                // console.timeEnd('update')

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
                console.log('--完成 patch--')
            })
            this.start = true;
        }
    },
}

// 注册组件 方法
export const component = function(name,options:componentOptions){
    options.name = name
    return ERerFactory(options)
}

// 实例化组件
export const createComponent = function(componentFunc, config){
    return new componentFunc(config)
}