import { _renderVnode,setAttrs } from './render'
import { DIFF_TYPE } from './const'
import { isComponent } from './component'


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
    let vnode:vnode = patch.oldVnode;
    let dom:Node = patch.oldVnode && patch.oldVnode.dom;
    // let code_arr,code_len,parent_codeArr,self_code,parentVnode
    let self_index,parentVnode
    switch (patch.type) {
        case DIFF_TYPE.REMOVE:  // 移除
            // code_arr = patch.indexCode.split(',').map(str=>Number(str));
            // code_len = code_arr.length;
            // parent_codeArr = code_arr.slice(0,code_len - 1)
            // self_code = code_arr[code_len - 1]
            // parentVnode = _getVnode(parent_codeArr);

            parentVnode = patch.parentVnode;
            self_index =  patch.index;

            dom.parentNode.removeChild(dom)
            if(parentVnode){
                parentVnode.children.splice(self_index,1)
            }

            // if( isComponent(patch.content) ){
            //     patch.content.instance.unmounted()
            //     delete patch.content.instance
            // }else{
            //     domMap[parent_code].removeChild(dom)
            // }
            break;

        case DIFF_TYPE.TEXT:  // 文本替换
            vnode.text = patch.newVnode.text;  // 补丁
            if (dom.textContent) {
                dom.textContent = vnode.text
            } else {
                dom.nodeValue = vnode.text
            }
            break;

        case DIFF_TYPE.REPLACE:  // 节点替换
            // if( isComponent(patch.oldContent) ){
            //     patch.oldContent.instance.unmounted()
            //     delete patch.oldContent.instance
            // }else{
            //     domMap[parent_code].removeChild(dom)
            // }
            // insertDom(domMap[parent_code], _renderVnode(patch.content), self_code)
            break;

        case DIFF_TYPE.ADD:  // 新增
            // console.log('add--------vnode:', patch.content)
            // code_arr = patch.indexCode.split(',').map(str=>Number(str));
            // code_len = code_arr.length;
            // parent_codeArr = code_arr.slice(0,code_len - 1)
            // self_code = code_arr[code_len - 1]
            // parentVnode = _getVnode(parent_codeArr);
            parentVnode = patch.parentVnode;
            self_index =  patch.index;

            let newDom = _renderVnode(patch.newVnode)
            parentVnode.children.splice(self_index,0,patch.newVnode)  // 补丁
            insertDom(parentVnode.dom, newDom, self_index)
            break;

        case DIFF_TYPE.ATTRS:  //  属性变化
            let attrs = patch.attrs;
            vnode.props = patch.newVnode.props;
            Object.keys(attrs).forEach(key=>{
                setAttrs(dom,key,attrs[key])
            })
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
const insertDom = function(parentDom:HTMLElement, insertDom:Node, index:number){
    let nodes_arr = parentDom.childNodes;
    let len = nodes_arr.length;
    if( (len == 0 && index == 0) || (index == len) ){
        parentDom.appendChild(insertDom)
    }else{
        let afterDom = parentDom[index]
        parentDom.insertBefore(insertDom,afterDom)
    }
}

export default patch