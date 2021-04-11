module.exports = (sequelize, DataType) => {
    const Usuario = sequelize.define('Usuario', {
        nome_usuario:DataType.STRING,
        email:{
            type: DataType.STRING,
            unique: true
        },
        senha:DataType.STRING,
        status: DataType.INTEGER,
        tipo_usuario: DataType.INTEGER
    },{
        tableName: 'usuario',
        timestamps: false
    })

    Usuario.associate = (listModels) =>{
        Usuario.hasMany(listModels.CoinUsuario,{
            foreignKey: 'id_usuario',
            as: 'coinUsuario'
        })
    }

    Usuario.associate = (listModels) =>{
        Usuario.belongsToMany(listModels.CursoPublicado,{through: 'CursoAgendado',
            foreignKey: 'id_curso_publicado',
            as: 'publicado'
        })
    }

    return Usuario;
}