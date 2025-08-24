import { Sequelize } from 'sequelize';
import logger from './winston.config.js';

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER_NAME, process.env.DATABASE_PASSWORD, {
    host          : process.env.DATABASE_HOST,
    port          : parseInt(process.env.DATABASE_PORT, 10),
    dialect       : process.env.DATABASE_DIALECT,
    logging       : (seqlog) => {
        logger.info(JSON.stringify(seqlog));
    },
    // dialectOptions: {
    //     ssl: {
    //         require           : true,
    //         rejectUnauthorized: false
    //     }
    // },
});

export default sequelize;

export async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
        await sequelize.sync({ force: false });
        console.log('Database & tables synced!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}