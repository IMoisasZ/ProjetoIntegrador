let btnRequest = document.getElementById('learnteach-request')
let msgRequest = document.getElementById('msg-request')

let btnPublicated = document.getElementById('learnteach-publicated')
let msgPublicated = document.getElementById('msg-publicated')

btnRequest.addEventListener('click',function(){
    msgRequest.hidden = false
    msgPublicated.hidden = true
})

btnPublicated.addEventListener('click',function(){
    msgRequest.hidden = true
    msgPublicated.hidden = false
})