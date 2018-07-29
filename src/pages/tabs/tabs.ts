import {Component} from '@angular/core';

import { DataShowPage } from '../data-show/data-show';
import { DevicesShowPage } from '../devices-show/devices-show';
import { DataCollectPage } from '../data-collect/data-collect';
import { ParamsSetPage } from '../params-set/params-set';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root = DataCollectPage;
  tab2Root = DataShowPage;
  tab3Root = DevicesShowPage;
  tab4Root = ParamsSetPage;

  constructor() {

  }
}
