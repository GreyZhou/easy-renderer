//  *****  监听功能 watcher ************************
import Observer from './observer'


// 数组监听
const arrayWatcher = (function(){
    const constructor = function(arr,func){
        this._arr = arr;
        this._arr.__proto__ = this;
        this._func = func;
    }
    const arrayMethods = Object.create(Array.prototype)
    constructor.prototype = arrayMethods;

    const methodsToPatch = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ]
    methodsToPatch.forEach(method=>{
        const original = Array.prototype[method]
        arrayMethods[method] = function(...args){
            const result = original.apply(this, args)
            // console.log(method)
            this._func(this._arr)
            return result;
        }
    })



    return constructor;
})()

interface watcherConfig {
    lazy?:boolean  // 懒监听
    deep?:boolean  // 深度监听
    path?:string   // 当前监听对象的路径
    parent?:Watcher  // 当前监听对象的父级
}


class Watcher{

    private _data:any | Object;  // 需要监听的对象
    private _path:string;   // 内部路径
    private _deep:boolean;  // 深度监听
    private _ob:Observer; // 观察者
    private _parent:Watcher;  // 父对象
    private _isArray:boolean = false;  // 判断监听类型
    private _lazy:boolean = false; // 懒监听

    constructor(obj,config:watcherConfig = {}){
        if (!obj || typeof obj !== 'object') {
            return
        }

        let {lazy = false,deep = true,path = null,parent = null} = config;

        this._data = obj;   
        this._path = path || null;  //将path存在对象内部
        this._deep = !!deep
        this._ob = new Observer();
        this._parent = parent || null;
        this._lazy = !!lazy;

        this._lazy || this._watch();   
    }

    // 监听
    private _watch(){
        if( this._data instanceof Array){
            this._isArray = true;
            new arrayWatcher(this._data,(newArr)=>{
                this.$trigger(this._path,[{
                    path:this._path,
                    new:newArr,
                    old:newArr
                }])
            })
            return;
        }

        Object.keys(this._data).forEach(key=>{
            this._define(key);
            this._deepWatch(this._data[key],key);
        })
    }

    // 存取器
    private _define(key){
        let Path = this._path? this._path+'.'+key : key;
        let temp = this._data[key];
        let _this = this;

        Object.defineProperty(this._data,key,{
            get(){
                return temp;
            },
            set(newVal){
                if(newVal === temp){
                    return;
                }          
                let old = temp      
                temp = newVal;
                _this.$trigger(Path,[{
                    path:Path,
                    new:newVal,
                    old:old,
                }]);
                _this._deepWatch(newVal,key)
             }
        })
    }

    // 深度监听 + 判断
    private _deepWatch(obj,key){
        let Path = this._path? this._path+'.'+key : key;
        if(this._deep && typeof obj === 'object'){
            new Watcher(obj,{
                deep : this._deep,
                path : Path,
                parent : this,
            })
        }
    }

    // 触发事件
    public $trigger(path,bubble){
        // console.log('path: ',path)
        // console.log('self_path: ',this._path)

        // 添加冒泡监听
        if( path.indexOf('.') !== -1 &&  this._parent){
            if( path.indexOf(this._path) !== -1 && !this._isArray){
                bubble.push({
                    path:this._path,
                    new:this._data,
                    old:this._data,
                })
            }
        }

        // 触发监听事件
        if(bubble.length){
            bubble = bubble.filter((item,i)=>{
                if( this._ob.hasEvent(item.path) ){
                    this._ob.trigger(item.path,item.new,item.old);
                    return false;
                }
                return true
            })
        }
        
        // 扔到上层继续处理
        this._parent && this._parent.$trigger(path,bubble)
    }

    // 监听事件
    public $watch(path,func){
        this._ob.listen(path,func)
        if(this._lazy){
            let key = path.split('.').shift();
            this._define(key);
            this._deepWatch(this._data[key],key);
        }
    }
}

export default Watcher;