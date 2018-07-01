export function socketCallbackWrapper(callback: Function, socket) {
    return eventData => callback(socket, eventData);
}

export default class withSocketListeners {
    static socketEvents: { [s: string]: Function };

    attachSocketEvent(socket): void {
        let socketHandler = <typeof withSocketListeners>this.constructor;

        while (socketHandler) {
            for (let socketEvent in socketHandler.socketEvents) {
                const bindedCallback = socketHandler.socketEvents[socketEvent].bind(this);
    
                const handler = socketCallbackWrapper(bindedCallback, socket);
    
                socket.on(socketEvent, handler);
            }

            socketHandler = Object.getPrototypeOf(socketHandler);
        }
    }
}

export function socketEvent(target: any, propertyKey: string) {
    if (!target.constructor.hasOwnProperty('socketEvents')) {
        target.constructor.socketEvents = {};
    }

    target.constructor.socketEvents[propertyKey] = target[propertyKey];
};