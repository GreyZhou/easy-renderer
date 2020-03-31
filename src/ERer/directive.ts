import { DIRECTIVE_CYCLE } from "./const";

// const DIRECTIVE_CYCLE = {
//     BIND: 'bind',
//     INSERTED: 'inserted',
//     UPDATE: 'update',
// }

const directive = {
    _map:{},
    setDirective(name,config={}){
        if(this._map[name]){
            console.error(`$-${name} 指令已存在`)
            return
        }
        this._map[name] = config
    },
    dealDirective(vnode, signName, oldVnode?){
        let directives = vnode.directive;
        oldVnode = oldVnode || {};
        let old_directives = oldVnode.directive || {}

        if(  !directives || !signName  ) return
        Object.keys(directives).forEach((name)=>{
            if( !this._map[name] && signName === DIRECTIVE_CYCLE.BIND ){
                console.error(`无效的指令：$-${name}`)
                return
            }else if( !this._map[name] || !this._map[name][signName] ){
                return;
            }

            let binding = {
                name: signName,
                value: directives[name],
                oldValue: directives[name] !== old_directives[name]
                    ? old_directives[name]
                    : null
            }
            
            this._map[name][signName](vnode.dom, binding, vnode)
        })
    }
}

directive.setDirective('show',{
    inserted(el, binding, vnode){
        if('style' in el){
            if( binding.value ){
                el.style.display = ''
            }
            else{
                el.style.display = 'none'
            }
        }
    },
    update(el, binding, vnode){
        if( binding.value ){
            el.style.display = ''
        }
        else{
            el.style.display = 'none'
        }
    }
})

directive.setDirective('if',{
    bind(el, binding, vnode){
        if( binding.value == false ){
            vnode.type = 'null'
            vnode.children = []
        }
    },
    update(el, binding, vnode){
        if( binding.value == false ){
            vnode.type = 'null';
            vnode.children = []
        }
    }
})


export const dealDirective = directive.dealDirective.bind(directive)
export const setDirective = directive.setDirective.bind(directive)