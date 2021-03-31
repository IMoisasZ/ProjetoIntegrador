'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('ponto_obtido',{
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        pontos: Sequelize.INTEGER,
        caminho: Sequelize.STRING,
        id_usuario: Sequelize.INTEGER,
    })
  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.dropTable('ponto_obtido');
  }
};
