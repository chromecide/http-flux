module.exports = {
    name: 'member',
    collection: 'members',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        first_name: {
            type: 'STRING',
            max_length: 200
        },
        last_name: {
            type: 'STRING',
            max_length: 200
        },
        user_id: {
            type: 'NUMBER',
            default: 'NOW'
        }
    },
    belongsTo: [
        {
            model: 'user',
            fk_field: 'id',
            field: 'user_id'
        }
    ]
};