'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('status_curso',{
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        sigla: Sequelize.STRING,
        descricao_status: Sequelize.STRING,
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('status_curso');
  }
};