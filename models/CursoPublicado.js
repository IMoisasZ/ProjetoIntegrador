module.exports = (sequelize, DataType) => {
    const CursoPublicado = sequelize.define('CursoPublicado', {
        curso: DataType.STRING,
        carga_horaria:DataType.INTEGER,
        coin:DataType.INTEGER,
        caminho_imagem:DataType.STRING,
        data_hora:DataType.DATE,
        descricao: DataType.STRING,
        id_usuario: DataType.INTEGER,
        nome_usuario: DataType.STRING,
        id_status_curso: DataType.INTEGER,
    },{
        tableName: 'curso_publicado',
        timestamps: false
    })

    CursoPublicado.associate = (listModels) =>{
        CursoPublicado.belongsToMany(listModels.Usuario,{through: 'CursoAgendado',
            foreignKey: 'id_usuario_agendamento',
            as: 'usuario'
        })
     }

    return CursoPublicado;
}

   