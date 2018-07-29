import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      // setTimeout(() => {
      //   splashScreen.hide();
      // }, 500)
      splashScreen.hide();
    });
  }

  static socketPort = 8899;
  /**
     * 是否为空
     * @param value 值
     */
    static isEmpty(value: any): boolean {
      return value == undefined || value == null || typeof value === 'string' && value.length === 0;
  }

  /**
   * 是否不为空
   * @param value 值
   */
  static isNotEmpty(value: any): boolean {
      return !this.isEmpty(value);
  }

  /**
   * dB转mV（保留0位小数）
   * @param val
   */
  static dB2mV(val: number){
    let result = Math.pow(10, val/20);
    return result.toFixed(0);
  }
  /**
   * mV转dB（保留1位小数）
   * @param val
   */
  static mV2dB(val: number){
    let result:number = 0;
    if(val != 0){
      result = 20 * (Math.log(val)/Math.log(10));
      return result.toFixed(1);
    }else{
      return result.toFixed(0);
    }
  }
  /**
   * 电池电压换算成电池电量：V 转为 %
   * @param volNum 电池电压
   */
  static getEleNum(volNum:number){
    let volNumFormat = volNum>8.4?8.4:volNum; //电池电压大于8.4V时按照8.4计算
    return Math.round(((volNumFormat-6.8)/1.6)*100) + '%';
  }
  /**
   * 格式化日期
   * @param flag：D-年月日，T-年月日时分秒，FT-年月日,时分秒
   * @param timestamp 时间戳：秒数
   */
  static getFormatDateTime(flag: string, timestamp?) {
    let date: Date;
    if(MyApp.isNotEmpty(timestamp)){
      date = new Date(timestamp*1000);
    }else{
      date = new Date();
    }
    let seperator1 = "-";
    let seperator2 = ":";
    let year = date.getFullYear() + "";
    let month = date.getMonth() + 1 + "";
    let strDate = date.getDate() + "";
    let hour = date.getHours() + "";
    let minute = date.getMinutes() + "";
    let second = date.getSeconds() + "";
    if (month.length < 2) {
        month = "0" + month;
    }
    if (strDate.length < 2) {
        strDate = "0" + strDate;
    }
    if (hour.length < 2) {
      hour = "0" + hour;
    }
    if (minute.length < 2) {
      minute = "0" + minute;
    }
    if (second.length < 2) {
      second = "0" + second;
    }

    let currentTime = year + seperator1 + month + seperator1 + strDate + " " + hour + seperator2 + minute + seperator2 + second;
    let currentFormatTime = year + seperator1 + month + seperator1 + strDate + "," + hour + seperator2 + minute + seperator2 + second;
    let currentDate = year + seperator1 + month + seperator1 + strDate;

    if(flag == 'D'){
      return currentDate;
    }else if(flag == 'FT') {
      return currentFormatTime;
    }else{
      return currentTime;
    }
  }
}
