let connection = {
    active: false,
    ws: null
};

function wsConnect(){
    let token = sessionStorage.getItem("token");
    let url = `ws://${window.location.host}/connect?token=${token}`
    if (connection.active == null) {
        return;
    }

    connection.ws = new WebSocket(url);

    connection.ws.onopen = function() {
        console.log("Connected");
        connection.active = true;
    };

    connection.ws.onclose = function() {
        connection.active = false;
        connection.ws = null;
        displayView();
    };

    connection.ws.onerror = function() {
        console.log("ws error");
        sessionStorage.clear();
        connection.active = false;
        connection.ws = null;
        displayView();
    };

    connection.ws.onmessage = function(message) {
        let response = JSON.parse(message.data);
        console.log(response);
        switch (response.action){
          case "sign_out":
            sessionStorage.clear();
            connection.active = false;
            connection.ws = null;
            displayView();
            break;
          default:
            console.log(response.action);
            console.log("Unexpected message");
            break;
        }
    }
}

window.onload = function(){
    displayView();
};

function getToken() {
    return sessionStorage.getItem("token");
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
            function(status){
                if(status == 401) {
                    errorMessage = `User is not logged in!`
                } else if(status == 405) {
                    errorMessage = `Method not allowed!`
                } else if(status == 500) {
                    errorMessage = `Server error! Try again.`
                }
                document.getElementById('homeInfoErrorMessage').innerHTML = `${errorMessage} Code: ${status}`;
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
    form.reset();
}

function loginValidate(email, password) {
    // Call Call server sign-in function

    let object = {'email': email,
                 'password': password};

    httpRequest('POST', '/sign_in', object,
        function(data){
            let token = data;
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("email", object['email']);
            wsConnect();
            displayView();
        },
        function(status){
            if(status == 400) {
                errorMessage = `Input Error!`
            } else if(status == 401) {
                errorMessage = `Wrong email or password!`
            } else if(status == 405) {
                errorMessage = `Method not allowed!`
            } else if(status == 500) {
                errorMessage = `Server error! Try again.`
            }
            document.getElementById('LoginErrorMessage').innerHTML = `${errorMessage} Code: ${status}`;;
        }
    );
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
                if(status == 400) {
                    errorMessage = `Input Error!`
                } else if(status == 405) {
                    errorMessage = `Method not allowed!`
                } else if(status == 409) {
                    errorMessage = `Email already in use!`
                } else if(status == 500) {
                    errorMessage = `Server error! Try again.`
                }
                document.getElementById('SignupErrorMessage').innerHTML = `${errorMessage} Code: ${status}`;;
            }
        );
    }
    form.reset();
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
                document.getElementById('PassErrorMessage').innerHTML = `Password changed successfully!`;
            },
            function(status){
                if(status == 400) {
                    errorMessage = `Input Error!`
                } else if(status == 401) {
                    errorMessage = `User not logged in!`
                } else if(status == 405) {
                    errorMessage = `Method not allowed!`
                } else if(status == 500) {
                    errorMessage = `Server error! Try again.`
                }
                document.getElementById('PassErrorMessage').innerHTML = `${errorMessage} Code: ${status}`;
            }
        );
    }
}

function signOut() {
    token = getToken();
    httpRequest('DELETE', '/sign_out', token,
        function () {
            sessionStorage.clear();
            displayView();
        },
        function (status) {
            if(status == 400) {
                errorMessage = `Input Error! Code:${status}`
            } else if(status == 401) {
                errorMessage = `Email is not logged in! Code:${status}`
            } else if(status == 405) {
                errorMessage = `Method not allowed! Code:${status}`
            } else if(status == 500) {
                errorMessage = `Server error! Try again. Code: ${status}`
            }
            document.getElementById('signOutErrorMessage').innerHTML = errorMessage;
            // `${message} Error: ${status}` :(
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
        function(status){
            if(status == 400) {
                errorMessage = `Input Error!`
            } else if(status == 401) {
                errorMessage = `Email is not logged in!`
            } else if(status == 404) {
                errorMessage = `User not found!`
            } else if(status == 405) {
                errorMessage = `Method not allowed!`
            } else if(status == 500) {
                errorMessage = `Server error! Try again.`
            }
            document.getElementById('PostErrorMessage').innerHTML = `${errorMessage} Code: ${status}`;
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
        function(status){
            if(status == 400) {
                errorMessage = `Input Error!`
            } else if(status == 401) {
                errorMessage = `Not logged in!`
            } else if(status == 404) {
                errorMessage = `User not found!`
            } else if(status == 405) {
                errorMessage = `Method not allowed!`
            } else if(status == 500) {
                errorMessage = `Server error! Try again.`
            }
            document.getElementById('browsePostErrorMessage').innerHTML = `${errorMessage} Code: ${status}`;
        }
    )
}

function loadMessages() {
    httpRequest('GET', '/get_user_messages_by_token', {},
        function(data) {
            let messages = "";
            for (let i = data.length-1; 0 <= i; i--) {
                messages +=
                `<dt draggable="true" ondragstart="dragstartHandler(event)">${data[i][1]}</dt>
                 <dd draggable="true" ondragstart="dragstartHandler(event)">${data[i][0]}</dd>`;
            }
            document.getElementById("messages").innerHTML = messages;
        },
        function(status){
            if(status == 401) {
                errorMessage = `Not logged in!`;
            } else if(status == 405) {
                errorMessage = `Method not allowed!`;
            } else if(status == 500) {
                errorMessage = `Server error! Try again.`;
            }
            document.getElementById('WallErrorMessage').innerHTML = `${errorMessage} Code: ${status}`
        }
    )
}

function loadBrowseMessages() {
    let target = document.getElementById("browse_emailInfo").innerHTML;
    if (target !== "") {
        httpRequest('GET', `/get_user_messages_by_email/${target}`, {},
            function(data) {
                let messages = "";
                for (let i = data.length-1; 0 <= i; i--) {
                    messages +=
                    `<dt draggable="true" ondragstart="dragstartHandler(event)">${data[i][1]}</dt>
                     <dd draggable="true" ondragstart="dragstartHandler(event)">${data[i][0]}</dd>`;
                }
                document.getElementById("browse_messages").innerHTML = messages;
                document.getElementById("browseWallErrorMessage").innerHTML = "";
            },
            function(status) {
                if(status == 401) {
                    errorMessage = `Not logged in!`;
                } else if(status == 404) {
                    errorMessage = `User not found!`;
                } else if(status == 405) {
                    errorMessage = `Method not allowed!`;
                } else if(status == 500) {
                    errorMessage = `Server error! Try again.`;
                }
                document.getElementById('browseWallErrorMessage').innerHTML = `${errorMessage} Code: ${status}`
            }
        )
    }
    else {
        document.getElementById("browseWallErrorMessage").innerHTML = "No user to look up!";
    }
}

function lookupEmail(form) {
    let target = form.searchEmail.value;
    httpRequest('GET', `/get_user_data_by_email/${target}`, {},
            function(data) {
                getAccountInfo(data, "browse_");
                document.getElementById("searchEmailform").reset();
            },
            function(status){
                if(status == 400) {
                    errorMessage = `Incorrect input!`
                } else if(status == 401) {
                    errorMessage = `Not logged in!`
                } else if(status == 404) {
                    errorMessage = `User not found!`
                } else if(status == 405) {
                    errorMessage = `Method not allowed!`
                } else if(status == 500) {
                    errorMessage = `Server error! Try again.`
                }
                document.getElementById('searchErrorMessage').innerHTML = `${errorMessage} Code: ${status}`;
            }
        );
}

function dragstartHandler(ev) {
    ev.dataTransfer.setData("text", ev.target.innerText);
}

function dragoverHandler(ev) {
    ev.preventDefault();
}

function dropHandler(ev) {
    let data = document.getElementById(ev.target.id);
    data.value += ev.dataTransfer.getData("text");
    ev.preventDefault();
}