import { DataTypes } from 'sequelize';
import sequelize from '../../configs/sequelize.config.js';


const Sample = sequelize.define('Sample', {
  name: DataTypes.STRING,
},{
  tableName      : 'sample',
  timestamps     : true,
  paranoid       : true,
  freezeTableName: true
});

export default Sample;