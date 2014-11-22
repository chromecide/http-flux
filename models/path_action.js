module.exports = {
    name: 'path_action',
    collection: 'path_actions',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        path_id: {
            type: 'NUMBER',
            max_length: 200
        },
        action_id: {
            type: 'NUMBER',
            max_length: 200
        },
        action_order:{
            type: 'NUMBER',
            required:true
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
    }
};