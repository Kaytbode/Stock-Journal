//Register service worker
 App.registerSw();

// Display the whole inventory
const wholeInventory = document.querySelector('.whole-inventory');
wholeInventory.addEventListener('click', App.getAllDatabaseData);

//Display inventory by reference
const inventoryByRef = document.querySelector('.inventory-ref');
inventoryByRef.addEventListener('click', function(){App.getDatabaseDataByIdx('stockRef')});

//Display inventory by stock item
const inventoryByItem = document.querySelector('.inventory-item');
inventoryByItem.addEventListener('click', function(){App.getDatabaseDataByIdx('stockItem')});

// Display stock balance by reference
const getBalance = document.querySelector('.get-balance');
getBalance.addEventListener('click', App.displayStockBalance);

//modal to add entry to inventory
let focusedElementBeforeModal;

const modalOverlay = document.querySelector('.overlay');

const closeModal = (modal)=> {
    //hide the modal and overlay
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';

    //set focus back to the element that had it before it was opened
    focusedElementBeforeModal.focus();
}

const openModal = (modal, closeBtn)=>{
    //save current focus
    focusedElementBeforeModal = document.activeElement;
    // Listen for and trap the keyboard
    modal.addEventListener('keydown', trapTabKey);
    //Listen for indicators to close the modal
    modalOverlay.addEventListener('click', function(){closeModal(modal)});
    //close button
   // const closeBtn = modal.querySelector('.close-addModal');
    closeBtn.addEventListener('click', function(){closeModal(modal)});
    //find focusable elements and convert nodelist to array
    let focusableElementsString = 'input:not([disable]), button:not([disabled]), [tabindex="0"]';
    let focusableElements = [...modal.querySelectorAll(focusableElementsString)];
    
    let firstTabStop = focusableElements[0],
        lastTabStop = focusableElements[focusableElements.length - 1];
    
    //show the modal and overlay
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';

    //focus first child
    firstTabStop.focus();

    function trapTabKey(event) {
        //check for tab key press
        if(event.key === 'Tab'){
            //shift + tab
            if(event.shiftkey){
                if(document.activeElement === firstTabStop){
                    event.preventDefault();
                    lastTabStop.focus();
                }
            }
            //tab
            else{
                if(document.activeElement === lastTabStop){
                    event.preventDefault();
                    firstTabStop.focus();
                }
            }
        }
        //escape
        if(event.key === 'Escape'){
            closeModal(modal);
        }
    }
}

// Click to display modal and add entry
const addModal = document.querySelector('.add-modal');
const addModalToggle = document.getElementById('add-entry');
const closeBtnAdd = addModal.querySelector('.close-AddModal');

addModalToggle.addEventListener('click', function (){openModal(addModal, closeBtnAdd)});

// click to display modal to remove entry
const removeModal = document.querySelector('.remove-modal');
const remModalToggle = document.getElementById('remove-entry');
const closeBtnRem = removeModal.querySelector('.close-RemModal');

remModalToggle.addEventListener('click', function (){openModal(removeModal, closeBtnRem)});

// Click to add entry to database
const addEntryBtn = document.querySelector('.A2I');
addEntryBtn.addEventListener('click', App.addEntryToDatabase);

//Click to remove entry from the database
const remEntryBtn = document.querySelector('.RFI');
remEntryBtn.addEventListener('click', App.deleteEntryFromDatabase);

//const addEntry = document.getElementById('addEntry');
/*
addEntry.onclick =(event)=>{

    event.preventDefault();
    const stockObj = {};

    stockObj.date= new Date().toLocaleString();
    stockObj.stock= document.getElementById('stockItem').value;
    stockObj.ref= document.getElementById('stockRef').value;
    stockObj.in= +document.getElementById('stockIn').value;
    stockObj.out= +document.getElementById('stockOut').value;
    

    if(!stockObj.stock || !stockObj.ref){
        const showError= document.getElementById('showError');
        showError.textContent= 'Input fields cannot be left empty';
        return;
    }

    dbPromise.then(db=>{

        document.getElementById('sdisplay').value= '';
        const tx = db.transaction('stocks', 'readwrite').objectStore('stocks');
        const bal= db.transaction('stock-balance').objectStore('stock-balance');
        tx.put(stockObj);
        return bal.get(stockObj.ref);
    }).then(bl=>{
        let balance;        
       if(!bl){
            dbPromise.then(db=>{

                const bal= db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
                balance= stockObj.in - stockObj.out;
                bal.put(balance, stockObj.ref);
            }); 
       }
       else{
           dbPromise.then(db=>{

            const bal= db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
            balance = (stockObj.in - stockObj.out) + bl;
            bal.put(balance, stockObj.ref);
          }); 
       }
    });
}


// displays all entries in the database on the screen
const inventory = document.getElementById('inventory');

inventory.onclick= ()=>{
    
    clear();

    dbPromise.then(db=>{

        const tx= db.transaction('stocks').objectStore('stocks');
        return tx.getAll();
    }).then(entries=> {
       
        if(entries.length < 1){
          
            document.getElementById('sdisplay').value = 'No entry in Journal';
            return;
        }

        printTable(entries)
    });   
};
// deletes entry from the database and modifies the balance 
const del= document.getElementById('delete');

del.onclick= event=>{

    event.preventDefault();

    let bal, refToDelete;
    const entryToDelete= document.getElementById('dateEntry').value;
    const showError= document.getElementById('showError2');

    if(!entryToDelete){

        showError.textContent= 'Input field cannot be left empty';
        return;
    }

    dbPromise.then(db=>{

        const tx= db.transaction('stocks').objectStore('stocks');
        return tx.get(entryToDelete);
    }).then(entry=>{

        bal = entry.in - entry.out;
        refToDelete= entry.ref;
        dbPromise.then(db=>{

            const tx= db.transaction('stocks', 'readwrite').objectStore('stocks');
            const balance= db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
            tx.delete(entryToDelete);
            return balance.get(refToDelete);
        }).then(bl=>{

            bl-= bal;
            dbPromise.then(db=>{

                const balance= db.transaction('stock-balance', 'readwrite').objectStore('stock-balance');
                balance.put(bl, refToDelete);
                return balance.complete;
            });
        });
    }).catch(()=>{

        showError.textContent= 'Entry Not Found';
    });
};
// displays inventory by their reference
const ref= document.getElementById('ref');

ref.onclick= event=>{

    event.preventDefault();

    getData('stockRef');
};

//displays inventory by items
const item= document.getElementById('stock');

item.onclick= event=>{

    event.preventDefault();
    
    getData('stockItem');
};

//displays the balance of a particular stock entry
const getBal= document.getElementById('sbal');

getBal.onclick=event=>{
    
    event.preventDefault();

    const stockRef= document.getElementById('sref').value;

    dbPromise.then(db=>{

        const tx= db.transaction('stock-balance').objectStore('stock-balance');
        return tx.get(stockRef);
    }).then(bl=>{
        
        const display= document.getElementById('sdisplay');
        if(!bl){

            display.style.color = 'red';
            display.value= 'Reference not found';
            return;
        }

        display.style.color = '#02194b';
        display.value= bl;
    });

}
*/