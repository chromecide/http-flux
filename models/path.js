module.exports = {
    name: 'path',
    collection: 'paths',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        path: {
            type: 'STRING',
            max_length: 800
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
    }
};