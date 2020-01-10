class Observer {
    private funcMap
    constructor(){
        this.funcMap = {};
    }

    listen(name:string,func:Function){
        let arr:Function[] = this.funcMap[name] || (this.funcMap[name] = []);
        arr.push(func);
    }

    trigger(name:string,...arg){
        let list:Function[] = this.funcMap[name] || [];
        for(let func of list){
            func.apply(null,arg);
        }
    }

    hasEvent(name:string){
        let list = this.funcMap[name] || [];
        return list.length !== 0
    }

    clean(name){
        this.funcMap[name] && (this.funcMap[name] = [])
    }
}

export default Observer;