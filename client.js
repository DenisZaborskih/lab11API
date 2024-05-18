const server="http://localhost:8000";
var indx='/index.html';
var User={
    id:null,
    name:null,
    pass:null,
    logged:null
}
async function postData(url, data) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    const response = await fetch(url, options);
    const responseData = await response.json();
    return responseData;
}
async function getPage(url = '', data = {}) {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    const response = await fetch(url, options);
    const responseData = await response.json();
    return responseData;
}
function registration(){
    regField=document.getElementById("reg");
    if(regField.innerHTML)
        {
            regField.innerHTML="";
        }
        else
    regField.innerHTML=" <form id='userReg'>    <label for='regName'>Имя:</label>    <input type='text' name='name' id='regName'/>    <br>    <label for='regPass'>Пароль:</label><input type='password' name='pass' id='regPass'/><br><input type='submit' onclick=regSubmit() class='btn btn-sm btn-primary' value='Сохранить' /></form>";
}
function authentification(){
    authField=document.getElementById("auth");
    if(authField.innerHTML)
        {
            authField.innerHTML="";
        }
        else
    authField.innerHTML=" <form id='userAuth'>    <label for='authName'>Имя:</label>    <input type='text' name='name'id='authName'/>    <br>    <label for='authPass'>Пароль:</label><input type='password' name='pass' id='authPass'/><br><input type='submit' onclick=authSubmit() class='btn btn-sm btn-primary' value='Войти' /></form>";
}
async function regSubmit(){
    regName=document.getElementById("regName").value;
    regPass=document.getElementById("regPass").value;
    console.log(regName);
    var url = server + '/api/regSubmit';
    const response = await postData(url, {name: regName, pass: regPass});
    if (response.result) {
        console.log(response);
        authentification();
    }
}
async function authSubmit(){
    authName=document.getElementById("authName").value;
    authPass=document.getElementById("authPass").value;
    url = server + "/api/authSubmit";
    const response = await postData(url, {name: authName, pass: authPass});
    if (response.result) {
        console.log(response.result);
        User.id=response.result._id;
        User.name=response.result.name;
        User.pass=response.result.pass;
        User.logged=true;
        updatePage();
        console.log(User);
    }
    
}