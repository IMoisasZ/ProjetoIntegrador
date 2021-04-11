'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
      return queryInterface.createTable('curso_agendado',{
        id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        id_curso_publicado: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: {
            model:{
              tableName: 'curso_publicado'
            },
            key: 'id'
          }
        },
        id_usuario_agendamento:{
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references:{
            model:{
              tableName:'usuario'
            },
            key:'id'
          }
        },
        id_status_agendamento:{
          type:Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references:{
            model:{
              tableName: 'status_agendamento'
            },
            key: 'id'
          }
        },
        data_hora_agendamento: Sequelize.DATE,
        data_hora_solicitada: Sequelize.DATE
      })
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('curso_agendado');
    }
  }