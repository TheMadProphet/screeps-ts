// Source: https://github.com/screepers/screeps-snippets/blob/master/src/misc/TypeScript/Creep%20intent%20tracker.ts
// Adjusted to simply keep track of amount of intents executed per tick

// unfleshedone 3 June 2017 at 20:56
// ===================================================

declare global {
    interface Creep {
        intentTracker: IntentTracker;
    }
}

interface Creep {
    readonly intentTracker: IntentTracker;
}

enum Buckets {
    eMeleePipeline,
    eRangedPipeline
}

type HostType = Creep;

interface IIntent {
    args: any[];
}

export class IntentTracker {
    public static WrapIntents(host: HostType) {
        if ((host as any)._intentsWrapped) return;
        (host as any)._intentsWrapped = true;

        IntentTracker.WrapIntent(host, "harvest");
        IntentTracker.WrapIntent(host, "attack");
        IntentTracker.WrapIntent(host, "build");
        IntentTracker.WrapIntent(host, "repair");
        IntentTracker.WrapIntent(host, "dismantle");
        IntentTracker.WrapIntent(host, "attackController");
        IntentTracker.WrapIntent(host, "rangedHeal");
        IntentTracker.WrapIntent(host, "heal");
        IntentTracker.WrapIntent(host, "rangedAttack");
        IntentTracker.WrapIntent(host, "rangedMassAttack");

        IntentTracker.WrapIntent(host, "upgradeController");
        IntentTracker.WrapIntent(host, "claimController");
        IntentTracker.WrapIntent(host, "move");
        IntentTracker.WrapIntent(host, "transfer");
        IntentTracker.WrapIntent(host, "withdraw");
        IntentTracker.WrapIntent(host, "drop");
        IntentTracker.WrapIntent(host, "pickup");
    }

    private static WrapIntent(host: HostType, functionName: string) {
        const descriptor = Object.getOwnPropertyDescriptor(host, functionName);
        if (!descriptor) return;

        const hasAccessor = descriptor.get || descriptor.set;
        if (hasAccessor) return;

        const isFunction = typeof descriptor.value === "function";
        if (!isFunction) return;

        const originalFunction = (host as any)[functionName];

        let buckets = IntentTracker.Pipelines[functionName];
        if (buckets === undefined) buckets = [];

        (host as any)[functionName] = function (this: any, ...args: any[]) {
            const res = originalFunction.apply(this, args);
            if (res === OK) this.intentTracker.onIntent(functionName, buckets, args);
            return res;
        };
    }

    private static Pipelines: {[name: string]: Buckets[]} = {
        attack: [Buckets.eMeleePipeline],
        harvest: [Buckets.eMeleePipeline],
        build: [Buckets.eMeleePipeline, Buckets.eRangedPipeline],
        repair: [Buckets.eMeleePipeline, Buckets.eRangedPipeline],
        dismantle: [Buckets.eMeleePipeline],
        attackController: [Buckets.eMeleePipeline],
        rangedHeal: [Buckets.eMeleePipeline, Buckets.eRangedPipeline],
        heal: [Buckets.eMeleePipeline],
        rangedAttack: [Buckets.eRangedPipeline],
        rangedMassAttack: [Buckets.eRangedPipeline]
    };

    private pipelines: Set<Buckets> = new Set();
    private intents: Map<string, IIntent> = new Map();

    public onIntent(name: string, buckets: Buckets[], args: any[]) {
        _.each(buckets, b => this.pipelines.add(b));

        if (buckets.length === 0) {
            this.intents.set(name, {args});
        }
    }

    public getIntentCount(): number {
        const bucketCount = this.pipelines.size;
        const intentCount = this.intents.size;

        return bucketCount + intentCount;
    }
}

if (!Creep.prototype.hasOwnProperty("intentTracker")) {
    Object.defineProperty(Creep.prototype, "intentTracker", {
        get(this: any) {
            if (this.__intentTracker === undefined) this.__intentTracker = new IntentTracker();
            return this.__intentTracker;
        },
        configurable: false,
        enumerable: false
    });
}
