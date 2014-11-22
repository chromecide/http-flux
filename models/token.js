module.exports = {
    name: 'token',
    collection: 'tokens',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        created_at: {
            type: 'TIMESTAMP',
            default: 'NOW'
        },
        modified_at: {
            type: 'TIMESTAMP',
            default: 'NOW'
        },
        expires_at: {
            type: 'TIMESTAMP',
            required: true
        },
        user_id: {
            type: 'NUMBER',
            required: true
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