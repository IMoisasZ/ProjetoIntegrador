'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
      return queryInterface.createTable('curso_publicado',{
        id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
          curso: Sequelize.STRING,
          carga_horaria: Sequelize.INTEGER,
          coin: Sequelize.INTEGER,
          caminho_imagem:Sequelize.STRING,
          data_hora: Sequelize.DATE,
          descricao: Sequelize.STRING,
          id_usuario:{
            type: Sequelize.INTEGER,
            references:{
              model:{
                tableName:'usuario'
              },
              key:'id'
            }
          },
          nome_usuario: Sequelize.STRING,
          id_status_curso:{
            type:Sequelize.INTEGER,
            references:{
              model:{
                tableName:'status_curso'
              },
              key:'id'
            }
          },
      })
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('curso_publicado');
    }
  }