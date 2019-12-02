const createElement = function(nodeName, attributes, ...args){
    // 使用concat是为了扁平化args，因为args数组里面的元素可能也是数组
    // h('div', {}, [1, 2, 3])  h('d', {}, 1, 2, 3) 都是合法的调用
    const children = args.length ? [].concat(...args) : null;
    return { nodeName, attributes, children };
}


// // 简易 cerateElement/h  名称于 babel.config.js 配置
// window.JQH = function(nodeName, attributes, ...args) {
//     // 使用concat是为了扁平化args，因为args数组里面的元素可能也是数组
//     // h('div', {}, [1, 2, 3])  h('d', {}, 1, 2, 3) 都是合法的调用
//     const children = args.length ? [].concat(...args) : null;
//     return { nodeName, attributes, children };
// }
// import { initClassList } from "@module/tool.js"
// initClassList();


// class monitor {

//     // 监听数据变化
//     listen(){
//         if(!this.watch || typeof this.watch !== 'object'){
//             return;
//         }

//         let watcher = new Watcher(this,{lazy:true})
//         for(let name in this.watch){
//             let func = this.watch[name].bind(this)
//             watcher.$watch(name,func)
//         }

//     }
//     // ******渲染jsx***********************
//     // 挂载渲染 或 替换
//     render(vnode,id,replaceFlag){
//         let doms = this.getNode(vnode);
//         // console.log(dom)
//         // console.log(typeof dom)
//         if(doms instanceof Array === false){
//             doms = [doms]
//         }

        
//         let content;
//         if( id instanceof HTMLElement ){
//             content = id;
//         }else if(typeof id === 'string'){
//             content = document.getElementById(id.replace(/^#/,''));
//         }

//         if(content){
//             // 完整替换dom
//             if(replaceFlag){
//                 let parent = content.parentNode;
//                 for(let dom of doms){
//                     parent.insertBefore(dom, content);
//                 }
//                 parent.removeChild(content);
//             }
//             // 内部渲染
//             else{
//                 content.innerHTML = "";
//                 for(let dom of doms){
//                     content.appendChild(dom);
//                 }
//             }
//         }

//         return doms.length == 1?doms[0]:doms
//     }
//     // 添加子元素
//     append(vnode,parent){
//         let child = this.getNode(vnode);
//         if(child instanceof Array === false){
//             child = [child]
//         }

//         let content;
//         if( parent instanceof HTMLElement ){
//             content = parent;
//         }else if(typeof parent === 'string'){
//             content = document.getElementById(parent.replace(/^#/,''));
//         }

//         if(content){
//             for(let dom of child){
//                 content.appendChild(dom);
//             }
//         }

//         return child.length == 1?child[0]:child;
//     }
//     // 包裹渲染
//     wrap(dom,vnode){
//         let clone_dom = dom.cloneNode(true)
//         let parent = dom.parentNode;
//         parent.insertBefore(clone_dom, dom);

//         return this.render(vnode,clone_dom,true)
//     }

//     // vnode -> node
//     getNode(vnode){
//         if(vnode instanceof HTMLElement){
//             return vnode
//         }
//         if( vnode === undefined || vnode === null ){
//             return document.createTextNode('');
//         }
//         if(vnode instanceof Array){
//             return vnode.map(item=>this.getNode(item))
//         }
//         if(typeof vnode === 'string' || !vnode.nodeName) {
//             // 生成文本节点
//             return document.createTextNode(vnode);
//         }


//         // 生成元素节点并设置属性
//         const attributes = vnode.attributes || {};
//         if( ['$if','If','_if'].some(key=>attributes.hasOwnProperty(key) && !!attributes[key]==false) ){
//             return document.createTextNode('');
//         }

//         const node = document.createElement(vnode.nodeName);
//         Object.keys(attributes).forEach(key =>{
//             if( ['$if','If','_if'].some(str=>str===key) ){
//                 return;
//             }
//             else if( typeof attributes[key] === 'function'){
//                 node[key] = attributes[key]
//             }
//             else if( key === '$Node' || key === 'Node' ||key === '_node' ){  // node 处理
//                 this[attributes[key]] = node;
//             }
//             else{
//                 node.setAttribute(key, attributes[key])
//             }
//         });
        
//         if (vnode.children) {
//             // 递归调用render生成子节点
//             vnode.children.forEach(child => node.appendChild(this.getNode(child)));
//         }
        
//         return node;
//     }
// }

const component = function(name,options){
    console.log('component')
    return name + ' 啊哈哈哈哈'
}

export default {
    createElement,
    component,
}

