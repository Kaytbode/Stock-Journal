//unleashes the modal and saves to database
const addEntry = document.getElementById('addEntry');

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

// Add to homescreen

let deferredPrompt;
const btnAdd= document.createElement('button');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
  // Stash the event so it can be triggered later.
    deferredPrompt = e;
 //Notify user can add to homescreen
    document.querySelector('body').appendChild(btnAdd);
    btnAdd.style.display= 'block';
});

btnAdd.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button   
    btnAdd.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
        .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
            } else {
            console.log('User dismissed the A2HS prompt');
            }
        deferredPrompt = null;
      });
});