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
interface vnodeOptions {
    type:string | Function  // tag 名称或者
    props?:any        // 属性等配置
    children?:Array<vnode>  // 子元素
}

// 虚拟dom【允许真实 dom 和字符串】
type vnode = vnodeOptions | string | HTMLElement