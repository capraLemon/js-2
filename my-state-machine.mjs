class Machine {

    constructor({id, initialState, context, states, actions}) {
        Object.assign(this, {id, initialState, context, states, actions});
        this.currentState = initialState;
    }

    transition(transaction, body) {
        stackOfMachines.push(this);
        let stateActions = this.states[this.currentState];
        try {
            checkInitialErrors.call(this, transaction);
            if (stateActions.on[transaction].service) {
                stateActions.on[transaction].service(body);
            }
            stackOfMachines.pop();
        } catch(err) {
            console.log(err);
        }

        function checkInitialErrors(transaction) {
            if (!this.states[this.currentState]) {
                throw new Error(`there is no such state ${this.currentState}`);
            }
            if (!stateActions.on) {
                throw new Error(`there is no "on" action in state ${this.currentState}`);
            }
            if (!stateActions.on.hasOwnProperty(transaction)) {
                throw new Error(`there is no transaction ${transaction} in "on" field`);
            }
        }
    }
}

let stackOfMachines = [];

function doAction(onEntryOrExit) {
    let stateActions = this.states[this.currentState];
    if (!stateActions[onEntryOrExit]) {
        return;
    }
    if (typeof(stateActions[onEntryOrExit]) === "function") {
        stateActions[onEntryOrExit]();
    } else if (this.actions[stateActions[onEntryOrExit]]) {
        this.actions[stateActions[onEntryOrExit]]();
    } else {
        throw new Error(`there is no such ${onEntryOrExit} action in "actions" field`);
    }
}

function useState() {
    const currentMachine = stackOfMachines[stackOfMachines.length - 1];
    return [currentMachine.currentState,
        (newState) => {
            stackOfMachines.push(currentMachine);
            if (!currentMachine.states[newState]) {
                throw new Error(`can not set new state, ${newState} doesn't exist`);
            }
            doAction.call(currentMachine, 'onExit');
            currentMachine.currentState = newState;
            doAction.call(currentMachine, 'onEntry');
            stackOfMachines.pop();
        }
    ];
}

function useContext() {
    const currentMachine = stackOfMachines[stackOfMachines.length - 1];
    return [currentMachine.context, 
        (newContext) => {
            Object.assign(currentMachine.context, newContext);
        }];
}

function machine(parameters) {
    return new Machine(parameters);
}

export { machine, useContext, useState };