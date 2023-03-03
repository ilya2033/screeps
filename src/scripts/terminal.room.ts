import conf from "../settings";

const terminalScript = function (room: Room) {
    if (!room.terminal) {
        return;
    }
    if (!room.storage) {
        return;
    }
    if (room.energyAvailable < room.energyCapacityAvailable * 0.8) {
        return;
    }
    const terminal: StructureTerminal = room.terminal;
    const storage: StructureStorage = room.storage;

    Object.keys(terminal.store).forEach((resourceName) => {
        if (resourceName === RESOURCE_ENERGY) {
            return;
        }

        if (
            terminal.store[RESOURCE_ENERGY] >= 2000 &&
            terminal.store[resourceName] >= 2000 &&
            storage.store[resourceName] >= 10000
        ) {
            const orders = Game.market.getAllOrders(
                (order) =>
                    order.resourceType == resourceName &&
                    order.type == ORDER_BUY &&
                    Game.market.calcTransactionCost(
                        1000,
                        room.name,
                        order.roomName
                    ) < 2000
            );
            console.log("Buy orders found: " + orders.length);
            orders.sort(function (a, b) {
                return b.price - a.price;
            });

            console.log("Best price: " + orders[0].price);

            if (orders[0].price > 0.7) {
                const result = Game.market.deal(orders[0].id, 1000, room.name);
                if (result == 0) {
                    console.log("Order completed successfully");
                }
            }
        }
    });

    conf.resources.NEED_TO_BY.forEach((resourceName: ResourceConstant) => {
        if (
            terminal.store[RESOURCE_ENERGY] >= 2000 &&
            storage.store[resourceName] + terminal.store[resourceName] <
                conf.resources.MIN[resourceName]
        ) {
            const orders = Game.market.getAllOrders(
                (order) =>
                    order.resourceType == resourceName &&
                    Game.market.credits > 1000000 &&
                    order.type == ORDER_SELL &&
                    Game.market.calcTransactionCost(
                        1000,
                        order.roomName,
                        room.name
                    ) < 2000
            );
            if (!orders.length) {
                return;
            }
            console.log("Sell orders found: " + orders.length);
            orders.sort(function (a, b) {
                return b.price - a.price;
            });

            console.log("Best sell price: " + orders[0].price);

            if (orders[0].price > 0.7) {
                const result = Game.market.deal(orders[0].id, 1000, room.name);
                if (result == 0) {
                    console.log("Order completed successfully");
                }
            }
        }
    });
};

export { terminalScript };
