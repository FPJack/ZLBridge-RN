
## demo
下载包到本地，可选择android或者ios模拟器运行查看效果图
## 说明
ZLBridge-RN是为react-native-webview组件与JS数据交互提供更简单方便的一个小插件工具，可配合H5端使用ZLBridge-JS库来数据交互，也可选择RN本地注入JS代码，H5无需任何集成操作。目前已支持的平台有
<br/>[ZLBridge-iOS](https://github.com/FPJack/ZLBridge-iOS)
<br/>[ZLBridge-Android](https://github.com/FPJack/ZLBridge-Android)
<br/>[ZLBridge-JS](https://github.com/FPJack/ZLBridge-JS)
<br/>[ZLBridge-flutter](https://github.com/FPJack/ZLBridge-flutter)
<br/>[ZLBridge-RN](https://github.com/FPJack/ZLBridge-RN)

## 安装
```ruby
npm install zlbridge-rn -D
```
## 初始化 

### bridge
```JavaScript
import ZLBridge,{ locaJS } from "zlbridge-rn";

this.birdge = new ZLBridge();
//实现执行js的函数调用
this.birdge.injectJavaScriptAction((js) => {
    //webview执行js脚本
    this.webref.injectJavaScript(js);
});
```
### WebView
```JavaScript
//内部解析处理js传过来的消息
this.birdge.handJSMessage(event.nativeEvent.data)
<WebView 
    ref={(r) => (this.webref = r)}
    onLoadEnd={()=>{this.birdge.injectLocalJS();}}
    injectedJavaScript={locaJS}
    source={require('./ZLBridge.html')}
    onMessage={(event) => this.birdge.handJSMessage(event.nativeEvent.data)} /> 
```

## window.zlbridge初始化(可选本地原生注入初始化，也可以由H5远程导入初始化)
原生
```JavaScript
//webview加载完成手动调用执行js脚本初始化window.zlbridge
this.birdge.injectLocalJS();
//直接传入js脚本系统自动调用
injectedJavaScript={locaJS};
```
或者H5
```JavaScript
//初始化完成后也可通过window.zlbridge拿zlbridge对象,详细请查看ZLBridge-JS
 var zlbridge = require('zlbridge')
```

## 原生与JS交互

### JS调用原生test事件

#### 无参数
```JavaScript
window.zlbridge.call('test',(arg) => {

});
```
#### 有参数参数
```JavaScript
window.zlbridge.call('test',{key:"value"},(arg) => {

});
```
#### 原生注册test事件
```JavaScript
//注册test特定事件
this.birdge.registHandler("test",(obj,callback)=>{
//第二个参数true代表js只能接受一次callback回到，false可以连续接受多次，默认不传为true
callback(obj,true);
});
```

### 原生调用js

#### 原生调用JS的jsMethod事件
```JavaScript
this.birdge.callHandler('jsMethod',[],function (data,error) {
    console.log(error);
});
```

#### js注册jsMethod事件
```JavaScript
window.zlbridge.register("jsMethod",(arg) => {
     return arg;
});
 ```
 或者
 ```JavaScript
window.zlbridge.registerWithCallback("jsMethod",(arg,callback) => {
  //ture代表原生只能监听一次回调结果，false可以连续监听，默认不传为true
  callback(arg,true);
});
  ```

## 通过本地注入JS脚本的，H5可以监听zlbridge初始化完成事件
```JavaScript
document.addEventListener('ZLBridgeInitReady', function() {
    console.log('ZLBridge初始化完成');
},false);
  ```
## Author

范鹏, 2551412939@qq.com



## License

ZLBridge-RN is available under the MIT license. See the LICENSE file for more info.
