
// Applications's helper functions

class App {
    //register a service worker
    static registerSw() {
        navigator.serviceWorker.register('./sw.js').then(function(reg) {
            if (!navigator.serviceWorker.controller) {
                return;
            }
        });                
    }

    //initialize database
    static idbStore() {
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
    
        return dbPromise;
    }

    // get table body element
    static get tableBody() {
        return document.querySelector('tbody');
    }

    // clear screen before drawing a table
    static clearTable(){
        const tbody= App.tableBody;

        while(tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
    }

    // print table to screen
    static printTable(table) {
        const tbody= App.tableBody;

        table.forEach(entry=> {
            const row = tbody.insertRow();
        
           for(const ppty in entry) {            
              if(entry.hasOwnProperty(ppty)) {
                const cell = row.insertCell();
                const newText = document.createTextNode(entry[ppty]);
                cell.appendChild(newText);
              }
           }
        });
    }

    // Get data stored in idb database by *index*
    // and print to screen
    static getDatabaseDataByIdx(storeIndex) {
        App.clearTable();

        const dbPromise = App.idbStore();
        const displayBalance = document.getElementById('display-balance');

        dbPromise.then(db=>{
            const stocksStore= db.transaction('stocks').objectStore('stocks');
            const refIndex= stocksStore.index(storeIndex);
            return refIndex.getAll();
        }).then(entries=>{
            if(!entries.length){
                displayBalance.textContent = 'No entry in Journal';
                return;
            }

            App.printTable(entries);
        }).catch(()=> displayBalance.textContent = 'Database index not found');
    }

    //Get all data stored in database
    //and print to screen
    static getAllDatabaseData() {
        App.clearTable();

        const dbPromise = App.idbStore();
        const displayBalance = document.getElementById('display-balance');

        dbPromise.then(db=>{
            const stocksStore= db.transaction('stocks').objectStore('stocks');
            return stocksStore.getAll();
        }).then(entries=>{
            if(!entries.length){
                displayBalance.textContent = 'No entry in Journal';
                return;
            }

            App.printTable(entries);
        }).catch(()=> displayBalance.textContent = 'Database not found');
    }

    //Display balance of a stock based on reference
    static displayStockBalance() {
        const stockRef= document.getElementById('stock-ref-balance').value;
        const dbPromise = App.idbStore();

        dbPromise.then(db=>{
            const tx= db.transaction('stock-balance').objectStore('stock-balance');
            return tx.get(stockRef);
        }).then(balance=>{
            const display= document.getElementById('display-balance');

            if(!balance){
                display.style.color = '#FFBDBD';
                display.textContent= 'Reference not found';
                return;
            }

            display.style.color = '#e0e0e0';
            display.textContent = balance;
        });
    }

    //Add entries to database
    static addEntryToDatabase() {
        const stockObj = {};

        stockObj.date= new Date().toLocaleString();
        stockObj.stock= document.querySelector('.stock-item').value;
        stockObj.ref= document.querySelector('.stock-reference').value;
        stockObj.in= document.querySelector('.stock-in').value;
        stockObj.out= document.querySelector('.stock-out').value;

        //display error to user
        const showError= document.querySelector('.show-error');
        
        //Ensuring input fields are not left empty
        if(!stockObj.stock || !stockObj.ref){
            showError.textContent= 'Input fields cannot be left empty';
            return;
        }

         //Stock must either be going out or coming in
         // Both fields cannot be empty
         if(!stockObj.in && !stockObj.out){
            showError.textContent= 'fill stock in or stock out';
            return;
        }
        
        //If no error, do not show previous errors
        showError.textContent='';

        const dbPromise = App.idbStore();

        dbPromise.then(db=>{
            //clear the display balance screen to remove
            //balance or error logged out
            document.getElementById('display-balance').textContent= '';
            const tx = db.transaction('stocks', 'readwrite').objectStore('stocks');
            const bal= db.transaction('stock-balance').objectStore('stock-balance');
            //Add new stock to inventory
            tx.put(stockObj);
            //Update the stock balance of new inventory
            return bal.get(stockObj.ref);
        }).then(stockBalance=>{
            let newBalance, balanceStore;
            // if it is a new stock
            if(!stockBalance){
                dbPromise.then(db=>{
                    balanceStore= db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
                    newBalance= stockObj.in - stockObj.out;
                    balanceStore.put(newBalance, stockObj.ref);
                }); 
            }
            //stock already exist
            else{
                dbPromise.then(db=>{
                    balanceStore = db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
                    newBalance = (stockObj.in - stockObj.out) + stockBalance;
                    balanceStore.put(newBalance, stockObj.ref);
                }); 
            }
        });
    }

    //deletes entry from database and update the balance store
    static deleteEntryFromDatabase() {
        let balance, refToDelete;
        const entryToDelete= document.querySelector('.delete-reference').value;
        const parent= document.querySelector('.remove-modal');
        const showError = parent.querySelector('.show-error');

        if(!entryToDelete){
            showError.textContent= 'Input date when entry was made';
            return;
        }

        showError.textContent = '';
        
        const dbPromise = App.idbStore();

        dbPromise.then(db=>{
            const tx= db.transaction('stocks').objectStore('stocks');
            return tx.get(entryToDelete);
        }).then(stock=>{
            //ensuring whatever value was added to the balance store
            //gets deleted
            balance = stock.in - stock.out;
            //store the reference to the deleted entry
            //to be used lated to update the balance store
            refToDelete= stock.ref;

            dbPromise.then(db=>{
                //delete entry
                const tx= db.transaction('stocks', 'readwrite').objectStore('stocks');
                const balanceStore= db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
                tx.delete(entryToDelete);
                // get the balance store and update record
                return balanceStore.get(refToDelete);
            }).then(stockBalance=>{
                //there are numerous entries to the same reference stock
                // get the total value and remove the value of deleted entry
                stockBalance-= balance;

                dbPromise.then(db=>{
                    //the total value gets the new value
                    const balanceStore= db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
                    balanceStore.put(stockBalance, refToDelete);
                    return balanceStore.complete;
                });
            });
        }).catch(()=>{
            showError.textContent= 'Entry Not Found';
        });
    }
}