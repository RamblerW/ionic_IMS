/**
 * 采集数据表
 */
export class CollectData {

    data_id: number; //id
    seneor_ip: string;//传感器IP
    data_time: Date;//数据生成时间
    data_timestamp: number;//数据生成时间（时间戳）
    pulse_amplitude: number;//脉冲幅值
    pulse_num: number;//脉冲数
    collect_time: Date;//采集时间
    seneor_ele: number;//平均放电幅值
  
    constructor() {
  
    }
  
  }