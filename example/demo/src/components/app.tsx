import ERer from '../ERer.js'
export default ERer.component('hello',{
    data(){
        return {
            value:90,
            text:'你猜猜'
        }
    },
    created(){
        console.log('created',this.props)
        console.log(this)
    },
    mounted(){
        console.log('mounted')
        setTimeout(()=>{
            this.setState({
                text:'aha'
            })
        },2000)
    },
    render(){
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
            let val = this.value + 1;
            this.setState({
                value:val
            })
        }
    }
})

