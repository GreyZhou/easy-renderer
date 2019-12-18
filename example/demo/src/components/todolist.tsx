import ERer from '/src/ERer'

const Todo = ERer.component('todoList',{
    render(){
        console.log('now: todoWrap')
        return <div className="todo-wrap">
            <div className="todo-input">
                <input 
                    value={ this.text } 
                    oninput={(e)=>this.text = e.target.value}
                    onkeypress={e=>this.enter(e)}
                />
                <div className="add" onclick={()=>this.addItem()}>添加</div>
            </div>
            <div className="loading">
                <div className="title">待完成列表<span className='num'>{ this.loadingList.length }</span></div>
                {
                    this.loadingList.map((str,i)=><Item text={str} $change={(val)=>this.changeItem(val,i)}></Item>)
                }
            </div>
            <div className="finish">
                <div className="title">已完成列表<span className='num'>{ this.finishList.length }</span></div>
                {
                    this.finishList.map((str,i)=><Item text={str} check={true} $change={(val)=>this.changeItem(val,i)}></Item>)
                }
            </div>
        </div>
    },
    data(){
        return {
            text:"",
            loadingList:[],
            finishList:[],
        }
    },
    
    methods:{
        addItem(){
            let text = this.text;
            this.loadingList.push(text)
            console.log(this.loadingList)
            this.setState({
                text:""
            })
        },
        changeItem(finishFlag,index){
            // console.log('changeItem',finishFlag,index)
            // let start = this.loadingList
            // let end = this.finishList 
            console.log(this.loadingList,this.finishList)
            if(!finishFlag){
                let item = this.finishList.splice(index,1)
                this.loadingList.push(item[0])
            }else{
                let item = this.loadingList.splice(index,1)
                this.finishList.unshift(item[0])
            }
            this.setState()
        },
        enter(e){
            if(e.keyCode === 13){
                this.addItem()
            }
        }
    }
})

const Item = ERer.component('todoItem',{
    render(){
        let checkClass = this.check?'active':''
        console.log('now todoItem',this.props)
        return <div className={`todo-item ${checkClass}`}>
            <div className={`check-box ${checkClass}`} onclick={()=>this.change()}></div>
            <div className='text'>{ this.props.text }</div>
            <div className='remove'></div>
        </div>
    },
    data(){
        return {
            check:false,
        }
    },
    created(){
        this.check = this.props.check || false
    },
    methods:{
        change(){
            let val = !this.check
            this.setState({
                check:val
            })
            this.$emit('change',val)
        }
    }
})


export default Todo
