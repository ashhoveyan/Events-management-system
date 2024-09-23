import sequelize from '../clients/sequelize.mysql.js';
import { DataTypes, Model } from 'sequelize';
import Users from './Users.js';

class Chat extends Model {}

Chat.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'chat',
        modelName: 'chat',
        timestamps: true,
    }
);

Users.hasMany(Chat, {
    foreignKey: 'senderId',
    onDelete: 'CASCADE',
    as: 'sentMessages',
});

Chat.belongsTo(Users, {
    foreignKey: 'senderId',
    onDelete: 'CASCADE',
    as: 'sender',
});

Users.hasMany(Chat, {
    foreignKey: 'receiverId',
    onDelete: 'CASCADE',
    as: 'receivedMessages',
});

Chat.belongsTo(Users, {
    foreignKey: 'receiverId',
    onDelete: 'CASCADE',
    as: 'receiver',
});

export default Chat;