const terminalScript = function (room: Room) {
    if (!room.terminal) {
        return;
    }
    const terminal: StructureTerminal = room.terminal;

    Object.keys(terminal.store).forEach((resourceName) => {
        if (resourceName === RESOURCE_ENERGY) {
            return;
        }
        if (
            terminal.store[RESOURCE_ENERGY] >= 2000 &&
            terminal.store[resourceName] >= 2000
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
};

export { terminalScript };
