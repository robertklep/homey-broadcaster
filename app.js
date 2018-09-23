const Homey        = require('homey');
const { HomeyAPI } = require('athom-api')
const mqtt         = require('mqtt');

const URI = 'mqtt://192.168.23.8:1883';

module.exports = class HomeyBroadcaster extends Homey.App {

  async onInit() {
    this.log('HomeyBroadcaster is running...');
    this.api    = await HomeyAPI.forCurrentHomey();
    this.client = mqtt.connect(URI).on('connect', this.onConnect.bind(this));
    this.subscribe();
  }

  async subscribe() {
    // Subscribe to device manager changes.
    //    await this.api.devices.subscribe();
    this.api.devices.on('device.create', async id => {
      this.log('device.create', id);
      this.addDevice(await this.api.devices.getDevice({ id }));
    }).on('device.update', async id => {
      this.log('device.update', id);
    }).on('device.delete', async id => {
      this.log('device.delete', id);
    });

    // Subscribe to all existing devices.
    const allDevices = await this.api.devices.getDevices();
    for (const id in allDevices) {
      this.addDevice(allDevices[id]);
    }
  }

  async addDevice(device) {
    device.on('$state', state => {
      console.log('Realtime update from:', device.name, ', state =', state);
    });
  }

  onConnect() {
  }

}
