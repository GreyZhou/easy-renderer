import ERer from '/src/ERer'

const Todo = ERer.component('todoList',{
    render(h){
        console.log('获取模板: todoList')
        return <div className="todo-wrap">
            <div className="todo-input">
                <input 
                    $ref='input'
                    value={ this.text } 
                    oninput={(e)=>{
                        let text = e.target.value
                        this.setState({
                            text:text,
                        })
                    }}
                    onkeypress={e=>this.enter(e)}
                />
                <div class="add" onclick={()=>this.addItem()}>添加</div>
            </div>
            <div class="loading">
                <div class="title">待完成列表<span class='num'>{ this.loadingList.length }</span></div>
                {
                    this.loadingList.map((str,i)=>{
                        console.log(str,i)
                        return <Item text={str} $change={(val)=>this.changeItem(val,i)} key={str}></Item>
                    })
           
                }
                {
                    this.loadingList.map((str,i)=>{
                        return <div onclick={()=>{ console.log(i) }}>{ str },{i}</div>
                    })
                }
            </div>
            <div class="finish">
                <div class="title">已完成列表<span class='num'>{ this.finishList.length }</span></div>
                {
                    this.finishList.map((str,i)=><Item text={str} check={true} $change={(val)=>this.changeItem(val,i)} key={str}></Item>)
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
            this.setState({
                text:'',
                loadingList:[...this.loadingList],
            })
            console.log(this.loadingList)
        },
        changeItem(finishFlag,index){
            // console.log('changeItem',finishFlag,index)
            // let start = this.loadingList
            // let end = this.finishList 
            // console.log(this.finishList.join(','))
            console.log(index,this.loadingList.join(','))

            if(!finishFlag){
                let item = this.finishList.splice(index,1)
                this.loadingList.push(item[0])
            }else{
                let item = this.loadingList.splice(index,1)
                this.finishList.unshift(item[0])
            }
            this.setState({
                loadingList:[...this.loadingList],
                finishList:[...this.finishList],
            })
            console.log(this.loadingList)
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
        let checkClass = this.props.check?'active':''
        console.log('获取模板： todoItem',this.props)
        return <div class={`todo-item ${checkClass}`}>
            <div class={`check-box ${checkClass}`} onclick={()=>this.change()}></div>
            <div class='text'>{ this.props.text }</div>
            <div class='remove'></div>
        </div>
    },

    methods:{
        change(){
            let val = !this.props.check
            this.$emit('change',val)
        }
    }
})


export default Todo

