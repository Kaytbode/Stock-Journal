
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
    static AddEntryToDatabase() {
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
            showError.textContent= 'Input value of what you are adding or removing';
            return;
        }
         //stock input value must be a number
        const regExp = /^[0-9]+$/;

        if((!regExp.test(stockObj.in)) || (!regExp.test(stockObj.out))){
            showError.textContent = 'Input a positive value';
            return;
        }

        stockObj.in = Number(stockObj.in);
        stockObj.out = Number(stockObj.out);

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
}