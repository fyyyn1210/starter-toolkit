'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'sample';
export const up = async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      id: {
          allowNull    : false,
          autoIncrement: true,
          primaryKey   : true,
          type         : Sequelize.INTEGER
      },
      name: {
          type     : Sequelize.STRING,
          unique   : true,
          allowNull: false
      },
      createdAt: {
          allowNull   : false,
          type        : Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
          allowNull   : false,
          type        : Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
          allowNull   : true,
          type        : Sequelize.DATE
      }
  });
  }

  export const down = async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  };
