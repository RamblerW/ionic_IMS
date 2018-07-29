import { Component } from '@angular/core';
import { NavController,ToastController } from 'ionic-angular';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import { MyApp } from '../../app/app.component';
import * as echarts from 'echarts';
declare let cordova: any;
declare let window: any;
@Component({
  selector: 'page-data-collect',
  templateUrl: 'data-collect.html'
})
export class DataCollectPage {

  socket: any;
  database: SQLiteObject;

  curDevice="未连接";//当前设备
  curSerNo = '';//当前传感器编号
  curDeviceIP = '';//当前设备IP
  curDevicePort: number;//当前设备端口号

  curPulseNum = ''; //脉冲数
  curAvgAmplitude = ''; //平均放电幅值
  curEleQuantity = ''; //电池电量
  curMaxAmplitude = ''; //最大放电幅值

  constructor(public navCtrl: NavController, public toastCtrl: ToastController,private sqlite: SQLite) {
    this.curDevicePort = MyApp.socketPort;
  }
  //初始化页面
  ngOnInit() {
    this.initSocket();//初始化与传感器的通信
    this.initDatabase();//初始化数据库
  }
  //当进入页面时触发
  ionViewDidEnter(){
    this.doRefresh();
  }
  //校准传感器时间
  doSetTime() {
    let time = MyApp.getFormatDateTime('FT');
    this.sentMsg("TIME(ID:"+this.curSerNo+")="+time);
  }
  //刷新页面
  doRefresh(event?: any){
    this.initParam();//初始化参数
    this.getWifiInfo();//获取wifi信息
    this.initView([]);//初始化折线图
    //关闭刷新
    if(MyApp.isNotEmpty(event)){
      setTimeout(() => {
        event.complete();
      }, 1500);
    }
  }
  //初始化参数
  initParam() {
    this.curDevice = "未连接";
    this.curSerNo = '';
    this.curDeviceIP = '';//当前设备IP

    this.curPulseNum = ''; //脉冲数
    this.curAvgAmplitude = ''; //平均放电幅值
    this.curEleQuantity = ''; //电池电量
    this.curMaxAmplitude = ''; //最大放电幅值
  }
  //获取wifi信息
  getWifiInfo(){
    let wifi = cordova.plugins.wifiinfo;
    let my = this;
    wifi.getInfo(
      function success(data){
        if(MyApp.isNotEmpty(data.dhcp.gateway) && data.dhcp.gateway !== '0.0.0.0'){
          my.curDeviceIP = data.dhcp.server;
          //查询设备信息
          my.doGetDeviceInfo();
        }else{
          my.curDevice = "未连接";
        }
      },
      function error(e) {
        my.showToast('获取设备Wifi信息失败！'+e);
      }
    );
  }

  //与传感器通信
  sentMsg(message){
    console.log("sentMessage:"+message);
    let my = this;
    //判断socket连接是否打开
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
        //校准时间不进行后续操作
        if(dataStr.indexOf('current')>0){
          return;
        }
        //将字符串转为数组
        let dataArr = dataStr.replace(/{/g,'').replace(/}/g,'').split(/\r\n/);//用回车换行符分割数组
        console.log("dataArr:"+dataArr);
        //将数组中的每个子元素转为数组
        let length = dataArr.length>1?dataArr.length-1:dataArr.length//历史数据采集的最后一个元素不要（最后一个是空）
        let resultArr = [];
        for(let i=0;i<length;i++){
          //[1360468677,0,13702,0] 去掉中括号
          let item = dataArr[i].substr(1,dataArr[0].length-2);
          if(dataArr.length>1){//历史数据采集时，过滤无效数据
            if(parseInt(item.split(',')[0]) > 1000){
              resultArr.push(item.split(','));
            }
          }else{//单次采集
            resultArr.push(item.split(','));
          }
        }
        console.log("resultArr:"+resultArr);
        //判断返回的是什么请求的数据
        if(dataArr.length>1){//采集数据
          my.initView(resultArr);//折线图显示采集的数据
          my.saveInfo(resultArr);//保存采集的数据
        }else{//单次采集
          my.curPulseNum = resultArr[0][0]; //脉冲数
          my.curEleQuantity = MyApp.getEleNum((parseFloat(resultArr[0][1]))/1000); //电池电量（mv转为V，再转为%）
          my.curMaxAmplitude = parseFloat(MyApp.mV2dB(resultArr[0][2])) + ''; //脉冲最大幅值（mv转db）
          my.curAvgAmplitude = parseFloat(MyApp.mV2dB(resultArr[0][3])) + ''; //平均放电幅值（mv转db）

          // parseFloat(MyApp.mV2dB(resultArr[0][2]))
          // my.eleQuantity = MyApp.getEleNum((parseFloat(dataArr[0].split(':')[1]))/1000);//mv转为V，再转为%
        }
      }
    };
    this.socket.onError = function(errorMessage) {
      alert('设备连接中断！'+errorMessage);
    };
    this.socket.onClose = function(hasError) {
      alert('设备连接已断开！');
    };
  }
  // 初始化数据库
  initDatabase() {
    let my = this;
    this.sqlite.create({
      name: 'IMS.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql(
        'CREATE TABLE IF NOT EXISTS collect_data( '+
        ' data_id integer PRIMARY KEY autoincrement, '+
        ' seneor_ip VARCHAR(50),'+
        ' data_time datetime,'+
        ' data_timestamp INTEGER,'+
        ' pulse_amplitude INTEGER, '+
        ' pulse_num INTEGER, '+
        ' collect_time datetime,'+
        ' seneor_ele INTEGER);'
        , {})
      .then((data)=>{
        console.log('success:'+JSON.stringify(data));
        },(error)=>{
        console.log('error:'+JSON.stringify(error));
        });

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
        ');', {})
      .then((data)=>{
        console.log('success:'+JSON.stringify(data));
       },(error)=>{
        console.log('error:'+JSON.stringify(error));
       });

       my.database = db;
    })
    .catch(e => console.log(e));
  }
  // 查询设备信息
  doGetDeviceInfo() {
    let my = this;
    this.database.executeSql(
      'SELECT * FROM devices_data where seneor_ip = ?',
      [my.curDeviceIP]
    )
    .then((data)=>{
      //获取查询结果集
      if(data.rows.length>0){
        my.curDevice = MyApp.isEmpty(data.rows.item(0).device_name)?'未连接':data.rows.item(0).device_name;
        my.curSerNo = data.rows.item(0).seneor_no;
        my.doSetTime();//校准传感器时间
      }else{
        alert('该设备还未录入，请先到“设备管理”中添加设备！');
        return;
      }
    },(error)=>{
      alert("查询设备信息出错！"+JSON.stringify(error));
    });
  }
  // 保存采集的数据
  saveInfo(resultArr: any) {
    // 查询数据
    // 数据格式为[时间戳,脉冲数,脉冲最大幅值,电池电压]
    // 20180514 指令修改为[脉冲数，电池电量，最大放电幅值，平均放电幅值]
    for(let i=0;i<resultArr.length;i++){
      this.doInsertInfo(resultArr[i]);
    }
    this.showToast('采集成功！');
  }
  doInsertInfo(item){
    let my = this;
    this.database.executeSql(
      'INSERT INTO collect_data SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM collect_data where seneor_ip = ? and data_timestamp = ?);',
      [ null,
        my.curDeviceIP,
        MyApp.getFormatDateTime('T', parseInt(item[0])),
        parseInt(item[0]),
        parseInt(item[2]),
        parseInt(item[1]),
        MyApp.getFormatDateTime('T'),
        parseFloat(item[3]),
        my.curDeviceIP,
        parseInt(item[0])
      ])
    .then((data)=>{
      console.log(JSON.stringify(data)+":"+JSON.stringify(item));
    },(error)=>{
      alert('数据保存失败！/n'+JSON.stringify(error)+":"+JSON.stringify(item));
      return;
    });
  }
  // 初始化图表
  initView(resultData) {
    let xData = [];
    let yData = [];
    if(MyApp.isNotEmpty(resultData) && resultData.length > 0){
      for(let i=0;i<resultData.length;i++){
          xData.push(MyApp.getFormatDateTime('D',parseInt(resultData[i][0])));//时间
          yData.push(parseFloat(MyApp.mV2dB(resultData[i][2])));//脉冲最大幅值（mv转成db）
      }
    }
    const ec = echarts as any;
    const container = document.getElementById('chart');
    const chart = ec.init(container);
    let option = {
      title: {
          left: 'center',
          text: '历史数据',
      },
      xAxis: {
          type: 'category',
          data: xData
      },
      yAxis: {
          name: '单位：dB',
          type: 'value'
      },
      series: [{
          data: yData,
          type: 'line'
      }]
    };

    chart.setOption(option);
  }
  //采集
  doCollect(){
    if(MyApp.isEmpty(this.curDeviceIP)){
      alert('设备未连接，请先连接设备！');
      return;
    }
    if((MyApp.isEmpty(this.curDevice) || this.curDevice == '未连接')&&MyApp.isEmpty(this.curSerNo)){
      alert('该设备还未录入，请先到“设备管理”中添加设备！');
      return;
    }
    this.showToast('正在采集中……');
  }
  //即时数据采集
  doGetCurData(){
    this.doCollect();
    this.sentMsg("S(ID:"+this.curSerNo+")");//单次采集
  }
  //历史数据采集
  doGetHisData(){
    this.doCollect();
    this.sentMsg("DR");//数据回收
  }
  // 连接wifi
  doConnectWifi(){
    cordova.plugins.Jump2Wifi.coolMethod(
      "",
      function success(data){},
      function error(e) {});
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
