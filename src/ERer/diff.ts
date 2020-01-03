
import { DIFF_TYPE } from './const'
import { isComponent } from './component'

// diff 主入口
const diff = function(oldTree:vnode, newTree:vnode):patchOptions[] {
    let patches:patchOptions[] = [];
    console.log(oldTree)
    console.log(newTree)
    // 递归树， 比较后的结果放到补丁包中
    walk(oldTree, newTree, patches)
    return patches;
}

// 递归处理
function walk(oldVnode:vnode, newVnode:vnode, patches:patchOptions[],parentVnode?:vnode,index?:number) {
    // let currentPatch:patchOptions[] = [];
    let currentPatch:patchOptions[] = patches;

    if( oldVnode && !newVnode ){  // 移除
        currentPatch.push({
            type: DIFF_TYPE.REMOVE,
            parentVnode: parentVnode,
            oldVnode: oldVnode,
            index: index,
        });
    }
    else if( !oldVnode && newVnode ){ // 新增
        // console.log('add------', newVnode)
        currentPatch.push({
            type: DIFF_TYPE.ADD,
            parentVnode: parentVnode,
            newVnode: newVnode,
            index: index,
        })
    }
    else if( oldVnode.type === 'string' && newVnode.type === 'string' ){  // 文本
        if(oldVnode.text !== newVnode.text){
            currentPatch.push({
                type: DIFF_TYPE.TEXT,
                oldVnode: oldVnode,
                newVnode: newVnode,
            });
        }
    }
    else if ( oldVnode.type !== newVnode.type ) {  // 节点类型不同
        currentPatch.push({
            type: DIFF_TYPE.REMOVE,
            parentVnode: parentVnode,
            oldVnode: oldVnode,
            index: index,
        });
        currentPatch.push({
            type: DIFF_TYPE.ADD,
            parentVnode: parentVnode,
            oldVnode: oldVnode,
            newVnode: newVnode,
            index: index,
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
                    oldVnode: oldVnode,
                    newVnode: newVnode,
                    attrs: attrs,
                });
            }
            // 比较儿子们
            // diffChildren(oldVnode.children,newVnode.children,patches,oldVnode);
            diffChildren2(oldVnode.children,newVnode.children,patches,oldVnode);
        }
    }

    // currentPatch.length ? patches[indexCode] = currentPatch : null;
}

// 比较子节点们
const diffChildren = function(oldList:vnode[],newList:vnode[],patches:patchOptions[],parentVnode:vnode){
    oldList = oldList || []
    newList = newList || []
    let maxLen = Math.max(oldList.length,newList.length)

    for(let i = 0;i<maxLen;i++){
        let oldChild = oldList[i]
        walk(oldChild,newList[i],patches,parentVnode,i);
    }
}

const diffChildren2 = function(oldList:vnode[],newList:vnode[],patches:patchOptions[],parentVnode:vnode){
    let nextIndex = 0,
        lastIndex = 0;
    let addCache:any[] = [];  // 新增vnode 数据缓存
    // let multiCache:any[] = [];  // 移动及删除 vnode 数据缓存
    oldList = oldList || []
    newList = newList || []
    // 旧列表 key -- index 映射
    let indexMap = oldList.reduce((res,item,i) => {
            res[item.key] = i
        return res
    },{})

    while(nextIndex <= newList.length - 1){
        let newChild = newList[nextIndex];
        let index = indexMap[newChild.key];
        if( index === undefined ){
            // 临时缓存
            addCache.push({
                old: null,
                new: newChild,
                index: nextIndex,
            })
        }else{
            if(index < lastIndex){
                patches.push({
                    type: DIFF_TYPE.MOVETO,
                    parentVnode: parentVnode,
                    index: nextIndex,
                    oldVnode: oldList[index]
                })
                console.log(oldList,newList)
                console.log('move!!!!',index,oldList[index])
            }
            walk(oldList[index],newChild,patches,parentVnode)
            
            lastIndex = Math.max(index,lastIndex);
        }
        nextIndex++
    }

    let copy_oldList = [...oldList]
    for(let child of newList){
        let index = indexMap[child.key]
        if(index !== undefined ){
            copy_oldList.splice(index,1,null)
        }
    }
    copy_oldList.forEach( item => {
        if( item === null) return
        let index = indexMap[item.key]
        walk(item,null,patches,parentVnode,index)
    })
    addCache.forEach(obj=>{
        walk(obj.old,obj.new,patches,parentVnode,obj.index)
    })
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

const updateChildren =  (function(){
    let sameVnode = function(oldOne:vnode,newOne:vnode):boolean{
        return oldOne.type === newOne.type && oldOne.key === newOne.key
    }

    return function(oldList:vnode[],newList:vnode[],parentCode:string,patches:patchOptions[]) {
        let oldStartIndex = 0, newStartIndex = 0,
            oldEndIndex = oldList.length - 1,
            newEndIndex = newList.length - 1,
            oldStartVnode = oldList[0],
            newStartVnode = newList[0],
            oldEndVnode = oldList[oldEndIndex],
            newEndVnode = newList[newEndIndex]
    
        let oldKeyToIndex
        let IndexInOld
        let elmToMove
        let before
        while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {                                                                               
            // if (oldStartVnode == null) { 
            //     oldStartVnode = oldList[++oldStartIndex] 
            //     // walk(oldChild,newList[i],`${code},${i}`,patches);
            // }else if (oldEndVnode == null) {
            //     oldEndVnode = oldList[--oldEndIndex]
            // }else if (newStartVnode == null) {
            //     newStartVnode = newList[++newStartIndex]
            // }else if (newEndVnode == null) {
            //     newEndVnode = newList[--newEndIndex]
            // }else 
            if (sameVnode(oldStartVnode, newStartVnode)) {
                walk(oldStartVnode, newStartVnode,`${parentCode},${newStartIndex}`,patches)
                oldStartVnode = oldList[++oldStartIndex]
                newStartVnode = newList[++newStartIndex]
            }else if (sameVnode(oldEndVnode, newEndVnode)) {
                walk(oldStartVnode, newStartVnode,`${parentCode},${newStartIndex}`,patches)
                oldEndVnode = oldList[--oldEndIndex]
                newEndVnode = newList[--newEndIndex]
            }else if (sameVnode(oldStartVnode, newEndVnode)) {                                 m                    
                patchVnode(oldStartVnode, newEndVnode)
                api.insertBefore(parentElm, oldStartVnode.el, api.nextSibling(oldEndVnode.el))
                oldStartVnode = oldList[++oldStartIndex]
                newEndVnode = newList[--newEndIndex]
            }else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode)
                api.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
                oldEndVnode = oldList[--oldEndIndex]
                newStartVnode = newList[++newStartIndex]
            }else {
                // 使用key时的比较
                if (oldKeyToIndex === undefined) {
                    oldKeyToIndex = createKeyToOldIndex(oldList, oldStartIndex, oldEndIndex) // 有key生成index表
                }
                IndexInOld = oldKeyToIndex[newStartVnode.key]
                if (!IndexInOld) {
                    api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                    newStartVnode = newList[++newStartIndex]
                }
                else {
                    elmToMove = oldList[IndexInOld]
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                    }else {
                        patchVnode(elmToMove, newStartVnode)
                        oldList[IndexInOld] = null
                        api.insertBefore(parentElm, elmToMove.el, oldStartVnode.el)
                    }
                    newStartVnode = newList[++newStartIndex]
                }
            }
        }
        if (oldStartIndex > oldEndIndex) {
            before = newList[newEndIndex + 1] == null ? null : newList[newEndIndex + 1].el
            addVnodes(parentElm, bef                        ore, newList, newStartIndex, newEndIndex)
        }else if (newStartIndex > newEndIndex) {
            removeVnodes(parentElm, oldList, oldStartIndex, oldEndIndex)
        }
    }
}()

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