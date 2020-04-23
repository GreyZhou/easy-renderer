import ERer from '../ERer.js'
import Poper from './poper'

export default ERer.component('hello', {
    data(){
        return {
            value:90,
            text:'你猜猜',
            show_flag: false,
            text_show: false,
        }
    },
    watch:{
        value(num){
            if(num > 100){
                setTimeout(()=>{
                    this.value = 90
                },2000)
            }
        }
    },
    created(){
        console.log('created',this.$props)
        // console.log(this)
    },
    mounted(){
        console.log('mounted')
        console.log(this.$refs)
        setTimeout(()=>{
            this.text = 'aha';
            this.text_show = true
        },2000)
    },
    render(){
        if(this.value > 100){
            return null
        }
        return (<div>
            <div class="text" onclick={()=>this.add()}>
                <div class="text">
                    { this.text }
                    <div class='text'>{ this.value }</div>
                </div>
            </div>
            
            <button onclick={()=>this.show_flag = true}>弹窗</button>
            <Poper show={ this.show_flag }>
                <div $-if={ this.text_show }>哈哈哈</div>
                <select ref='select' onchange={(e)=>this.change(e)}>
                    <option value ="all">通讯录</option>
                    <option value ="saab">Saab</option>
                    <option value="opel">Opel</option>
                    <option value="audi">Audi</option>
                </select>
            </Poper>
        </div>)
    },
    methods:{
        add(){
            this.value++;
        },
        change(e){
            console.log(e.target, e.target.value)
            // this.$refs['select'].value = e.target.value
            console.log(this.$refs['select'], this.$refs['select'].value)
        }
    }
})