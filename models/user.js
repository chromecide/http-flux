module.exports = {
    name: 'user',
    collection: 'users',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        username: {
            type: 'STRING',
            max_length: 200
        },
        pass_phrase: {
            type: 'STRING',
            max_length: 200
        },
        created_at: {
            type: 'TIMESTAMP',
            default: 'NOW'
        },
        created_by:{
            type: 'NUMBER',
            required: true
        },
        modified_at: {
            type: 'TIMESTAMP',
            default: 'NOW'
        },
        modified_by:{
            type: 'NUMBER',
            required: true
        },
        deleted_at: {
            type: 'TIMESTAMP',
            default: 'NOW'
        },
        deleted_by:{
            type: 'NUMBER',
            required: true
        },
        enabled: {
            type: 'BOOLEAN',
            default: true
        }
    },
    belongsTo: [
        {
            model: 'user',
            fk_field: 'id',
            field: 'created_by'
        },
        {
            model: 'user',
            fk_field: 'id',
            field: 'modified_by'
        }
    ]
};