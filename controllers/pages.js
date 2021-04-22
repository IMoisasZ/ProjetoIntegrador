const { CursoPublicado, Usuario, CursoAgendado, CoinUsuario, StatusCurso } = require('../models')
const {Op} = require('sequelize')
const { check, validationResult, body } = require('express-validator')
const moment = require('moment')
const agora = new Date()
const limit  = 4

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
                id_status_agendamento: 1
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
                id_status_agendamento:
                {[Op.or]:[1,3]}
            }
        })

        /* buscar os cursos agendados */
        let cursoAgendado = await CursoPublicado.findAll({
            where:{
                id_status_curso:
                {[Op.or]:[2,3]}
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

        let status = ""
        if(listaAgendamentos[idCurso].id_status_curso !== 3){
            status = "AGENDADO"
        }else{
            status = "AGUARDANDO SOLICITAÇÃO"
        }
        
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

        let cancelarAgendamento = await CursoAgendado.findOne({
            where:
            {
                id_curso_publicado: id_curso,
                id_usuario_agendamento: req.session.usuario.id
            }
        })

        await cancelarAgendamento.update({
                id_status_agendamento: 2
        })

        res.render("main",{usuarios: req.session.usuario})
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
            /* cria o agendamento "parcial" - aguardando liberação */
            let agendar = await CursoAgendado.create({
                id_curso_publicado: id_curso,
                id_usuario_agendamento: req.session.usuario.id,
                id_status_agendamento: 3,
                data_hora_agendamento: agora,
                data_hora_solicitada: data_hora_nova
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
        agendamentos.update({
            id_status_agendamento: 2
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
        
        let {count: size, rows: cursos} = await CursoPublicado.findAndCountAll({
            where: {
                id_usuario:req.session.usuario.id,
                id_status_curso: 6
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
                res.render("finished",{usuarios: req.session.usuario, erro: 1, listaCursos})
            }

        res.render("finished",{usuarios: req.session.usuario, page, totalPages, cursos})
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

        await curso_p.update({
            id_status_curso: 6
        })
        res.redirect("/pages/create/publicated/finished")
    },
}

module.exports = pagesController;