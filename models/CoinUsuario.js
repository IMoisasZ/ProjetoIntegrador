module.exports = (sequelize, DataType) => {
    const CoinUsuario = sequelize.define('CoinUsuario', {
        pontos:DataType.INTEGER,
        caminho:DataType.STRING,
        id_usuario:{
            type: DataType.INTEGER,
        }
    },{
        tableName: 'ponto_obtido',
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