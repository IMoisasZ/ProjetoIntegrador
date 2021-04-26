const {Op} = require('sequelize')
const { CoinUsuario, Message, CursoPublicado, CursoAgendado } = require("../models")

const mainController = {
    
    index:(req, res, next) =>{
        res.render('index')
    },
    main:async(req, res, next) => {
        req.session.usuario.coin = await CoinUsuario.sum('coin',{
            where: {id_usuario: req.session.usuario.id}
        })

        // let curso = await CursoPublicado.findAll({
        //     where:{
        //         id_status_curso:
        //             {[Op.ne]:[4]}
        //     }
        // })

        // console.log("Cursos: "+curso);

        // let agendamento = await CursoAgendado.findAll({
        //     where:{
        //         id_usuario_agendamento: req.session.usuario.id
        //     }
        // })

        // console.log("Agendados: "+agendamento);

        let message = await Message.findAll({
            where:{
                para: req.session.usuario.id,
                lida: false
            }
        })

        // console.log("Mensagens: "+message);

        // let mensagens = []

        // for(let i =0; i<message.length; i++){
        //     for(let j = 0; j<curso.length; j++){
        //         for(let k =0; k<agendamento.length; k++){
        //             if(message[i].id_curso == curso[j].id && message[i].id_curso == agendamento[k].id_curso_publicado){
        //                 mensagens.push({
        //                     curso: curso[j].curso,
        //                     carga_horaria: curso[j].carga_horaria,
        //                     coin: curso[j].coin,
        //                     data_hora: curso[j].data_hora,
        //                     descricao: curso[j].descricao,
        //                     professor: curso[j].nome_usuario,
        //                     data_hora_solicitada: agendamento[k].data_hora_solicitada,
        //                     id_mensagem: message[i].id,
        //                     mensagem: message[i].mensagem,
        //                     lida: message[i].lida
        //                 })
        //             }
        //         }
        //     }
        // }
        

        req.session.usuario.msg = message.length

        res.render('main',{usuarios: req.session.usuario})
    }
}

module.exports = mainController;