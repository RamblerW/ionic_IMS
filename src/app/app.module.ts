import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { DataShowPage } from '../pages/data-show/data-show';
import { DevicesShowPage } from '../pages/devices-show/devices-show';
import { DevicesMgtPage } from '../pages/devices-mgt/devices-mgt';
import { DataCollectPage } from '../pages/data-collect/data-collect';
import { ParamsSetPage } from '../pages/params-set/params-set';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from "@ionic-native/sqlite";
import { Keyboard } from "@ionic-native/keyboard";

@NgModule({
  declarations: [
    MyApp,
    DataShowPage,
    DevicesShowPage,
    DevicesMgtPage,
    DataCollectPage,
    ParamsSetPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    // IonicModule.forRoot(MyApp)
    IonicModule.forRoot(MyApp,{
      tabsHideOnSubPages: 'true'         //隐藏全部子页面tabs
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    DataShowPage,
    DevicesShowPage,
    DevicesMgtPage,
    DataCollectPage,
    ParamsSetPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SQLite,
    Keyboard,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
