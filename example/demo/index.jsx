import ERer from './src/ERer'
import App from './src/components/app.tsx'
import Todo from './src/components/todolist.tsx'
import './src/scss/index.scss'

// class App {
//     constructor(...arg){
//         console.log(arg)
//     }

//     render(){
//         return <div>999</div>
//     }
// }


ERer.directive('test',{
    inserted(...arg){
        console.log(arg)
        console.log(this)
    }
})

let div = document.createElement('div')
ERer.render(
    <div class='todo-list-app'>
        <div class="title">ToDoList</div>
        { undefined }
        { div }
        <Todo></Todo>
        <App></App>
    </div>,
    document.getElementById('root')
)

