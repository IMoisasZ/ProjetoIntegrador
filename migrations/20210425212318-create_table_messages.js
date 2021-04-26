'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('message',{
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_aluno:{
        type: Sequelize.INTEGER
      },
      id_professor:{
        type: Sequelize.INTEGER
      },
      id_curso:{
        type: Sequelize.INTEGER
      },
      mensagem: {
        type: Sequelize.STRING,
      },
      lida:{
        type: Sequelize.BOOLEAN
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
