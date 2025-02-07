window.onload = function(){
    displayView();
};

function displayView (){
    document.getElementById("viewport").innerHTML = document.getElementById("welcome_view").innerHTML;
};

function Login(form) {
    LoginValidate(form);
}

function LoginValidate(form) {
    let email = form.email_input.value;
    let password = form.passwd_input.value;
    let errorMessage = document.getElementById("login_error")

    errorMessage.textContent = "app appp app. you must be getting funky ;)"

    return true;

}


function signup(form){
    signupValidation(form)
}
    
function signupValidation(form) {
    let passwd = form.passwd.value
    let repasswd = form.repasswd.value

    if (passwd !== repasswd) {
        errorMessage.textContent = "lösenorden måste vara lika. försök igen ;)"
        return false;
    }

    return true;
}
