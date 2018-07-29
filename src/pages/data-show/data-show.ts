import { Component } from '@angular/core';
import { NavController,ToastController } from 'ionic-angular';
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";

import * as echarts from 'echarts';
import { MyApp } from '../../app/app.component';
@Component({
  selector: 'page-data-show',
  templateUrl: 'data-show.html'
})
export class DataShowPage {

  database: SQLiteObject;
  collectDatas: any;
  inputDate: string;
  showInputDate = false;
  dataType: string = "1";
  deviceInfos: any;
  currentDeviceEle: string;
  currentDeviceId: number;
  currentDeviceNo: string;
  currentDeviceName: string;

  warnDevices: any;
  focusDevices: any;
  normalDevices: any;

  constructor(public navCtrl: NavController, public toastCtrl: ToastController,private sqlite: SQLite) {

  }

  ngOnInit() {
    this.initDatabase();//初始化数据库
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

       },(error)=>{});
       my.database = db;
    })
    .catch(e => console.log(e));
  }

  ionSelectEvent(value: string) {
    this.dataType = value;
    setTimeout(() => {
      if(value == '1'){
        this.getFirstChartInfo();
        this.showInputDate = false;
      }else if(value == '2'){
        this.getSecondChartInfo();
        this.showInputDate = false;
      }else if(value == '3'){
        this.getThirdChartInfo();
        this.showInputDate = false;
      }else if(value == '4'){
        this.getFourthChartInfo();
        this.showInputDate = true;
      }
    }, 200)
  }
  initView1(resultData) {
    let xData = [];
    let yData = [];
    for(let i=0;i<resultData.length;i++){
        xData.push(MyApp.isEmpty(resultData[i].device_name)?resultData[i].device_no:resultData[i].device_name);
        yData.push(parseFloat(MyApp.mV2dB(resultData[i].avg_pulse_amplitude)));//mv转成db
    }
    const ec = echarts as any;
    const container = document.getElementById('chart1');
    const chart = ec.init(container);
    let option = {
      color: ['#3398DB'],
      tooltip : {
          trigger: 'axis',
          axisPointer : {            // 坐标轴指示器，坐标轴触发有效
              type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
      },
      grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
      },
      xAxis : [
          {
              type : 'category',
              data : xData,
              axisTick: {
                  alignWithLabel: true
              }
          }
      ],
      yAxis : [
          {
              name: '单位：dB',
              type : 'value'
          }
      ],
      series : [
          {
              type:'bar',
              barWidth: '60%',
              data: yData
          }
      ]
    };

    chart.setOption(option);
  }

  initView2(resultData) {
    let xData = [];
    let yData = [];
    let legendData = [];
    //组装数据
    for(let i=0;i<resultData.length;i++){
        //组装横轴的数据
        let xindex = -1;
        for(let j=0;j<xData.length;j++){//判断当前日期是否已创建
            if(xData[j].data_time == resultData[i].data_time){
                xindex = j; // 保存下标
                break;
            }
        }
        if(xindex == -1){//当前日期不存在，则添加到数组中
            xData.push(resultData[i].data_time);
        }
        //组装纵轴的数据
        let yindex = -1;
        for(let k=0;k<yData.length;k++){//判断当前设备数据的数组是否已创建
            if(yData[k].id == resultData[i].device_id){
                yindex = k; // 保存下标
                break;
            }
        }
        if(yindex != -1){ //如果当前设备数据的数组已创建，则将脉冲幅值数据放入data中
            yData[yindex].data.push(parseFloat(MyApp.mV2dB(resultData[i].avg_pulse_amplitude)));//mv转成db
        }else{
            let item = { id: '', name: '', type: 'line', data:[] };
            item.id = resultData[i].device_id;
            item.name = MyApp.isEmpty(resultData[i].device_name)?resultData[i].device_no:resultData[i].device_name;
            item.data.push(parseFloat(MyApp.mV2dB(resultData[i].avg_pulse_amplitude)));//mv转成db
            yData.push(item);
        }
        legendData.push(MyApp.isEmpty(resultData[i].device_name)?resultData[i].device_no:resultData[i].device_name);
    }
    const ec = echarts as any;
    const container = document.getElementById('chart2');
    const chart = ec.init(container);
    let option = {
      tooltip: {
          trigger: 'axis'
      },
      legend: {
          data: legendData
      },
      toolbox: {
          show: false,  //为true显示右上角标注
          feature: {
              dataZoom: {
                  yAxisIndex: 'none'
              },
              dataView: {readOnly: false},
              magicType: {type: ['line', 'bar']},
              restore: {},
              saveAsImage: {}
          }
      },
      xAxis:  {
          type: 'category',
          boundaryGap: false,
          data: xData
      },
      yAxis: {
          name: '单位：dB',
          type: 'value',
          axisLabel: {
              formatter: '{value} '
          }
      },
      series: yData
  };
    chart.setOption(option);
  }
  initView3(resultData) {
    let xData = [];
    let yData = [];
    for(let i=0;i<resultData.length;i++){
        xData.push(resultData[i].data_time);
        yData.push(parseFloat(MyApp.mV2dB(resultData[i].avg_pulse_amplitude)));//mv转成db
    }
    this.currentDeviceEle = MyApp.getEleNum((parseInt(resultData[resultData.length-1].seneor_ele))/1000);//mv转V再转%
    const ec = echarts as any;
    const container = document.getElementById('chart3');
    const chart = ec.init(container);
    let option = {
      title: {
        text: (MyApp.isEmpty(this.currentDeviceName)?('设备编号为'+this.currentDeviceNo+'的'):this.currentDeviceName)+'历史数据'
      },
      color: ['#3398DB'],
      tooltip : {
          trigger: 'axis',
          axisPointer : {            // 坐标轴指示器，坐标轴触发有效
              type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
      },
      grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
      },
      xAxis : [
          {
              type : 'category',
              data : xData,
              axisTick: {
                  alignWithLabel: true
              }
          }
      ],
      yAxis : [
          {
              name: '单位：dB',
              type : 'value'
          }
      ],
      series : [
          {
              // name:'直接访问',
              type:'bar',
              barWidth: '60%',
              data: yData
          }
      ]
    };
    chart.setOption(option);
  }

  ionViewDidEnter() {

    //初始化数据库
    this.initDatabase();
    //初始化参数
    this.warnDevices = [];
    this.focusDevices = [];
    this.normalDevices = [];
    this.deviceInfos = [];
    //查询所有设备名称
    this.getAllDeviceInfos();
    //获取预警状态页签查询时间
    this.getInputDate();

    this.ionSelectEvent("1");
  }
  //查询所有设备名称
  getAllDeviceInfos(){
    let my = this;
    let sql = 'SELECT * FROM devices_data order by device_id ASC';
    this.database.executeSql(sql, {})
    .then((data)=>{
        //获取查询结果集
        for(let i=0;i<data.rows.length;i++){
            my.deviceInfos.push(data.rows.item(i));
        }
        my.currentDeviceName = my.deviceInfos[0].device_name;
        my.currentDeviceNo = my.deviceInfos[0].device_no;
        my.currentDeviceId = my.deviceInfos[0].device_id;
        //获取横向分析图表数据
        my.getFirstChartInfo();
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
    });
  }
  //查询最新采集时间
  getInputDate(){
    this.deviceInfos = [];
    let my = this;
    let sql = 'SELECT MAX(data_timestamp) timestamp FROM collect_data';
    this.database.executeSql(sql, {})
    .then((data)=>{
        if(data.rows.length > 0){
            my.inputDate = MyApp.getFormatDateTime('D',parseInt(data.rows.item(0).timestamp));
        }else{
            my.inputDate = MyApp.getFormatDateTime('D');//获取当前时间
        }
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
    });
  }
  //获取横向分析图表数据
  getFirstChartInfo(){
    let my = this;
    let resultData = [];
    let sql = ' SELECT T.* FROM ('+
    ' SELECT ' +
        ' avg(c.pulse_amplitude) avg_pulse_amplitude, ' +
        ' date(c.data_time) data_time,d.device_id,d.device_no,' +
        ' d.device_name ' +
    ' FROM collect_data c ' +
        ' INNER JOIN devices_data d ON c.seneor_ip = d.seneor_ip ' +
    ' GROUP BY ' +
        ' c.seneor_ip, ' +
        ' date(c.data_time) '+
    ' ) T' +
    ' WHERE T.data_time = (select date(data_time) FROM collect_data order by data_timestamp desc limit 1)' +
    ' ORDER BY T.device_id asc ';
    this.database.executeSql(sql, {})
    .then((data)=>{
        if(data.rows.length == 0){
            my.showToast('暂无数据！');
            return;
        }
        //获取查询结果集
        for(let i=0;i<data.rows.length;i++){
            resultData.push(data.rows.item(i));
        }
        //初始化横向分析图表
        my.initView1(resultData);
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
    });
  }
  //横向分析
  getSecondChartInfo(){
    let my = this;
    let resultData = [];
    let sql = ' SELECT T.* FROM ('+
    ' SELECT ' +
        ' avg(c.pulse_amplitude) avg_pulse_amplitude, ' +
        ' date(c.data_time) data_time,d.device_id,d.device_no,' +
        ' d.device_name ' +
    ' FROM collect_data c ' +
        ' INNER JOIN devices_data d ON c.seneor_ip = d.seneor_ip ' +
    ' GROUP BY ' +
        ' c.seneor_ip, ' +
        ' date(c.data_time) '+
    ' ) T' +
    ' ORDER BY T.data_time asc ';
    this.database.executeSql(sql, {})
    .then((data)=>{
        if(data.rows.length == 0){
            my.showToast('暂无数据！');
            return;
        }
        //获取查询结果集
        for(let i=0;i<data.rows.length;i++){
            resultData.push(data.rows.item(i));
        }
        //初始化横向分析图表
        my.initView2(resultData);
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
    });
  }
  // 查看单柜信息
  getThirdChartInfo(item?: any){
    this.dataType = '3';
    if(MyApp.isNotEmpty(item)){
        this.currentDeviceName = item.device_name;
        this.currentDeviceNo = item.device_no;
        this.currentDeviceId = item.device_id;
    }
    let my = this;
    let resultData = [];
    let sql = ' SELECT T.* FROM ('+
    ' SELECT ' +
        ' avg(c.pulse_amplitude) avg_pulse_amplitude, ' +
        ' date(c.data_time) data_time,d.device_id,d.device_no,' +
        ' d.device_name, c.seneor_ele ' +
    ' FROM collect_data c ' +
        ' INNER JOIN devices_data d ON c.seneor_ip = d.seneor_ip ' +
    ' GROUP BY ' +
        ' date(c.data_time) '+
    ' ) T' +
    ' WHERE T.device_id = ? ' +
    ' ORDER BY T.data_time asc ';
    this.database.executeSql(sql, [my.currentDeviceId])
    .then((data)=>{
        if(data.rows.length == 0){
            my.showToast('暂无数据！');
            return;
        }
        //获取查询结果集
        for(let i=0;i<data.rows.length;i++){
            resultData.push(data.rows.item(i));
        }
        //初始化单柜信息表
        my.initView3(resultData);
    },(error)=>{
      console.log('error:'+JSON.stringify(error));
    });
  }
  //查询预警信息
  getFourthChartInfo(){
    this.warnDevices = [];
    this.focusDevices = [];
    this.normalDevices = [];
    let my = this;
    let sql = ' SELECT T.* FROM ('+
    ' SELECT ' +
        ' avg(c.pulse_amplitude) avg_pulse_amplitude, ' +
        ' date(c.data_time) data_time, '+
        ' d.seneor_no,' +
        ' d.device_id,' +
        ' d.device_id,' +
        ' d.device_no,' +
        ' d.device_name ' +
    ' FROM collect_data c ' +
        ' INNER JOIN devices_data d ON c.seneor_ip = d.seneor_ip ' +
    ' GROUP BY ' +
        ' c.seneor_ip, ' +
        ' date(c.data_time) '+
    ' ) T' +
    ' WHERE T.data_time = ? ' +
    ' ORDER BY T.device_id asc ';
    this.database.executeSql(sql, [my.inputDate])
    .then((data)=>{
        if(data.rows.length == 0){
            my.showToast('暂无数据！');
            return;
        }
        //计算预警状态
        let warns = [];//存储预警状态的设备名称
        let focuss = [];//存储关注状态的设备名称
        let normals = [];//存储正常状态的设备名称
        let allDevicesSum = 0;//所有设备脉冲幅值的总和
        let A = 0;//所有设备脉冲幅值的平均值A
        let P = 0;//某一设备当天的脉冲幅值
        let Swarn = 0;//预警柜子的总数量
        for(let i=0;i<data.rows.length;i++){
            allDevicesSum += data.rows.item(i).avg_pulse_amplitude;
        }
        A = parseFloat(MyApp.mV2dB(allDevicesSum/data.rows.length));//计算A，并转换为dB
        //判断初始状态
        for(let i=0;i<data.rows.length;i++){
            P = parseFloat(MyApp.mV2dB(parseFloat(data.rows.item(i).avg_pulse_amplitude)));
            if(A >= 20){//判断A是否 >= 20
                if(P <= 25){//正常
                    normals.push(data.rows.item(i));
                }else if(P > 25 && P < 40){//关注
                    focuss.push(data.rows.item(i));
                }else{//预警
                    warns.push(data.rows.item(i));
                }
            }else{
                if(P <= 1.5 * A){//正常
                    normals.push(data.rows.item(i));
                }else if(P > (1.5*A) && P < (2*A)){//关注
                    focuss.push(data.rows.item(i));
                }else{//预警
                    warns.push(data.rows.item(i));
                }
            }
        }
        //故障确认
        Swarn = warns.length;
        if(Swarn<=1){//确认上述分类结果
            for(let i=0;i<warns.length;i++){
                //设备名称为空，则显示设备编号
                my.warnDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
            }
            for(let i=0;i<focus.length;i++){
                //设备名称为空，则显示设备编号
                my.focusDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
            }
            for(let i=0;i<normals.length;i++){
                //设备名称为空，则显示设备编号
                my.normalDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
            }
        }else if(Swarn>=2 && Swarn<=3){
            //判断传感器编号是否相邻
            if((Math.abs(warns[0].seneor_no - warns[1].seneor_no) == 1)||(Math.abs(warns[2].seneor_no - warns[1].seneor_no) == 1)){
                //相邻则确认上述结果
                for(let i=0;i<warns.length;i++){
                    //设备名称为空，则显示设备编号
                    my.warnDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
                }
                for(let i=0;i<focus.length;i++){
                    //设备名称为空，则显示设备编号
                    my.focusDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
                }
                for(let i=0;i<normals.length;i++){
                    //设备名称为空，则显示设备编号
                    my.normalDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
                }
            }else{
                //不相邻则降级
                for(let i=0;i<normals.length;i++){
                    //设备名称为空，则显示设备编号
                    my.normalDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
                }
                for(let i=0;i<focus.length;i++){
                    //设备名称为空，则显示设备编号
                    my.normalDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
                }
                for(let i=0;i<warns.length;i++){
                    //设备名称为空，则显示设备编号
                    my.focusDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
                }
            }
        }else{//上述分类结果降级，预警变关注，关注变正常
            for(let i=0;i<normals.length;i++){
                //设备名称为空，则显示设备编号
                my.normalDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
            }
            for(let i=0;i<focus.length;i++){
                //设备名称为空，则显示设备编号
                my.normalDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
            }
            for(let i=0;i<warns.length;i++){
                //设备名称为空，则显示设备编号
                my.focusDevices.push(MyApp.isEmpty(warns[i].device_name)?warns[i].device_no:warns[i].device_name);
            }
        }
        //
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
