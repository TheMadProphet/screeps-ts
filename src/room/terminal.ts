export {};

declare global {
    interface StructureTerminal {
        automate(): void;
    }
}

interface ResourcePrices {
    sell?: number;
    sellOrder?: number;
    buy?: number;
    buyOrder?: number;
}

const RESOURCE_PRICES: Partial<Record<MarketResourceConstant, ResourcePrices>> = {
    [RESOURCE_LEMERGIUM]: {
        // sell: 825,
        sellOrder: 900
    }
};

class ExtendedTerminal extends StructureTerminal {
    @AddToPrototype
    public automate() {
        if (this.cooldown > 0) return;
        if (Game.time % 6 !== 0) return;

        if (Game.market.credits > 0 && Game.time % 12 === 0) {
            this.createOrder();
        }

        if (this.store[RESOURCE_ENERGY] > 0) {
            this.sellResources();
        }
    }

    @AddToPrototype
    private createOrder() {
        const energyAmount = Math.min(this.store[RESOURCE_ENERGY], 1000);
        if (energyAmount < 100) return;

        for (const resourceType in this.store) {
            const resource = resourceType as ResourceConstant;
            if (resourceType === RESOURCE_ENERGY || this.store[resource] <= 0) {
                continue;
            }

            const orderExists = Object.values(Game.market.orders).some(
                order => order.resourceType === resourceType && order.roomName === this.room.name
            );
            if (orderExists) {
                continue;
            }

            const price = RESOURCE_PRICES[resource]?.sellOrder;
            if (price) {
                const affordableAmount = Math.floor(Game.market.credits / price / 0.05);
                const amountToSell = Math.min(this.store[resource], affordableAmount);
                if (amountToSell < 1000) continue;

                Game.market.createOrder({
                    type: ORDER_SELL,
                    resourceType: resource,
                    price: price,
                    totalAmount: amountToSell,
                    roomName: this.room.name
                });
            }
        }
    }

    @AddToPrototype
    private sellResources() {
        for (const resourceType in this.store) {
            const resource = resourceType as ResourceConstant;
            if (resourceType === RESOURCE_ENERGY || this.store[resource] <= 0) continue;

            const price = RESOURCE_PRICES[resource]?.sell;
            if (!price) continue;

            const orders = Game.market
                .getAllOrders({type: ORDER_BUY, resourceType: resource})
                .filter(it => it.price >= price)
                .sort((a, b) => b.price - a.price);
            for (const order of orders) {
                if (order.price < price || !order.roomName) break;

                const transactionCost = Game.market.calcTransactionCost(1000, this.room.name, order.roomName);
                const energyAvailable = this.store[RESOURCE_ENERGY];
                const maxAffordableAmount = Math.floor(energyAvailable / (transactionCost / 1000));
                const amountToSell = Math.min(maxAffordableAmount, this.store[resource], order.remainingAmount);
                if (amountToSell < 100) continue;

                const result = Game.market.deal(order.id, amountToSell, this.room.name);
                if (result === OK) {
                    console.log(
                        `Terminal in ${this.room.name} sold ${amountToSell} of ${resource} at price ${
                            order.price
                        } for a total of ${amountToSell * price} credits (transaction cost: ${transactionCost})`
                    );

                    break;
                }
            }
        }
    }
}

function AddToPrototype(target: any, methodName: string, descriptor: PropertyDescriptor) {
    // @ts-ignore
    StructureTerminal.prototype[methodName] = function (...args: any[]) {
        return descriptor.value.apply(this, args);
    };
}
