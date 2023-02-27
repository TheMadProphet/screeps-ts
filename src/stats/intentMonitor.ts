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
    const creepFunction = Creep.prototype[functionName] as unknown as Function & {isMonitored: boolean};
    if (creepFunction.isMonitored) return;

    (Creep.prototype as any)[functionName] = function (this: Creep, ...params: any) {
        const status = creepFunction.apply(this, params);

        if (status === OK) {
            Statistics.registerCreepIntent(this.name);
        }

        return status;
    };

    (Creep.prototype as any)[functionName].isMonitored = true;
}
