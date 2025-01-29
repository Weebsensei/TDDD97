function saveContact(form){
    try{
        let contact = {
            name: form.name.value,
            phone: form.number.value
        };

        let contactsStorage = localStorage.getItem('contacts');
        let contacts = [];

        if (contactsStorage){
            contacts = JSON.parse(contactsStorage);
        }
        
        contacts.push(contact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        document.getElementById('output').innerHTML = 'Contact saved successfully';
    }
    catch(e){
        document.getElementById('output').innerHTML = e.message;
    }
    finally{
        form.name.value = '';
        form.number.value = '';
    } 
}

function loadContact(form){
    let name = form.name.value;
    let contactsStorage = localStorage.getItem('contacts');
    let contacts = [];
    if (contactsStorage){
        contacts = JSON.parse(contactsStorage);
    }
    contacts = contacts.filter(c => c.name === name);
    console.log(contacts);
    let cnt = 0;
    for (let index in contacts){
        if (cnt % 2 == 0){
            className = 'roweven';
        }else{
            className = 'rowodd';
        }  
        document.getElementById('output').innerHTML += `<div class=${className}>${contacts[index].name} - ${contacts[index].phone}</div>`;
        cnt++;
    }
    

}