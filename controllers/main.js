const {Op} = require('sequelize')
const { CoinUsuario, Message, StatusCurso, StatusAgendamento } = require("../models")

const statusCurso = [
    {sigla: "P", descricao_status: "PUBLICADO"},
    {sigla: "A", descricao_status: "AGENDADO"},
    {sigla: "AS", descricao_status: "AGUARDANDO SOLICITAÇÃO"},
    {sigla: "C", descricao_status: "CANCELADO"},
    {sigla: "I", descricao_status: "EM ANDAMENTO"},
    {sigla: "F", descricao_status: "CONCLUÍDO"},
]

const statusAgendamento = [
    {sigla_agendamento: "A", status_agendamento: "AGENDADO"},
    {sigla_agendamento: "C", status_agendamento: "CANCELADO"},
    {sigla_agendamento: "AS", status_agendamento: "AGUARDANDO SOLICITAÇÃO"},
    {sigla_agendamento: "I", status_agendamento: "EM ANDAMENTO"},
    {sigla_agendamento: "F", status_agendamento: "CONCLUÍDO"},
]

const mainController = { 
    index:async (req, res, next) =>{
        // const cadastroStatusCurso = await StatusCurso.findAll()
        // const cadastroStatusAgendamento = await StatusAgendamento.findAll()
        // /* incluir itens padões no banco de dados ao iniciar o sistema */

        // if(cadastroStatusCurso.length === 0){
        //     statusCurso.forEach(stCurso =>{
        //         let incluirStatusCurso = StatusCurso.create({
        //             sigla: stCurso.sigla,
        //             descricao_status: stCurso.descricao_status
        //         })
        //     })
        //     console.log("Dados da tabela StatusCurso incluidos com sucesso!");
        // }

        // if(cadastroStatusAgendamento.length === 0){
        //     statusAgendamento.forEach(stAgendamento =>{
        //         let incluirStatusAgendamento = StatusAgendamento.create({
        //             sigla_agendamento: stAgendamento.sigla_agendamento,
        //             status_agendamento: stAgendamento.status_agendamento
        //         })
        //     })
        //     console.log("Dados da tabela StatusAgendamento incluidos com sucesso!");
        // }
        res.render('index')
    },
    main:async(req, res, next) => {
        req.session.usuario.coin = await CoinUsuario.sum('coin',{
            where: {id_usuario: req.session.usuario.id}
        })

        let message = await Message.findAll({
            where:{
                para: req.session.usuario.id,
                lida: false
            }
        })

        req.session.usuario.msg = message.length

        res.render('main',{usuarios: req.session.usuario})
    },
    knowMore: (req, res, next) => {
        res.render('knowMore')
    }
}

module.exports = mainController;