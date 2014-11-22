module.exports = {
    name: 'group_path',
    collection: 'group_paths',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        group_id: {
            type: 'NUMBER',
            max_length: 200
        },
        path_id: {
            type: 'NUMBER',
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
        allow_get:{
            type: 'BOOLEAN',
            default: 0
        },
        allow_post:{
            type: 'BOOLEAN',
            default: 0
        },
        allow_put:{
            type: 'BOOLEAN',
            default: 0
        },
        allow_delete:{
            type: 'BOOLEAN',
            default: 0
        },
        own_only:{
            type: 'BOOLEAN',
            default: 0
        }
    }
};