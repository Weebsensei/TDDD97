function saveContact(form){
    try{
        let contact = {
            name: form.name.value,
            number: form.phone.value
        };

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:5002/contact', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4){
                
                if (xhr.status === 201){
                    // some UI update.
                    document.getElementById('feedback').innerHTML = 'Contact saved successfully';
    
                }else if (xhr.status === 400){
                    document.getElementById('feedback').innerHTML = 'Sonmething wrong with data!';
                }else{
                    document.getElementById('feedback').innerHTML = 'Something went wrong!';
                }
                
            }    
        };
        xhr.send(JSON.stringify(contact));
     
      


    }
    catch(e){
        document.getElementById('feedback').innerHTML = "Something went wrong!";
    }
    finally{
        form.name.value = '';
        form.phone.value = '';
    }



}

function loadContact(form){
    document.getElementById('feedback').innerHTML = '';

    let name = form.name.value;
    
    
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://127.0.0.1:5002/contact/' + name, true);

    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            // some UI update.
            let contacts_json = xhr.responseText;
            
            let contacts = JSON.parse(contacts_json);
            for (let index in contacts){
                let output = '<div class="feedbackrow">' + contacts[index].name + ' - ' + contacts[index].number + '</div>';
                document.getElementById('feedback').innerHTML += output;

    }

        }
    };
    xhr.send();
    
    
    
    

}