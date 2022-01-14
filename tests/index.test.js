const { memoiseSync, memoiseAsync } = require('../src/index.js');

describe('memoiseSync()', () => {
    test('Memoise and get cached result of an expensive function call', () => {
        const expensiveFn = (x, y) => {
            for (let i = 0; i < 1e5; i++);
            return x + y;
        };

        const fn = memoiseSync(
            expensiveFn,
            (x, y) => `key:${x}-${y}`
        );

        // Initial call will take some time to complete
        fn(3, 4);
        // Instant call
        expect(fn(3, 4)).toBe(7);
    });

    test('Memoise an object method', () => {
        const obj = {
            expensiveMethod(x, y) {
                for (let i = 0; i < 1e5; i++);
                return x + y;
            }
        };

        const fn = memoiseSync(
            obj.expensiveMethod,
            (x, y) => `key:${x}-${y}`
        );

        // Initial call will take some time to complete
        fn(3, 4);
        // Instant call
        expect(fn(3, 4)).toBe(7);
    });

    test('Memoise a class method', () => {
        const cls = class {
            expensiveMethod(x, y) {
                for (let i = 0; i < 1e5; i++);
                return x + y;
            }
        };

        const fn = memoiseSync(
            (new cls()).expensiveMethod,
            (x, y) => `key:${x}-${y}`
        );

        // Initial call will take some time to complete
        fn(3, 4);
        // Instant call
        expect(fn(3, 4)).toBe(7);
    });

    test('Memoisation with cache expiration', () => {
        const expensiveFn = (x, y) => {
            for (let i = 0; i < 1e5; i++);
            return x + y;
        };

        const fn = memoiseSync(
            expensiveFn,
            (x, y) => `key:${x}-${y}`,
            { ttl: 100 }
        );

        // Initial call will take some time to complete
        fn(3, 4);

        setTimeout(() => {
            // Instant call but cache lives for 100ms only
            expect(fn(3, 4)).toBe(null);
        }, 200);
    });

    test('Memoisation with cache expiration and callback', () => {
        const expensiveFn = (x, y) => {
            for (let i = 0; i < 1e5; i++);
            return x + y;
        };

        const fn = memoiseSync(
            expensiveFn,
            (x, y) => `key:${x}-${y}`,
            { ttl: 100, onExpire: () => 'Expired' }
        );

        // Initial call will take some time to complete
        fn(3, 4);

        setTimeout(() => {
            // Instant call but cache lives for 100ms only
            expect(fn(3, 4)).toBe('Expired');
        }, 200);
    });
});

describe('memoiseAsync()', () => {
    test('Memoise and get cached promise of an expensive async function call', async () => {
        const expensiveAsyncFn = (x, y) => new Promise((resolve) => {
            setTimeout(() => resolve(x + y), 1000);
        });

        const fn = memoiseAsync(
            expensiveAsyncFn,
            (x, y) => `key:${x}-${y}`
        );

        // Initial call will take 1000ms to resolve
        await fn(3, 4);
        // Instantly resolving
        await expect(fn(3, 4)).resolves.toBe(7);
    });

    test('Memoise an async object method', async () => {
        const obj = {
            expensiveAsyncMethod(x, y) {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(x + y), 1000);
                });
            }
        };

        const fn = memoiseAsync(
            obj.expensiveAsyncMethod, 
            (x, y) => `key:${x}-${y}`
        );

        // Initial call will take 1000ms to resolve
        await fn(3, 4);
        // Instantly resolving
        await expect(fn(3, 4)).resolves.toBe(7);
    });

    test('Memoise an async class method', async () => {
        const cls = class {
            expensiveAsyncMethod(x, y){
                return new Promise((resolve) => {
                    setTimeout(() => resolve(x + y), 1000);
                });
            }
        };

        const fn = memoiseAsync(
            (new cls()).expensiveAsyncMethod,
            (x, y) => `key:${x}-${y}`
        );

        // Initial call will take 1000ms to resolve
        await fn(3, 4);
        // Instantly resolving
        await expect(fn(3, 4)).resolves.toBe(7);
    });

    test('Memoised async function rejects', async () => {
        const expensiveAsyncFn = () => Promise.reject('Something went wrong.');

        const fn = memoiseAsync(
            expensiveAsyncFn,
            () => Math.random().toString(16)
        );

        // Initial call to cache the result
        // Note that this statement will produce an UnhandledPromiseRejectionWarning
        fn().catch(e => {});
        // Result cached
        await expect(fn()).rejects;
    });

    test('Memoised async function rejects with an error', async () => {
        const expensiveAsyncFn = () => { throw new Error('Unexpected error.'); };

        const fn = memoiseAsync(
            expensiveAsyncFn,
            () => Math.random().toString(16)
        );

        // Initial call to cache the result
        // Note that this statement will produce an UnhandledPromiseRejectionWarning
        fn().catch(e => {});
        // Result cached
        await expect(fn()).rejects.toThrow('Unexpected error.');
    });

    test.concurrent('Memoisation of async function with cache expiration', async () => {
        const expensiveAsyncFn = (x, y) => new Promise((resolve) => {
            setTimeout(() => resolve(x + y), 1000);
        });

        const fn = memoiseAsync(
            expensiveAsyncFn,
            (x, y) => `key:${x}-${y}`,
            { ttl: 100 }
        );

        // Initial call will take 1000ms to resolve
        await fn(3, 4);

        // Wait to expire
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Instantly resolving but cache lives for 100ms only
        await expect(fn(3, 4)).resolves.toBe(null);
    });

    test.concurrent('Memoisation of async function with cache expiration and callback', async () => {
        const expensiveAsyncFn = (x, y) => new Promise((resolve) => {
            setTimeout(() => resolve(x + y), 1000);
        });

        const fn = memoiseAsync(
            expensiveAsyncFn,
            (x, y) => `key:${x}-${y}`,
            { ttl: 100, onExpire: () => 'Expired' }
        );

        // Initial call will take 1000ms to resolve
        await fn(3, 4);

        // Wait to expire
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Instantly resolving but cache lives for 100ms only
        await expect(fn(3, 4)).resolves.toBe('Expired');
    });
});
