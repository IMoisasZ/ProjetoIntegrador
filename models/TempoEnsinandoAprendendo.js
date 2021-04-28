module.exports = (sequelize, DataType) => {
    const TempoEnsinandoAprendendo = sequelize.define('TempoEnsinandoAprendendo', {
        id_curso:DataType.INTEGER,
        id_usuario: DataType.INTEGER,
        tipo: DataType.STRING,
        coin:DataType.INTEGER,
    },{
        tableName: 'tempo_ensinado_aprendendo',
        timestamps: true
    })

    return TempoEnsinandoAprendendo;
}