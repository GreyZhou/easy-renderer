import { _renderVnode } from './render'
import { DIFF_TYPE } from './const'
import { isComponent } from './component'


const patch = function(dom:HTMLElement,patches:Patches):HTMLElement{

    return patchWalk(dom,patches)
}

// 遍历处理
const patchWalk = function( node:HTMLElement, patches:Patches ){
    let domMap:any = {
        "0": node
    };
    Object.keys(patches).forEach((code)=>{
        let patch_arr = patches[code]
        applyPatches( domMap, code, patch_arr )
    })

    // let patch_arr = patches[treeCode]
    // console.log(treeCode,node)
    // //遍历子节点
    // let len = node.childNodes
    //     ? node.childNodes.length
    //     : 0
    // for (var i = 0; i < len; i++) {
    //     let child:HTMLElement = node.childNodes[i] as HTMLElement
    //     patchWalk(child, indexObj, patches)
    // }
    
    // //将当前节点的修改记录进行真是的dom修改
    // if ( patch_arr ) {
    //     return applyPatches(node, patch_arr)
    // }

    return node
}

// 对应节点操作
const applyPatches = function( domMap:any = {}, treeCode:string, patchArr:patchOptions[] ){
    
    let dom = getDom(domMap,treeCode);
    // console.log(domMap)
    patchArr.forEach(patch=>{
        let code_len = treeCode.length
        let self_code = Number( treeCode.substr(code_len-1,1) )
        let parent_code = treeCode.substr(0,code_len - 1)
        console.log(patch.type,patch.content)
        switch (patch.type) {
            case DIFF_TYPE.REMOVE:  // 移除
                if( isComponent(patch.content) ){
                    patch.content.instance.unmounted()
                    delete patch.content.instance
                }else{
                    domMap[parent_code].removeChild(dom)
                }
                break;

            case DIFF_TYPE.TEXT:  // 文本替换
                if (dom.textContent) {
                    dom.textContent = patch.content
                } else {
                    dom.nodeValue = patch.content
                }
                break;

            case DIFF_TYPE.REPLACE:  // 节点替换
                if( isComponent(patch.oldContent) ){
                    patch.oldContent.instance.unmounted()
                    delete patch.oldContent.instance
                }else{
                    domMap[parent_code].removeChild(dom)
                }
                insertDom(domMap[parent_code], _renderVnode(patch.content), self_code)
                break;

            case DIFF_TYPE.ADD:  // 新增
                // console.log('add--------vnode:', patch.content)
                insertDom(domMap[parent_code], _renderVnode(patch.content), self_code)
                break;

            case DIFF_TYPE.ATTRS:  //  属性变化
                
                break;
        
            default:
                break;
        }
    })

}

// 获取dom
const getDom = function( domMap,code ) {

    let len = code.length;
    
    if(len == 1 && code == 0){ // 到根节点了
        return domMap[0]
    }else{
        let selfCode = Number( code.substr(len-1,1) );
        let parentCode = code.substr(0,len-1)
        let parent = domMap[parentCode] || getDom(domMap,parentCode);
        let dom = parent.childNodes[selfCode]
        domMap[code] = dom;
        return dom
    }    
}

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