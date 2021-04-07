module.exports = (sequelize, DataType) => {
    const CursoAgendado = sequelize.define('CursoAgendado', {
        id_curso_publicado: DataType.INTEGER,
        id_usuario_agendamento: DataType.INTEGER,
        id_status_agendamento: DataType.INTEGER
    },{
        tableName: 'curso_agendado',
        timestamps: false
    })
    return CursoAgendado;
}

    // CursoAgendado.associate = (listModels) =>{
    //     CursoAgendado.hasMany(listModels.CursoPublicado,{
    //         foreignKey: 'id_curso_publicado',
    //         as: 'cursoAgendado'
    //     })
    // }
    
    // CursoAgendado.associate = (listModels) =>{
    //     CursoAgendado.hasMany(listModels.Usuario,{
    //         foreignKey: 'id_usuario_agendado',
    //         as: 'cursoAgendadoUsuario'
    //     })
    // }