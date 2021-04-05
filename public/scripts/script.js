const { CursoPublicado } = require("../../models")

async function paginacaoCursos() {
    let curso = 0;
    let totalCursos = 0
    let lefth = document.querySelector('#p');
    let rigth = document.querySelector('#r');
    let cursos = await CursoPublicado.findAll();
    let listaCursos = [];
    cursos.forEach(element => {
        listaCursos.push({
            id:element.id,
            curso:element.curso,
            coin:element.coin,
            hora:element.hora,
            data:element.data,
            descricao:element.descricao
        });
        totalCursos = listaCursos.length
        lefth.addEventListener('click',function(){
            if(curso == 0){
                curso = 0
            }else{
                curso -= 1
            }
        })

        rigth.addEventListener('click',function(){
            if(curso == totalCursos){
                curso = curso;
            }else{
                curso += 1
            }
        })
        return console.log(listaCursos[curso]);
    });
}

module.exports = paginacaoCursos;