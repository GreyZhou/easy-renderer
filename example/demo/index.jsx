import ERer from '/src/ERer'
import App from './src/components/app.tsx'

// class App {
//     constructor(...arg){
//         console.log(arg)
//     }

//     render(){
//         return <div>999</div>
//     }
// }
ERer.render(
    <div>
        <App a={5}>xx</App>
    </div>,
    document.getElementById('root')
)
