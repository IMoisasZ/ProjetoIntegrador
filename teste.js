let email = "pacheco@injetaq.com.br"

let meta = ""



for(let i = 0; i<email.length; i++){
    var novoEmail
    if(i<=2){
        if(typeof(novoEmail)=="undefined"){
            novoEmail = email[i]
        }else{
            novoEmail = novoEmail+""+email[i]
        }
    }
    else if(email[i] == "@"){
        novoEmail = novoEmail+""+email[i]
    }
    else if(email[i-1] == "@"){
        novoEmail=novoEmail+""+email[i]
    }
    else if(email.length - i <= 3){
        novoEmail = novoEmail+""+email[i]
    }
    else{
        novoEmail = novoEmail+""+"*"
    }
}

console.log(novoEmail)
