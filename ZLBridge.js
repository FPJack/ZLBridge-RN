export const locaJS = "(function () {    if (window.zlbridge) return ;    var zlbridge = {        call: function(method,arg,func){            if (typeof method != 'string') return;            if (typeof arg == 'function') {                func = arg;                arg = null;            }            var args = {};            args['body'] = arg;            args['name'] = method;            args['end'] = true;            args['callID'] = '';            if (typeof func == 'function') {                var _callHandlerID = setTimeout(function(){});                _callHandlerID = '_methodid_' + _callHandlerID + new Date().getTime();                args['jsMethodId'] = _callHandlerID ;                window.zlbridge[_callHandlerID] = func;            }            window.zlbridge._callNative(args);        },         _callNative: function(arg) {               var json = JSON.stringify(arg);               if(window.ZLBridge && window.ZLBridge.postMessage){                  window.ZLBridge.postMessage(JSON.stringify(arg));               }else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ZLBridge){                  window.webkit.messageHandlers.ZLBridge.postMessage(JSON.stringify(arg));               }else if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {                   window.ReactNativeWebView.postMessage(json);                }          },        register: function(method,func){            if (typeof func == 'function' && typeof method == 'string') {                window.zlbridge['_register_' + method] = func;            }        },        removeRegisted: function(method) {            if (typeof method != 'string') return;            delete window.zlbridge['_register_' + method];            delete window.zlbridge['_register_callback' + method];         },        registerWithCallback: function(method,func){            if (typeof func == 'function' && typeof method == 'string') {                window.zlbridge['_register_callback' + method] = func;            }        },        _nativeCall: function(method,arg) {            var obj = JSON.parse(arg);            var result = obj['result'];            var callID = obj['callID'];            setTimeout(() => {                  try {                       var func = window.zlbridge['_register_' + method];                       if (typeof func == 'function') {                           var args = {};                           args['end'] = true;                           if (callID) args['callID'] = callID;                           args['body'] = func(result);                           return window.zlbridge._callNative(args);                       }                       func = window.zlbridge['_register_callback' + method];                       var callback = function (params,end) {                           var args = {};                           if (callID) args['callID'] = callID;                           args['body'] = params;                           args['end'] = (typeof end == 'boolean')?end:true;                           window.zlbridge._callNative(args);                       };                       func(result,callback);                     } catch (error) {                       window.zlbridge._callNative({error:error.message,callID:callID,end:true});                  }           });        },        _nativeCallback: function(methodid,arg){            setTimeout(() => {               var func = window.zlbridge[methodid];               if (typeof func != 'function') return;               arg = JSON.parse(arg);               func(arg['result']);               if (arg.end==1) delete window.zlbridge[methodid];            });        },        _hasNativeMethod: function(method) {            var func = window.zlbridge['_register_' + method];            if (typeof func != 'function')func = window.zlbridge['_register_callback' + method];            return (func!=null||func!=undefined);        }    };    window.zlbridge = zlbridge;    var doc = document;    var event = doc.createEvent('Events');    event.initEvent('ZLBridgeInitReady');    doc.dispatchEvent(event);})();";
class ZLBridge {
    constructor(){
        this._registHanders = {};
        this._callHanders = {};
        this._injectLocalJS = false;
        this._undefinedHandler = function(){};    
    }
    _verifyInjectJavaScript = () => {
        if (typeof this.injectJavaScript == 'function'){
            return true;
        }
        console.log('请实现injectJavaScriptAction函数');
        return false;
    }
    injectLocalJS = () => {
        if(this._injectLocalJS == true) return;
        this._injectLocalJS = true;
        this.injectJavaScript(locaJS);
    }
    handJSMessage = (message) => {
        if(!this._verifyInjectJavaScript()) return;
        const msgObj = JSON.parse(message);
        const name = msgObj.name;
        const callID = msgObj.callID;
        const error = msgObj.error;
        const end = msgObj.end;
        const jsMethodId = msgObj.jsMethodId;
        const body = msgObj.body;
        if (typeof callID == 'string' && callID.length > 0){
            const callHandler = this._callHanders[callID];
            if (typeof callHandler == 'function') {
                callHandler(body,error);
                if (end == true) delete this._callHanders[callID];
            }
            return;
        }
        const registHandler = this._registHanders[name];
        const callback = (result,end) => {
            const jsObj = {};
            jsObj['end'] = end == true ? 1:0;
            jsObj['result'] = result;
            const js = "window.zlbridge._nativeCallback('" + jsMethodId + "','" + JSON.stringify(jsObj) + "');";
            this.injectJavaScript(js);
        }
        if(typeof registHandler == 'function'){
            registHandler(body,callback)
            return;
        }
        if(typeof this._undefinedHandler == 'function'){
            this._undefinedHandler(name,body,callback)
            return;
        }
    };
    injectJavaScriptAction = (injectJavaScript)=> {
        this.injectJavaScript = injectJavaScript;
    }
    registHandler = (methodName,registHandler) => {
        if(typeof methodName != 'string' || typeof registHandler != 'function') return;
        this._registHanders[methodName] = registHandler;
    }
    registUndefinedHandler = (undefinedHandler) => {
        this._undefinedHandler = undefinedHandler;
    }
    removeRegistedHandlerWithMethodName = (methodName) => {
        if(typeof methodName != 'string') return;
        delete this._registHanders[methodName];
    }
    removeAllRegistMethodName = () => {
        for(var key in this._registHanders){
            delete this._registHanders[key];
        }
    }
    callHandler = (methodName,args,completionHandler) => {
        if(!this._verifyInjectJavaScript()) return;
        if(typeof methodName != 'string') return;
        args = args ? args : [];
        const jsMap = {};
        jsMap['result'] = args;
        let ID = '';
        if(completionHandler){
            const timeID = setTimeout(function(){});
            ID = 'callID' + timeID + new Date().getTime();
            jsMap['callID'] = ID;
            this._callHanders[ID] = completionHandler;
        }
        let js = 'try{';
        js += "window.zlbridge._nativeCall('" + methodName + "','" + JSON.stringify(jsMap) + "');";
        js += '} catch(error) {';
        js += 'window.ReactNativeWebView.postMessage(JSON.stringify({error:error.message,callID:"' + ID + '",end:true}));';
        js += '}';
        this.injectJavaScript(js);
    }
}
export default ZLBridge;