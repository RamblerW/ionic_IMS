/**
 * 设备数据表
 */
export class DevicesData {

    device_id: number; //id
    //传感器信息
    seneor_no: string; //传感器编号 *
    seneor_name: string;//传感器名称
    seneor_pword: string;//传感器密码
    seneor_ele: number;//传感器电量
    seneor_ip: string;//传感器IP

    device_name: string;//设备名称
    device_no: string//设备编号（柜号）*
    device_type: string;//设备类型
    device_model: string;//设备型号
    voltage_grade: string;//电压等级
    producer: string;//生产厂家
    operation_depart: string;//运行单位
    factory_no: string;//出厂编号
    factory_date: Date;//出厂日期
    use_date: Date;//投运日期
    substation_name: string;//变电站名称

    focus_val: number;//触发阈值
    warn_val: number;//预警阈值
    time_sub: number;//自启动时间间隔/小时
  
    constructor() {
  
    }
  
  }