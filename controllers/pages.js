const { CursoPublicado, Usuario } = require('../models')
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
            // where:{
            //     id_usuario:{
            //         [Op.ne]:[req.session.usuario.id]
            //     }
            });

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