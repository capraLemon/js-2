import { machine, useContext, useState } from './my-state-machine';


const myMachine3 = machine({
    initialState: 1,
    context: { b: 'myData' },
    states: {
        '2': {
            onEntry: () => {
                console.log('onEntry', useState());
            },
        },
        '1': {
            on: {
                go: {
                    service: () => {
                        const [context, setContext] = useContext();
                        const [_, setState] = useState();
                        console.log(useContext()); // [ 'myData', [Function: bound setContext] ]
                        console.log(useState()); // [ 1, [Function: bound setState] ]
                        
                        setTimeout(() => {
                            setState('2');
                            setContext({ a: 1 });
                            console.log(context);
                        });
                    },
                },
            },
        },
    },
});

const myMachine = machine({
    initialState: 1,
    context: { b: 'myData' },
    states: {
        '2': {},
        '1': {
            on: {
                go: {
                    service: () => {
                        myMachine2.transition('go');
                        console.log(useContext()[0]); // Здесь будет выведено { b: 'Machine2 data' } и работа будет с myMachine2, хотя функция внутри myMachine
                    },
                },
            },
        },
    },
});

const myMachine2 = machine({
    initialState: 1,
    context: { b: 'Machine2 data' },
    states: {
        '2': {},
        '1': {
            on: {
                go: {
                    service: () => {
                        console.log(useContext()[0]); 
                    },
                },
            },
        },
    },
});

myMachine3.transition('go', 0);
setTimeout(() => {
    console.log();
    myMachine.transition('go');
}, 400);