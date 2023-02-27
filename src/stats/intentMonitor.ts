import {Statistics} from "./statistics";

monitorFunctionsForIntent([
    "move",
    "harvest",
    "attack",
    "build",
    "repair",
    "dismantle",
    "transfer",
    "withdraw",
    "drop",
    "pickup",
    "pull",
    "suicide",
    "say",
    "rangedHeal",
    "heal",
    "rangedAttack",
    "rangedMassAttack",
    "attackController",
    "upgradeController",
    "claimController",
    "reserveController",
    "signController",
    "generateSafeMode"
]);

function monitorFunctionsForIntent(functionNames: (keyof Creep)[]) {
    functionNames.forEach(monitorFunctionForIntent);
}

function monitorFunctionForIntent(functionName: keyof Creep) {
    const unmonitoredFunctionName = functionName + "Unmonitored";
    if ((Creep.prototype as any)[unmonitoredFunctionName]) return;

    const unmonitoredFunction = (Creep.prototype as any)[functionName];
    (Creep.prototype as any)[unmonitoredFunctionName] = unmonitoredFunction;

    (Creep.prototype as any)[functionName] = function (this: any, ...params: any) {
        const status = unmonitoredFunction.apply(this, params);

        if (status === OK) {
            Statistics.registerCreepIntent();
        }

        return status;
    };
}
