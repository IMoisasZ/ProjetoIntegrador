module.exports = (sequelize, DataType) => {
    const Usuario = sequelize.define('Usuario', {
        nome_usuario:DataType.STRING,
        email:{
            type: DataType.STRING,
            unique: true
        },
        senha:DataType.STRING,
        status: DataType.INTEGER
    },{
        tableName: 'usuario',
        timestamps: false
    })
    return Usuario;
}