import sequelize from '../clients/sequelize.mysql.js';
import { DataTypes, Model } from 'sequelize';

import Events from '../models/Events.js';
class EventInvitedes extends Model {}

EventInvitedes.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
},

{
    sequelize,
        timestamps: true,
    tableName: 'eventInvitedes',
    modelName: 'eventInvitedes',
}
)

EventInvitedes.belongsTo(Events, {
    foreignKey: 'registerId',
    onDelete: 'cascade',
});

Events.hasMany(EventInvitedes, {
    foreignKey: 'registerId',
    onDelete: 'cascade',
});

export default EventInvitedes;