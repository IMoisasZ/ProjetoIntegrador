const {
	CursoPublicado,
	Usuario,
	CursoAgendado,
	CoinUsuario,
	StatusCurso,
	StatusAgendamento,
	Message,
	TempoEnsinandoAprendendo,
} = require('../models')
const { Op } = require('sequelize')
const { check, validationResult, body } = require('express-validator')
const moment = require('moment')

moment.locale('pt-BR')
const agora = new Date()

const limit = 6
const limitMsg = 4
const mensagens = {
	novoAgendamentoAluno:
		'Obrigado por se cadastrar no curso! Qualquer duvida fale com o professor!',
	novoAgendamentoProfessor: 'O curso que você publicou foi agendado!',
	solcitarAlteracaoAluno:
		'Sua solicitação de alteração foi enviada com sucesso!Assim que o professor analisar sua proposta, você receberá uma notificação!',
	solcitarAlteracaoProfessor:
		'Você recebeu uma solicitação de alteração de data/hora! verifique se é possivel aceitar!',
	conclusaoCursoAluno:
		'Parabéns! Você terminou o curso. Bora fazer mais um? Ou, porque não publicar um curso e ensiar outras pessoas! CONNEKT!!',
	conclusaoCursoProfessor:
		'Parabéns! Você acaba de ensinar uma pessoa! Vamos lá, publique mais um curso e bora ensinar!',
	iniciarCursoAluno: 'Seu curso foi iniciado! Bons estudos!',
	iniciarCursoProfessor: 'Você iniciou o curso!',
	cancelarCurso: 'Você cancelou o curso! Não desanima...bora publicar outro?',
	aceitarSolicitacaoAlteracaoDataHoraAluno:
		'Sua solicitação de alteração do curso foi aceita pelo professor. Verifique seus agendamentos!',
	aceitarSolicitacaoAlteracaoDataHoraProfessor:
		'Você aceitou a solicitação de alteração de data e hora feita pelo aluno! Bora ensinar!',
	recusarSolicitaçãoAlteracaoDataHoraAluno:
		'Infelizmente sua solicitação de alteração de data e hora foi recusada! Não desita, tente outro curso!!',
	recusarSolicitaçãoAlteracaoDataHoraProfessor:
		'Você recusou a solicitação de alteração de data e hora feita pelo aluno!',
	debitoCoinsProfessor:
		'Os coins referente ao curso, foram debitados da sua conta e devolvidos ao aluno!',
	creditoCoinsAluno: 'Os coins pagos pelo curso, foram devolvidos a sua conta!',
	agendamentoCanceladoPeloAlunoProfessor:
		'O aluno cancelou o agendamento do curso',
	agendamentoCanceladoPeloAlunoAluno:
		'Você cancelou o agendamento. Vamos lá, não desanima!',
	cancelamentoAgendamentoCursoProfessor:
		'Você cancelou o curso. Os coin(s) pagos pelo curso serão devolvidos ao aluno!',
	cancelamentoAgendamentoCursoAluno:
		'O professor cancelou o curso! Os coin(s) pagos pelo curso foram devolvidos a sua conta!',
}

const pagesController = {
	learn: async (req, res, next) => {
		let cursos = await CursoPublicado.findAll({
			where: {
				id_status_curso: 1,
				id_usuario: { [Op.ne]: [req.session.usuario.id] },
			},
		})

		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_usuario_agendamento: req.session.usuario.id,
				id_status_agendamento: 5,
				status_agendamento: true,
			},
		})

		let c = cursos.length
		let a = agendamentos.length

		if (c > 0) {
			c = 'ok'
		}

		if (a > 0) {
			a = 'ok'
		}

		return res.render('learn', { usuarios: req.session.usuario, c, a })
	},
	schedules: async (req, res, next) => {
		let { idCurso = 0 } = req.query
		idCurso = parseInt(idCurso)
		/* buscar agendamentos no banco */
		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_usuario_agendamento: req.session.usuario.id,
				id_status_agendamento: 5,
			},
		})

		/* buscar os cursos agendados */
		let cursoAgendado = await CursoPublicado.findAll({
			where: {
				id_status_curso: 3,
			},
		})

		/* listar os agendamentas em um objeto */
		let listaAgendamentos = []
		for (let i = 0; i < agendamentos.length; i++) {
			for (let j = 0; j < cursoAgendado.length; j++) {
				if (cursoAgendado[j].id == agendamentos[i].id_curso_publicado) {
					let data_brasil = moment(cursoAgendado[j].data_hora).format('llll')
					let data_brasil_solicitada = moment(
						agendamentos[i].data_hora_solicitada
					).format('llll')
					listaAgendamentos.push({
						id_agendamento: agendamentos[i].id,
						id_usuario: req.session.usuario.id,
						nome_usuario: req.session.usuario.nome_usuario,
						id_curso_agendamento: cursoAgendado[j].id,
						curso: cursoAgendado[j].curso,
						carga_horaria: cursoAgendado[j].carga_horaria,
						coin: cursoAgendado[j].coin,
						data_hora: cursoAgendado[j].data_hora,
						data_hora_brasil: data_brasil,
						data_hora_brasil_solicitada: data_brasil_solicitada,
						descricao: cursoAgendado[j].descricao,
						id_usuario_publicador: cursoAgendado[j].id_usuario,
						nome_usuario_publicador: cursoAgendado[j].nome_usuario,
						id_status_curso: cursoAgendado[j].id_status_curso,
					})
				}
			}
		}

		let status = 'AGUARDANDO SOLICITAÇÃO'

		let totalAgendamentos = listaAgendamentos.length
		if (typeof idCurso == 'undefined') {
			listaAgendamentos = listaCursos[0]
		} else {
			listaAgendamentos = listaAgendamentos[idCurso]
		}

		res.render('schedules', {
			usuarios: req.session.usuario,
			listaAgendamentos,
			idCurso,
			totalAgendamentos,
			status,
		})
	},
	// cancelar agendamentos
	cancel: async (req, res, next) => {
		let { id_curso } = req.body

		let cursoDisponivel = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		await cursoDisponivel.update({
			id_status_curso: 1,
		})

		let agendamentos = await CursoAgendado.update(
			{ status_agendamento: false },
			{
				where: {
					id_usuario_agendamento: req.session.usuario.id,
					id_curso_publicado: id_curso,
					status_agendamento: true,
				},
			}
		)

		await CursoAgendado.create({
			id_curso_publicado: agendamentos.id_curso_publicado,
			id_usuario_agendamento: agendamentos.id_usuario_agendamento,
			id_status_agendamento: 2,
			data_hora_agendamento: agendamentos.data_hora_agendamento,
			data_hora_solicitada: '',
			data_publicacao: agora,
			createAt: agora,
			updateAt: agora,
			status_agendamento: true,
		})

		res.render('learnCourses', { usuarios: req.session.usuario })
	},
	new: async (req, res, next) => {
		let { idCurso = 0 } = req.query
		idCurso = parseInt(idCurso)
		let listaCursos = []
		let cursos = await CursoPublicado.findAll({
			where: {
				id_status_curso: 1,
				id_usuario: { [Op.ne]: [req.session.usuario.id] },
			},
		})

		cursos.forEach((curso) => {
			let data_brasil = moment(curso.data_hora).format('llll')
			listaCursos.push({
				id: curso.id,
				curso: curso.curso,
				carga_horaria: curso.carga_horaria,
				coin: curso.coin,
				data_hora: curso.data_hora,
				data_hora_brasil: data_brasil,
				descricao: curso.descricao,
				id_usuario: curso.id_usuario,
				nome_usuario: curso.nome_usuario,
			})
		})

		let totalCursos = cursos.length
		if (typeof idCurso == 'undefined') {
			listaCursos = listaCursos[0]
		} else {
			listaCursos = listaCursos[idCurso]
		}

		/*não passar para outra pagina caso não tenha disponibilidade de curso*/
		let cursosPublicados = ''
		if (totalCursos == 0) {
			cursosPublicados = 0
			res.render('main', { usuarios: req.session.usuario, cursosPublicados })
		}

		let saldo = 'OK'
		if (req.session.usuario.coin < listaCursos.coin) {
			saldo = 'NOK' /* não é possivel comprar curso - sem saldo*/
		}

		res.render('new', {
			usuarios: req.session.usuario,
			idCurso,
			totalCursos,
			listaCursos,
			cursosPublicados,
			saldo,
		})
	},
	schedule: async (req, res, next) => {
		let { coin, id_curso, nome_curso, data_hora_nova, id_usuario } = req.body
		let coinDebito = coin - coin - coin
		/* caso não teve solicitação de alteração de data do curso executa o if */
		/* caso sim executa o else */
		let curso = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		if (data_hora_nova.length == 0 || typeof data_hora_nova == 'undefined') {
			/* criar agendamento */
			let agendar = await CursoAgendado.create({
				id_curso_publicado: id_curso,
				id_usuario_agendamento: req.session.usuario.id,
				id_status_agendamento: 1,
				data_hora_agendamento: curso.data_hora,
				data_hora_solicitada: '',
				data_publicacao: agora,
				createdAt: agora,
				updatedAt: agora,
				status_agendamento: true,
			})

			/* debitar os coins - aprender */
			let incluirDebito = await CoinUsuario.create({
				tipo: 'A' /* A = Agendado */,
				coin: coinDebito,
				caminho: id_curso + '-' + nome_curso,
				id_usuario: req.session.usuario.id,
			})

			/* creditar os coins - ensinar */
			let incluirCredito = await CoinUsuario.create({
				tipo: 'A' /* A = Agendado */,
				coin: coin,
				caminho: id_curso + '-' + nome_curso,
				id_usuario: id_usuario,
			})

			/* alterar os status do curso para agendado = 2 */
			let atualizacao = await CursoPublicado.update(
				{
					id_status_curso: 2,
					id_agendamento: agendar.id,
				},
				{
					where: {
						id: id_curso,
					},
				}
			)

			/*mensages*/

			await Message.create({
				id_curso: id_curso,
				mensagem: mensagens.novoAgendamentoProfessor,
				de: req.session.usuario.id,
				para: curso.id_usuario,
				lida: false,
				tipo: 'PROFESSOR',
			})

			await Message.create({
				id_curso: id_curso,
				mensagem: mensagens.novoAgendamentoAluno,
				de: curso.id_usuario,
				para: req.session.usuario.id,
				lida: false,
				tipo: 'ALUNO',
			})
		} else {
			await CursoAgendado.update(
				{
					status_agendamento: false,
				},
				{
					where: {
						id_curso_publicado: id_curso,
					},
				}
			)

			/* cria o agendamento "parcial" - aguardando liberação */
			let agendar = await CursoAgendado.create({
				id_curso_publicado: id_curso,
				id_usuario_agendamento: req.session.usuario.id,
				id_status_agendamento: 5,
				data_hora_agendamento: curso.data_hora,
				data_hora_solicitada: data_hora_nova,
				data_publicacao: agora,
				createAt: agora,
				updateAt: agora,
				status_agendamento: true,
			})

			/* altera o status do curso para aguardando solicitação*/
			let atualizacao = await CursoPublicado.update(
				{
					id_status_curso: 3,
					id_agendamento: agendar.id,
				},
				{
					where: {
						id: id_curso,
					},
				}
			)

			/* debitar os coins - aprender */
			let incluirDebito = await CoinUsuario.create({
				tipo: 'A' /* A = Agendado */,
				coin: coinDebito,
				caminho: id_curso + '-' + nome_curso + ' - AGUARDANDO SOLICITAÇÃO',
				id_usuario: req.session.usuario.id,
			})

			/* creditar os coins - ensinar */
			let incluirCredito = await CoinUsuario.create({
				tipo: 'A' /* A = Agendado */,
				coin: coin,
				caminho: id_curso + '-' + nome_curso + ' - AGUARDANDO SOLICITAÇÃO',
				id_usuario: id_usuario,
			})
			/*mensages*/
			// let curso = await CursoPublicado.findOne({
			//     where:{
			//         id: id_curso
			//     }
			// })

			await Message.create({
				id_curso: id_curso,
				mensagem: mensagens.solcitarAlteracaoProfessor,
				de: req.session.usuario.id,
				para: curso.id_usuario,
				lida: false,
				tipo: 'ALUNO',
			})

			await Message.create({
				id_curso: id_curso,
				mensagem: mensagens.solcitarAlteracaoAluno,
				de: curso.id_usuario,
				para: req.session.usuario.id,
				lida: false,
				tipo: 'PROFESSOR',
			})
		}
		res.redirect('/main')
	},
	teach: async (req, res, next) => {
		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_status_agendamento: 5,
				status_agendamento: true,
				id_usuario_agendamento: { [Op.ne]: [req.session.usuario.id] },
			},
		})

		let cursos = await CursoPublicado.findAll({
			where: {
				id_usuario: req.session.usuario.id,
			},
		})

		let b = agendamentos.length

		let c = cursos.length

		res.render('teach', { usuarios: req.session.usuario, b, c })
	},
	requests: async (req, res, next) => {
		let { idCurso = 0 } = req.query
		idCurso = parseInt(idCurso)
		/* buscar agendamentos no banco */

		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_status_agendamento: 5,
				id_usuario_agendamento: { [Op.ne]: [req.session.usuario.id] },
			},
		})

		let usuarioCurso = await Usuario.findAll({
			where: {
				id: { [Op.ne]: [req.session.usuario.id] },
			},
		})

		/* buscar os cursos agendados aguardando confirmação de alteração de data */
		let cursoAgendado = await CursoPublicado.findAll({
			where: { id_status_curso: 3 },
		})

		/* listar os agendamentas em um objeto */
		let listaAgendamentos = []
		for (let i = 0; i < agendamentos.length; i++) {
			for (let j = 0; j < cursoAgendado.length; j++) {
				for (let k = 0; k < usuarioCurso.length; k++)
					if (
						cursoAgendado[j].id == agendamentos[i].id_curso_publicado &&
						usuarioCurso[k].id == agendamentos[i].id_usuario_agendamento
					) {
						let data_brasil_agendado = moment(
							agendamentos[i].data_hora_agendamento
						).format('llll')
						let data_brasil_solicitado = moment(
							agendamentos[i].data_hora_solicitada
						).format('llll')
						listaAgendamentos.push({
							id_usuario_curso: usuarioCurso[k].id,
							nome_usuario_curso: usuarioCurso[k].nome_usuario,
							id_agendamento: agendamentos[i].id,
							id_curso_agendamento: cursoAgendado[j].id,
							curso: cursoAgendado[j].curso,
							carga_horaria: cursoAgendado[j].carga_horaria,
							coin: cursoAgendado[j].coin,
							id_curso_publicado: cursoAgendado[j].id_curso_publicado,
							data_hora: agendamentos[i].data_hora_agendamento,
							data_hora_agendado_brasil: data_brasil_agendado,

							data_hora_solicitada: agendamentos[i].data_hora_solicitada,
							data_hora_solicitada_brasil: data_brasil_solicitado,

							descricao: cursoAgendado[j].descricao,
							id_usuario_publicador: cursoAgendado[j].id_usuario,
							nome_usuario_publicador: cursoAgendado[j].nome_usuario,
						})
					}
			}
		}

		let totalAgendamentos = listaAgendamentos.length
		if (typeof idCurso == 'undefined') {
			listaAgendamentos = listaCursos[0]
		} else {
			listaAgendamentos = listaAgendamentos[idCurso]
		}
		res.render('requests', {
			usuarios: req.session.usuario,
			listaAgendamentos,
			totalAgendamentos,
			idCurso,
		})
	},
	aceptSolicitation: async (req, res, next) => {
		let { id_curso_agendamento, id_usuario_curso, coin, curso } = req.body

		console.log('ID CURSO: ' + id_curso_agendamento)

		let agendamentos = await CursoAgendado.update(
			{ status_agendamento: false },
			{
				where: {
					id_curso_publicado: id_curso_agendamento,
				},
			}
		)

		let agendado = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso_agendamento,
			},
		})

		await CursoAgendado.create({
			id_curso_publicado: agendado.id_curso_publicado,
			id_usuario_agendamento: agendado.id_usuario_agendamento,
			id_status_agendamento: 1,
			data_hora_agendamento: agendado.data_hora_solicitada,
			data_hora_solicitada: agendado.data_hora_solicitada,
			data_publicacao: agendado.data_hora_agendamento,
			createdAt: agora,
			updateAt: agora,
			status_agendamento: true,
		})

		let cursoAgendado = await CursoPublicado.findOne({
			where: {
				id: id_curso_agendamento,
			},
		})

		cursoAgendado.update({
			id_status_curso: 2,
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

		await Message.create({
			id_curso: id_curso_agendamento,
			mensagem: mensagens.aceitarSolicitacaoAlteracaoDataHoraProfessor,
			de: '',
			para: req.session.usuario.id,
			lida: false,
			tipo: 'SISTEMA',
		})

		await Message.create({
			id_curso: id_curso_agendamento,
			mensagem: mensagens.aceitarSolicitacaoAlteracaoDataHoraAluno,
			de: req.session.usuario.id,
			para: agendamentos.id_usuario_agendamento,
			lida: false,
			tipo: 'PROFESSOR',
		})

		res.redirect('/main')
	},
	cancelSolicitation: async (req, res, next) => {
		let { id_curso_agendamento, id_usuario_curso, coin, curso } = req.body
		let coinDebito = coin - coin - coin
		let agendamentos = await CursoAgendado.update(
			{ status_agendamento: false },
			{
				where: {
					id_curso_publicado: id_curso_agendamento,
				},
			}
		)

		let agendado = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso_agendamento,
			},
		})

		await CursoAgendado.create({
			id_curso_publicado: agendado.id_curso_publicado,
			id_usuario_agendamento: agendado.id_usuario_agendamento,
			id_status_agendamento: 3,
			data_hora_agendamento: agendado.data_hora_agendamento,
			data_hora_solicitada: agendado.data_hora_solicitada,
			data_publicacao: agora,
			createdAt: agora,
			updateAt: agora,
			status_agendamento: true,
		})

		let cursoAgendado = await CursoPublicado.findOne({
			where: {
				id: id_curso_agendamento,
			},
		})

		cursoAgendado.update({
			id_status_curso: 1,
		})

		/* debitar os coins - aprender */
		/* devolver os coins ao aluno */
		let incluirDebito = await CoinUsuario.create({
			tipo: 'C' /* C = Cancelado - Solicitação de alteração de data e hora não aceita */,
			coin: coin,
			caminho: id_curso_agendamento + '-' + curso + ' - CANCELADO',
			id_usuario: id_usuario_curso,
		})

		/* creditar os coins - ensinar */
		let incluirCredito = await CoinUsuario.create({
			tipo: 'C' /* C = Cancelado - Solicitação de alteração de data e hora não aceita */,
			coin: coinDebito,
			caminho: id_curso_agendamento + '-' + curso + ' - CANCELADO',
			id_usuario: req.session.usuario.id,
		})

		// mensagem de recusa de solicitação para o professor
		await Message.create({
			id_curso: id_curso_agendamento,
			mensagem: mensagens.recusarSolicitaçãoAlteracaoDataHoraProfessor,
			de: '',
			para: req.session.usuario.id,
			lida: false,
			tipo: 'SISTEMA',
		})

		// mensagem de debito dos coins para do professor
		await Message.create({
			id_curso: id_curso_agendamento,
			mensagem: mensagens.debitoCoinsProfessor,
			de: '',
			para: req.session.usuario.id,
			lida: false,
			tipo: 'SISTEMA',
		})

		// mensagem de recusa de solicitação para o aluno
		await Message.create({
			id_curso: id_curso_agendamento,
			mensagem: mensagens.recusarSolicitaçãoAlteracaoDataHoraAluno,
			de: '',
			para: agendamentos.id_usuario_agendamento,
			lida: false,
			tipo: 'SISTEMA',
		})

		// mensagem de devolução dos coins para o aluno
		await Message.create({
			id_curso: id_curso_agendamento,
			mensagem: mensagens.creditoCoinsAluno,
			de: '',
			para: agendamentos.id_usuario_agendamento,
			lida: false,
			tipo: 'SISTEMA',
		})

		res.redirect('/main')
	},
	create: (req, res, next) => {
		res.render('create', { usuarios: req.session.usuario })
	},
	public: async (req, res, next) => {
		let { curso, carga_horaria, coin, data_hora, descricao } = req.body
		//let { files } = req

		let nomeUsuario = req.session.usuario.nome_usuario
		await CursoPublicado.create({
			data_publicacao: agora,
			curso: curso,
			carga_horaria: carga_horaria,
			coin: coin,
			caminho_imagem: '', //files[0].originalname,
			data_hora: data_hora,
			descricao: descricao,
			id_usuario: req.session.usuario.id,
			nome_usuario: nomeUsuario,
			id_status_curso: 1,
		})
		res.render('create', { usuarios: req.session.usuario, sucesso: true })
	},

	publicated: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: cursos } = await CursoPublicado.findAndCountAll({
			where: {
				id_usuario: req.session.usuario.id,
				id_status_curso: 1,
			},
			order: ['id'],
			limit: limit,
			offset: (page - 1) * limit,
		})

		let totalPages = Math.ceil(size / limit)

		let status = await StatusCurso.findAll()

		let listaCursos = []
		let statusCurso = []

		status.forEach((sts) => {
			statusCurso.push({
				id: sts.id,
				descricao: sts.descricao_status,
			})
		})

		for (let i = 0; i < statusCurso.length; i++) {
			for (let j = 0; j < cursos.length; j++) {
				if (statusCurso[i].id == cursos[j].id_status_curso) {
					let data_brasil = moment(cursos[j].data_hora).format('llll')
					listaCursos.push({
						id: cursos[j].id,
						curso: cursos[j].curso,
						carga_horaria: cursos[j].carga_horaria,
						coin: cursos[j].coin,
						data_hora: cursos[j].data_hora,
						data_brasil: data_brasil,
						descricao: cursos[j].descricao,
						id_usuario: cursos[j].id_usuario,
						nome_usuario: cursos[j].nome_usuario,
						id_status: statusCurso[i].id,
						descricao_status: statusCurso[i].descricao,
					})
				}
			}
		}

		if (typeof cursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('publicated', {
				usuarios: req.session.usuario,
				erro: 1,
				listaCursos,
			})
		}

		let totalCursos = 'undefined'
		if (listaCursos.length !== 0) {
			totalCursos = 'ok'
		}
		res.render('publicated', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			cursos,
			totalCursos,
			listaCursos,
		})
	},
	scheduled: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: cursos } = await CursoPublicado.findAndCountAll({
			where: {
				id_usuario: req.session.usuario.id,
				id_status_curso: 2,
			},
			order: ['id'],
			limit: limit,
			offset: (page - 1) * limit,
		})

		let totalPages = Math.ceil(size / limit)

		let status = await StatusCurso.findAll()

		let listaCursos = []
		let statusCurso = []

		status.forEach((sts) => {
			statusCurso.push({
				id: sts.id,
				descricao: sts.descricao_status,
			})
		})

		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_status_agendamento: 1,
				status_agendamento: 1,
			},
		})

		let agendamento = []
		agendamentos.forEach((element) => {
			agendamento.push({
				id_curso_publicado: element.id_curso_publicado,
				data_hora: element.data_hora_agendamento,
				data_hora_solicitada: element.data_hora_solicitada,
				id_usuario_agendamento: element.id_usuario_agendamento,
			})
		})

		let us = await Usuario.findAll()
		let usuario = []
		us.forEach((nome) => {
			usuario.push({
				id: nome.id,
				nomeUsuario: nome.nome_usuario,
			})
		})

		for (let j = 0; j < cursos.length; j++) {
			for (let k = 0; k < agendamento.length; k++) {
				for (let m = 0; m < usuario.length; m++) {
					if (
						cursos[j].id == agendamento[k].id_curso_publicado &&
						usuario[m].id == agendamento[k].id_usuario_agendamento
					) {
						let data_brasil = moment(agendamento[k].data_hora).format('llll')
						listaCursos.push({
							id: cursos[j].id,
							curso: cursos[j].curso,
							carga_horaria: cursos[j].carga_horaria,
							coin: cursos[j].coin,
							data_hora: cursos[j].data_hora,
							descricao: cursos[j].descricao,
							id_usuario: cursos[j].id_usuario,
							nome_usuario: cursos[j].nome_usuario,
							// id_status: statusCurso[i].id,
							// descricao_status: statusCurso[i].descricao,
							data_hora_agendamento: agendamento[k].data_hora_agendamento,
							data_brasil: data_brasil,
							nome_usuario_agendado: usuario[m].nomeUsuario,
						})
					}
				}
			}
		}

		console.log(listaCursos)

		if (typeof cursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('scheduled', {
				usuarios: req.session.usuario,
				erro: 1,
				listaCursos,
			})
		}

		res.render('scheduled', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			cursos,
			listaCursos,
		})
	},
	started: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: cursos } = await CursoPublicado.findAndCountAll({
			where: {
				id_usuario: req.session.usuario.id,
				id_status_curso: 5,
			},
			order: ['id'],
			limit: limit,
			offset: (page - 1) * limit,
		})

		let totalPages = Math.ceil(size / limit)

		let status = await StatusCurso.findAll()

		let listaCursos = []
		let statusCurso = []

		status.forEach((sts) => {
			statusCurso.push({
				id: sts.id,
				descricao: sts.descricao_status,
			})
		})

		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_status_agendamento: 4,
				status_agendamento: 1,
			},
		})

		let agendamento = []
		agendamentos.forEach((element) => {
			agendamento.push({
				id_curso_publicado: element.id_curso_publicado,
				data_hora: element.data_hora_agendamento,
				data_hora_solicitada: element.data_hora_solicitada,
				id_usuario_agendamento: element.id_usuario_agendamento,
			})
		})

		let us = await Usuario.findAll()
		let usuario = []
		us.forEach((nome) => {
			usuario.push({
				id: nome.id,
				nomeUsuario: nome.nome_usuario,
			})
		})

		for (let j = 0; j < cursos.length; j++) {
			for (let k = 0; k < agendamento.length; k++) {
				for (let m = 0; m < usuario.length; m++) {
					if (
						cursos[j].id == agendamento[k].id_curso_publicado &&
						usuario[m].id == agendamento[k].id_usuario_agendamento
					) {
						let data_brasil = moment(agendamento[k].data_hora).format('llll')
						listaCursos.push({
							id: cursos[j].id,
							curso: cursos[j].curso,
							carga_horaria: cursos[j].carga_horaria,
							coin: cursos[j].coin,
							data_hora: cursos[j].data_hora,
							descricao: cursos[j].descricao,
							id_usuario: cursos[j].id_usuario,
							nome_usuario: cursos[j].nome_usuario,
							// id_status: statusCurso[i].id,
							// descricao_status: statusCurso[i].descricao,
							data_hora_agendamento: agendamento[k].data_hora_agendamento,
							data_brasil: data_brasil,
							nome_usuario_agendado: usuario[m].nomeUsuario,
						})
					}
				}
			}
		}

		if (typeof cursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('started', {
				usuarios: req.session.usuario,
				erro: 1,
				listaCursos,
			})
		}

		res.render('started', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			cursos,
			listaCursos,
		})
	},
	finished: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: agendamentos } =
			await CursoAgendado.findAndCountAll({
				where: {
					id_status_agendamento: 2,
					status_agendamento: true,
				},
				order: ['id'],
				limit: limit,
				offset: (page - 1) * limit,
			})

		let totalPages = Math.ceil(size / limit)

		let status = await StatusCurso.findAll()

		let cursos = await CursoPublicado.findAll({
			where: {
				id_usuario: req.session.usuario.id,
			},
		})

		let listaCursos = []
		let statusCurso = []

		status.forEach((sts) => {
			statusCurso.push({
				id: sts.id,
				descricao: sts.descricao_status,
			})
		})

		let us = await Usuario.findAll()
		let usuario = []
		us.forEach((nome) => {
			usuario.push({
				id: nome.id,
				nomeUsuario: nome.nome_usuario,
			})
		})

		for (let i = 0; i < agendamentos.length; i++) {
			for (let j = 0; j < cursos.length; j++) {
				for (let k = 0; k < usuario.length; k++) {
					if (
						agendamentos[i].id_curso_publicado == cursos[j].id &&
						agendamentos[i].id_usuario_agendamento == usuario[k].id
					) {
						let data_brasil = moment(
							agendamentos[i].data_hora_agendamento
						).format('llll')
						listaCursos.push({
							id: cursos[j].id,
							curso: cursos[j].curso,
							carga_horaria: cursos[j].carga_horaria,
							coin: cursos[j].coin,
							data_hora: cursos[j].data_hora,
							descricao: cursos[j].descricao,
							id_usuario: cursos[j].id_usuario,
							nome_usuario: cursos[j].nome_usuario,
							data_brasil: data_brasil,
							nome_usuario_agendado: usuario[k].nomeUsuario,
						})
					}
				}
			}
		}

		if (typeof cursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('finished', {
				usuarios: req.session.usuario,
				erro: 1,
				listaCursos,
			})
		}

		res.render('finished', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			listaCursos,
		})
	},
	update: async (req, res, next) => {
		let {
			nome_curso_edicao,
			carga_horaria_edicao,
			coin_edicao,
			data_hora_agendado,
			data_hora_edicao,
			descricao_edicao,
		} = req.body

		let { id_curso } = req.params

		let cursoAlterado = await CursoPublicado.findOne({
			where: { id: id_curso },
		})

		let data = data_hora_edicao
		if (data.length === 0) {
			data = cursoAlterado.data_hora
		}

		await cursoAlterado.update({
			curso: nome_curso_edicao,
			carga_horaria: carga_horaria_edicao,
			coin: coin_edicao,
			data_hora: data,
			descricao: descricao_edicao,
			updateAt: agora,
		})

		res.redirect('/pages/create/publicated')
	},
	// mostrar a view com os cursos cancelados
	cancelCourse: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: cursos } = await CursoPublicado.findAndCountAll({
			where: {
				id_usuario: req.session.usuario.id,
				id_status_curso: 4,
			},
			order: ['id'],
			limit: limit,
			offset: (page - 1) * limit,
		})

		let totalPages = Math.ceil(size / limit)

		let status = await StatusCurso.findAll()

		let listaCursos = []
		let statusCurso = []

		status.forEach((sts) => {
			statusCurso.push({
				id: sts.id,
				descricao: sts.descricao_status,
			})
		})

		for (let i = 0; i < statusCurso.length; i++) {
			for (let j = 0; j < cursos.length; j++) {
				if (statusCurso[i].id == cursos[j].id_status_curso) {
					let data_brasil = moment(cursos[j].data_hora).format('llll')
					listaCursos.push({
						id: cursos[j].id,
						curso: cursos[j].curso,
						carga_horaria: cursos[j].carga_horaria,
						coin: cursos[j].coin,
						data_hora: cursos[j].data_hora,
						data_brasil: data_brasil,
						descricao: cursos[j].descricao,
						id_usuario: cursos[j].id_usuario,
						nome_usuario: cursos[j].nome_usuario,
						id_status: statusCurso[i].id,
						descricao_status: statusCurso[i].descricao,
					})
				}
			}
		}

		if (typeof cursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('publicated', {
				usuarios: req.session.usuario,
				listaCursos,
				erro: true,
			})
		}
		res.render('cancel', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			cursos,
			listaCursos,
		})
	},
	courseCancel: async (req, res, next) => {
		let { id } = req.params

		let cancelar = await CursoPublicado.update(
			{ id_status_curso: 4 },
			{
				where: { id },
			}
		)

		await Message.create({
			id_curso: id,
			mensagem: mensagens.cancelarCurso,
			de: '',
			para: req.session.usuario.id,
			lida: false,
			tipo: 'SISTEMA',
		})

		res.redirect('/pages/create/publicated/cancel')
	},
	edit: async (req, res, next) => {
		let { id_curso } = req.params

		let alterar = await CursoPublicado.findOne({
			where: { id: id_curso },
		})

		let data_brasil = moment(alterar.data_hora).format('llll')

		res.render('editCourse', {
			usuarios: req.session.usuario,
			alterar,
			data_brasil,
		})
	},
	start: async (req, res, next) => {
		let { id_curso } = req.params

		/* buscar os cursos agendados */
		let cursoAgendado = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		let agendamentos = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso,
			},
		})

		// listando usuarios
		let usuario = await Usuario.findOne({
			where: {
				id: agendamentos.id_usuario_agendamento,
			},
		})

		let lista = []
		lista.push({
			id_curso: cursoAgendado.id,
			curso: cursoAgendado.curso,
			carga: cursoAgendado.carga_horaria,
			data_hora: cursoAgendado.data_hora,
			aluno: usuario.nome_usuario,
			data_brasil: moment(agendamentos.data_hora_agendamento).format('llll'),
		})

		res.render('startCourse', { usuarios: req.session.usuario, list: lista[0] })
	},
	start_course: async (req, res, next) => {
		let { id_curso } = req.params

		let curso_p = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		await curso_p.update({
			id_status_curso: 5,
		})

		await CursoAgendado.update(
			{ status_agendamento: false },
			{
				where: {
					id_curso_publicado: id_curso,
				},
			}
		)

		let agendamentos = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso,
			},
		})

		await CursoAgendado.create({
			id_curso_publicado: agendamentos.id_curso_publicado,
			id_usuario_agendamento: agendamentos.id_usuario_agendamento,
			id_status_agendamento: 4,
			data_hora_agendamento: agendamentos.data_hora_agendamento,
			data_hora_solicitada: '',
			data_publicacao: agora,
			status_agendamento: true,
		})

		/* enviar mensagens */
		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.iniciarCursoAluno,
			de: req.session.usuario.id,
			para: agendamentos.id_usuario_agendamento,
			lida: false,
			tipo: 'PROFESSOR',
		})

		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.iniciarCursoProfessor,
			de: '',
			para: req.session.usuario.id,
			lida: false,
			tipo: 'SISTEMA',
		})

		res.redirect('/pages/create/publicated/started')
	},
	finish: async (req, res, next) => {
		let { id_curso } = req.params

		/* buscar os cursos agendados */
		let cursoAgendado = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		let agendamentos = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso,
			},
		})

		// listando usuarios
		let usuario = await Usuario.findOne({
			where: {
				id: agendamentos.id_usuario_agendamento,
			},
		})

		let lista = []
		lista.push({
			id_curso: cursoAgendado.id,
			curso: cursoAgendado.curso,
			carga: cursoAgendado.carga_horaria,
			data_hora: cursoAgendado.data_hora,
			aluno: usuario.nome_usuario,
			data_brasil: moment(agendamentos.data_hora_agendado_brasil).format(
				'llll'
			),
		})

		res.render('finishCourse', {
			usuarios: req.session.usuario,
			list: lista[0],
		})
	},
	finish_course: async (req, res, next) => {
		let { id_curso } = req.params

		let curso_p = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		curso_p.update({
			id_status_curso: 6,
		})

		let agendamentos = await CursoAgendado.update(
			{
				status_agendamento: false,
			},
			{
				where: {
					id_curso_publicado: id_curso,
				},
			}
		)

		let agendado = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso,
			},
		})

		await CursoAgendado.create({
			id_curso_publicado: agendado.id_curso_publicado,
			id_usuario_agendamento: agendado.id_usuario_agendamento,
			id_status_agendamento: 2,
			data_hora_agendamento: agendado.data_hora_agendamento,
			data_hora_solicitada: '',
			data_publicacao: agora,
			createAt: agora,
			updateAt: agora,
			status_agendamento: true,
		})

		/* enviar mensagem de conclusão do curso */
		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.conclusaoCursoAluno,
			de: '',
			para: agendado.id_usuario_agendamento,
			lida: false,
			tipo: 'SISTEMA',
		})

		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.conclusaoCursoProfessor,
			de: '',
			para: curso_p.id_usuario,
			lida: false,
			tipo: 'SISTEMA',
		})

		/* inserir coin para o professor*/
		await TempoEnsinandoAprendendo.create({
			id_curso: id_curso,
			id_usuario: curso_p.id_usuario,
			tipo: 'ENSINANDO - ' + curso_p.curso,
			carga_horaria: curso_p.carga_horaria,
			e_a: 'E',
		})

		/* inserir coin para o aluno*/
		await TempoEnsinandoAprendendo.create({
			id_curso: id_curso,
			id_usuario: agendado.id_usuario_agendamento,
			tipo: 'APRENDENDO - ' + curso_p.curso,
			carga_horaria: curso_p.carga_horaria,
			e_a: 'A',
		})
		res.redirect('/pages/create/publicated/finished')
	},
	myCourses: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: cursos } = await CursoPublicado.findAndCountAll({
			where: {
				id_status_curso: 2,
			},
			order: ['id'],
			limit: limit,
			offset: (page - 1) * limit,
		})

		let totalPages = Math.ceil(size / limit)

		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_usuario_agendamento: req.session.usuario.id,
				id_status_agendamento: 1,
				status_agendamento: true,
			},
		})

		let listaCursos = []
		let listaAgendamentos = []
		let cursosAgendados = []

		cursos.forEach((element) => {
			cursosAgendados.push({
				id: element.id,
				curso: element.curso,
			})
		})

		agendamentos.forEach((agendamento) => {
			listaAgendamentos.push({
				id_usuario_agendamento: agendamento.id_usuario_agendamento,
				id_status_agendamento: agendamento.id_status_agendamento,
				id_curso_publicado: agendamento.id_curso_publicado,
				data_hora_agendamento: agendamento.data_hora_agendamento,
				data_hora_solicitada: agendamento.data_hora_solicitada,
			})
		})

		for (let i = 0; i < listaAgendamentos.length; i++) {
			for (let j = 0; j < cursos.length; j++) {
				if (listaAgendamentos[i].id_curso_publicado === cursos[j].id) {
					let data_brasil = moment(
						listaAgendamentos[i].data_hora_agendamento
					).format('llll')
					listaCursos.push({
						id: cursos[j].id,
						curso: cursos[j].curso,
						carga_horaria: cursos[j].carga_horaria,
						coin: cursos[j].coin,
						data_hora: cursos[j].data_hora,
						descricao: cursos[j].descricao,
						id_usuario: cursos[j].id_usuario,
						nome_usuario: cursos[j].nome_usuario,
						data_hora_agendamento: listaAgendamentos[i].data_hora_agendamento,
						data_brasil: data_brasil,
						data_hora_solicitada: listaAgendamentos[i].data_hora_solicitada,
					})
				}
			}
		}
		if (typeof listaCursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('mySchedules', { usuarios: req.session.usuario, listaCursos })
		}

		res.render('mySchedules', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			listaCursos,
		})
	},
	startedCourses: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: cursos } = await CursoPublicado.findAndCountAll({
			where: {
				id_status_curso: 5,
			},
			order: ['id'],
			limit: limit,
			offset: (page - 1) * limit,
		})
		console.log('cursos:' + cursos)
		let totalPages = Math.ceil(size / limit)

		let agendamentos = await CursoAgendado.findAll({
			where: {
				id_usuario_agendamento: req.session.usuario.id,
				id_status_agendamento: 4,
			},
		})

		console.log('agendamentos:' + agendamentos)

		let listaCursos = []
		let listaAgendamentos = []
		let cursosAgendados = []

		cursos.forEach((element) => {
			cursosAgendados.push({
				id: element.id,
				curso: element.curso,
			})
		})

		agendamentos.forEach((agendamento) => {
			listaAgendamentos.push({
				id_usuario_agendamento: agendamento.id_usuario_agendamento,
				id_status_agendamento: agendamento.id_status_agendamento,
				id_curso_publicado: agendamento.id_curso_publicado,
				data_hora_agendamento: agendamento.data_hora_agendamento,
			})
		})

		for (let i = 0; i < listaAgendamentos.length; i++) {
			for (let j = 0; j < cursos.length; j++) {
				if (listaAgendamentos[i].id_curso_publicado === cursos[j].id) {
					let data_brasil = moment(
						listaAgendamentos[i].data_hora_agendamento
					).format('llll')
					listaCursos.push({
						id: cursos[j].id,
						curso: cursos[j].curso,
						carga_horaria: cursos[j].carga_horaria,
						coin: cursos[j].coin,
						data_hora: cursos[j].data_hora,
						data_hora_agendamento: listaAgendamentos[i].data_hora_agendamento,
						data_brasil: data_brasil,
						descricao: cursos[j].descricao,
						id_usuario: cursos[j].id_usuario,
						nome_usuario: cursos[j].nome_usuario,
					})
				}
			}
		}
		console.log(listaCursos)
		if (typeof listaCursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('startedCourses', {
				usuarios: req.session.usuario,
				listaCursos,
			})
		}

		res.render('startedCourses', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			listaCursos,
		})
	},
	canceledSchedule: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: agendamentos } =
			await CursoAgendado.findAndCountAll({
				where: {
					id_status_agendamento: 3,
					status_agendamento: true,
					id_usuario_agendamento: req.session.usuario.id,
				},
				order: ['id'],
				limit: limit,
				offset: (page - 1) * limit,
			})

		let totalPages = Math.ceil(size / limit)

		let cursos = await CursoPublicado.findAll()

		let listaCursos = []
		let listaAgendamentos = []
		let cursosAgendados = []

		cursos.forEach((element) => {
			cursosAgendados.push({
				id: element.id,
				curso: element.curso,
			})
		})

		agendamentos.forEach((agendamento) => {
			listaAgendamentos.push({
				id_usuario_agendamento: agendamento.id_usuario_agendamento,
				id_status_agendamento: agendamento.id_status_agendamento,
				id_curso_publicado: agendamento.id_curso_publicado,
				data_hora_agendamento: agendamento.data_hora_agendamento,
			})
		})

		for (let i = 0; i < listaAgendamentos.length; i++) {
			for (let j = 0; j < cursos.length; j++) {
				if (listaAgendamentos[i].id_curso_publicado === cursos[j].id) {
					let data_brasil = moment(
						listaAgendamentos[i].data_hora_agendamento
					).format('llll')
					listaCursos.push({
						id: cursos[j].id,
						curso: cursos[j].curso,
						carga_horaria: cursos[j].carga_horaria,
						coin: cursos[j].coin,
						data_hora: cursos[j].data_hora,
						data_brasil: data_brasil,
						descricao: cursos[j].descricao,
						id_usuario: cursos[j].id_usuario,
						nome_usuario: cursos[j].nome_usuario,
					})
				}
			}
		}

		if (typeof listaCursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('canceledSchedule', {
				usuarios: req.session.usuario,
				listaCursos,
			})
		}

		res.render('canceledSchedule', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			listaCursos,
		})
	},
	cancelSchedule: async (req, res, next) => {
		let { id_curso } = req.params

		let curso = await CursoPublicado.update(
			{ id_status_curso: 1 },
			{
				where: {
					id: id_curso,
				},
			}
		)

		let agendamentos = await CursoAgendado.update(
			{ status_agendamento: false },
			{
				where: {
					id_usuario_agendamento: req.session.usuario.id,
					id_curso_publicado: id_curso,
				},
			}
		)

		let agendado = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso,
				id_usuario_agendamento: req.session.usuario.id,
			},
		})

		await CursoAgendado.create({
			id_curso_publicado: agendado.id_curso_publicado,
			id_usuario_agendamento: agendado.id_usuario_agendamento,
			id_status_agendamento: 3,
			data_hora_agendamento: agendado.data_hora_agendamento,
			data_hora_solicitada: '',
			data_publicacao: agora,
			createAt: agora,
			updateAt: agora,
			status_agendamento: true,
		})

		/* enviar mensagem de conclusão do curso */
		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.agendamentoCanceladoPeloAlunoProfessor,
			de: '',
			para: curso.id_usuario,
			lida: false,
			tipo: 'SISTEMA',
		})

		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.agendamentoCanceladoPeloAlunoAluno,
			de: '',
			para: req.session.usuario.id,
			lida: false,
			tipo: 'SISTEMA',
		})
		res.redirect('/pages/create/learnCourses')
	},
	finishedSchedule: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: agendamentos } =
			await CursoAgendado.findAndCountAll({
				where: {
					id_status_agendamento: 2,
					status_agendamento: true,
					id_usuario_agendamento: req.session.usuario.id,
				},
				order: ['id'],
				limit: limit,
				offset: (page - 1) * limit,
			})

		let totalPages = Math.ceil(size / limit)

		let cursos = await CursoPublicado.findAll({
			where: {
				id_status_curso: { [Op.ne]: [4] },
			},
		})

		let listaCursos = []
		let listaAgendamentos = []
		let cursosAgendados = []

		cursos.forEach((element) => {
			cursosAgendados.push({
				id: element.id,
				curso: element.curso,
			})
		})

		agendamentos.forEach((agendamento) => {
			listaAgendamentos.push({
				id_usuario_agendamento: agendamento.id_usuario_agendamento,
				id_status_agendamento: agendamento.id_status_agendamento,
				id_curso_publicado: agendamento.id_curso_publicado,
				data_hora_agendamento: agendamento.data_hora_agendamento,
			})
		})

		for (let i = 0; i < listaAgendamentos.length; i++) {
			for (let j = 0; j < cursos.length; j++) {
				if (listaAgendamentos[i].id_curso_publicado === cursos[j].id) {
					let data_brasil = moment(
						listaAgendamentos[i].data_hora_agendamento
					).format('llll')
					listaCursos.push({
						id: cursos[j].id,
						curso: cursos[j].curso,
						carga_horaria: cursos[j].carga_horaria,
						coin: cursos[j].coin,
						data_hora: cursos[j].data_hora,
						data_brasil: data_brasil,
						descricao: cursos[j].descricao,
						id_usuario: cursos[j].id_usuario,
						nome_usuario: cursos[j].nome_usuario,
					})
				}
			}
		}

		if (typeof listaCursos == 'undefined') {
			listaCursos = {
				id: '',
				curso: '',
				carga_horaria: '',
				coin: '',
			}
			res.render('finishedSchedule', {
				usuarios: req.session.usuario,
				listaCursos,
			})
		}

		res.render('finishedSchedule', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			listaCursos,
		})
	},
	message: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: message } = await Message.findAndCountAll({
			where: {
				para: req.session.usuario.id,
			},
			order: ['id'],
			limit: limitMsg,
			offset: (page - 1) * limitMsg,
		})

		let totalPages = Math.ceil(size / limitMsg)

		let agendamento = await CursoAgendado.findAll({
			where: {
				status_agendamento: true,
			},
		})

		// let message = await Message.findAll({
		//     where:{
		//         para:req.session.usuario.id
		//     }
		// })
		if (typeof message == 'undefined') {
			message = {
				id: '',
				id_curso: '',
				mensagem: '',
				lida: false,
			}
			res.render('messages', {
				usuarios: req.session.usuario,
				page,
				totalPages,
				message,
			})
		}
		res.render('messages', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			message,
		})
	},
	messageChecked: async (req, res, next) => {
		let { id_message, tipo } = req.params

		let mensagem = await Message.findOne({
			where: {
				id: id_message,
			},
		})

		if (mensagem.lida == false) {
			await mensagem.update({
				lida: true,
			})
		} else {
			await mensagem.update({
				lida: false,
			})
		}

		res.redirect('/pages/create/message')
	},
	sendMessageDados: async (req, res, next) => {
		let { id_curso } = req.params

		let curso = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		let mensagens = await Message.findOne({
			where: {
				id_curso: id_curso,
			},
		})

		res.render('sendMessage', {
			usuarios: req.session.usuario,
			curso,
			mensagens,
		})
	},
	sendMessage: async (req, res, next) => {
		let { id_curso } = req.params
		let { usuario_id, mensagem, id_msg } = req.body
		console.log(
			'Curso: ' +
				id_curso +
				'Usuario: ' +
				usuario_id +
				' - Mensagem: ' +
				mensagem
		)

		let msg = await Message.findOne({
			where: {
				id: id_msg,
				id_curso: id_curso,
			},
		})

		if (msg.para == req.session.usuario.id) {
			await Message.create({
				id_curso: id_curso,
				mensagem: mensagem,
				lida: false,
				tipo: 'PROFESSOR',
				de: req.session.usuario.id,
				para: msg.de,
			})
		} else {
			await Message.create({
				id_curso: id_curso,
				mensagem: mensagem,
				lida: false,
				tipo: 'PROFESSOR',
				de: req.session.usuario.id,
				para: msg.para,
			})
		}

		res.redirect('/pages/create/message')
	},
	readMessages: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: message } = await Message.findAndCountAll({
			where: {
				para: req.session.usuario.id,
				lida: true,
			},
			order: ['id'],
			limit: limitMsg,
			offset: (page - 1) * limitMsg,
		})

		let totalPages = Math.ceil(size / limitMsg)

		let agendamento = await CursoAgendado.findAll({
			where: {
				status_agendamento: true,
			},
		})

		if (typeof message == 'undefined') {
			message = {
				id: '',
				id_curso: '',
				mensagem: '',
				lida: false,
			}
			res.render('readMessages', {
				usuarios: req.session.usuario,
				page,
				totalPages,
				message,
			})
		}
		res.render('readMessages', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			message,
		})
	},
	unreadMessages: async (req, res, next) => {
		let { page = 1 } = req.query
		page = parseInt(page)

		let { count: size, rows: message } = await Message.findAndCountAll({
			where: {
				para: req.session.usuario.id,
				lida: false,
			},
			order: ['id'],
			limit: limitMsg,
			offset: (page - 1) * limitMsg,
		})

		let totalPages = Math.ceil(size / limitMsg)

		let agendamento = await CursoAgendado.findAll({
			where: {
				status_agendamento: true,
			},
		})

		if (typeof message == 'undefined') {
			message = {
				id: '',
				id_curso: '',
				mensagem: '',
				lida: false,
			}
			res.render('unreadMessages', {
				usuarios: req.session.usuario,
				page,
				totalPages,
				message,
			})
		}
		res.render('unreadMessages', {
			usuarios: req.session.usuario,
			page,
			totalPages,
			message,
		})
	},
	cancelScheduled: async (req, res, next) => {
		let { id_curso } = req.params

		let agendamento = await CursoAgendado.update(
			{ id_status_agendamento: 3 },
			{
				where: {
					id_curso_publicado: id_curso,
				},
			}
		)

		let devolverCoin = await CursoPublicado.findOne({
			where: {
				id: id_curso,
			},
		})

		let curso = await CursoPublicado.update(
			{ id_status_curso: 4 },
			{
				where: {
					id: id_curso,
				},
			}
		)

		let aluno = await CursoAgendado.findOne({
			where: {
				id_curso_publicado: id_curso,
			},
		})

		let credito = await CoinUsuario.create({
			tipo: 'D',
			coin: devolverCoin.coin,
			caminho: 'Devolução por cancelamento do curso ' + devolverCoin.curso,
			id_usuario: aluno.id_usuario_agendamento,
		})

		let debito = await CoinUsuario.create({
			tipo: 'D',
			coin: devolverCoin.coin - devolverCoin.coin - devolverCoin.coin,
			caminho: 'Devolução por cancelamento do curso ' + devolverCoin.curso,
			id_usuario: req.session.usuario.id,
		})

		/* enviar mensagem de cancelamento de agendamento do curso */
		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.cancelamentoAgendamentoCursoProfessor,
			de: '',
			para: req.session.usuario.id,
			lida: false,
			tipo: 'SISTEMA',
		})

		await Message.create({
			id_curso: id_curso,
			mensagem: mensagens.cancelamentoAgendamentoCursoAluno,
			de: '',
			para: aluno.id_usuario_agendamento,
			lida: false,
			tipo: 'SISTEMA',
		})

		res.redirect('/pages/create/publicated/cancel')
	},
}

module.exports = pagesController
