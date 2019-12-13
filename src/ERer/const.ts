// 组件保留属性 内部需要使用
export const RESERVED_PROPS = {
    // key:true,
    // $ref:true,
    $el:true,
    preVnodeTree:true,
    $emit:true,
    $slots:true,
    event:true,
}

// 特别属性
export const SPECIAL_PROPS = {
    $if:true,
    $ref:true,
    $show:true,
    $model:true,
}

// diff type
export const DIFF_TYPE = {
    ATTRS : 'ATTRS',  //属性改变
    TEXT : 'TEXT',  //文本改变
    REMOVE : 'REMOVE',  //移除操作
    REPLACE : 'REPLACE',  //替换操作
    ADD : 'ADD',  // 创建操作
}