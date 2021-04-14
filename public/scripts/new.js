let btnAgendarOk = document.getElementById("new-ok")
let msgOk = document.getElementById("msg-ok")

btnRequest.addEventListener('click',function(){
    msgOk.hidden = false
})

let btnAgendarErro = document.getElementById("new-erro")
let msgErro = document.getElementById("msg-erro")

btnRequest.addEventListener('click',function(){
    msgErro.hidden = false
})