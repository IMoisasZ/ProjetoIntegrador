module.exports = (sequelize, DataType) => {
    const Message = sequelize.define('Message', {
        id_curso: DataType.INTEGER,
        mensagem: DataType.STRING,
        lida: {
            type:DataType.BOOLEAN,
            default: false
        },            
        tipo: DataType.STRING,  
        de: DataType.INTEGER,
        para: DataType.INTEGER
    },{
        tableName: 'message',
        timestamps: true
    })
    return Message;
}