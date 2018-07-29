import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, NavParams } from 'ionic-angular';
import {SQLiteObject} from "@ionic-native/sqlite";
import {MyApp} from "../../app/app.component";

declare let cordova: any;
@Component({
  selector: 'page-devices-mgt',
  templateUrl: 'devices-mgt.html'
})
export class DevicesMgtPage {

  database: SQLiteObject;

  deviceId: number; //id
  seneorNo: number; //传感器编号 *
  seneorName: string;//传感器名称
  seneorPword: string;//传感器密码
  seneorEle: number;//传感器电量
  seneorIp: string;//传感器IP

  deviceName: string;//设备名称
  deviceNo: string//设备编号（柜号）*
  deviceType: string;//设备类型
  deviceModel: string;//设备型号
  voltageGrade: string;//电压等级
  producer: string;//生产厂家
  operationDepart: string;//运行单位
  factoryNo: string;//出厂编号
  factoryDate: string;//出厂日期
  useDate: string;//投运日期
  substationName: string;//变电站名称

  focusVal: number;//触发阈值
  warnVal: number;//预警阈值
  timeSub: number;//自启动时间间隔/小时

  flag=0;
  constructor(public navCtrl: NavController, private navParams: NavParams,
    private alertCtrl: AlertController, private toastCtrl: ToastController) {

    this.deviceId = this.navParams.get('id');
    this.database = this.navParams.get('db');
  }
  ngOnInit() {
    // 查询数据
    if(MyApp.isNotEmpty(this.deviceId)){
      this.selectData(this.deviceId);
    }else{
      this.getWifiInfo();//获取当前设备IP
    }
  }
  // 上一步/下一步
  toNext(){
    this.flag = 1-this.flag;
  }
  //获取wifi信息
  getWifiInfo(){
    let wifi = cordova.plugins.wifiinfo;
    let my = this;
    wifi.getInfo(
      function success(data){
        if(MyApp.isNotEmpty(data.dhcp.gateway) && data.dhcp.gateway !== '0.0.0.0'){
          my.seneorIp = data.dhcp.server;
        }
      },
      function error(e) {
        my.showToast('获取设备Wifi信息失败！'+e);
      }
    );
  }
  // 查询数据
  selectData(device_id: number) {
    let my = this;
    let sql = 'SELECT * FROM devices_data where device_id = '+device_id;
    this.database.executeSql(sql, {})
    .then((data)=>{
      //获取查询结果集
      my.seneorNo = parseInt(data.rows.item(0).seneor_no);
      my.seneorName = data.rows.item(0).seneor_name;
      my.seneorPword = data.rows.item(0).seneor_pword;
      my.seneorEle = data.rows.item(0).seneor_ele;
      my.seneorIp = data.rows.item(0).seneor_ip;
      my.deviceName = data.rows.item(0).device_name;
      my.deviceNo = data.rows.item(0).device_no;
      my.deviceType = data.rows.item(0).device_type;
      my.deviceModel = data.rows.item(0).device_model;
      my.voltageGrade = data.rows.item(0).voltage_grade;
      my.producer = data.rows.item(0).producer;
      my.operationDepart = data.rows.item(0).operation_depart;
      my.factoryNo = data.rows.item(0).factory_no;
      my.factoryDate = data.rows.item(0).factory_date;
      my.useDate = data.rows.item(0).use_date;
      my.substationName = data.rows.item(0).substation_name;
      my.focusVal = data.rows.item(0).focus_val;
      my.warnVal = data.rows.item(0).warn_val;
      my.timeSub = data.rows.item(0).time_sub;
      console.log('success:'+JSON.stringify(data.rows.item(0)));
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
    });
  }
  // 保存事件
  doSave() {
    if(MyApp.isEmpty(this.seneorNo)){
      this.showToast("传感器编号不能为空！");
      this.flag = 0;
      return;
    }
    let reg = /^\+?[1-9][0-9]*$/;　　//正整数
    if(!reg.test(this.seneorNo.toString())){
      this.showToast("传感器编号只能为正整数！");
      this.flag = 0;
      return;
    }
    if(MyApp.isEmpty(this.seneorIp)){
      this.showToast("传感器IP不能为空！");
      this.flag = 0;
      return;
    }
    if(MyApp.isEmpty(this.deviceNo)){
      this.showToast("设备编号不能为空！");
      this.flag = 1;
      return;
    }
    let alert = this.alertCtrl.create({
      title: '温馨提示',
      message: '确认保存？',
      buttons: [
        {
          text: '是',
          handler: () => {
            this.showToast('正在保存中……');
            this.updateData();//保存数据
            
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
  }
  // 删除设备
  doDelete(){
    let alert = this.alertCtrl.create({
      title: '温馨提示',
      message: '确认删除"'+ MyApp.isNotEmpty(this.deviceName)?this.deviceName:this.deviceNo +'"？',
      buttons: [
        {
          text: '是',
          handler: () => {
            this.showToast('正在删除中……');
            this.deleteData(this.deviceId);
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
  }
  // 更新数据
  updateData() {
    this.database.executeSql(
      'REPLACE INTO devices_data VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', 
      [ MyApp.isNotEmpty(this.deviceId)?this.deviceId:null,
        MyApp.isNotEmpty(this.seneorNo)?this.seneorNo.toString().trim():null,
        MyApp.isNotEmpty(this.seneorName)?this.seneorName.trim():null,
        MyApp.isNotEmpty(this.seneorPword)?this.seneorPword.trim():null,
        MyApp.isNotEmpty(this.seneorEle)?this.seneorEle:null,
        MyApp.isNotEmpty(this.seneorIp)?this.seneorIp.trim():null,
        MyApp.isNotEmpty(this.deviceName)?this.deviceName.trim():null,
        MyApp.isNotEmpty(this.deviceNo)?this.deviceNo.trim():null,
        MyApp.isNotEmpty(this.deviceType)?this.deviceType.trim():null,
        MyApp.isNotEmpty(this.deviceModel)?this.deviceModel.trim():null,
        MyApp.isNotEmpty(this.voltageGrade)?this.voltageGrade.trim():null,
        MyApp.isNotEmpty(this.producer)?this.producer.trim():null,
        MyApp.isNotEmpty(this.operationDepart)?this.operationDepart.trim():null,
        MyApp.isNotEmpty(this.factoryNo)?this.factoryNo.trim():null,
        MyApp.isNotEmpty(this.factoryDate)?this.factoryDate:null,
        MyApp.isNotEmpty(this.useDate)?this.useDate:null,
        MyApp.isNotEmpty(this.substationName)?this.substationName.trim():null
      ])
    .then((data)=>{
      if(data.rowsAffected>0){
        this.showToast('保存成功！');
        setTimeout(() => { 
          this.navCtrl.pop();//返回上一页面
        }, 1500);
      }
      console.log('success:'+JSON.stringify(data));
    },(error)=>{
      alert('保存失败！'+JSON.stringify(error));
      console.log('error:'+JSON.stringify(error));
    });
  }
  // 删除数据
  deleteData(device_id: number) {
    let sql = 'delete from devices_data where device_id = '+device_id;
    this.database.executeSql(sql, {})
    .then((data)=>{
      if(data.rowsAffected>0){
        this.showToast('删除成功！');
        this.navCtrl.pop();//返回上一页面
      }
      console.log('success:'+JSON.stringify(data));
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
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
