
let btnNovoAgendamento = document.getElementById("learnteach-novo")
let msgNovo = document.getElementById("msg-learn-novo")

btnNovoAgendamento.addEventListener('click',function(){
    msgNovo.hidden = false
    msgVerificar.hidden = true
})

let btnVerificarAgendamento = document.getElementById("learnteach-verificar")
let msgVerificar = document.getElementById("msg-learn-agendamento")

btnVerificarAgendamento.addEventListener('click',function(){
    msgVerificar.hidden = false
    msgNovo.hidden = true
})
