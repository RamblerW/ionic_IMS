import { Component } from '@angular/core';
import { ToastController, AlertController } from 'ionic-angular';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {MyApp} from "../../app/app.component";

declare let cordova: any;
declare let window: any;
@Component({
  selector: 'page-params-set',
  templateUrl: 'params-set.html'
})
export class ParamsSetPage {

  socket: any;
  database: SQLiteObject;

  focusVal: number;//触发阈值
  warnVal: number;//预警阈值
  timeSub: number;//自启动时间间隔
  curDeviceIP = '';//当前设备IP
  curSerNo = '';//当前传感器编号
  curDevicePort: number;//当前设备端口号

  count: number;//发送指令的次数
  constructor(public toastCtrl: ToastController,
    private alertCtrl: AlertController, private sqlite: SQLite) {
    this.curDevicePort = MyApp.socketPort;
    this.initSocket();//初始化与传感器的通信
  }
  ngOnInit() {
    this.initSocket();//初始化与传感器的通信
    this.initDatabase();//初始化数据库
  }

  //当进入页面时触发
  ionViewDidEnter(){
    this.initSocket();//初始化与传感器的通信
    this.getWifiInfo();//获取wifi信息
  }
  doRefresh(event?: any){
    this.initSocket();//初始化与传感器的通信
    this.getWifiInfo(event);
  }
  //初始化与传感器的通信
  initSocket(){
    //获得socket对象
    this.socket = new window.Socket();
    let my = this;
    //接收返回数据的方法
    this.socket.onData = function(data) {
      if(MyApp.isNotEmpty(data) && (data.length>0)){
        //解析返回的数据
        let dataStr = '';
        //将编码转为字符串
        for (let i = 0; i < data.length; i++) {
          dataStr += String.fromCharCode(data[i]);
        }
        dataStr = dataStr.toLowerCase();
        console.log("socket.onData:"+dataStr);
        if((dataStr.indexOf("str") != -1) || (dataStr.indexOf("lmtr") != -1)){
          my.count++;
        }
        if(my.count == 3){
          my.updateDevicePara(this.curDeviceIP);
        }
      }
    };
    this.socket.onError = function(errorMessage) {
      // invoked after error occurs during connection
      alert('设备连接中断！'+errorMessage);
      // this.showToast('设备连接失败！'+errorMessage);
    };
    this.socket.onClose = function(hasError) {

    };
  }
  //与传感器通信
  sentMsg(message){
    console.log("sentMessage:"+message);
    let my = this;
    //判断socket连接是否打开
    console.log("socket._state:"+my.socket._state);
    if(my.socket._state !== 2 ){
      //打开连接
      my.socket.open(
        my.curDeviceIP,
        my.curDevicePort,
        function() {
          // invoked after successful opening of socket
          // this.showToast('设备连接成功！');
        },
        function(errorMessage) {
          // invoked after unsuccessful opening of socket
          // my.showToast('设备连接失败！'+errorMessage);
        }
      );
      setTimeout(() => {
        //发送
        let dataString = message;
        let data = new Uint8Array(dataString.length);
        for (let i = 0; i < data.length; i++) {
          data[i] = dataString.charCodeAt(i);
        }
        console.log("socket._state:"+my.socket._state);
        my.socket.write(data);
        console.log("sentMsg success")!
      }, 500);//连接需要过程，所以加500ms延时
    }else{
      //发送
      let dataString = message;
      let data = new Uint8Array(dataString.length);
      for (let i = 0; i < data.length; i++) {
        data[i] = dataString.charCodeAt(i);
      }
      console.log("socket._state:"+my.socket._state);
      my.socket.write(data);
      console.log("sentMsg success")!
    }
  }
  // 初始化数据库
  initDatabase() {
    this.sqlite.create({
      name: 'IMS.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql(
        'CREATE TABLE IF NOT EXISTS devices_data( '+
          ' device_id integer PRIMARY KEY autoincrement, '+
          ' seneor_no VARCHAR(100) NOT NULL,'+
          ' seneor_name VARCHAR(200),'+
          ' seneor_pword VARCHAR(100),'+
          ' seneor_ele INTEGER, '+
          ' seneor_ip VARCHAR(50),'+
          ' device_name VARCHAR(200),'+
          ' device_no VARCHAR(100) NOT NULL,'+
          ' device_type VARCHAR(100),'+
          ' device_model VARCHAR(100),'+
          ' voltage_grade VARCHAR(100),'+
          ' producer VARCHAR(200),'+
          ' operation_depart VARCHAR(200),'+
          ' factory_no VARCHAR(100),'+
          ' factory_date datetime,'+
          ' use_date datetime,'+
          ' substation_name VARCHAR(300),'+
          ' focus_val INTEGER,'+
          ' warn_val INTEGER,'+
          ' time_sub INTEGER'+
        ');'
        , {})
      .then((data)=>{
        console.log('success:'+JSON.stringify(data));
       },(error)=>{
        console.log('error:'+JSON.stringify(error));
       });
      this.database = db;
    })
    .catch(e => console.log(e));
  }
  //获取wifi信息
  getWifiInfo(event?: any){
    //关闭刷新
    if(MyApp.isNotEmpty(event)){
      setTimeout(() => {
        event.complete();
      }, 1500);
    }
    let wifi = cordova.plugins.wifiinfo;
    let my = this;
    wifi.getInfo(
      function success(data){
        if(MyApp.isNotEmpty(data.dhcp.gateway) && data.dhcp.gateway !== '0.0.0.0'){
          my.curDeviceIP = data.dhcp.server;
          //查询设备信息
          my.doGetDevicePara(my.curDeviceIP);
        }
      },
      function error(e) {
        my.showToast('获取设备Wifi信息失败！'+e);
      }
    );
  }
  //保存事件
  doSave() {
    this.count = 0;
    let reg = /^\+?[1-9][0-9]*$/;　　//正整数
    let my = this;
    if(MyApp.isEmpty(this.focusVal)){
      this.showToast("触发阈值不能为空！");
      return;
    }
    if(!reg.test(this.focusVal.toString())){
      this.showToast("触发阈值只能为正整数！");
      return;
    }
    if(MyApp.isEmpty(this.warnVal)){
      this.showToast("预警阈值不能为空！");
      return;
    }
    if(!reg.test(this.warnVal.toString())){
      this.showToast("预警阈值只能为正整数！");
      return;
    }
    if(MyApp.isEmpty(this.timeSub)){
      this.showToast("自启动时间间隔不能为空！");
      return;
    }
    let seconds = this.timeSub * 3600;
    if(!reg.test(seconds.toString())){
      this.showToast("自启动时间间隔只能为正整数！");
      return;
    }
    let alert = this.alertCtrl.create({
      title: '温馨提示',
      message: '确认保存？',
      buttons: [
        {
          text: '是',
          handler: () => {
            if(MyApp.isEmpty(my.curDeviceIP)){
              my.showToast('设备未连接，请先连接设备！');
              return;
            }else{
              my.sentMsg("ST(ID:"+my.curSerNo+")=09:00:00+"+seconds);//设置采集间隔
              setTimeout(() => {
                let limitVal = MyApp.dB2mV(my.focusVal);
                my.sentMsg("limit_val(ID:"+my.curSerNo+","+limitVal+")");//设置触发阈值
              }, 500);
              setTimeout(() => {
                let limitTh = MyApp.dB2mV(my.warnVal);
                my.sentMsg("limit_th(ID:"+my.curSerNo+","+limitTh+")");//设置预警阈值
              }, 500);
            }
          }
        },
        {
          text: '否',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    alert.present();
    console.log("component params-set function doSave end!");
  }
  // //噪声评估时间
  // doTestNoise() {
  //   this.showToast('正在开发中……');
  // }
  // 查询设备参数
  doGetDevicePara(seneor_ip: string) {
    let my = this;
    let sql = 'SELECT * FROM devices_data where seneor_ip = "'+seneor_ip+'"';
    this.database.executeSql(sql, {})
    .then((data)=>{
      //获取查询结果集
      if(data.rows.length>0){
        my.curSerNo = data.rows.item(0).seneor_no;
        my.focusVal = data.rows.item(0).focus_val;
        my.warnVal = data.rows.item(0).warn_val;
        my.timeSub = data.rows.item(0).time_sub;
      }
    },(error)=>{
      alert("查询设备参数出错！"+error);
    });
  }
  // 更新设备参数
  updateDevicePara(seneor_ip: string) {
    let my = this;
    this.database.executeSql(
      'UPDATE devices_data set focus_val = ? , warn_val = ?, time_sub = ? where seneor_ip = ? ;',
      [
        my.focusVal,
        my.warnVal,
        my.timeSub,
        my.curDeviceIP
      ])
    .then((data)=>{
      if(data.rowsAffected>0){
        this.showToast('保存成功！');
        // setTimeout(() => {
        //   this.navCtrl.pop();//返回上一页面
        // }, 1500);
      }else{
        alert('该设备还未录入，请先到“设备管理”中添加设备！');
        return;
      }
      console.log('success:'+JSON.stringify(data));
    },(error)=>{
      alert('保存失败！'+JSON.stringify(error));
    });
  }
  /**
   * 显示信息提示框
   * @param position
   * @param message
   */
  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 1000,
      position: 'middle'
    });
    toast.present();
  }
}
