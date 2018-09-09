export function socketCallbackWrapper(callback: Function, socket) {
    return eventData => callback(socket, eventData);
}

export default class withSocketListeners {
    static socketEvents: { [s: string]: Function };
    static socketHandlers: { [s: string]: Array<Function> } = {};

    attachSocketEvent(socket): void {
        const thisConstructor  = <typeof withSocketListeners>this.constructor;
        let socketHandler = thisConstructor;

        if (!thisConstructor.hasOwnProperty('socketHandlers')) {
            thisConstructor.socketHandlers = {};
        }
    
        while (socketHandler) {
            for (let socketEvent in socketHandler.socketEvents) {
                const bindedCallback = socketHandler.socketEvents[socketEvent].bind(this);
    
                const handler = socketCallbackWrapper(bindedCallback, socket);
    
                socket.on(socketEvent, handler);

                if (!thisConstructor.socketHandlers[socketEvent]) {
                    thisConstructor.socketHandlers[socketEvent] = [];
                }

                thisConstructor.socketHandlers[socketEvent].push(handler);
            }

            socketHandler = Object.getPrototypeOf(socketHandler);
        }
    }

    removeSocketEvent(socket): void {
        const thisConstructor = <typeof withSocketListeners>this.constructor;

        for (let socketEvent in thisConstructor.socketHandlers) {
            thisConstructor.socketHandlers[socketEvent].forEach(listener => socket.removeListener(socketEvent, listener));
        }
    }
}

export function socketEvent(target: any, propertyKey: string) {
    if (!target.constructor.hasOwnProperty('socketEvents')) {
        target.constructor.socketEvents = {};
    }

    target.constructor.socketEvents[propertyKey] = target[propertyKey];
};