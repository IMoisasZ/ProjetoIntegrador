module.exports = (sequelize, DataType) => {
    const StatusCurso = sequelize.define('StatusCurso', {
        sigla: DataType.STRING,
        descricao_status:DataType.STRING,
    },{
        tableName: 'status_curso',
        timestamps: true
    })
    return StatusCurso;
}