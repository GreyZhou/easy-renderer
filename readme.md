# easy-renderer

简化版的响应式框架，可以自动监听数据更新视图，类 vue 语法，支持 jsx，可以用于快速开发单独的 js 插件，减少打包后的体积。



## 安装

暂时未发npm



## 使用前的准备

安装 `babel-plugin-transform-react-jsx` 插件



### 全局解析 jsx

在 babel 配置文件（.babelrc 或 babel.config.js）中添加下方内容
```json
"plugins": [
    ["transform-react-jsx", { "pragma":"ERer.createElement" }]
]
```


### 单文件解析 jsx

在文件头部写入编译注释
```js
/** @jsx ERer.createElement */
```



## 全局对象

引入 easy-renderer 后，可以直接使用，也可以调用 `window.ERer` 来使用。

#### 全局的方法

| 方法名        | 描述                                                         | 参数                                                         | 返回值               |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------- |
| component     | 定义(注册)组件的函数                                         | name【string】    组件名称<br />options【componentOptions】   组件参数（类vue语法） | 组件的构造函数（类） |
| render        | 在页面指定 dom 位置渲染（插入）dom                           | vnode【vnode】    jsx 或  createElement 生成的虚拟dom<br />container【HTMLElement】指定的 dom 容器<br />replaceFlag【boolean】 是否替换掉指定的 dom | --                   |
| renderWrap    | 当指定 dom 是组件的一部分时，可以使用该方法，可以包裹住指定 dom 进行渲染 | vnode【vnode】<br />child【HTMLElement】                     | --                   |
| createElement | 虚拟 dom 的生产函数                                          | type, config, ...children                                    | vnode                |
| directive     | 注册自定义指令                                               | el, binding, vnode                                           | --                   |



#### 组件的配置 componentOptions 

##### 生命周期

- created
- mounted

##### 其余配置

- render 	【function】描述组件内容
- data         【function】内部数据
- methods   方法合集
- watch         监听指定数据变化

##### 内部方法和属性

在配置项和生命周期内，通过 `this.[name]` 可以访问内置的方法和属性

- $componentName    组件名称
- $el                                渲染后的 dom
- $props                         组件的传参
- $refs                             同 vue，标记的实例集合
- $slots                           组件标签间的 vnode 合集
- $parent                        父级组件
- $setState                   【function】(obj)  手动修改 data
- $emit                         【function】(name, ...value)  触发指定事件



#### 组件 render 详解

`render ` 必须为函数，返回值即为渲染内容，返回值可以为空。属性和文本内容可以通过 jsx 语法糖直接设置。原生事件可以利用箭头函数快速绑定到组件内部的方法，可以参照下例。

```tsx
ERer.component('hello',{
    render(){
        if(this.value > 100){
            return null
        }
        return (<div>
            <div class="text" onclick={()=>this.add()}>
                <div class="text">
                    { this.text }
                    <div class='text'>{ this.value }</div>
                </div>
            </div>
        </div>)
    },
    data(){
        return {
            value:90,
            text:'你猜猜'
        }
    },
    watch:{
        value(num){
            if(num > 100){
                setTimeout(()=>{
                    this.value = 90
                },2000)
            }
        }
    },
    created(){
        console.log('created',this.props)
        console.log(this)
    },
    mounted(){
        console.log('mounted')
        setTimeout(()=>{
            this.text = 'aha';
        },2000)
    },
    methods:{
        add(){
            this.value++;
        }
    }
})
```

除了原生dom，render 内也可以包含其他的组件，也可以通过数组的形式，批量渲染。需要注意的是，当批量渲染时，需要额外设置一下 **key** 属性，来提升组件的渲染效率。

```tsx
render(){
	return (
    	<div class="loading">
            <div class="title">待完成列表<span class='num'>{ this.loadingList.length }</span></div>
            {
                this.loadingList.map((str,i)=>{
                    return <Item 
                        text={str} 
                        $change={(val)=>this.changeItem(val,i)} 
                        $dragstart={()=>this.dragIndex = i}
                        $dragenter={()=>this.handleEnter(i)}
                        $dragend={()=>this.dragIndex = ''}
                        key={str}>
                    </Item>
                })

            }
            
        ... ...
		</div>
    )
}
```

##### 特殊语法

- **$**eventName         

  自定义事件，组件上可以监听自定义事件，语法为  **$**  +  事件名称，自定义事件需由组件内部的 `$emit` 方法进行触发。

- **ref**

  用于标记特定节点，通过 `$refs[name]`获取，可以拿到组件对象或原生 dom
  
- 内置命令

  - $-if                              【自定义命令】功能同 v-if
  - $-show                       【自定义命令】功能同 v-show



## 渲染根节点例子

根文件需要执行一次插入操作，否则组件不会实例化。

```tsx
let div = document.createElement('div')
ERer.render(
    <div class='todo-list-app'>
        <div class="title">ToDoList</div>
        { undefined }
        { div }
        <Todo></Todo>
        <App></App>
    </div>,
    document.getElementById('root')
)
```


### TODO
- [ ] 【需求】框架 class 属性的优化，支持多个 class 配置合并；支持 json 形式配置
- [ ] 【需求】框架 computed
- [ ] 【需求】框架 watch 不支持 "data.list" 这种形式
- [ ] 【bug】框架  $-if 在列表渲染中失效
