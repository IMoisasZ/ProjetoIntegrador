'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('usuario',{
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        nome_usuario: Sequelize.STRING,
        email:{
            type: Sequelize.STRING,
            unique: true
        },
        senha:Sequelize.STRING,
        status: Sequelize.INTEGER,
        tipo_usuario: Sequelize.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.dropTable('usuario');
  }
};
