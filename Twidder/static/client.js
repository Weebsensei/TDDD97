window.onload = function(){
    displayView();
};

function getToken() {
    return localStorage.getItem("token");
}

function httpRequest(method, url, data, success, failure){
    let xml = new XMLHttpRequest();
    xml.open(method, url, true);
    xml.setRequestHeader('Content-Type', 'application/json');
    xml.onreadystatechange = function() {
        if (xml.readyState === 4){
            response = JSON.parse(xml.responseText)
            if (xml.status === 200 || xml.status === 201){
                success(response.data);           
            } else {
                failure(xml.status);
            }
        }
    };
    xml.send(JSON.stringify(data));
}


function displayView (){
    if(getToken() != null){
        document.getElementById("viewport").innerHTML = document.getElementById("profile_view").innerHTML;
        let response = serverstub.getUserDataByToken(getToken());
        getAccountInfo(response.data, "home_");
    } else {
        document.getElementById("viewport").innerHTML = document.getElementById("welcome_view").innerHTML;        
    }
};

function login(form) {
    // Gather Inputs
    let email = form.email_input.value;
    let password = form.passwd_input.value;

    // Login
    loginValidate(email, password);
}

function loginValidate(email, password) {
    // Call Call server sign-in function

    let object = {'email': email,
                 'password': password};

    httpRequest('POST', '/sign_in', object, 
        function(response){
            let token = response.data;
            localStorage.setItem("token", token);
            displayView();
        },
        function(status){
            if (status === 400) {
                alert('SIGN IN 400');
            } 
            else if (status ===  401) {
                alert('SIGN IN 401');
            } 
            else if (status  === 405) {
                alert('SIGN IN 405');
            } 
            else if (status  === 500) {
                alert('SIGN IN 500');
            }

        }
    );
    displayView();
}

function passwdValidation(passwd, repasswd) {
    if (passwd !== repasswd) {
        document.getElementById("errorMessage").innerHTML = "Passwords doesn't match";
        return false;
    }
    return true;
}
    
function signup(form) {
    let email = form.email.value;
    let passwd = form.passwd.value;
    let repasswd = form.repasswd.value;

    if(passwdValidation(passwd, repasswd)){
        try{
            // Create a data object for server call
            let dataObject = {
                'email': form.email.value,
                'password': form.passwd.value,
                'firstname': form.fname.value,
                'familyname': form.lname.value,
                'gender': form.gender.value,
                'city': form.city.value,
                'country': form.country.value
            };
            httpRequest('POST', '/sign_up', dataObject,
                function (response){
                    document.getElementById("errorMessage").innerHTML = response.message;
                    // loginValidate(email, passwd);
                },
                function(status){
                    if(status === 400){
                        alert("SIGN UP 400")
                    }
                    else if(status === 409) {
                        alert("SIGN UP 409")
                    }
                    else if(status === 405) {
                        alert("SIGN UP 405")
                    }
                    else if(status === 500) {
                        alert("SIGN UP 500")
                    }
                }
            );

        }
        catch(e){
            document.getElementById('feedback').innerHTML = "Something went wrong! UWU";
        }
        finally{
            form.email.value = "";
            form.passwd.value = "";
            form.repasswd.value = "";
            form.fname.value = "";
            form.lname.value = "";
            form.gender.value = "";
            form.city.value = "";
            form.country.value = "";
        }
    }
}

function showTab(tabName){
 
    let contens = document.querySelectorAll(".tab-content");
    contens.forEach(content => content.style.display = "none");

    // Show selected tab content
    document.getElementById(tabName).style.display = "block";

    // Update active tab
    let tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => tab.classList.remove("active"));

    // Highlight the clicked tab
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add("active");
}

function changePassword(form) {
    let oldpwd = form.oldPw.value; // Old/Current Password
    let passwd = form.newPw.value; // New Password
    let repasswd = form.rePw.value; // Repeat New Password

    if(passwdValidation(passwd, repasswd)) {
        let response = serverstub.changePassword(getToken(), oldpwd, passwd);
        if(response.success){
            form.reset();
        }
        document.getElementById("errorMessage").innerHTML = response.message;
    }
    
} 

function signOut() {
    // Call server signOut function
    token = getToken();
    httpRequest('DELETE', '/sign_out', token,
        function () {
            localStorage.removeItem("token");
            displayView();
        },
        function (status) {
            if(status === 400){
                alert("SIGN OUT 400")
            }
            else if(status === 401) {
                alert("SIGN OUT 401")
            }
            else if(status === 405) {
                alert("SIGN OUT 405")
            }
            else if(status === 500) {
                alert("SIGN OUT 500")
            }
        })
    // serverstub.signOut(getToken());
    // Remove token from storage
    localStorage.removeItem("token");
    // Update view
    displayView();
}

function getAccountInfo(data, page) {
    document.getElementById(page + "fNameInfo").innerHTML = data.firstname;
    document.getElementById(page + "lNameInfo").innerHTML = data.familyname;
    document.getElementById(page + "genderInfo").innerHTML = data.gender;
    document.getElementById(page + "cityInfo").innerHTML = data.city;
    document.getElementById(page + "countryInfo").innerHTML = data.country;
    document.getElementById(page + "emailInfo").innerHTML = data.email;
}

function messagePost(form) {
    let reciever = form.toEmail.value;
    let message = form.postTextarea.value;
    let response = serverstub.postMessage(getToken(), message, reciever);
    
    if(response.success) {
        document.getElementById("postForm").reset();
    } else {
        document.getElementById("errorMessage").innerHTML = response.message;
    }
}

function browseMessagePost(form) {
    let reciever = form.browsetoEmail.value;
    let message = form.browsepostTextarea.value;
    let response = serverstub.postMessage(getToken(), message, reciever);
    
    if(response.success) {
        document.getElementById("browsePostForm").reset();
    } else {
        document.getElementById("errorMessage").innerHTML = response.message;
    }
}

function loadMessages() {
    let response = serverstub.getUserMessagesByToken(getToken());

    if(response.success) {
        let messages = "";
        response.data.forEach((msg) => messages += `<dt>${msg.writer}</dt><dd>${msg.content}</dd>`);
        document.getElementById("messages").innerHTML = messages;
    } else {
        document.getElementById("errorMessage").innerHTML = response.message;
    }
}

function loadBrowseMessages() {
    let target = document.getElementById("browse_emailInfo").innerHTML;
    let response = serverstub.getUserMessagesByEmail(getToken(), target);
    
    if(response.success) {
        let messages = "";
        response.data.forEach((msg) => messages += `<dt>${msg.writer}</dt><dd>${msg.content}</dd>`);
        document.getElementById("browse_messages").innerHTML = messages;
    } else {
        document.getElementById("errorMessage").innerHTML = response.message;
    }
}

function lookupEmail(form) {
    let target = form.searchEmail.value;
    let response = serverstub.getUserDataByEmail(getToken(), target);
    if(response.success){
        getAccountInfo(response.data, "browse_");
        document.getElementById("searchEmailform").reset();
    }
}