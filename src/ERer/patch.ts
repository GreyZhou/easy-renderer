import { _renderVnode } from './render'

const patch = function(dom:HTMLElement,patches:Patches):HTMLElement{

    return patchWalk(dom,0,patches)
}

// 递归处理
const patchWalk = function( node:HTMLElement,index,patches:Patches ){
    let patch_arr = patches[index]

    //遍历子节点
    let len = node.childNodes
        ? node.childNodes.length
        : 0
    for (var i = 0; i < len; i++) {
        let child = node.childNodes[i] as HTMLElement
        index++
        patchWalk(child, index, patches)
    }
    //将当前节点的修改记录进行真是的dom修改
    if ( patch_arr ) {
        return applyPatches(node, patch_arr)
    }

    return node
}


// 对应节点操作
const applyPatches = function(dom,patchArr:patchOptions[]){
    if(patchArr.length == 0){
        console.warn('boom!')
    }

    return dom
}

export default patch