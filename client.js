window.onload = function(){
    displayView();
};

function getToken() {
    return localStorage.getItem("token");
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
    let response = serverstub.signIn(email, password);

    if (response.success){
        let token = response.data;
        localStorage.setItem("token", token);
        displayView();
    } else {
        document.getElementById("errorMessage").innerHTML = response.message;
    }
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
        // Create a data object for server call
        let dataObject = {
            email: form.email.value,
            password: form.passwd.value,
            firstname: form.fname.value,
            familyname: form.lname.value,
            gender: form.gender.value,
            city: form.city.value,
            country: form.country.value
        };

        // Call server sign-up function
        let response = serverstub.signUp(dataObject);
        
        if (response.success){
            document.getElementById("errorMessage").innerHTML = response.message;
            loginValidate(email, passwd);
        } else {
            document.getElementById("errorMessage").innerHTML = response.message;
            errorElement.style.display = "block";
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
    serverstub.signOut(getToken());
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