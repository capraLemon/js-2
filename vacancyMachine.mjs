import { machine, useContext, useState } from './my-state-machine';


const vacancyMachine = machine({
    id: 'vacancy',
    initialState: 'notResponded',
    context: {id: 123},
    states: {
        responded: {
            onEntry: 'onStateEntry',
            on: {
                UNRESPOND: {
                    service: (event) => {
                        const [contex, setContext] = useContext();			
                        const [state, setState] = useState();
                        return new Promise((resolve, reject) => {
                            setTimeout(() => reject(), event);
                            }).then(() => {
                            setState('notResponded');
                            setContext({completed: 'UNRESPOND'});
                        })
                    },
                },
                RESPOND: {
                    service: (event) => {
                        console.log('i\'v already been responded');
                    },
                },
            },
        },
        notResponded: {
            onExit: 'onStateExit',
            on: {
                RESPOND: {
                    service: (event) => {
                        const [contex, setContext] = useContext();			
                        const [state, setState] = useState();
                        return new Promise((resolve, reject) => {
                            setTimeout(() => resolve(), event);
                            }).then(() => {
                            setState('responded');
                            setContext({completed: 'RESPOND'});
                        })
                    },
                },
                UNRESPOND: {},
            },
        },		
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            console.log('now state is ' + state);
        },
        onStateExit: (event) => {
            const [state] = useState();
            console.log('now state is ' + state);
        },
    }
})

const vacancyMachine2 = machine({
    id: 'vacancy2',
    initialState: 'notResponded',
    context: {id: 456},
    states: {
        responded: {
            onEntry: 'onStateEntry',
            on: {
                UNRESPOND: {
                    service: (event) => {
                        const [contex, setContext] = useContext();			
                        const [state, setState] = useState();
                        return new Promise((resolve, reject) => {
                            setTimeout(() => resolve(), event);
                            }).then(() => {
                            setState('notResponded');
                            setContext({completed: 'UNRESPOND'});
                        })
                    },
                },
            },
        },
        notResponded: {
            onExit: 'onStateExit',
            on: {
                RESPOND: {
                    service: (event) => {
                        const [contex, setContext] = useContext();			
                        const [state, setState] = useState();
                        return new Promise((resolve, reject) => {
                            setTimeout(() => resolve(), event);
                            }).then(() => {
                            setState('responded');
                            setContext({completed: 'RESPOND'});
                        })
                    },
                },
            },
        },		
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            console.log('now state is ' + state);
        },
        onStateExit: (event) => {
            const [state] = useState();
            console.log('now state is ' + state);
        },
    }
})

vacancyMachine2.transition('RESPOND', 10);
vacancyMachine2.transition('UNRESPOND', 10);
vacancyMachine2.transition('RESPOND', 10);
vacancyMachine2.transition('UNRESPOND', 10);

setTimeout(() => vacancyMachine.transition('RESPOND', 50), 100);
setTimeout(() => vacancyMachine.transition('UNRESPOND', 50), 160);
// когда в transition выставлен флаг true, то будет произведена попытка
// повторить по новой старую транзакцию, которая вызвала ошибку в сервисе
setTimeout(() => vacancyMachine.transition('RESPOND', 50, true), 250)
// если выставлен флаг false, то не будет производиться попытка провести 
// старые транзакции, а всё начнется с нуля.
setTimeout(() => vacancyMachine.transition('RESPOND', 50, false), 350)