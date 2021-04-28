'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('tempo_ensinado_aprendendo',{
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_curso:{
        type: Sequelize.INTEGER
      },
      id_usuario:{
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.STRING,
      },
      coin:{
        type: Sequelize.INTEGER,
      },
      // Timestamps
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tempo_ensinado_aprendendo');
  }
}
