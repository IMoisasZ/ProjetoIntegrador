module.exports = (sequelize, DataType) => {
    const StatusAgendamento = sequelize.define('StatusAgendamento', {
        sigla_agendamento: DataType.STRING,
        status_agendamento:DataType.STRING,
    },{
        tableName: 'status_agendamento',
        timestamps: false
    })
    return StatusAgendamento;
}