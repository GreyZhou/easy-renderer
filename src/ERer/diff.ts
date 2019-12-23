
import { DIFF_TYPE } from './const'
import { isComponent } from './component'

// diff 主入口
const diff = function(oldTree:vnode, newTree:vnode):patchOptions[] {
    let patches:patchOptions[] = [];
    console.log(oldTree)
    console.log(newTree)
    // 递归树， 比较后的结果放到补丁包中
    walk(oldTree, newTree, '0', patches)
    return patches;
}

// 递归处理
function walk(oldVnode:vnode, newVnode:vnode, indexCode:string, patches:patchOptions[]) {
    // let currentPatch:patchOptions[] = [];
    let currentPatch:patchOptions[] = patches;

    if( oldVnode && !newVnode ){  // 移除
        currentPatch.push({
            type: DIFF_TYPE.REMOVE,
            indexCode: indexCode,
            oldVnode: oldVnode,
        });
    }
    else if( !oldVnode && newVnode ){ // 新增
        // console.log('add------', newVnode)
        currentPatch.push({
            type: DIFF_TYPE.ADD,
            indexCode:indexCode,
            oldVnode: oldVnode,
            newVnode: newVnode,
        })
    }
    else if( oldVnode.type === 'string' && newVnode.type === 'string' ){  // 文本
        if(oldVnode.text !== newVnode.text){
            currentPatch.push({
                type: DIFF_TYPE.TEXT,
                indexCode:indexCode,
                oldVnode: oldVnode,
                newVnode: newVnode,
            });
        }
    }
    else if ( oldVnode.type !== newVnode.type ) {  // 节点类型不同
        currentPatch.push({
            type: DIFF_TYPE.REMOVE,
            indexCode: indexCode,
            oldVnode: oldVnode,
        });
        currentPatch.push({
            type: DIFF_TYPE.ADD,
            indexCode:indexCode,
            oldVnode: oldVnode,
            newVnode: newVnode,
        })
        //  // 说明节点被替换
        //  currentPatch.push({
        //     type: DIFF_TYPE.REPLACE,
        //     indexCode:indexCode,
        //     oldVnode: oldVnode,
        //     newVnode: newVnode,
        // });
    }
    else{   // 节点类型相同
        if( isComponent(oldVnode as vnode) && oldVnode.props.class === newVnode.props.class){
            let instance = oldVnode.instance;
            instance.setProps(newVnode.props,newVnode.children)
                // if( instance ){
                    // instance.setProps(newVnode.props,newVnode.children)
            // }else{
            //     currentPatch.push({
            //         type: DIFF_TYPE.ADD,
            //         indexCode:indexCode,
            //         oldVnode: newVnode,
            //     })
            // }
        }else{
            // 比较属性是否有更改
            let attrs = diffAttr(oldVnode.props, newVnode.props);
            if (Object.keys(attrs).length > 0) {
                currentPatch.push({
                    type: DIFF_TYPE.ATTRS,
                    indexCode:indexCode,
                    oldVnode: oldVnode,
                    newVnode: newVnode,
                    attrs: attrs,
                });
            }
            // 比较儿子们
            diffChildren(oldVnode.children,newVnode.children,indexCode,patches);
        }
    }

    // currentPatch.length ? patches[indexCode] = currentPatch : null;
}

// 遍历变化的值
const diffAttr = function( oldProps,newProps ){
    let changeAttrs = {}

    for(let key in newProps){
        let value = newProps[key]
        if( oldProps[key] !== value && typeof oldProps[key] !== 'function'){
            changeAttrs[key] = value
        }
    }
    return changeAttrs
}

// 比较子节点们
const diffChildren = function(oldList:vnode[],newList:vnode[],parentCode:string,patches:patchOptions[]){
    let code = parentCode;
    oldList = oldList || []
    newList = newList || []
    let maxLen = Math.max(oldList.length,newList.length)

    for(let i = 0;i<maxLen;i++){
        let oldChild = oldList[i]
        walk(oldChild,newList[i],`${code},${i}`,patches);
    }
}

const updateChildren =  function(parentElm, oldCh, newCh) {
    let oldStartIdx = 0, newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx
    let idxInOld
    let elmToMove
    let before
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == null) {   //对于vnode.key的比较，会把oldVnode = null
            oldStartVnode = oldCh[++oldStartIdx] 
        }else if (oldEndVnode == null) {
            oldEndVnode = oldCh[--oldEndIdx]
        }else if (newStartVnode == null) {
            newStartVnode = newCh[++newStartIdx]
        }else if (newEndVnode == null) {
            newEndVnode = newCh[--newEndIdx]
        }else if (sameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldCh[++oldStartIdx]
            newStartVnode = newCh[++newStartIdx]
        }else if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldCh[--oldEndIdx]
            newEndVnode = newCh[--newEndIdx]
        }else if (sameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
            api.insertBefore(parentElm, oldStartVnode.el, api.nextSibling(oldEndVnode.el))
            oldStartVnode = oldCh[++oldStartIdx]
            newEndVnode = newCh[--newEndIdx]
        }else if (sameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            api.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldCh[--oldEndIdx]
            newStartVnode = newCh[++newStartIdx]
        }else {
            // 使用key时的比较
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx) // 有key生成index表
            }
            idxInOld = oldKeyToIdx[newStartVnode.key]
            if (!idxInOld) {
                api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                newStartVnode = newCh[++newStartIdx]
            }
            else {
                elmToMove = oldCh[idxInOld]
                if (elmToMove.sel !== newStartVnode.sel) {
                    api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                }else {
                    patchVnode(elmToMove, newStartVnode)
                    oldCh[idxInOld] = null
                    api.insertBefore(parentElm, elmToMove.el, oldStartVnode.el)
                }
                newStartVnode = newCh[++newStartIdx]
            }
        }
    }
    if (oldStartIdx > oldEndIdx) {
        before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].el
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
    }else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
}

// // 对 vnode children 处理，先过滤 再比较
// const walkChild = function( oldVnode:vnodeLike,newVnode:vnodeLike,index:number,patches:Patches,i:number){
//     let currentPatch:patchOptions[] = patches[index] || [];

//     // 文本
//     if( typeof oldVnode === 'string' && typeof newVnode === 'string' ){
//         if(oldVnode !== newVnode){
//             currentPatch.push({
//                 type: DIFF_TYPE.TEXT,
//                 oldVnode:newVnode
//             });
//         }
        
//     }else if( !oldVnode && newVnode ){  // 新增
//         let insertType = i === 0 ? 'child':'after'
//         currentPatch.push({
//             type: DIFF_TYPE.ADD,
//             index:index,
//             insertType: insertType,
//             oldVnode: newVnode,
//         })
//     }else{  // 虚拟dom 节点
//         walk(oldVnode as vnode,newVnode as vnode,index,patches)
//     }

//     currentPatch.length ? patches[index] = currentPatch : null;

// }



export default diff