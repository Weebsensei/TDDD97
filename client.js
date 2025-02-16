window.onload = function(){
    displayView();
};

function getToken() {
    return localStorage.getItem("loggedinusers");
}

function displayView (){
    if(getToken() != null){
        document.getElementById("viewport").innerHTML = document.getElementById("profile_view").innerHTML
    } else {
        document.getElementById("viewport").innerHTML = document.getElementById("welcome_view").innerHTML;        
    }
};

function Login(form) {
    LoginValidate(form);
}

function LoginValidate(form) {
    let email = form.email_input.value;
    let password = form.passwd_input.value;
    let errorMessage = document.getElementById("login_error")


    let response = serverstub.signIn(email, password);
    if (response.success){
        localStorage.setItem(token, response.data);
        displayView();
    } else {
        document.getElementById("signup_error").innerHTML = response.message;
        errorElement.style.display = "block";
    }
    return true;

}

function passwdValidation(passwd, repasswd) {
    if (passwd !== repasswd) {
        document.getElementById("signup_error").innerHTML = "lösenorden måste vara lika. försök igen ;)";
        return false;
    }
    return true;
}

function signup(form){
   return signupValidation(form);
}
    
function signupValidation(form) {
    let passwd = form.passwd.value;
    let repasswd = form.repasswd.value;

    if(!passwdValidation(passwd, repasswd)){
        return false
    }

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
        document.getElementById("signup_error").innerHTML = response.message;
        displayView();
    } else {
        document.getElementById("signup_error").innerHTML = response.message;
        errorElement.style.display = "block";
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
    let oldpwd = form.oldPw.value;
    let passwd = form.newPw.value; //new password
    let repasswd = form.rePw.value; // repeat new password

    if(passwdValidation(passwd, repasswd)) {
        serverstub.changePassword(getToken(), oldpwd, passwd);
    }
    document.getElementById("signup_error").innerHTML = response.message;
} 