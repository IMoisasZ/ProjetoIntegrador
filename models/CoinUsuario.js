module.exports = (sequelize, DataType) => {
    const CoinUsuario = sequelize.define('CoinUsuario', {
        tipo: DataType.STRING,
        coin:DataType.INTEGER,
        caminho:DataType.STRING,
        id_usuario:{
            type: DataType.INTEGER,
        }
    },{
        tableName: 'pontos_usuario',
        timestamps: false
    })

    CoinUsuario.associate = (listModels) =>{
        CoinUsuario.belongsTo(listModels.Usuario,{
            foreignKey: 'id_usuario',
            as: 'usuario'
        })
    }
    return CoinUsuario;
}