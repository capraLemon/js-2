class Machine {

    constructor(parameters) {
        this.id = parameters.id;
        this.initialState = parameters.initialState;
        this.context = parameters.context;
        this.states = parameters.states;
        this.actions = parameters.actions;
        this.futureTransitions = [];
        this.transitionFailed = false;       
    }

    transition(transaction, body, retry=true) {
        let stateActions;
        if (retry && this.transitionFailed) {
            this.transitionFailed = false;
            resolveTransition.call(this, this.futureTransitions[0][0], this.futureTransitions[0][1]);
        } else if (this.transitionFailed) {
            this.transitionFailed = false;
            this.futureTransitions = [];
            resolveTransition.call(this, transaction, body);
        } else {
            this.futureTransitions.push([transaction, body]);
            if (this.futureTransitions.length !== 1) {
                return;
            }
            resolveTransition.call(this, transaction, body);
        }

        function resolveTransition(transaction, body) {
            stateActions = this.states[this.initialState];
            checkInitialErrors.call(this, transaction);
            return changeState.call(this, transaction, body);
        }

        function changeState(transaction, body) {
            (async () => {
                try {
                    await doAllActions.call(this, transaction, body);

                    console.log('finished transition in machine with');
                    console.log(`id: ${this.id}, state: ${this.initialState}, context.compl: ${this.context.completed}`);
                    console.log();

                    this.futureTransitions.shift();
                    if (this.futureTransitions.length) {
                        resolveTransition.call(this, this.futureTransitions[0][0], this.futureTransitions[0][1]);
                    } else {
                        return;
                    }
                } catch(err) {
                    console.log(err);
                }
            })();
        }

        async function doAllActions(transaction, body) {
            doAction.call(this, 'onExit');
            await doTransaction.call(this, transaction, body);
            doAction.call(this, 'onEntry');
        }

        function doTransaction(transaction, body) {
            useState.currentMachine = this;
            useContext.currentMachine = this;
            return new Promise( (resolve) => {
                if (stateActions.on[transaction].service) {
                    (async () => {
                        try {
                            await stateActions.on[transaction].service(body);
                            stateActions = this.states[this.initialState];
                            resolve();
                        } catch(err) {
                            this.transitionFailed = true;
                            console.log(`something went wrong in service action for ${transaction} transaction`);
                            console.log(err);
                        }
                    })();
                }
            })
        }

        function doAction(onEntryOrExit) {
            useState.currentMachine = this;
            useContext.currentMachine = this;
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

        function checkInitialErrors(transaction) {
            if (!this.states[this.initialState]) {
                throw new Error(`there is no such initial state ${this.initialState}`);
            }
            if (!stateActions.on) {
                throw new Error(`there is no "on" action in state ${this.initialState}`);
            }
            if (!stateActions.on.hasOwnProperty(transaction)) {
                throw new Error(`there is no transaction ${transaction} in "on" field`);
            }
        }
    }
}

function useState() {
    const currentMachine = useState.currentMachine;
    return [currentMachine.initialState, 
        (newState) => {
            if (!currentMachine.states[newState]) {
                throw new Error(`can not set new state, ${newState} doesn't exist`);
            }
            currentMachine.initialState = newState;
        }
    ];
}

function useContext() {
    const currentMachine = useContext.currentMachine;
    return [currentMachine.context, (newContext) => {Object.assign(currentMachine.context, newContext)}];
}

function machine(parameters) {
    return new Machine(parameters);
}

export { machine, useContext, useState };