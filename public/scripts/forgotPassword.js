let user = document.getElementById('usuario')
let btn = document.getElementById('forgotPassword')

btn.addEventListener('click',function(){
    if(!user.value){
        alert("Digite o email cadastrado!")
    }else{
        alert("Enviamos um email para o "+ user.value +" com instruções para recuperação da senha!")
    }
    
})
