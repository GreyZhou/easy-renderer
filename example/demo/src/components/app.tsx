import ERer from '../ERer.js'
export default ERer.component('hello',{
    data(){
        return {
            value:90,
            text:'你猜猜'
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
        console.log('created',this.props)
        console.log(this)
    },
    mounted(){
        console.log('mounted')
        setTimeout(()=>{
            this.text = 'aha';
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
        </div>)
    },
    methods:{
        add(){
            this.value++;
        }
    }
})

