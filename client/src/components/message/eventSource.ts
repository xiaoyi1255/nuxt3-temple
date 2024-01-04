interface Config {

}
class EventSore {
  instance: EventSource | null = null;
  url: string;
  config: { };
  constructor(url: string, config: {}) {
    this.url = url;
    this.config = config;
  }
  getState(){
    console.log('连接状态：', this.instance?.readyState);
    return this.instance.readyState;
  }
  init() {
    if (this.instance) {
      return;
    }
    this.instance = new EventSource(this.url, this.config);
    this.instance.addEventListener('notify', this.notifyHandle.bind(this));
    this.instance.addEventListener('message', this.messageHandled.bind(this));
    this.instance.addEventListener('open', this.openHandle.bind(this));
    this.instance.addEventListener('error', this.error.bind(this));
    this.instance.addEventListener('close', this.close.bind(this));
  }
  notifyHandle(e: MessageEvent) {
    console.log('自定义事件 notify：', e.data);
  }

  messageHandled(e: MessageEvent) {
    console.log('message 事件：', e.data);
  }

  close() {
    console.log('关闭连接');
    this.instance?.close();
    this.instance = null
  }

  openHandle() {
    console.log('连接成功');
  }

  error() {
    console.error('连接错误');
  }
}