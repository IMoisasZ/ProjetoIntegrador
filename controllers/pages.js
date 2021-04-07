const { CursoPublicado, Usuario, CursoAgendado, CoinUsuario } = require('../models')
const {Op} = require('sequelize')

const pagesController = {
    
    learn:(req, res, next) => {
        res.render("learn",{usuarios: req.session.usuario})
    },
    schedules:(req, res, next) => {
        res.render("schedules",{usuarios: req.session.usuario})
    },
    new:async(req, res, next) => {
        let { idCurso = 0 } = req.query
        idCurso = parseInt(idCurso)
        let listaCursos = []
        let cursos = await CursoPublicado.findAll({
            where:{
                id_status_curso: 1
            //     id_usuario:
            //         [Op.ne]:[req.session.usuario.id]
            //     
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

        res.render("new",{usuarios: req.session.usuario, idCurso, totalCursos, listaCursos})
    },
    schedule: async(req, res, next) =>{
        let { coin, id_curso, nome_curso } = req.body
        let coinDebito = parseInt("-"+ coin)

        let agendar = await CursoAgendado.create({
            id_curso_publicado: id_curso,
            id_usuario_agendamento: req.session.usuario.id,
            id_status_agendamento: 1
        })

        let inclusao = await CoinUsuario.create({
            tipo: "A", /* A = Agendado */
            coin: coinDebito,
            caminho: id_curso + "-" + nome_curso,
            id_usuario: req.session.usuario.id
        })

        let atualizacao = await CursoPublicado.update({
            id_status_curso: 2},
            {
                where:{
                    id: id_curso
                }
            })

        res.redirect("/main")
    },
    teach:(req, res, next) => {
        res.render("teach",{usuarios: req.session.usuario})
    },
    requests:(req, res, next) => {
        res.render("requests",{usuarios: req.session.usuario})
    },
    create:(req, res, next) =>{
        res.render('create',{usuarios: req.session.usuario})
    },
    public: async (req, res, next) =>{
        let { curso, carga_horaria, coin, data_hora, descricao } = req.body
        let { files } = req
        let nomeUsuario = req.session.usuario.nome_usuario
        console.log(nomeUsuario);
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

        console.log(req.session.usuario.nome_usuario)


        res.render('create', {usuarios: req.session.usuario})
    }
}

module.exports = pagesController;