module.exports = {
    name: 'config_setting',
    collection: 'config',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        key: {
            type: 'STRING',
            max_length: 255
        },
        value: {
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
        }
    }
};