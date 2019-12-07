import ERer from '/src/ERer'
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
            <div className="sdf" onclick={()=>this.add()}>{ this.text }</div>
            { this.value }
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

