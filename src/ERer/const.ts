// 保留字段 不提供 props 使用
export const RESERVED_PROPS = {
    // $ref:true,
    key:true,
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
    MOVETO : 'MOVETO',  // 移动操作
}