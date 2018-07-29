import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
// import {MyApp} from "../../app/app.component";
// import {DevicesData} from "../../database/devices-data";
import {DevicesMgtPage} from "../devices-mgt/devices-mgt";
import { MyApp } from '../../app/app.component';

@Component({
  selector: 'page-devices-show',
  templateUrl: 'devices-show.html'
})
export class DevicesShowPage {

  database: SQLiteObject;
  devicesData = [];

  constructor(public navCtrl: NavController, private alertCtrl: AlertController,
    private toastCtrl: ToastController,private sqlite: SQLite) {

  }

  ngOnInit(){
    this.initDatabase();//初始化数据库
    setTimeout(() => { 
      this.selectData();
    }, 500)
    
  }
  // 删除设备
  deleteDevice(device_id: number, deviceName: string, deviceNo: string){
    let alert = this.alertCtrl.create({
      title: '温馨提示',
      message: '确认删除？',
      buttons: [
        {
          text: '是',
          handler: () => {
            this.showToast('正在删除中……');
            this.deleteData(device_id);
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
  
  // 查询数据
  selectData() {
    let my = this;
    let sql = 'SELECT * FROM devices_data order by device_id desc';
    this.database.executeSql(sql, {})
    .then((data)=>{
      this.devicesData = [];//清空数据
      //获取查询结果集
      for(let i=0;i<data.rows.length;i++){
        my.devicesData.push(data.rows.item(i));
      }
      console.log('success:'+JSON.stringify(data));
    },(error)=>{
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
        this.selectData();//重新查询
      }
      console.log('success:'+JSON.stringify(data));
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
    });
  }

  // 新增设备
  // doAddDevice() {
    // this.selectData();
    // this.pageJump();
    // let item = new DevicesData();
    // item.seneor_no = 'CGQ001';
    // item.seneor_name = 'AAAA传感器';
    // item.seneor_pword = '123456';
    // item.seneor_ele = 50;
    // item.seneor_ip = '192.0.0.0';
    // item.device_name = 'W开关柜';
    // item.device_no = 'SB001';
    // item.device_type = '开关柜';
    // item.device_model = 'SKT';
    // item.voltage_grade = '三级';
    // item.producer = 'XX生产商';
    // item.operation_depart = '西安';
    // item.factory_no = 'CC001';
    // item.factory_date = new Date('2010-10-10');
    // item.use_date =  new Date();
    // item.substation_name = 'XX变电站';

    // this.updateData(item);
    // this.showToast('正在保存中……');
  // }
  //页面跳转
  pageJump(id?: number){
    this.navCtrl.push(DevicesMgtPage, {id: id, db: this.database});
  }
  //页面刷新
  ionViewDidEnter(){
    if(MyApp.isNotEmpty(this.database)){
      this.selectData();
    }
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
