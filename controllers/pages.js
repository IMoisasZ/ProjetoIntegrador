const { CursoPublicado, Usuario, CursoAgendado, CoinUsuario } = require('../models')
const {Op} = require('sequelize')
const agora = new Date()

const pagesController = {
    
    learn:(req, res, next) => {
        res.render("learn",{usuarios: req.session.usuario})
    },
    schedules: async (req, res, next) => {
        let { idCurso = 0 } = req.query
        idCurso = parseInt(idCurso)
        /* buscar agendamentos no banco */
        let agendamentos = await CursoAgendado.findAll({
            where: {
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 1,
            }
        })

        /* buscar os cursos agendados */
        let cursoAgendado = await CursoPublicado.findAll({
            where:{id_status_curso: 2}
        })
        
        /* listar os agendamentas em um objeto */
        let listaAgendamentos = []
        for(let i = 0; i < agendamentos.length; i++){
            for(let j = 0; j <cursoAgendado.length; j++){
                if(cursoAgendado[j].id == agendamentos[i].id_curso_publicado){
                    listaAgendamentos.push({
                    id_agendamento: agendamentos[i].id,
                    id_usuario: req.session.usuario.id,
                    nome_usuario: req.session.usuario.nome_usuario,
                    id_curso_agendamento: cursoAgendado[j].id,
                    curso: cursoAgendado[j].curso,
                    carga_horaria: cursoAgendado[j].carga_horaria,
                    coin: cursoAgendado[j].coin,
                    data_hora: cursoAgendado[j].data_hora,
                    descricao: cursoAgendado[j].descricao,
                    id_usuario_publicador: cursoAgendado[j].id_usuario,
                    nome_usuario_publicador: cursoAgendado[j].nome_usuario
                    })
                }
            }
        }
        
        let totalAgendamentos = listaAgendamentos.length
        if(typeof(idCurso) == 'undefined'){
            listaAgendamentos=listaCursos[0]
        }else{
            listaAgendamentos=listaAgendamentos[idCurso]
        }

        res.render("schedules",{usuarios: req.session.usuario, listaAgendamentos, idCurso, totalAgendamentos})
    },
    // cancelar agendamentos
    cancel: async (req,res,next) =>{
        let { id_curso } = req.body

        let cursoDisponivel = await CursoPublicado.update({
            id_status_curso: 1},
            {
                where:{id: id_curso}
            }
        )

        let cancelarAgendamento = await CursoAgendado.update({
            id_status_agendamento: 2},
            {where:{
                id_curso_publicado: id_curso,
                id_usuario_agendamento: req.session.usuario.id
            }
        })

        res.render("main")
    },
    new:async(req, res, next) => {
        let { idCurso = 0 } = req.query
        idCurso = parseInt(idCurso)
        let listaCursos = []
        let cursos = await CursoPublicado.findAll({
            where:{
                id_status_curso: 1,
                id_usuario:
                    {[Op.ne]:[req.session.usuario.id]}
            }});
        
        cursos.forEach(curso => {    
            listaCursos.push({
                id:curso.id,
                curso:curso.curso,
                carga_horaria:curso.carga_horaria,
                coin:curso.coin,
                data_hora:curso.data_hora,
                descricao:curso.descricao,
                id_usuario:curso.id_usuario,
                nome_usuario: curso.nome_usuario
            })
        });

        let totalCursos = cursos.length
        if(typeof(idCurso) == 'undefined'){
            listaCursos=listaCursos[0]
        }else{
            listaCursos=listaCursos[idCurso]
        }

        /*não passar para outra pagina caso não tenha disponibilidade de curso*/
        let cursosPublicados = ''
        if (totalCursos == 0){
            cursosPublicados = 0;
            res.render("main",{usuarios: req.session.usuario, cursosPublicados})   
        }

        res.render("new",{usuarios: req.session.usuario, idCurso, totalCursos, listaCursos, cursosPublicados})
    },
    schedule: async(req, res, next) =>{
        let { coin, id_curso, nome_curso, data_hora_nova, id_usuario } = req.body
        let coinDebito = coin-(coin*coin)
        /* caso não teve solicitação de alteração de data do curso executa o if */
        /* caso sim executa o else */ 
        console.log(agora)
        if(data_hora_nova.length == 0){
            /* criar agendamento */ 
            let agendar = await CursoAgendado.create({
                id_curso_publicado: id_curso,
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 1,
                data_hora_agendamento: agora,
                data_hora_solicitada: ""
            })

            /* debitar os coins - aprender */ 
            let incluirDebito = await CoinUsuario.create({
                tipo: "A", /* A = Agendado */
                coin: coinDebito,
                caminho: id_curso + "-" + nome_curso,
                id_usuario: req.session.usuario.id
            })

            /* creditar os coins - ensinar */
            let incluirCredito = await CoinUsuario.create({
                tipo: "A", /* A = Agendado */
                coin: coin,
                caminho: id_curso + "-" + nome_curso,
                id_usuario: id_usuario
            })

            /* alterar os status do curso para agendado = 2 */ 
            let atualizacao = await CursoPublicado.update({
                id_status_curso: 2,
                id_agendamento: agendar.id
                },
                {
                    where:{
                        id: id_curso
                }
            })
        }else{
            let agendar = await CursoAgendado.create({
                id_curso_publicado: id_curso,
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 3,
                data_hora_agendamento: agora,
                data_hora_solicitada: data_hora_nova
            })

            let atualizacao = await CursoPublicado.update({
                id_status_curso: 3,
                id_agendamento: agendar.id
                },
                {
                    where:{
                        id: id_curso
                }
            })
        }
        res.redirect("/main")
    },
    teach:(req, res, next) => {
        res.render("teach",{usuarios: req.session.usuario})
    },
    requests: async(req, res, next) => {
        let { idCurso = 0 } = req.query
        idCurso = parseInt(idCurso)
        /* buscar agendamentos no banco */
        
        let agendamentos = await CursoAgendado.findAll({
            where: {
                id_status_agendamento: 3,
                id_usuario_agendamento: 
                {[Op.ne]:[req.session.usuario.id]} 
            }
        })

        let usuarioCurso = await Usuario.findAll({
            where: {
                id: 
                {[Op.ne]:[req.session.usuario.id]} 
            }  
        })

        /* buscar os cursos agendados aguardando confirmação de alteração de data */
        let cursoAgendado = await CursoPublicado.findAll({
            where:{id_status_curso: 3}
        })
        
        
        /* listar os agendamentas em um objeto */
        let listaAgendamentos = []
        for(let i = 0; i < agendamentos.length; i++){
            for(let j = 0; j <cursoAgendado.length; j++){
                for(let k = 0; k <usuarioCurso.length; k++)
                if(cursoAgendado[j].id == agendamentos[i].id_curso_publicado && usuarioCurso[k].id == agendamentos[i].id_usuario_agendamento){
                    listaAgendamentos.push({
                    id_usuario_curso: usuarioCurso[k].id,
                    nome_usuario_curso: usuarioCurso[k].nome_usuario,
                    id_agendamento: agendamentos[i].id,
                    id_curso_agendamento: cursoAgendado[j].id,
                    curso: cursoAgendado[j].curso,
                    carga_horaria: cursoAgendado[j].carga_horaria,
                    coin: cursoAgendado[j].coin,
                    data_hora: agendamentos[i].data_hora_agendamento,
                    data_hora_solicitada: agendamentos[i].data_hora_solicitada,
                    descricao: cursoAgendado[j].descricao,
                    id_usuario_publicador: cursoAgendado[j].id_usuario,
                    nome_usuario_publicador: cursoAgendado[j].nome_usuario,
                    })
                }
            }
        }

        let totalAgendamentos = listaAgendamentos.length
        if(typeof(idCurso) == 'undefined'){
            listaAgendamentos=listaCursos[0]
        }else{
            listaAgendamentos=listaAgendamentos[idCurso]
        }

        res.render("requests",{usuarios: req.session.usuario, listaAgendamentos, totalAgendamentos, idCurso })
    },
    aceptSolicitation: async (req, res, next) =>{
        let { id_curso_agendamento, id_usuario_curso, coin, curso } = req.body
        let coinDebito = coin-coin-coin
        let agendamentos = await CursoAgendado.findOne({
            where:{
                id_curso_publicado: id_curso_agendamento
            }
        })

        agendamentos.update({
            id_status_agendamento: 1
        })

        let cursoAgendado = await CursoPublicado.findOne({
            where:{
                id: id_curso_agendamento
            }
        })

        cursoAgendado.update({
            id_status_curso: 2
        })

        /* debitar os coins - aprender */ 
        let incluirDebito = await CoinUsuario.create({
            tipo: "A", /* A = Agendado */
            coin: coinDebito,
            caminho: id_curso_agendamento + "-" + curso,
            id_usuario: id_usuario_curso
        })

        /* creditar os coins - ensinar */
        let incluirCredito = await CoinUsuario.create({
            tipo: "A", /* A = Agendado */
            coin: coin,
            caminho: id_curso_agendamento + "-" + curso,
            id_usuario: req.session.usuario.id
        })

        res.redirect("/main")
    },
    cancelSolicitation: async (req, res, next) =>{
        let { id_curso_agendamento } = req.body
        
        let agendamentos = await CursoAgendado.findOne({
            where:{
                id_curso_publicado: id_curso_agendamento
            }
        })
        agendamentos.update({
            id_status_agendamento: 2
        })

        let curso = await CursoPublicado.findOne({
            where:{
                id: id_curso_agendamento
            }
        })

        curso.update({
            id_status_curso: 1
        })

        res.redirect("/main")
    },
    create:(req, res, next) =>{
        res.render('create',{usuarios: req.session.usuario})
    },
    public: async (req, res, next) =>{
        let { curso, carga_horaria, coin, data_hora, descricao } = req.body
        let { files } = req
        let nomeUsuario = req.session.usuario.nome_usuario

        CursoPublicado.create({
            curso: curso,
            carga_horaria: carga_horaria,
            coin: coin,
            caminho_imagem: files[0].originalname,
            data_hora: data_hora,
            descricao: descricao,
            id_usuario: req.session.usuario.id,
            nome_usuario: nomeUsuario,
            id_status_curso: 1
        })


        res.render('create', {usuarios: req.session.usuario})
    }
}

module.exports = pagesController;