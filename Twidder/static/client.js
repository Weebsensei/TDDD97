window.onload = function(){
    displayView();
};

function getToken() {
    return localStorage.getItem("token");
}

function httpRequest(method, url, data, success, failure){
    let xml = new XMLHttpRequest();
    xml.onreadystatechange = function() {
        if (xml.readyState === 4){
            let response = JSON.parse(xml.responseText);
            if (xml.status === 200 || xml.status === 201){
                success(response.data);           
            } else {
                failure(xml.status, response.message);
            }
        }
    }
    xml.open(method, url, true);
    xml.setRequestHeader('Content-Type', 'application/json');
    // SUS?
    xml.setRequestHeader('Authorization', getToken());
    xml.send(JSON.stringify(data));
}


function displayView (){
    if(getToken() != null){
        document.getElementById("viewport").innerHTML = document.getElementById("profile_view").innerHTML;
        httpRequest('GET', '/get_user_data_by_token', {},
            function(data) {
                getAccountInfo(data, "home_");
            },
            function(status, message){
                if (status === 401){
                    alert(message + " " + status)
                }
                else if (status === 405) {
                    alert(message + " " + status)
                }
                else if (status === 500) {
                    alert(message + " " + status)
                }
            }
        );
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
        function(data){
            let token = data;
            localStorage.setItem("token", token);
            displayView();
        },
        function(status){
            document.getElementById('LoginErrorMessage').innerHTML = `${message} Error ${status}`;
            // if (status === 400) {
            //     document.getElementById('LoginErrorMessage').innerHTML = "Error 400";
            // } 
            // else if (status ===  401) {
            //     document.getElementById('LoginErrorMessage').innerHTML = "Error 401";
            // } 
            // else if (status === 404) {
            //     document.getElementById('LoginErrorMessage').innerHTML = "Error 404";
            // }
            // else if (status  === 405) {
            //     document.getElementById('LoginErrorMessage').innerHTML = "Error 405";
            // } 
            // else if (status  === 500) {
            //     document.getElementById('LoginErrorMessage').innerHTML = "Error 500";
            // }
        }
    );
    displayView();
}

function passwdValidation(passwd, repasswd, error) {
    if (passwd !== repasswd) {
        document.getElementById(error).innerHTML = "Passwords doesn't match";
        return false;
    }
    document.getElementById(error).innerHTML = "";
    return true;
}
    
function signup(form) {
    let email = form.email.value;
    let passwd = form.passwd.value;
    let repasswd = form.repasswd.value;

    if(passwdValidation(passwd, repasswd, "SignupErrorMessage")){
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
                function (){
                    loginValidate(email, passwd);
                },
                function(status){
                    document.getElementById('SignupErrorMessage').innerHTML = `${message} Error ${status}`;
                    // if(status === 400){
                    //     document.getElementById('SignupErrorMessage').innerHTML = "Error 400";
                    // }
                    // else if(status === 409) {
                    //     document.getElementById('SignupErrorMessage').innerHTML = "Error 409";
                    // }
                    // else if(status === 405) {
                    //     document.getElementById('SignupErrorMessage').innerHTML = "Error 405";
                    // }
                    // else if(status === 500) {
                    //     document.getElementById('SignupErrorMessage').innerHTML = "Error 500";
                    // }
                }
            );

        }
        catch(e){
            document.getElementById('SignupErrorMessage').innerHTML = "Something went wrong! UWU";
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

    // Missmatched password acts weird, but nothing changes as intended
    if(passwdValidation(passwd, repasswd, "PassErrorMessage")) {
        let dataObject = {
            'oldpassword': oldpwd,
            'newpassword': passwd,
        };
        httpRequest('PUT', '/change_password', dataObject,
            function(){
                form.reset();
            },
            function(status, message){
                document.getElementById("PassErrorMessage").innerHTML = `${message} Error ${status}`;
                // if (status === 400) {
                //     alert(message + " " + status)
                // }   
                // else if (status === 401) {
                //     alert(message + " " + status)
                // }
                // else if (status === 405) {
                //     alert(message + " " + status)
                // }
                // else if (status === 500) {
                //     alert(message + " " + status)
                // }
            }
        );
    }
} 

function signOut() {
    token = getToken();
    httpRequest('DELETE', '/sign_out', token,
        function () {
            localStorage.removeItem("token");
            displayView();
        },
        function (status, message) {
            if(status === 400){
                alert(message + " " + status)
            }
            else if(status === 401) {
                alert(message + " " + status)
            }
            else if(status === 405) {
                alert(message + " " + status)
            }
            else if(status === 500) {
                alert(message + " " + status)
            }
        }
    );
}

function getAccountInfo(data, page) {
    document.getElementById(page + "emailInfo").innerHTML = data[0];
    document.getElementById(page + "fNameInfo").innerHTML = data[2];
    document.getElementById(page + "lNameInfo").innerHTML = data[3];
    document.getElementById(page + "genderInfo").innerHTML = data[4];
    document.getElementById(page + "cityInfo").innerHTML = data[5];
    document.getElementById(page + "countryInfo").innerHTML = data[6];
}

function messagePost(form) {
    let dataObject = {
        'email': form.toEmail.value,
        'message': form.postTextarea.value
    }
    httpRequest('POST', '/post_message', dataObject, 
        function(){
            document.getElementById("postForm").reset();
        },
        function(status, message){
            document.getElementById("PostErrorMessage").innerHTML = `${message} Error ${status}`;
        }
    )

}

function browseMessagePost(form) {
    let dataObject = {
        'email': form.browsetoEmail.value,
        'message': form.browsepostTextarea.value
    }
    httpRequest('POST', '/post_message', dataObject, 
        function(){
            document.getElementById("browsePostForm").reset();
        },
        function(status, message){
            document.getElementById("PostErrorMessage").innerHTML = `${message} Error ${status}`;
        }
    )
}

function loadMessages() {
    httpRequest('GET', '/get_user_messages_by_token', {},
        function(data) {
            let messages = "";
            alert(data.length);
            for (let i = data.length-1; 0 <= i; i--) {
                messages += `<dt>${data[i][1]}</dt><dd>${data[i][0]}</dd>`;
            }
            document.getElementById("messages").innerHTML = messages;
        },
        function(status, message){
            document.getElementById("WallErrorMessage").innerHTML = `${message} Error ${status}`;
        }
    )
}

function loadBrowseMessages() {
    let target = document.getElementById("browse_emailInfo").innerHTML;

    httpRequest('GET', `/get_user_messages_by_email/${target}`, {},
        function(data) {
            let messages = "";
            for (let i = 0; i < data.length; i++) {
                messages += `<dt>${data[i][1]}</dt><dd>${data[i][0]}</dd>`;
            }
            document.getElementById("browse_messages").innerHTML = messages;
        },
        function(status, message){
            document.getElementById("WallErrorMessage").innerHTML = `${message} Error ${status}`;
        }
    )
}

function lookupEmail(form) {
    let target = form.searchEmail.value;
    httpRequest('GET', `/get_user_data_by_email/${target}`, {},
            function(data) {
                getAccountInfo(data, "browse_");
                document.getElementById("searchEmailform").reset();
            },
            function(status, message){
                if (status === 401){
                    alert(message + " " + status)
                }
                else if (status === 405) {
                    alert(message + " " + status)
                }
                else if (status === 500) {
                    alert(message + " " + status)
                }
            }
        );
}