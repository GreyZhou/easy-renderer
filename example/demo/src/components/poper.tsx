import ERer from '../ERer.js';

/**
 * @title 入参
 * @param show [boolean] 展示与否
 **/ 
export default ERer.component('popup',{
    render(){
        // 第一次渲染 & 没有展示需求
        console.log('poper $slots:',this.$slots)
        if(this.first && !this.$props.show){
            return ""
        }else{
            this.first = false;
            let active_class = this.$props.show
                ? ''
                : 'no-active'
            return (<div class={`hik-popup ${active_class}`}>
                <div class="hik-main">
                    { this.$slots }
                </div>
            </div>)
        }
    },
    data(){
        return {
            first:true,
        }
    },
    mounted(){
        setTimeout(()=>{
            document.body.appendChild(this.$el)
        })
    }
})