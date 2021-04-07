'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
      return queryInterface.createTable('status_agendamento',{
        id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        sigla_agendamento: Sequelize.STRING,
        status_agendamento: Sequelize.STRING
    })
  },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('status_agendamneto');
    }
  }