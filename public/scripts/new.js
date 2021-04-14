let btnAgendarOk = document.getElementById("new-ok")
let msgOk = document.getElementById("msg-ok")

btnAgendarOk.addEventListener('click',function(){
    alert("Agendamento realizado com sucesso!")
})

let btnAgendarErro = document.getElementById("new-erro")
let msgErro = document.getElementById("msg-erro")

btnRequest.addEventListener('click',function(){
    msgErro.hidden = false
})