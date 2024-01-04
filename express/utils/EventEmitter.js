
class EventEmitter {
  constructor() {
    this.events = {};
    this.lazyExecutes = {}
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [callback]
    } else {
      this.events[eventName].push(callback)
    }

    if (this.lazyExecutes[eventName] && this.lazyExecutes[eventName]?.length !== 0) {
      this.lazyExecutes[eventName].forEach(arg => {
        this.emit(eventName, ...arg)
      })
      this.lazyExecutes[eventName] = []
    }
  }
  immediately(eventName, callback, flag) {
    flag ? callback() : this.on(eventName, callback)
  }
  emit(eventName, ...rest) {
    this.events[eventName] && this.events[eventName].forEach(cb => cb.apply(this, rest));
    try {
      if (this.events[eventName] === undefined) {
        if (!this.lazyExecutes[eventName]) {
          this.lazyExecutes[eventName] = []
          this.lazyExecutes[eventName].push(rest)
        } else {
          this.lazyExecutes[eventName].push(rest)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  removeListener(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb != callback)
    }
  }
  once(eventName, callback) {
    let fn = (rest) => {
      callback(rest);
      this.removeListener(eventName, fn)
    }
    this.on(eventName, fn)
  }
}
module.exports = new EventEmitter()