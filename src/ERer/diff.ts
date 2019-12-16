
import { DIFF_TYPE } from './const'
import { isComponent } from './component'

// diff 主入口
const diff = function(oldTree:vnode, newTree:vnode):Patches {
    let patches:Patches = {};
    // 递归树， 比较后的结果放到补丁包中
    walk(oldTree, newTree, '0', patches)
    return patches;
}

// 递归处理
function walk(oldVnode:vnodeLike, newVnode:vnodeLike, indexCode:string, patches:Patches) {
    let currentPatch:patchOptions[] = [];

    if( oldVnode && !newVnode ){  // 移除
        currentPatch.push({
            type: DIFF_TYPE.REMOVE,
            indexCode: indexCode,
        });

    }else if( typeof oldVnode === 'string' && typeof newVnode === 'string' ){  // 文本
        if(oldVnode !== newVnode){
            currentPatch.push({
                type: DIFF_TYPE.TEXT,
                indexCode:indexCode,
                content:newVnode
            });
        }
    }else if( !oldVnode && newVnode ){ // 新增
        currentPatch.push({
            type: DIFF_TYPE.ADD,
            indexCode:indexCode,
            content: newVnode,
        })
    }else if ( oldVnode.type !== newVnode.type ) {  // 节点类型不同
         // 说明节点被替换
         currentPatch.push({
            type: DIFF_TYPE.REPLACE,
            indexCode:indexCode,
            content: newVnode
        });
    }else{   // 节点类型相同
        if( isComponent(oldVnode as vnode) ){
            let instance = oldVnode.instance;
            if( instance ){
                instance.setProps(newVnode.props,newVnode.children)
            }else{
                currentPatch.push({
                    type: DIFF_TYPE.ADD,
                    indexCode:indexCode,
                    content: newVnode,
                })
            }
        }else{
              // 比较属性是否有更改
              let attrs = diffAttr(oldVnode.porps, newVnode.props);
              if (Object.keys(attrs).length > 0) {
                  currentPatch.push({
                      type: DIFF_TYPE.ATTRS,
                      indexCode:indexCode,
                      content: attrs
                  });
              }
              // 比较儿子们
              diffChildren(oldVnode.children,newVnode.children,indexCode,patches);
        }
    }

    currentPatch.length ? patches[indexCode] = currentPatch : null;
}

const diffAttr = function(oldProps,newProps){
    return {}
}

// 比较子节点们
const diffChildren = function(oldList:vnodeLike[],newList:vnodeLike[],parentCode:string,patches:Patches){
    let code = parentCode;
    oldList = oldList || []
    newList = newList || []
    let maxLen = Math.max(oldList.length,newList.length)

    for(let i = 0;i<maxLen;i++){
        let oldChild = oldList[i]
        // if(oldChild) index++
        walk(oldChild,newList[i],code + i,patches);
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
//                 content:newVnode
//             });
//         }
        
//     }else if( !oldVnode && newVnode ){  // 新增
//         let insertType = i === 0 ? 'child':'after'
//         currentPatch.push({
//             type: DIFF_TYPE.ADD,
//             index:index,
//             insertType: insertType,
//             content: newVnode,
//         })
//     }else{  // 虚拟dom 节点
//         walk(oldVnode as vnode,newVnode as vnode,index,patches)
//     }

//     currentPatch.length ? patches[index] = currentPatch : null;

// }



export default diff