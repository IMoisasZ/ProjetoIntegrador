'use strict';


module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('pontos_usuario',{
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        tipo: Sequelize.STRING,
        coin: Sequelize.INTEGER,
        caminho: Sequelize.STRING,
        id_usuario: Sequelize.INTEGER,
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    })
  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.dropTable('pontos_usuario');
  }
};
