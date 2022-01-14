# memoiser

Store the results of expensive function calls and return the cached result when the same input occurs again. A specific expiration time can be set for that result. Supports both synchronous and asynchronous functions.


## Synchronous usage
```js
const { memoiseSync } = require('@unsudo/memoiser');

const expensiveSyncFn = (x, y) => {
    for (let i = 0; i < 1e10; i++);
    return x + y;
};

// Custom unique key generation  to store the result under it
const uniqueKey = (x, y) => `${x}-${y}`;

const fnSync = memoiseSync(
    expensiveSyncFn,
    uniqueKey
);

// Takes some time to print
console.log(fnSync(3, 4));
// Prints instantly
console.log(fnSync(3, 4));

// Will return null if invoked after 1h
const fnSyncWithExpire = memoiseSync(
    expensiveSyncFn,
    uniqueKey,
    { ttl: 60*60*1000 }
);

// Will return 'Expired' if invoked after 1h
const fnSyncWithExpireCb = memoiseSync(
    expensiveSyncFn,
    uniqueKey,
    { ttl: 60*60*1000, onExpire: () => 'Expired' }
);
```
## Asynchronous usage
```js
const { memoiseAsync } = require('@unsudo/memoiser');

const expensiveAsyncFn = (x, y) => new Promise((resolve, reject) => {
    setTimeout(() => resolve(x + y), 3000);
});

// Custom unique key generation  to store the result under it
const uniqueKey = (x, y) => `${x}-${y}`;

const fnAsync = memoiseAsync(
    expensiveAsyncFn,
    uniqueKey
);

// Prints after 3000ms
console.log(await fnAsync(3, 4));
// Prints instantly
console.log(await fnAsync(3, 4));

// Will return null if invoked after 1h
const fnAsyncWithExpire = memoiseAsync(
    expensiveAsyncFn,
    uniqueKey,
    { ttl: 60*60*1000 }
);

// Will return 'Expired' if invoked after 1h
const fnAsyncWithExpireCb = memoiseAsync(
    expensiveAsyncFn,
    uniqueKey,
    { ttl: 60*60*1000, onExpire: () => 'Expired' }
);

```
## Installation
```bash
npm install @unsudo/memoiser
```
