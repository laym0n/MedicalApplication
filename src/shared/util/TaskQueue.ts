type Entry = {
  lazyTask: () => Promise<{}>;
  resolve: (v?: {} | PromiseLike<{}>) => void;
  reject: (reason?: any) => void;
};

export class TaskQueue {
  private queue = new Array<Entry>();

  // Pushes a task into the queue and returns a promise that will be fulfilled/rejected when the has been processed
  public push<T>(lazyTask: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let entry = { lazyTask: lazyTask, resolve: resolve, reject: reject };

      this.pushTask(entry);
    });
  }

  private executeNext() {
    if (this.queue.length === 0) {
      return;
    }

    let item = this.queue[0];
    try {
      let task = item.lazyTask();
      task
        .then((val) => {
          item.resolve(val);
          this.popTask();
        })
        .catch((error) => {
          item.reject(error);
          this.popTask();
        });
    } catch (e1) {
      // Even if the client screwed up - the show must go on
      try {
        item.reject(e1);
      } catch (e2) {
        // The rejection handler threw an error so we just log it and move on - no point in trying again
        // You may want to log the error to e.g. Sentry here
        console.error(e2);
      }
      this.popTask();
    }
  }

  private popTask() {
    this.queue.shift();
    this.executeNext();
  }

  private pushTask(entry: Entry) {
    this.queue.push(entry);
    // If it is the first and only task we need to trigger the execution of the queue
    if (this.queue.length === 1) {
      this.executeNext();
    }
  }
}
