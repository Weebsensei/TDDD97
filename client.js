window.onload = function(){
    displayView();
};

function getToken() {
    return localStorage.getItem("token");
}

function displayView (){
    if(getToken() != null){
        document.getElementById("viewport").innerHTML = document.getElementById("profile_view").innerHTML;
        getAccountInfo();
        messageWall();
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
        errorElement.style.display = "block";
    }
    return true;

}

function passwdValidation(passwd, repasswd) {
    if (passwd !== repasswd) {
        document.getElementById("errorMessage").innerHTML = "Passwords doesn't match. Try again.";
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

function getAccountInfo() {
    let response = serverstub.getUserDataByToken(getToken());
    if(response.success){
        document.getElementById("fNameInfo").innerHTML = response.data.firstname;
        document.getElementById("lNameInfo").innerHTML = response.data.familyname;
        document.getElementById("genderInfo").innerHTML = response.data.gender;
        document.getElementById("cityInfo").innerHTML = response.data.city;
        document.getElementById("countryInfo").innerHTML = response.data.country;
        document.getElementById("emailInfo").innerHTML = response.data.email;
    }
}

function messagePost(form) {
    let response = serverstud.postMessage(getToken(), form.postTextarea.value, form.toEmail.value);
    if(response.success) {
        document.getElementById("postForm").reset();
    }
    document.getElementById("errorMessage").innerHTML = response.message;
}

function messageWall() {
    let response = serverstub.getUserMessagesByToken(getToken());

    if(response.success) {
        let feed = document.getElementById("messages");
        let messages = "";
        response.data.forEach((msg) => messages += `<dt>${msg.writer}</dt><dd>${msg.content}</dd>)`);
        feed.innerHTML = `<dl>${messages}</dl>`;
    } else {
        document.getElementById("errorMessage").innerHTML = response.message;
    }
}