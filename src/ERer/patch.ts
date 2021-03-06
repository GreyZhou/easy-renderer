import transElement,{ setAttrs } from './transElement'
import { DIFF_TYPE } from './const'
// import { isComponent } from './component'


const patch = function( oldTree:vnode, patches:patchOptions[] ):HTMLElement{

    return patchWalk( oldTree, patches )
}

// 遍历处理
const patchWalk = function( tree:vnode, patches:patchOptions[] ){
    if( patches.length == 0 )return

    patches.forEach(patchObj=>{
        applyPatches( patchObj )
    })

    return tree.dom as HTMLElement
}

// 对应节点操作
const applyPatches = function( patch:patchOptions ){
    // let vnode:vnode = patch.oldVnode;
    let dom:Node = patch.dom;
    // let code_arr,code_len,parent_codeArr,self_code,parentVnode
    let parentVnode,beforeVnode,newDom
    switch (patch.type) {
        case DIFF_TYPE.REMOVE:  // 移除
            if(!dom)return  // 多余的patch 导致 dom 可能为 null
            patch.parentDom.removeChild(dom)
            break;

        case DIFF_TYPE.ADD:  // 新增
            // parentVnode = patch.parentVnode;
            // beforeVnode = patch.beforeVnode;
            newDom = transElement(patch.newVnode)
            insertAfter(patch.parentDom, newDom, patch.beforeDom)
            break;

        case DIFF_TYPE.TEXT:  // 文本替换
            if(!dom)return  // 多余的patch 导致 dom 可能为 null
            if (dom.textContent) {
                dom.textContent = patch.newText
            } else {
                dom.nodeValue = patch.newText
            }
            break;

        case DIFF_TYPE.REPLACE:  // 节点替换
            // parentVnode = patch.parentVnode;
            if(!dom)return  // 多余的patch 导致 dom 可能为 null
            newDom = transElement(patch.newVnode)
            insertAfter(patch.parentDom, newDom, dom)
            dom && dom.parentNode && dom.parentNode.removeChild(dom)
            break;

        case DIFF_TYPE.ATTRS:  //  属性变化
            let attrs = patch.attrs;
            Object.keys(attrs).forEach(key=>{
                setAttrs(patch.newVnode,key,attrs[key])
            })
            break;

        case DIFF_TYPE.MOVETO:
            // parentVnode = patch.parentVnode;
            // beforeVnode = patch.beforeVnode;
            insertAfter(patch.parentDom, dom, patch.beforeDom)
            break;
    }
}

// // 获取 vnode
// const getVnode = function( tree ){
//     return function(codeArr){
//         if(codeArr.length == 0){
//             return null
//         }

//         let len = codeArr.length
//         if(len == 1 && codeArr[0] == 0){ // 到根节点了
//             return tree
//         }else{
//             // let arr = code.split('').map(str=>Number(str));
//             codeArr.shift();  // 去掉根节点
//             return codeArr.reduce((obj,num,i)=>{
//                 if(obj.children){
//                     obj = obj.children[num]
//                 }
//                 return obj
//             },tree)
//         }
//     }
// }

// // 获取dom
// const getDom = function( domMap,code ) {

//     let len = code.length;
    
//     if(len == 1 && code == 0){ // 到根节点了
//         return domMap[0]
//     }else{
//         let selfCode = Number( code.substr(len-1,1) );
//         let parentCode = code.substr(0,len-1)
//         let parent = domMap[parentCode] || getDom(domMap,parentCode);
//         let dom = parent.childNodes[selfCode]
//         domMap[code] = dom;
//         return dom
//     }    
// }

// 指定位置插入dom
const insertDom = function(parentDom:HTMLElement, insert_dom:Node, index:number){
    let nodes_arr = parentDom.childNodes;
    let len = nodes_arr.length;
    if( (len == 0 && index == 0) || (index == len) ){
        parentDom && parentDom.appendChild(insert_dom)
    }else{
        let afterDom = nodes_arr[index]
        parentDom && parentDom.insertBefore(insert_dom,afterDom)
    }
}

const insertAfter = function(parentDom:HTMLElement, insert_dom:Node, beforeDom:Node){
    if(!beforeDom){
        parentDom && parentDom.appendChild(insert_dom)        
    }else{
        let afterDom = beforeDom.nextSibling;
        parentDom && parentDom.insertBefore(insert_dom,afterDom)
    }
}
export default patch