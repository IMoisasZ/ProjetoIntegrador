module.exports = (sequelize, DataType) => {
    const CursoAgendado = sequelize.define('CursoAgendado', {
        id_curso_publicado: DataType.INTEGER,
        id_usuario_agendamento: DataType.INTEGER,
        id_status_agendamento: DataType.INTEGER,
        data_hora_agendamento: DataType.DATE,
        data_hora_solicitada: DataType.DATE
    },{
        tableName: 'curso_agendado',
        timestamps: false
    })
    return CursoAgendado;
}