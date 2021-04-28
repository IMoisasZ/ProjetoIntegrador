const { CursoPublicado, Usuario, CursoAgendado, CoinUsuario, StatusCurso, Message, TempoEnsinandoAprendendo } = require('../models')
const {Op} = require('sequelize')
const { check, validationResult, body } = require('express-validator')
const moment = require('moment')
const agora = new Date()
const limit  = 4
const limitMsg = 3
const mensagens = {
    novoAgendamentoAluno:"Obrigado por se cadastrar no curso! Fique atento a data e hora do curso!",
    novoAgendamentoProfessor:"O curso que você publicou foi agendado!",
    solcitarAlteracaoAluno:"Sua solicitação de alteração foi enviada com sucesso!Assim que o professor que o professor analisar sua proposta, você receberá uam notificação!",
    solcitarAlteracaoProfessor:"Você recebeu uma solicitação de alteração de data/hora! verifique se é possivel aceitar!",
    conclusaoCursoAluno: "Parabéns! Você terminou o curso. Bora fazer mais um? Ou, porque não publicar um curso e ensiar outras pessoas! CONNEKT -se!!",
    conclusaoCursoProfessor: "Parabéns! Você acaba de ensinar uma pessoa! Vamos lá, publique mais um curso e bora ensinar mais pessoas!"
}


const pagesController = {
    
    learn: async (req, res, next) => {
        let cursos = await CursoPublicado.findAll({
            where:{
                id_status_curso: 1,
                id_usuario:
                    {[Op.ne]:[req.session.usuario.id]}
            }});

        let agendamentos = await CursoAgendado.findAll({
            where:{
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 3,
                status_agendamento: true
            }
        })

        let c = cursos.length
        let a = agendamentos.length

        if(c > 0){
            c = "ok"
        }

        if(a > 0){
            a = "ok"
        }

        return res.render("learn",{usuarios: req.session.usuario, c, a})
    },
    schedules: async (req, res, next) => {
        let { idCurso = 0 } = req.query
        idCurso = parseInt(idCurso)
        /* buscar agendamentos no banco */
        let agendamentos = await CursoAgendado.findAll({
            where: {
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 3
            }
        })

        /* buscar os cursos agendados */
        let cursoAgendado = await CursoPublicado.findAll({
            where:{
                id_status_curso: 3
            }
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
                    nome_usuario_publicador: cursoAgendado[j].nome_usuario,
                    id_status_curso: cursoAgendado[j].id_status_curso
                    })
                }
            }
        }

        let status = "AGUARDANDO SOLICITAÇÃO"   
        
        let totalAgendamentos = listaAgendamentos.length
        if(typeof(idCurso) == 'undefined'){
            listaAgendamentos=listaCursos[0]
        }else{
            listaAgendamentos=listaAgendamentos[idCurso]
        }

        res.render("schedules",{usuarios: req.session.usuario, listaAgendamentos, idCurso, totalAgendamentos, status})
    },
    // cancelar agendamentos
    cancel: async (req,res,next) =>{
        let { id_curso } = req.body

        let cursoDisponivel = await CursoPublicado.findOne(
            {
                where:{
                    id: id_curso
                }
            }
        )

        await cursoDisponivel.update({
            id_status_curso: 1
        })

        let agendamentos = await CursoAgendado.update(
            {status_agendamento: false},
            {
                where: {
                    id_usuario_agendamento: req.session.usuario.id,
                    id_curso_publicado: id_curso
            }
        })

        await CursoAgendado.create({
            id_curso_publicado: agendamentos.id_curso_publicado,
            id_usuario_agendamento: agendamentos.id_usuario_agendamento,
            id_status_agendamento: 2,
            data_hora_agendamento: agendamentos.data_hora_agendamento,
            data_hora_solicitada: "",
            data_publicacao: agora,
            createAt: agora,
            updateAt: agora,
            status_agendamento: true
        })

        res.render("learnCourses",{usuarios: req.session.usuario})
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
        
        let saldo = "OK"
        if(req.session.usuario.coin < listaCursos.coin){
            saldo = "NOK" /* não é possivel comprar curso - sem saldo*/
        }
        
        res.render("new",{usuarios: req.session.usuario, idCurso, totalCursos, listaCursos, cursosPublicados, saldo})
    },
    schedule: async(req, res, next) =>{
        let { coin, id_curso, nome_curso, data_hora_nova, id_usuario } = req.body
        let coinDebito = coin-coin-coin
        /* caso não teve solicitação de alteração de data do curso executa o if */
        /* caso sim executa o else */ 
        if(data_hora_nova.length == 0 || typeof(data_hora_nova) == "undefined"){
            /* criar agendamento */ 
            let agendar = await CursoAgendado.create({
                id_curso_publicado: id_curso,
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 1,
                data_hora_agendamento: agora,
                data_hora_solicitada: "",
                data_publicacao: agora,
                createdAt: agora,
                updatedAt: agora,
                status_agendamento: true
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

            /*mensages*/
            let curso = await CursoPublicado.findOne({
                where:{
                    id: id_curso
                }
            })

            await Message.create({
                id_curso: id_curso,
                mensagem: mensagens.novoAgendamentoProfessor,
                de: req.session.usuario.id,
                para: curso.id_usuario,
                lida: false,
                tipo: "PROFESSOR"
            })

            await Message.create({
                id_curso: id_curso,
                mensagem: mensagens.novoAgendamentoAluno,
                de: curso.id_usuario,
                para: req.session.usuario.id,
                lida: false,
                tipo: "ALUNO"
            })
        }else{

            await CursoAgendado.update({
                status_agendamento: false},
                {
                    where:{
                        id_curso_publicado: id_curso
                    }
                })

            /* cria o agendamento "parcial" - aguardando liberação */
            let agendar = await CursoAgendado.create({
                id_curso_publicado: id_curso,
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 3,
                data_hora_agendamento: agora,
                data_hora_solicitada: data_hora_nova,
                data_publicacao: agora,
                createAt: agora,
                updateAt: agora,
                status_agendamento: true
            })

            /* altera o status do curso para aguardando solicitação*/
            let atualizacao = await CursoPublicado.update({
                id_status_curso: 3,
                id_agendamento: agendar.id
                },
                {
                    where:{
                        id: id_curso
                }
            })

            /* debitar os coins - aprender */ 
            let incluirDebito = await CoinUsuario.create({
                tipo: "A", /* A = Agendado */
                coin: coinDebito,
                caminho: id_curso + "-" + nome_curso + " - AGUARDANDO SOLICITAÇÃO",
                id_usuario: req.session.usuario.id
            })

            /* creditar os coins - ensinar */
            let incluirCredito = await CoinUsuario.create({
                tipo: "A", /* A = Agendado */
                coin: coin,
                caminho: id_curso + "-" + nome_curso + " - AGUARDANDO SOLICITAÇÃO",
                id_usuario: id_usuario
            })
            /*mensages*/
            let curso = await CursoPublicado.findOne({
                where:{
                    id: id_curso
                }
            })

            console.log(">>>>>>>>>>>"+curso);

            await Message.create({
                id_curso: id_curso,
                mensagem: mensagens.solcitarAlteracaoAluno,
                de: req.session.usuario.id,
                para: curso.id_usuario,
                lida: false,
                tipo: "PROFESSOR"
            })

            await Message.create({
                id_curso: id_curso,
                mensagem: mensagens.solcitarAlteracaoProfessor,
                de: curso.id_usuario,
                para: req.session.usuario.id,
                lida: false,
                tipo: "ALUNO"
            })
        }
        res.redirect("/main")
    },
    teach: async (req, res, next) => {
        let agendamentos = await CursoAgendado.findAll({
            where: {
                id_status_agendamento: 3,
                id_usuario_agendamento: 
                {[Op.ne]:[req.session.usuario.id]} 
            }
        })
        
        let cursos = await CursoPublicado.findAll({
            where:{
                id_usuario: req.session.usuario.id
            }
        })
        
        let b = agendamentos.length

        let c = cursos.length
    
        res.render("teach",{usuarios: req.session.usuario, b, c})

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

        let agendamentos = await CursoAgendado.findOne({
            where:{
                id_curso_publicado: id_curso_agendamento
            }
        })

        await agendamentos.update({
            status_agendamento: false
        })

        await CursoAgendado.create({
            id_curso_publicado: agendamentos.id_curso_publicado,
            id_usuario_agendamento: agendamentos.id_usuario_agendamento,
            id_status_agendamento: 1,
            data_hora_agendamento: agora,
            data_hora_solicitada: agendamentos.data_hora_solicitada,
            data_publicacao: agora,
            createdAt: agora,
            updateAt: agora,
            status_agendamento: true
        })


        let cursoAgendado = await CursoPublicado.findOne({
            where:{
                id: id_curso_agendamento
            }
        })

        cursoAgendado.update({
            id_status_curso: 2
        })

        // /* debitar os coins - aprender */ 
        // let incluirDebito = await CoinUsuario.create({
        //     tipo: "A", /* A = Agendado */
        //     coin: coinDebito,
        //     caminho: id_curso_agendamento + "-" + curso,
        //     id_usuario: id_usuario_curso
        // })

        // /* creditar os coins - ensinar */
        // let incluirCredito = await CoinUsuario.create({
        //     tipo: "A", /* A = Agendado */
        //     coin: coin,
        //     caminho: id_curso_agendamento + "-" + curso,
        //     id_usuario: req.session.usuario.id
        // })

        res.redirect("/main")
    },
    cancelSolicitation: async (req, res, next) =>{
        let { id_curso_agendamento, id_usuario_curso, coin, curso } = req.body
        let coinDebito = coin-coin-coin
        let agendamentos = await CursoAgendado.findOne({
            where:{
                id_curso_publicado: id_curso_agendamento
            }
        })
        
        await agendamentos.update({
            status_agendamento: false
        })

        await CursoAgendado.create({
            id_curso_publicado: agendamentos.id_curso_publicado,
            id_usuario_agendamento: agendamentos.id_usuario_agendamento,
            id_status_agendamento: 2,
            data_hora_agendamento: agora,
            data_hora_solicitada: agendamentos.data_hora_solicitada,
            data_publicacao: agora,
            createdAt: agora,
            updateAt: agora,
            status_agendamento: true
        })

        let cursoAgendado = await CursoPublicado.findOne({
            where:{
                id: id_curso_agendamento
            }
        })

        cursoAgendado.update({
            id_status_curso: 1
        })

        /* debitar os coins - aprender */
        /* devolver os coins ao aluno */
        let incluirDebito = await CoinUsuario.create({
            tipo: "C", /* C = Cancelado - Solicitação de alteração de data e hora não aceita */
            coin: coin,
            caminho: id_curso_agendamento + "-" + curso + " - CANCELADO",
            id_usuario: id_usuario_curso
        })

        /* creditar os coins - ensinar */
        let incluirCredito = await CoinUsuario.create({
            tipo: "C", /* C = Cancelado - Solicitação de alteração de data e hora não aceita */
            coin: coinDebito,
            caminho: id_curso_agendamento + "-" + curso + " - CANCELADO",
            id_usuario: req.session.usuario.id
        })

        res.redirect("/main")
    },
    create:(req, res, next) =>{
        res.render('create',{usuarios: req.session.usuario})
    },
    public: async (req, res, next) =>{
        let { curso, carga_horaria, coin, data_hora, descricao } = req.body
        //let { files } = req

            let nomeUsuario = req.session.usuario.nome_usuario
            await CursoPublicado.create({
                data_publicacao: agora,
                curso: curso,
                carga_horaria: carga_horaria,
                coin: coin,
                caminho_imagem:"", //files[0].originalname,
                data_hora: data_hora,
                descricao: descricao,
                id_usuario: req.session.usuario.id,
                nome_usuario: nomeUsuario,
                id_status_curso: 1
            })
            res.render('create', {usuarios: req.session.usuario, sucesso:true})
            
        },
    
    publicated: async (req, res, next) => {
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: cursos} = await CursoPublicado.findAndCountAll({
            where: {
                id_usuario:req.session.usuario.id,
                id_status_curso: 1
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });
      
        let totalPages = Math.ceil(size / limit);         
        
        let status = await StatusCurso.findAll()
        
        let listaCursos = []
        let statusCurso = []
        
        status.forEach(sts =>{
            statusCurso.push({
                id: sts.id,
                descricao: sts.descricao_status
            })
            })
            
            for(let i = 0; i < statusCurso.length; i++){
                for(let j = 0; j < cursos.length; j++){
                    if(statusCurso[i].id == cursos[j].id_status_curso){
                        listaCursos.push({
                            id:cursos[j].id,
                            curso:cursos[j].curso,
                            carga_horaria:cursos[j].carga_horaria,
                            coin:cursos[j].coin,
                            data_hora:cursos[j].data_hora,
                            descricao:cursos[j].descricao,
                            id_usuario:cursos[j].id_usuario,
                            nome_usuario: cursos[j].nome_usuario,
                            id_status: statusCurso[i].id,
                            descricao_status: statusCurso[i].descricao
                        })
                    }
                }
            }
            
            if(typeof(cursos) == "undefined"){
                listaCursos = {
                    id:"",
                    curso: "",
                    carga_horaria:"",
                    coin:""
                }
                res.render("publicated",{usuarios: req.session.usuario, erro: 1, listaCursos})
            }

        res.render("publicated",{usuarios: req.session.usuario, page, totalPages, cursos})
    },
    scheduled: async (req, res, next) =>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: cursos} = await CursoPublicado.findAndCountAll({
            where: {
                id_usuario:req.session.usuario.id,
                id_status_curso: 2
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });
      
        let totalPages = Math.ceil(size / limit);         
        
        let status = await StatusCurso.findAll()
        
        let listaCursos = []
        let statusCurso = []
        
        status.forEach(sts =>{
            statusCurso.push({
                id: sts.id,
                descricao: sts.descricao_status
            })
            })
            
            for(let i = 0; i < statusCurso.length; i++){
                for(let j = 0; j < cursos.length; j++){
                    if(statusCurso[i].id == cursos[j].id_status_curso){
                        listaCursos.push({
                            id:cursos[j].id,
                            curso:cursos[j].curso,
                            carga_horaria:cursos[j].carga_horaria,
                            coin:cursos[j].coin,
                            data_hora:cursos[j].data_hora,
                            descricao:cursos[j].descricao,
                            id_usuario:cursos[j].id_usuario,
                            nome_usuario: cursos[j].nome_usuario,
                            id_status: statusCurso[i].id,
                            descricao_status: statusCurso[i].descricao
                        })
                    }
                }
            }
            
            if(typeof(cursos) == "undefined"){
                listaCursos = {
                    id:"",
                    curso: "",
                    carga_horaria:"",
                    coin:""
                }
                res.render("scheduled",{usuarios: req.session.usuario, erro: 1, listaCursos})
            }

        res.render("scheduled",{usuarios: req.session.usuario, page, totalPages, cursos}) 
    },
    started: async (req,res,next)=>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: cursos} = await CursoPublicado.findAndCountAll({
            where: {
                id_usuario:req.session.usuario.id,
                id_status_curso: 5
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });
      
        let totalPages = Math.ceil(size / limit);         
        
        let status = await StatusCurso.findAll()
        
        let listaCursos = []
        let statusCurso = []
        
        status.forEach(sts =>{
            statusCurso.push({
                id: sts.id,
                descricao: sts.descricao_status
            })
            })
            
            for(let i = 0; i < statusCurso.length; i++){
                for(let j = 0; j < cursos.length; j++){
                    if(statusCurso[i].id == cursos[j].id_status_curso){
                        listaCursos.push({
                            id:cursos[j].id,
                            curso:cursos[j].curso,
                            carga_horaria:cursos[j].carga_horaria,
                            coin:cursos[j].coin,
                            data_hora:cursos[j].data_hora,
                            descricao:cursos[j].descricao,
                            id_usuario:cursos[j].id_usuario,
                            nome_usuario: cursos[j].nome_usuario,
                            id_status: statusCurso[i].id,
                            descricao_status: statusCurso[i].descricao
                        })
                    }
                }
            }
            
            if(typeof(cursos) == "undefined"){
                listaCursos = {
                    id:"",
                    curso: "",
                    carga_horaria:"",
                    coin:""
                }
                res.render("started",{usuarios: req.session.usuario, erro: 1, listaCursos})
            }

        res.render("started",{usuarios: req.session.usuario, page, totalPages, cursos})
    },
    finished: async (req, res, next) =>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: agendamentos} = await CursoAgendado.findAndCountAll({
            where: {
                id_status_agendamento: 5,
                status_agendamento: true
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });
          
        let totalPages = Math.ceil(size / limit);         
        
        let status = await StatusCurso.findAll()
        
        let cursos = await CursoPublicado.findAll({
            where: {
                id_usuario:req.session.usuario.id,
            }
        })

        let listaCursos = []
        let statusCurso = []
        
        status.forEach(sts =>{
            statusCurso.push({
                id: sts.id,
                descricao: sts.descricao_status
            })
            })
            
            for(let i = 0; i < agendamentos.length; i++){
                for(let j = 0; j < cursos.length; j++){
                    if(agendamentos[i].id_curso_publicado == cursos[j].id){
                        listaCursos.push({
                            id:cursos[j].id,
                            curso:cursos[j].curso,
                            carga_horaria:cursos[j].carga_horaria,
                            coin:cursos[j].coin,
                            data_hora:cursos[j].data_hora,
                            descricao:cursos[j].descricao,
                            id_usuario:cursos[j].id_usuario,
                            nome_usuario: cursos[j].nome_usuario,
                        })
                    }
                }
            }
            
            if(typeof(cursos) == "undefined"){
                listaCursos = {
                    id:"",
                    curso: "",
                    carga_horaria:"",
                    coin:""
                }
                res.render("finished",{usuarios: req.session.usuario, erro: 1, listaCursos})
            }

        res.render("finished",{usuarios: req.session.usuario, page, totalPages, listaCursos})
    },
    update: async(req, res, next) =>{
        let { nome_curso_edicao, carga_horaria_edicao, coin_edicao, data_hora_agendado, data_hora_edicao, descricao_edicao } = req.body

        let { id_curso } = req.params

        let cursoAlterado = await CursoPublicado.findOne({
            where: {id: id_curso}
        })

        console.log(data_hora_edicao);

        let data = ""
        if(data_hora_edicao.length == 0){
            data = data_hora_agendado
        }else{
            data = data_hora_edicao
        }

        await cursoAlterado.update({
            curso: nome_curso_edicao,
            carga_horaria: carga_horaria_edicao,
            coin: coin_edicao,
            data_hora: data,
            descricao: descricao_edicao,
            updateAt: agora
        })

        res.redirect("/pages/create/publicated")
    },
    cancelCourse: async(req,res,next) =>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: cursos} = await CursoPublicado.findAndCountAll({
            where: {
                id_usuario:req.session.usuario.id,
                id_status_curso: 4
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });
      
        let totalPages = Math.ceil(size / limit);
            
            
            let status = await StatusCurso.findAll()
            
            let listaCursos = []
            let statusCurso = []
            
            status.forEach(sts =>{
                statusCurso.push({
                    id: sts.id,
                    descricao: sts.descricao_status
            })
        })
            
        for(let i = 0; i < statusCurso.length; i++){
            for(let j = 0; j < cursos.length; j++){
                if(statusCurso[i].id == cursos[j].id_status_curso){
                    listaCursos.push({
                        id:cursos[j].id,
                        curso:cursos[j].curso,
                        carga_horaria:cursos[j].carga_horaria,
                        coin:cursos[j].coin,
                        data_hora:cursos[j].data_hora,
                        descricao:cursos[j].descricao,
                        id_usuario:cursos[j].id_usuario,
                        nome_usuario: cursos[j].nome_usuario,
                        id_status: statusCurso[i].id,
                        descricao_status: statusCurso[i].descricao
                    })
                }
            }
        }
            
        if(typeof(cursos) == "undefined"){
            listaCursos = {
                id:"",
                curso: "",
                carga_horaria:"",
                coin:""
            }
            res.render("publicated",{usuarios: req.session.usuario, listaCursos, erro:true})
        }
        res.render("cancel",{usuarios: req.session.usuario, page, totalPages, cursos, listaCursos})  
    },
    courseCancel: async (req, res, next) =>{
        let { id_curso } = req.params
        console.log("id cancelamento: "+id_curso)
        let cancelar = await CursoPublicado.findOne({
            where: {id: id_curso}
        })
        console.log("Cancelar: "+id_curso)
        await cancelar.update({
            id_status_curso: 4,
            updateAt: agora
        })

        res.redirect("/pages/create/publicated")
    },
    edit: async(req, res, next) =>{
        let { id_curso } = req.params
        
        let alterar = await CursoPublicado.findOne({
            where: {id: id_curso}
        })

        res.render("editCourse", { usuarios: req.session.usuario, alterar })
    },
    start: async(req, res, next) =>{
        let { id_curso } = req.params
        console.log("Id Curso: "+id_curso);
        /* buscar os cursos agendados */
        let cursoAgendado = await CursoPublicado.findOne({
            where: {
                id: id_curso
            }
        })
        console.log("Curso agendado: "+cursoAgendado);

        await CursoAgendado.update(
            {status_agendamento: false},
            {
                where: {
                id_curso_publicado: id_curso
            }
        })

        let agendamentos = await CursoAgendado.findOne({
            where:{
                id_curso_publicado: id_curso,
            }
        })
        console.log("Agendamentos: "+agendamentos);

        await CursoAgendado.create({
            id_curso_publicado: agendamentos.id_curso_publicado,
            id_usuario_agendamento: agendamentos.id_usuario_agendamento,
            id_status_agendamento: 4,
            data_hora_agendamento: agendamentos.data_hora_agendamento,
            data_hora_solicitada: "",
            data_publicacao: agora,
            createAt: agora,
            updateAt: agora,
            status_agendamento: true
        })

        // listando usuarios
        let usuario = await Usuario.findOne({
            where:{
                id: agendamentos.id_usuario_agendamento
            }
        })

        let lista = []
        lista.push({
            id_curso: cursoAgendado.id,
            curso: cursoAgendado.curso,
            carga: cursoAgendado.carga_horaria,
            data_hora: cursoAgendado.data_hora,
            aluno: usuario.nome_usuario
        })
 
        res.render("startCourse", { usuarios: req.session.usuario, list:lista[0]})
    },
    start_course: async(req,res,next) =>{
        let { id_curso } = req.params

        let curso_p = await CursoPublicado.findOne({
            where:{
                id: id_curso
            }
        })

        await curso_p.update({
            id_status_curso: 5
        })
        res.redirect("/pages/create/publicated/started")
    },
    finish: async(req, res, next) =>{
        let { id_curso } = req.params
        
        /* buscar os cursos agendados */
        let cursoAgendado = await CursoPublicado.findOne({
            where: {
                id: id_curso
            }
        })

        let agendamentos = await CursoAgendado.findOne({
            where: {
                id_curso_publicado: id_curso
            }
        })

        // listando usuarios
        let usuario = await Usuario.findOne({
            where:{
                id: agendamentos.id_usuario_agendamento
            }
        })

        let lista = []
        lista.push({
            id_curso: cursoAgendado.id,
            curso: cursoAgendado.curso,
            carga: cursoAgendado.carga_horaria,
            data_hora: cursoAgendado.data_hora,
            aluno: usuario.nome_usuario
        })
 
        res.render("finishCourse", { usuarios: req.session.usuario, list:lista[0]})
    },
    finish_course: async(req,res,next) =>{
        let { id_curso } = req.params

        let curso_p = await CursoPublicado.findOne({
            where:{
                id: id_curso
            }
        })

        curso_p.update({
            id_status_curso: 1
        })

        let agendamentos = await CursoAgendado.update({
            status_agendamento: false},
            {
                where: {
                id_curso_publicado: id_curso
            }
        })

        let agendado = await CursoAgendado.findOne({
            where: {
                id_curso_publicado: id_curso
            }
        })

        await CursoAgendado.create({
            id_curso_publicado: agendado.id_curso_publicado,
            id_usuario_agendamento: agendado.id_usuario_agendamento,
            id_status_agendamento: 5,
            data_hora_agendamento: agendado.data_hora_agendamento,
            data_hora_solicitada: "",
            data_publicacao: agora,
            createAt: agora,
            updateAt: agora,
            status_agendamento: true
        })

        /* enviar mensagem de conclusão do curso */
        await Message.create({
            id_curso: id_curso,
            mensagem: mensagens.conclusaoCursoAluno,
            de: "",
            para: agendado.id_usuario_agendamento,
            lida: false,
            tipo: "SISTEMA"
        })

        await Message.create({
            id_curso: id_curso,
            mensagem: mensagens.conclusaoCursoProfessor,
            de: "",
            para: curso_p.id_usuario,
            lida: false,
            tipo: "SISTEMA"
        })

        /* inserir coin para o professor*/
        await TempoEnsinandoAprendendo.create({
            id_curso: id_curso,
            id_usuario: curso_p.id_usuario,
            tipo: "ENSINANDO - "+curso_p.curso,
            coin: curso_p.coin
        })

        /* inserir coin para o aluno*/
        await TempoEnsinandoAprendendo.create({
            id_curso: id_curso,
            id_usuario: agendado.id_usuario_agendamento,
            tipo: "APRENDENDO - "+curso_p.curso,
            coin: curso_p.coin
        })



        res.redirect("/pages/create/publicated/finished")
    },
    myCourses: async(req, res, next)=>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: cursos} = await CursoPublicado.findAndCountAll({
            where: {
                id_status_curso: 2
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });
        
        let totalPages = Math.ceil(size / limit);         

        let agendamentos = await CursoAgendado.findAll({
            where:{
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 1,
                status_agendamento: true
            }
        })
        
        let listaCursos = []
        let listaAgendamentos = []
        let cursosAgendados = []

        cursos.forEach(element =>{
            cursosAgendados.push({
                id: element.id,
                curso: element.curso
            })
        })

        agendamentos.forEach(agendamento =>{
            listaAgendamentos.push({
                id_usuario_agendamento: agendamento.id_usuario_agendamento,
                id_status_agendamento: agendamento.id_status_agendamento,
                id_curso_publicado: agendamento.id_curso_publicado
            }) 

        })
 
        for(let i = 0; i < listaAgendamentos.length; i++){
            for(let j = 0; j < cursos.length; j++){
                if(listaAgendamentos[i].id_curso_publicado === cursos[j].id){
                    listaCursos.push({
                        id:cursos[j].id,
                        curso:cursos[j].curso,
                        carga_horaria:cursos[j].carga_horaria,
                        coin:cursos[j].coin,
                        data_hora:cursos[j].data_hora,
                        descricao:cursos[j].descricao,
                        id_usuario:cursos[j].id_usuario,
                        nome_usuario: cursos[j].nome_usuario,
                    })
                }
            }
        }         
            if(typeof(listaCursos) == "undefined"){
                listaCursos = {
                    id:"",
                    curso: "",
                    carga_horaria:"",
                    coin:""
                }
                res.render("mySchedules",{usuarios: req.session.usuario, listaCursos})
            }

        res.render("mySchedules",{usuarios: req.session.usuario, page, totalPages, listaCursos})
    },
    startedCourses: async(req, res, next)=>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: cursos} = await CursoPublicado.findAndCountAll({
            where: {
                id_status_curso: 5
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });
        console.log("cursos:" + cursos);
        let totalPages = Math.ceil(size / limit);         

        let agendamentos = await CursoAgendado.findAll({
            where:{
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 4
            }
        })
        
        console.log("agendamentos:" + agendamentos);

        let listaCursos = []
        let listaAgendamentos = []
        let cursosAgendados = []

        cursos.forEach(element =>{
            cursosAgendados.push({
                id: element.id,
                curso: element.curso
            })
        })

        agendamentos.forEach(agendamento =>{
            listaAgendamentos.push({
                id_usuario_agendamento: agendamento.id_usuario_agendamento,
                id_status_agendamento: agendamento.id_status_agendamento,
                id_curso_publicado: agendamento.id_curso_publicado
            }) 

        })
 
        for(let i = 0; i < listaAgendamentos.length; i++){
            for(let j = 0; j < cursos.length; j++){
                if(listaAgendamentos[i].id_curso_publicado === cursos[j].id){
                    listaCursos.push({
                        id:cursos[j].id,
                        curso:cursos[j].curso,
                        carga_horaria:cursos[j].carga_horaria,
                        coin:cursos[j].coin,
                        data_hora:cursos[j].data_hora,
                        descricao:cursos[j].descricao,
                        id_usuario:cursos[j].id_usuario,
                        nome_usuario: cursos[j].nome_usuario,
                    })
                }
            }
        }         
            if(typeof(listaCursos) == "undefined"){
                listaCursos = {
                    id:"",
                    curso: "",
                    carga_horaria:"",
                    coin:""
                }
                res.render("startedCourses",{usuarios: req.session.usuario, listaCursos})
            }

        res.render("startedCourses",{usuarios: req.session.usuario, page, totalPages, listaCursos})
    },
    canceledSchedule: async(req, res, next)=>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: agendamentos} = await CursoAgendado.findAndCountAll({
            where: {
                id_status_agendamento: 2,
                status_agendamento: true,
                id_usuario_agendamento: req.session.usuario.id
            },
            order: ['id'],
            limit: limit,
            offset: ((page - 1) * limit)
          });

          

        let totalPages = Math.ceil(size / limit);         

        let cursos = await CursoPublicado.findAll()
        
        let listaCursos = []
        let listaAgendamentos = []
        let cursosAgendados = []

        cursos.forEach(element =>{
            cursosAgendados.push({
                id: element.id,
                curso: element.curso
            })
        })

        agendamentos.forEach(agendamento =>{
            listaAgendamentos.push({
                id_usuario_agendamento: agendamento.id_usuario_agendamento,
                id_status_agendamento: agendamento.id_status_agendamento,
                id_curso_publicado: agendamento.id_curso_publicado
            }) 

        })
 
        for(let i = 0; i < listaAgendamentos.length; i++){
            for(let j = 0; j < cursos.length; j++){
                if(listaAgendamentos[i].id_curso_publicado === cursos[j].id){
                    listaCursos.push({
                        id:cursos[j].id,
                        curso:cursos[j].curso,
                        carga_horaria:cursos[j].carga_horaria,
                        coin:cursos[j].coin,
                        data_hora:cursos[j].data_hora,
                        descricao:cursos[j].descricao,
                        id_usuario:cursos[j].id_usuario,
                        nome_usuario: cursos[j].nome_usuario,
                    })
                }
            }
        }
        
        if(typeof(listaCursos) == "undefined"){
            listaCursos = {
                id:"",
                curso: "",
                carga_horaria:"",
                coin:""
            }
            res.render("canceledSchedule",{usuarios: req.session.usuario, listaCursos})
        }

        res.render("canceledSchedule",{usuarios: req.session.usuario, page, totalPages, listaCursos})
    },
    cancelSchedule: async(req, res, next)=>{
        let { id_curso } = req.params
        
        let curso = await CursoPublicado.update(
            {id_status_curso: 1},
            {
                where:{
                    id: id_curso
                }
            })

            let agendamentos = await CursoAgendado.update(
                {status_agendamento: false},
                {
                    where: {
                        id_usuario_agendamento: req.session.usuario.id,
                        id_curso_publicado: id_curso
                }
            })

            let agendado = await CursoAgendado.findOne({
                where:{
                    id_curso_publicado: id_curso,
                    id_usuario_agendamento: req.session.usuario.id
                }
            })
           
            await CursoAgendado.create({
                id_curso_publicado: agendado.id_curso_publicado,
                id_usuario_agendamento: agendado.id_usuario_agendamento,
                id_status_agendamento: 2,
                data_hora_agendamento: agendado.data_hora_agendamento,
                data_hora_solicitada: "",
                data_publicacao: agora,
                createAt: agora,
                updateAt: agora,
                status_agendamento: true
            })
        res.redirect("/pages/create/learnCourses")
    },
    finishedSchedule: async(req, res, next)=>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: agendamentos} = await CursoAgendado.findAndCountAll({
        where: {
            id_status_agendamento: 5,
            status_agendamento: true,
            id_usuario_agendamento: req.session.usuario.id
        },
        order: ['id'],
        limit: limit,
        offset: ((page - 1) * limit)
      });

      

    let totalPages = Math.ceil(size / limit);         

    let cursos = await CursoPublicado.findAll({
        where:{
            id_status_curso:
            {[Op.ne]:[4]} 
        }
    })
    
    let listaCursos = []
    let listaAgendamentos = []
    let cursosAgendados = []

    cursos.forEach(element =>{
        cursosAgendados.push({
            id: element.id,
            curso: element.curso
        })
    })

    agendamentos.forEach(agendamento =>{
        listaAgendamentos.push({
            id_usuario_agendamento: agendamento.id_usuario_agendamento,
            id_status_agendamento: agendamento.id_status_agendamento,
            id_curso_publicado: agendamento.id_curso_publicado
        })

    })

    for(let i = 0; i < listaAgendamentos.length; i++){
        for(let j = 0; j < cursos.length; j++){
            if(listaAgendamentos[i].id_curso_publicado === cursos[j].id){
                listaCursos.push({
                    id:cursos[j].id,
                    curso:cursos[j].curso,
                    carga_horaria:cursos[j].carga_horaria,
                    coin:cursos[j].coin,
                    data_hora:cursos[j].data_hora,
                    descricao:cursos[j].descricao,
                    id_usuario:cursos[j].id_usuario,
                    nome_usuario: cursos[j].nome_usuario,
                })
            }
        }
    }
    
    if(typeof(listaCursos) == "undefined"){
        listaCursos = {
            id:"",
            curso: "",
            carga_horaria:"",
            coin:""
        }
        res.render("finishedSchedule",{usuarios: req.session.usuario, listaCursos})
    }

    res.render("finishedSchedule",{usuarios: req.session.usuario, page, totalPages, listaCursos})
    },
    message: async(req, res, next)=>{
        let { page = 1 } = req.query;
        page = parseInt(page)
        
        let {count: size, rows: curso} = await CursoPublicado.findAndCountAll({
            where: {
                id_status_curso:
                    {[Op.ne]:[4]}
            },
            order: ['id'],
            limit: limitMsg,
            offset: ((page - 1) * limitMsg)
          });

        let totalPages = Math.ceil(size / limitMsg);         

        let agendamento = await CursoAgendado.findAll({
            where:{
                status_agendamento: true
            }
        })

        let message = await Message.findAll({
            where:{
                para:req.session.usuario.id
            }
        })

        let mensagens = []

        for(let j = 0; j< curso.length; j++){
            for(let i = 0; i< message.length; i++){
                for(let k =0; k< agendamento.length; k++){
                    if(message[i].id_curso == curso[j].id && message[i].id_curso == agendamento[k].id_curso_publicado || message[i].id_curso == 0){
                        mensagens.push({
                            id_curso: curso[j].id,
                            curso: curso[j].curso,
                            carga_horaria: curso[j].carga_horaria,
                            coin: curso[j].coin,
                            data_hora: curso[j].data_hora,
                            descricao: curso[j].descricao,
                            professor: curso[j].nome_usuario,
                            data_hora_solicitada: agendamento[k].data_hora_solicitada,
                            id_mensagem: message[i].id,
                            mensagem: message[i].mensagem,
                            lida: message[i].lida,
                            id_curso_mensagem: message[i].id_curso
                        })
                    }
                }
            }
        }
        
        let msg = []
        mensagens.forEach(msgs =>{
            msg.push({
                curso: msgs.mensagem,
                id_curso: msgs.id_curso_mensagem
            })
        })
        console.log(msg);
        
            console.log("mensagens: "+mensagens);

            if(typeof(mensagens) == "undefined"){
                mensagens = {
                    curso: "",
                    carga_horaria: "",
                    coin: "",
                    data_hora: "",
                    descricao: "",
                    professor: "",
                    data_hora_solicitada: "",
                    id_mensagem: "",
                    mensagem: "",
                    lida: false
                }
                res.render("messages",{usuarios: req.session.usuario, page, totalPages, mensagens})
            }   
            res.render("messages",{usuarios: req.session.usuario, page, totalPages, mensagens})
    },
    messageChecked: async(req, res, next)=>{
        let { id_message } = req.params

        let mensagem = await Message.findOne({
            where:{
                id: id_message
            }
        }) 

        console.log(id_message);
        
        if(mensagem.lida == false){
            await mensagem.update({
                lida: true
            })
        }else{
            await mensagem.update({
                lida: false
            })
        }
        
        res.redirect("/pages/create/message")
    },
    sendMessageDados: async(req, res, next)=>{
        let { id_curso } = req.params
        
        let curso = await CursoPublicado.findOne({
            where:{
                id: id_curso
            }
        })

        res.render("sendMessage", {usuarios: req.session.usuario, curso})
    },
    sendMessage: async(req, res, next) =>{
        let { id_curso, mensagem, usuario_id} = req.body
        console.log("idCurso: "+id_curso+"Mensagem: "+mensagem+"Usuario ID: "+usuario_id);    
        await Message.create({
                id_curso: id_curso,
                mensagem: mensagem,
                de: req.session.usuario.id,
                para: usuario_id,
                lida: false,
                tipo: "PROFESSOR"
             })
             res.rendirect("/pages/create/message")
        },
        readMessages: async(req, res, next)=>{
            let { page = 1 } = req.query;
            page = parseInt(page)
            
            let {count: size, rows: curso} = await CursoPublicado.findAndCountAll({
                where: {
                    id_status_curso:
                        {[Op.ne]:[4]}
                },
                order: ['id'],
                limit: limitMsg,
                offset: ((page - 1) * limitMsg)
              });
    
            let totalPages = Math.ceil(size / limitMsg);         
    
            let agendamento = await CursoAgendado.findAll({
                where:{
                    status_agendamento: true
                }
            })
    
            let message = await Message.findAll({
                where:{
                    para:req.session.usuario.id,
                    lida: true
                }
            })
    
            let mensagens = []
    
            for(let j = 0; j< curso.length; j++){
                for(let i = 0; i< message.length; i++){
                    for(let k =0; k< agendamento.length; k++){
                        if(message[i].id_curso == curso[j].id && message[i].id_curso == agendamento[k].id_curso_publicado || message[i].id_curso == 0){
                            mensagens.push({
                                id_curso: curso[j].id,
                                curso: curso[j].curso,
                                carga_horaria: curso[j].carga_horaria,
                                coin: curso[j].coin,
                                data_hora: curso[j].data_hora,
                                descricao: curso[j].descricao,
                                professor: curso[j].nome_usuario,
                                data_hora_solicitada: agendamento[k].data_hora_solicitada,
                                id_mensagem: message[i].id,
                                mensagem: message[i].mensagem,
                                lida: message[i].lida,
                                id_curso_mensagem: message[i].id_curso
                            })
                        }
                    }
                }
            }
            
            let msg = []
            mensagens.forEach(msgs =>{
                msg.push({
                    curso: msgs.mensagem,
                    id_curso: msgs.id_curso_mensagem
                })
            })
            console.log(msg);
            
                console.log("mensagens: "+mensagens);
    
                if(typeof(mensagens) == "undefined"){
                    mensagens = {
                        curso: "",
                        carga_horaria: "",
                        coin: "",
                        data_hora: "",
                        descricao: "",
                        professor: "",
                        data_hora_solicitada: "",
                        id_mensagem: "",
                        mensagem: "",
                        lida: false
                    }
                    res.render("readMessages",{usuarios: req.session.usuario, page, totalPages, mensagens})
                }   
                res.render("readMessages",{usuarios: req.session.usuario, page, totalPages, mensagens})
    },
    unreadMessages: async(req, res, next)=>{
        let { page = 1 } = req.query;
            page = parseInt(page)
            
            let {count: size, rows: curso} = await CursoPublicado.findAndCountAll({
                where: {
                    id_status_curso:
                        {[Op.ne]:[4]}
                },
                order: ['id'],
                limit: limitMsg,
                offset: ((page - 1) * limitMsg)
              });
    
            let totalPages = Math.ceil(size / limitMsg);         
    
            let agendamento = await CursoAgendado.findAll({
                where:{
                    status_agendamento: true
                }
            })
    
            let message = await Message.findAll({
                where:{
                    para:req.session.usuario.id,
                    lida: false
                }
            })
    
            let mensagens = []
    
            for(let j = 0; j< curso.length; j++){
                for(let i = 0; i< message.length; i++){
                    for(let k =0; k< agendamento.length; k++){
                        if(message[i].id_curso == curso[j].id && message[i].id_curso == agendamento[k].id_curso_publicado || message[i].id_curso == 0){
                            mensagens.push({
                                id_curso: curso[j].id,
                                curso: curso[j].curso,
                                carga_horaria: curso[j].carga_horaria,
                                coin: curso[j].coin,
                                data_hora: curso[j].data_hora,
                                descricao: curso[j].descricao,
                                professor: curso[j].nome_usuario,
                                data_hora_solicitada: agendamento[k].data_hora_solicitada,
                                id_mensagem: message[i].id,
                                mensagem: message[i].mensagem,
                                lida: message[i].lida,
                                id_curso_mensagem: message[i].id_curso
                            })
                        }
                    }
                }
            }
            
            let msg = []
            mensagens.forEach(msgs =>{
                msg.push({
                    curso: msgs.mensagem,
                    id_curso: msgs.id_curso_mensagem
                })
            })
            console.log(msg);
            
                console.log("mensagens: "+mensagens);
    
                if(typeof(mensagens) == "undefined"){
                    mensagens = {
                        curso: "",
                        carga_horaria: "",
                        coin: "",
                        data_hora: "",
                        descricao: "",
                        professor: "",
                        data_hora_solicitada: "",
                        id_mensagem: "",
                        mensagem: "",
                        lida: false
                    }
                    res.render("unreadMessages",{usuarios: req.session.usuario, page, totalPages, mensagens})
                }   
                res.render("unreadMessages",{usuarios: req.session.usuario, page, totalPages, mensagens})
    }
}

module.exports = pagesController;