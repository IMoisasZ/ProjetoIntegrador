module.exports = (sequelize, DataType) => {
    const TempoEnsinandoAprendendo = sequelize.define('TempoEnsinandoAprendendo', {
        id_curso:DataType.INTEGER,
        id_usuario: DataType.INTEGER,
        tipo: DataType.STRING,
        carga_horaria:DataType.INTEGER,
        e_a: DataType.STRING,
    },{
        tableName: 'tempo_ensinado_aprendendo',
        timestamps: true
    })

    return TempoEnsinandoAprendendo;
}