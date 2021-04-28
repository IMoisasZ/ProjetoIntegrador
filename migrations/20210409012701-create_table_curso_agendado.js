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
        data_hora_agendamento: Sequelize.DATE, /* data e hora marcada pelo publicador*/
        data_hora_solicitada: Sequelize.DATE, /* data e hora solicitada pelo usuario*/
        data_publicacao: Sequelize.DATE, /* data de publicacao do curso no site*/
        status_agendamento: Sequelize.BOOLEAN,
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
      })
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('curso_agendado');
    }
  }