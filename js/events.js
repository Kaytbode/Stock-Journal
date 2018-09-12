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

