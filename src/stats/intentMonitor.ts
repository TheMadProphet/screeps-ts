import {Statistics} from "./statistics";

monitorFunctionsForIntent([
    "attack",
    "attackController",
    "build",
    "claimController",
    "dismantle",
    "drop",
    "generateSafeMode",
    "harvest",
    "heal",
    "move",
    "notifyWhenAttacked",
    "pickup",
    "rangedAttack",
    "rangedHeal",
    "rangedMassAttack",
    "repair",
    "reserveController",
    "signController",
    "suicide",
    "transfer",
    "upgradeController",
    "withdraw"
]);

function monitorFunctionsForIntent(functionNames: (keyof Creep)[]) {
    functionNames.forEach(monitorFunctionForIntent);
}

function monitorFunctionForIntent(functionName: keyof Creep) {
    const unmonitoredFunctionName = functionName + "Unmonitored";
    if ((Creep.prototype as any)[unmonitoredFunctionName]) return;

    const unmonitoredFunction = (Creep.prototype as any)[functionName];
    (Creep.prototype as any)[unmonitoredFunctionName] = unmonitoredFunction;

    (Creep.prototype as any)[functionName] = function (this: Creep, ...params: any) {
        const status = unmonitoredFunction.apply(this, params);

        if (status === OK) {
            Statistics.registerCreepIntent(this.name);
        }

        return status;
    };
}
