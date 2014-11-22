module.exports = {
    name: 'group_user',
    collection: 'group_users',
    fields:{
        id: {
            type: 'NUMBER',
            primary_key: true
        },
        group_id: {
            type: 'NUMBER',
            max_length: 200
        },
        user_id: {
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
    }
};