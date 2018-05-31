export default class withSocketListeners {
    static socketEvents: { [s: string]: Function };

    attachSocketEvent(socket): void {
        const thisConstructor = <typeof withSocketListeners>this.constructor;

        for (let socketEvent in thisConstructor.socketEvents) {
            socket.on(socketEvent, thisConstructor.socketEvents[socketEvent].bind(this));
        }
    }
}

export function socketEvent(target: any, propertyKey: string) {
    if (!target.constructor.hasOwnProperty('socketEvents')) {
        target.constructor.socketEvents = {};
    }

    target.constructor.socketEvents[propertyKey] = target[propertyKey];
};