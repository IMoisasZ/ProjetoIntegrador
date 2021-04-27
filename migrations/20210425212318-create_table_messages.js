'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('message',{
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_curso:{
        type: Sequelize.INTEGER
      },
      mensagem: {
        type: Sequelize.STRING,
      },
      lida:{
        type: Sequelize.BOOLEAN,
        default: false
      },
      tipo:{
        type: Sequelize.STRING
      },
      de:{
        type: Sequelize.INTEGER
      },
      para:{
        type: Sequelize.INTEGER
      },
      // Timestamps
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('message');
  }
}
