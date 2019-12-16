// 组件描述
interface componentOptions { 
    render:Function  // 渲染函数
    name:string      // 组件名称
    created?:Function  // 实例化组件时的回调
    mounted?:Function  // dom 渲染完毕后的回调
    methods?:any  // 方法
    data?:Function  // 数据
}

// 虚拟dom 属性
interface vnode {
    type:string | Function | HTMLElement // tag 名称或者组件构造函数
    props?:any        // 属性等配置
    children?:Array<vnodeLike>  // 子元素
    instance?:any  // 组件实例
}

// 单个 patch 描述
interface patchOptions {
    type: string;
    index?: number;
    indexCode: string;
    // text?: string
    // newNode?: vnode
    // attrs?:any 
    content?: any
    insertType?: string
    old?: vnode
    new?: vnode
}
// patches 合集
interface Patches {
    [index:number]:patchOptions[]
}

// 虚拟dom【允许真实 dom & 字符串 & 虚拟dom对象】
type vnodeLike = vnode | string | HTMLElement
