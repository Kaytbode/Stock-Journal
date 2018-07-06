// register a service worker
navigator.serviceWorker.register('./sw.js').then(function(reg) {
    if (!navigator.serviceWorker.controller) {
        return;
    }
});

//clears the screen before drawing a new table
const clear=()=>{

    const tbody= document.querySelector('tbody');
    while(tbody.firstChild){

        tbody.removeChild(tbody.firstChild);
    }
};
// prints to the screen
const printTable= table=>{

    const tbody= document.querySelector('tbody');
        table.forEach(entry=>{

           const row= document.createElement('tr');
           tbody.appendChild(row);
           for(const ppty in entry){
            
              if(entry.hasOwnProperty(ppty)){
                 
                 const cell= document.createElement('td');
                 cell.textContent= entry[ppty];
                 row.appendChild(cell);
              }
           }
    });

};
// gets data from database
const getData= idx=>{
    
    clear();

    dbPromise.then(db=>{

        const stocksStore= db.transaction('stocks').objectStore('stocks');
        const refIndex= stocksStore.index(idx);
        return refIndex.getAll();
    }).then(entries=>{

        if(entries.length < 1){
          
            document.getElementById('sdisplay').value = 'No entry in Journal';
            return;
        }
        
        printTable(entries)}
    );
}