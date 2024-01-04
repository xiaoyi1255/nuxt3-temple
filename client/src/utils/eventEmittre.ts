class EventEmitter {
  private events: Record<string, Function[]> = {};
  private lazyExecutes: Record<string, any[]> = {};

  on(eventName: string, callback: Function): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [callback];
    } else {
      this.events[eventName].push(callback);
    }

    if (this.lazyExecutes[eventName] && this.lazyExecutes[eventName]?.length !== 0) {
      this.lazyExecutes[eventName].forEach(arg => {
        this.emit(eventName, ...arg);
      });
      this.lazyExecutes[eventName] = [];
    }
  }

  immediately(eventName: string, callback: Function, flag: boolean): void {
    flag ? callback() : this.on(eventName, callback);
  }

  emit(eventName: string, ...rest: any[]): void {
    if (this.events[eventName]) {
      this.events[eventName].forEach(cb => cb.apply(this, rest));
    }
    try {
      if (this.events[eventName] === undefined) {
        if (!this.lazyExecutes[eventName]) {
          this.lazyExecutes[eventName] = [];
          this.lazyExecutes[eventName].push(rest);
        } else {
          this.lazyExecutes[eventName].push(rest);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  removeListener(eventName: string, callback: Function): void {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb != callback);
    }
  }

  once(eventName: string, callback: Function): void {
    let fn = (rest: any) => {
      callback(rest);
      this.removeListener(eventName, fn);
    };
    this.on(eventName, fn);
  }
}
