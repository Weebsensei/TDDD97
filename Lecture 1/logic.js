function saveContact(form){
    try {
        let contact = {
            name: form.name.value,
            phone: form.phone.value
        };
        
        let contacts_json = localStorage.getItem('contacts');
        if ( contacts_json === null) {
            contacts_json = '[]';
        }
        
        let contacts = JSON.parse(contacts_json);
        
        contacts.push(contact);
        
        contacts_json = JSON.stringify(contacts);
        localStorage.setItem('contacts', contacts_json);
        
        document.getElementById('feedback').innerHTML = "Contact saved Successfully";   
    }
    catch(e) {
        document.getElementById('feedback').innerHTML = "You must be getting funky";
    }
    finally {
        name = '';
        phone = '';
    }

}

function loadContact(form){
    document.getElementById('feedback').innerHTML = '';
    let name = form.name.value;
    let contacts_json = localStorage.getItem('contacts');
    let contacts = JSON.parse(contacts_json);
    contacts = contacts.filter(c => c.name === name);
    for (let index in contacts) {
        let output = '<div class="feedbackrow">' + contacts[index].name + ' - ' + contacts[index].phone + '</div>';
        document.getElementById('feedback').innerHTML += output;
    }
}