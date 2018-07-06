
//Open and create and object store
const dbPromise = idb.open('stock-tracker', 4, function(upgradeDb) {
    switch(upgradeDb.oldVersion){
        case 0:
            upgradeDb.createObjectStore('stocks', {keyPath:'date'});
        case 1:
            const refStore= upgradeDb.transaction.objectStore('stocks');
            refStore.createIndex('stockRef', 'ref');
        case 2:
            const itemStore= upgradeDb.transaction.objectStore('stocks');
            itemStore.createIndex('stockItem', 'stock');
        case 3:
            upgradeDb.createObjectStore('stock-balance');
     }
});
