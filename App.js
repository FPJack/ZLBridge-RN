import React,{Component} from 'react';
import { WebView } from 'react-native-webview';
import {
  View,
  Button
} from 'react-native';
import ZLBridge,{ locaJS } from "zlbridge-rn";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
export default class App extends Component {
  constructor(){
    super()
    this.birdge = new ZLBridge();
    //执行js
    this.birdge.injectJavaScriptAction((js) => {
      this.webref.injectJavaScript(js);
    });
    //注册test特定事件
    this.birdge.registHandler("test",(obj,func)=>{
      func(obj);
    });
    //注册上传事件
    this.birdge.registHandler("upload",(obj,func)=>{
      var time = 0;
      func(0);
      setInterval(() => {
        time += 1;
        func(time,time == 10);
      }, 1000);
    });
    //注册未监听事件响应
    this.birdge.registUndefinedHandler((name,body,func) => {
      console.log(name);
      console.log(body);
      func('原生已响应');
    });
  }
  render() {    
    
    return (
      <View style={{height: 300,padding: 20,marginTop:100}}>
        <WebView 
            ref={(r) => (this.webref = r)}
            onLoadEnd={()=>{
              this.birdge.injectLocalJS();
            }}
            injectedJavaScript={locaJS}
            source={require('./ZLBridge.html')}
            onMessage={(event) => this.birdge.handJSMessage(event.nativeEvent.data)} />
        <Button title='调用js事件1' onPress={()=>{
               this.birdge.callHandler('jsMethod',[],function (body,error) {
                 console.log(error);
               });
        }}/>
        <Button title='调用js事件2' onPress={()=>{
              this.birdge.callHandler('jsMethodWithCallback',['jsMethodWithCallback'],function (body,error) {
                console.log(error);
              });
        }}/>  
      </View>
    );
  }
}

