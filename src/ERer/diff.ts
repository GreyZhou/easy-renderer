
import { DIFF_TYPE } from './const'
import { isComponent } from './component'

// diff 主入口
const diff = function(oldTree:vnode, newTree:vnode):patchOptions[] {
    let patches:patchOptions[] = [];
    console.log('--- diff ---')
    console.log(oldTree,newTree)
    console.log('--------')
    // 递归树， 比较后的结果放到补丁包中
    walk(oldTree, newTree, patches)
    return patches;
}

// 递归处理
function walk(oldVnode:vnode, newVnode:vnode, patches:patchOptions[],parentVnode?:vnode,index?:number) {
    // let currentPatch:patchOptions[] = [];
    let currentPatch:patchOptions[] = patches;
    if( newVnode && oldVnode){
        newVnode.instance = oldVnode.instance
        newVnode.dom = oldVnode.dom
    }

    if( oldVnode && !newVnode ){  // 移除
        currentPatch.push({
            type: DIFF_TYPE.REMOVE,
            parentVnode: parentVnode,
            oldVnode: oldVnode,
            index: index,
        });
        return null
    }
    else if( !oldVnode && newVnode ){ // 新增
        // console.log('add------', newVnode)
        currentPatch.push({
            type: DIFF_TYPE.ADD,
            parentVnode: parentVnode,
            newVnode: newVnode,
            index: index,
        })
        return newVnode
    }
    else if( oldVnode.type === 'string' && newVnode.type === 'string' ){  // 文本
        if(oldVnode.props.text !== newVnode.props.text){
            // parentVnode.children.splice(index,1,newVnode)
            currentPatch.push({
                type: DIFF_TYPE.TEXT,
                oldVnode: oldVnode,
                newVnode: newVnode,
                newText: newVnode.props.text,
            });
        }
        return newVnode
    }
    else if ( oldVnode.type !== newVnode.type ) {  // 节点类型不同
        console.log(index,parentVnode)
        // currentPatch.push({
        //     type: DIFF_TYPE.REMOVE,
        //     parentVnode: parentVnode,
        //     oldVnode: oldVnode,
        //     index: index,
        // });
        // currentPatch.push({
        //     type: DIFF_TYPE.ADD,
        //     parentVnode: parentVnode,
        //     oldVnode: oldVnode,
        //     newVnode: newVnode,
        //     index: index,
        // })
        // Object.keys(newVnode).forEach(key=>{
        //     if(key !== 'dom' && key !== 'instance'){
        //         oldVnode[key] = newVnode[key]
        //     }
        // })
        
        // 说明节点被替换
        // parentVnode.children.splice(index,1,newVnode)
        currentPatch.push({
            type: DIFF_TYPE.REPLACE,
            parentVnode: parentVnode,
            index: index,
            oldVnode: oldVnode,
            newVnode: newVnode,
        });
        return newVnode
    }
    else{   // 节点类型相同
        if( isComponent(oldVnode as vnode) ){
            let instance = newVnode.instance;
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
            return oldVnode
        }else{
            // 比较属性是否有更改
            let attrs = diffAttr(oldVnode.props, newVnode.props);
            if (Object.keys(attrs).length > 0) {
                currentPatch.push({
                    type: DIFF_TYPE.ATTRS,
                    oldVnode: oldVnode,
                    newVnode: newVnode,
                    parentVnode: parentVnode,
                    attrs: attrs,
                    index: index,
                });
            }
            // 比较儿子们
            diffChildren2(oldVnode.children, newVnode.children, patches, oldVnode);
            // let old_list = oldVnode.props && oldVnode.props.children || []
            // let new_list = newVnode.props && newVnode.props.children || []
            // diffChildren( old_list, new_list, patches, oldVnode);
            return oldVnode
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

    // console.log([...oldList].sort((a,b)=>a.key - b.key).some((item,i,arr)=>{
    //     if(item.key === arr[i+1] && arr[i+1].key){
    //         console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    //         return  true
    //     }
    // }))
    // console.log([...newList])

    // 旧列表 key -- vnode 映射
    let childMap = oldList.reduce((res,item,i) => {
            item._mountIndex = i;
            res[item.key] = item
        return res
    },{})

    let indexMap = oldList.reduce((res,item,i) => {
            res[item.key] = i
        return res
    },{})

    while(nextIndex <= newList.length - 1){
        let newChild = newList[nextIndex];
        let index = indexMap[newChild.key];
        if( index === undefined ){  // 新增
            // // 临时缓存
            // addCache.push({
            //     old: null,
            //     new: newChild,
            //     index: nextIndex,
            // })

            // oldList.forEach(item=>{
            //     if(nextIndex <= item._mountIndex){
            //         item._mountIndex++
            //     }
            // })
            // newChild._mountIndex = nextIndex
            walk(null, newChild, patches, parentVnode, nextIndex)
        }else{

            if(index < lastIndex){
                patches.push({
                    type: DIFF_TYPE.MOVETO,
                    parentVnode: parentVnode,
                    index: index,
                    toIndex: nextIndex,
                    oldVnode: newChild
                })
                // console.log(oldList,newList)
                // console.log('move!!!!',index,oldList[index])
                lastIndex = Math.max(oldChild._mountIndex,lastIndex);            
                oldList.forEach(item=>{
                    if( item._mountIndex > oldChild._mountIndex && item._mountIndex <= nextIndex){
                        item._mountIndex--
                    }
                })
                oldChild._mountIndex = nextIndex;
                oldList.splice(oldChild._mountIndex,1)
                oldList.splice(nextIndex,0,oldChild)
            }

            walk(oldChild, newChild, patches, parentVnode, nextIndex)
       
        }
        nextIndex++
    }

    let newChildMap = newList.reduce((res,item,i)=>{
        res[item.key] = item
        return res
    },{})
    for(let index in oldList){
        let searchChild = newChildMap[oldList[index].key]
        if(searchChild == undefined ){
            oldList.splice(Number(index),1,null)
            walk(oldList[index], null, patches, parentVnode, Number(index))
        }
    }

    // copy_oldList.sort((a,b)=>{
    //     let index_a = a === null? null : indexMap[a.key]
    //     let index_b = b === null? null : indexMap[b.key]
    //     return index_b - index_a
    // })
    // .filter(item=>{
    //     return item !== null
    // })
    // .forEach( (item,i) => {
    //     let index = indexMap[item.key]
    //     walk(item,null,patches,parentVnode,index)
    // })


    // addCache.forEach(obj=>{
    //     walk(obj.old,obj.new,patches,parentVnode,obj.index)
    // })
    // parentVnode.children = oldList.filter(item=>item !== null)
    parentVnode.children = newList;

    // let cache = [...oldList]

    // setTimeout(()=>{
    //     if(oldList.length !== newList.length || oldList.some((item,i)=>{
    //         return item.type !== newList[i].type || item.key !== newList[i].key
    //     })){
    //         console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    //         console.log(cache)
    //         console.log(oldList)
    //         console.log(newList)
    //         console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    
    //     }
    // },10)
}


// 遍历变化的值
const diffAttr = function( oldProps,newProps ){
    let changeAttrs = {}
    for(let key in newProps){
        // if(key === 'children') continue
        let value = newProps[key]
        // if( typeof oldProps[key] == 'function' && typeof value == 'function' && JSON.stringify(oldProps[key]) !== JSON.stringify(value) ){
        //     // oldProps[key] = value
        //     changeAttrs[key] = value
        // }else if( oldProps[key] !== value  || typeof oldProps[key] == 'function'){
        //     changeAttrs[key] = value
        // }    
        if( JSON.stringify(oldProps[key]) !== JSON.stringify(value)  && typeof oldProps[key] !== 'function'){
            changeAttrs[key] = value
        }
        // if(JSON.stringify(oldProps[key]) !== JSON.stringify(value)){
        //     changeAttrs[key] = value
        // }
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
})()

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