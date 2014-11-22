module.exports = {
    name: 'action',
    collection: 'actions',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        name: {
            type: 'STRING',
            max_length: 200
        },
        path: {
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
    }
};