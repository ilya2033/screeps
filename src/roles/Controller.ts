abstract class Controller {
    static runAll<T extends Controller>(...args: any[]) {
        this.getAllControllers().forEach((controller: T) =>
            controller.run(...args)
        );
    }

    static getAllControllers<T>(): T[] {
        return [];
    }

    run(...args: any[]) {
        return;
    }
}

export { Controller };
