
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    return this;
};

jQuery.fn.centerInParent = function () {
    this.css("position","relative");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    return this;
};

function HTTPFluxAPI(){
    this.basePath = 'http://localhost:3000';
    this.token = false;
    this.user = false;
    var self = this;

    this.generateURL = function(path){
        var fullPath = this.basePath+path;
        if(self.token){
            fullPath+='?token='+this.token;
        }
        
        return fullPath;
    };

    this.login = function(username, pass, cbs){
        self.post('/login', {username: username, pass_phrase: pass}, {
            success: function(res){
                self.token = res.token.token;
                self.user = res.user;

                if(cbs.success){
                    cbs.success(res);
                }
            },
            error: function(err, res){
                if(cbs.error){
                    cbs.error(err, res);
                }
            }
        });
    };

    this.get = function(path, data, cbs){
        $.ajax({
            type: "GET",
            url: self.generateURL(path),
            data: data,
            success: function(res, status, xhr){
                if(cbs.success){
                    cbs.success(res, xhr);
                }
            },
            error: function(xhr, statusText, err){
                if(cbs.error){
                    if(xhr.status===0){
                        err = {
                            error: 'Connection Refused'
                        };
                    }else{
                        if(xhr && xhr.responseText){
                            err = JSON.parse(xhr.responseText);
                        }
                    }
                    
                    cbs.error(err, xhr);
                }
            },
            dataType: 'json'
        });
    };

    this.post = function(path, data, cbs){
        $.ajax({
            type: "POST",
            url: self.generateURL(path),
            data: data,
            success: function(res, status, xhr){
                if(cbs.success){
                    cbs.success(res, xhr);
                }
            },
            error: function(xhr, statusText, err){
                if(cbs.error){
                    if(xhr.status===0){
                        err = {
                            error: 'Connection Refused'
                        };
                    }else{
                        if(xhr && xhr.responseText){
                            err = JSON.parse(xhr.responseText);
                        }
                    }
                    
                    cbs.error(err, xhr);
                }
            },
            dataType: 'json'
        });
    };

    this.put = function(path, data, cbs){
        $.ajax({
            type: "PUT",
            url: self.generateURL(path),
            data: data,
            success: function(res, status, xhr){
                if(cbs.success){
                    cbs.success(res, xhr);
                }
            },
            error: function(xhr, statusText, err){
                if(cbs.error){
                    if(xhr.status===0){
                        err = {
                            error: 'Connection Refused'
                        };
                    }else{
                        if(xhr && xhr.responseText){
                            err = JSON.parse(xhr.responseText);
                        }
                    }
                    
                    cbs.error(err, xhr);
                }
            },
            dataType: 'json'
        });
    };

    this.delete = function(path, data, cbs){
        $.ajax({
            type: "DELETE",
            url: self.generateURL(path),
            data: data,
            success: function(res, status, xhr){
                if(cbs.success){
                    cbs.success(res, xhr);
                }
            },
            error: function(xhr, statusText, err){
                if(cbs.error){
                    if(xhr.status===0){
                        err = {
                            error: 'Connection Refused'
                        };
                    }else{
                        if(xhr && xhr.responseText){
                            err = JSON.parse(xhr.responseText);
                        }
                    }
                    
                    cbs.error(err, xhr);
                }
            },
            dataType: 'json'
        });
    };
}


var httpFlux = new HTTPFluxAPI();

var fluxToken = localStorage.getItem("HTTPFluxAPIToken");
var toolbarRendered = false;

$(function() {
    $('#ProgressBar').progressbar({
        value: false
    }).center().find('.progress-label').position({
        of: $('#ProgressBar'),
        my: 'center center',
        at: 'center center'
    });

    httpFlux.token = fluxToken;
    //if no token, then login
    if(!fluxToken){
        renderLogin();
    }else{
        renderToolbar();
    }

    $('#ProgressBar').hide();
    /*httpFlux.get('/', null, {
        success: function(){
            
        },
        error: function(err){
            if(err.error=='Connection Refused'){
                connectionRefused();
            }else{
                switch(err.error){
                    case 'Path not Found':
                        renderToolbar();
                        break;
                    case 'Unauthorised':
                        renderLogin();
                        break;
                    default:
                        alert(err.error);
                        break;
                }
            }
        }
    });*/
});

function connectionRefused(){
    $('#toolbar_items').empty();
    $('.flux-module').addClass('ui-helper-hidden');

    if($('#error').length===0){
        $('<div id="error" class="ui-state-error" style="width: 300px;height: 40px;line-height: 40px; text-align:center;">Could not connect to API Server</div>').appendTo('#content').center();
    }else{
        $('#error').removeClass('ui-helper-hidden');
    }
}

function renderLogin(){
    $('#tplLoginDialog').removeClass('ui-helper-hidden').dialog({
        buttons: {
            Login: function() {
                $('#ProgressBar').find('.progress-label').text('Checking Login').position({
                    of: $('#ProgressBar'),
                    my: 'center center',
                    at: 'center center'
                });

                $( this ).dialog( "close" );
                var username = $('#username').val();
                var pass_phrase = $('#pass_phrase').val();

                httpFlux.login(username, pass_phrase, {
                    success: function(res){
                        localStorage.setItem('HTTPFluxAPIToken', res.token.token);
                        renderToolbar();
                    },
                    error: function(err){
                        $('#ProgressBar').hide();
                        if(err.error=='Connection Refused'){
                            connectionRefused();
                        }else{
                            switch(err.error){
                                case 'Path not Found':
                                    break;
                                default:
                                    alert(err.error);
                                    break;
                            }
                        }
                    }
                });
            }
        }
    });
}

function renderToolbar(){
    if(!toolbarRendered){
        $('#toolbar_items').append('<button>Actions</button><button>Paths</button><button>Users</button><button>Groups</button>').find('button').button().click(function(){
            switch($(this).text()){
                case 'Groups':
                    renderGroupModule();
                    break;
                case 'Users':
                    renderUserModule();
                    break;
                case 'Paths':
                    renderPathModule();
                    break;
                case 'Actions':
                    renderActionModule();
                    break;
            }
        });
    }
}

function renderUserModule(){
    $('.flux-module').addClass('ui-helper-hidden');
    $('#userModule').removeClass('ui-helper-hidden');
    $('#userList tbody').empty();
    
    $('.user-add').click(function(){
        showUserForm();
    });

    httpFlux.get('/users', {deleted_at:-1}, {
        success: function(records){
            for(var i=0;i<records.length;i++){
                console.log('appending');
                var rowHTML = '<tr role="row" class="'+(i%2===0?'even':'odd')+'"><td>'+records[i].username+'</td><td>'+records[i].created_at+'</td><td>';
                rowHTML+='<button data-id="'+records[i].id+'" data-action="edit"><img src="images/user_edit.png" class="grid-tool"/></button>&nbsp;<button data-id="'+records[i].id+'" data-action="delete"><img src="images/user_delete.png" class="grid-tool"/></button>';
                rowHTML+='</td></tr>';
                $('#userList tbody').append(rowHTML);
            }
            $('#userList').DataTable();
            $('#userList tbody tr td button').click(function(){
                if($(this).attr('data-action')=='delete'){
                    showDeleteUserConfirmation($(this).attr('data-id'));
                }else{
                    showUserForm($(this).attr('data-id'));
                }
            });
        },
        error: function(){
            connectionRefused();
        }
    });
}

function showUserForm(userId){
    $('#userForm').removeClass('ui-helper-hidden').dialog({
        title: userId?'Edit User':'Add User',
        height: 400,
        width: 500,
        modal: true,
        buttons: {
            Save: function(){
                var allFields = $('#userForm').find('[data-role="field"]');
                var data = {};
                console.log(allFields);
                for(var fidx=0;fidx<allFields.length;fidx++){

                    var fieldName = $(allFields[fidx]).attr('name');
                    var attrName = fieldName.replace('userForm_', '');
                    var attrValue = $(allFields[fidx]).val();
                    if($(allFields[fidx]).attr('type')=='checkbox'){
                        if(attrName=='enabled'){
                            attrValue = $(allFields[fidx]).prop('checked')===true?1:0;
                        }else{
                            attrValue = $(allFields[fidx]).prop('checked')?$(allFields[fidx]).attr('data-id'):null;
                        }
                    }

                    if(attrValue!==null){
                        if(data[attrName]){
                            if((typeof data[attrName])=='string'){
                                data[attrName] = [data[attrName]];
                            }

                            data[attrName].push(attrValue);
                        }else{
                            data[attrName] = attrValue;
                        }
                    }
                }

                if(data.groups && (typeof data.groups)=='string'){
                    data.groups = [data.groups];
                }
                console.log(data);
                httpFlux.put('/users/'+(userId>0?userId:''), data, {
                    success: function(){
                        console.log(arguments);
                        $('#userForm').dialog( "close" );
                        renderUserModule();
                    },
                    error: function(){
                        console.log('ERROR');
                        console.log(arguments);
                    }
                });

            },
            Cancel: function() {
                $('#userForm').dialog( "close" );
            }
        },
        close: function() {
            $('#userForm form')[ 0 ].reset();
            //allFields.removeClass( "ui-state-error" );
        }
    });

    $('#userFormProgressBar').progressbar({
        value: false
    }).position({
        of: $('#userFormProgressBar').parent(),
        my: 'center center',
        at: 'center center'
    }).find('.progress-label').text('Loading').position({
        of: $('#userFormProgressBar'),
        my: 'center center',
        at: 'center center'
    });

    httpFlux.get('/groups', {}, {
        success: function(records){
            console.log(records);
            $('#userGroupList .field').remove();
            for(var i=0;i<records.length;i++){
                console.log('ADDING');
                console.log(records[i]);
                groupHTML='<div class="field '+(i%2===0?'even':'odd')+'" style="clear:both;"><label for="groups" style="float:left;">'+records[i].name+'</label><input type="checkbox" name="userForm_groups" data-role="field" style="float:right;" data-field="group" data-id="'+records[i].id+'"/></div>';
                $('#userGroupList').append(groupHTML);
            }

            if(userId){
                httpFlux.get('/users/'+userId, {include: ['groups']}, {
                    success: function(record){
                        $('#userForm_username').val(record.username);
                        $('#userForm_pass_phrase').val(record.pass_phrase);

                        $('#userFormProgressBar').hide();
                        $('#userForm form').removeClass('ui-helper-hidden');
                        var formGroups = $('#userForm form input[data-field="group"]');
                        
                        for(var ugIdx=0;ugIdx<record.groups.length;ugIdx++){
                            for(var gIdx=0;gIdx<formGroups.length;gIdx++){
                                console.log(record.groups[ugIdx].id, $(formGroups[gIdx]).attr('data-id'));
                                if(record.groups[ugIdx].id==$(formGroups[gIdx]).attr('data-id')){
                                    $(formGroups[gIdx]).attr('checked', true);
                                }
                            }
                        }
                    },
                    error: function(){
                        alert('ERROR');
                        console.log(arguments);
                    }
                });
            }else{
                $('#userFormProgressBar').hide();
                $('#userForm form').removeClass('ui-helper-hidden');
            }
        },
        error: function(){

        }
    });
}

function showDeleteUserConfirmation(userId){
    httpFlux.get('/users/'+userId, {include: ['groups']}, {
        success: function(record){
            var dlg = $('#userDelete_Confirm').removeClass('ui-helper-hidden').dialog({
                title: 'Confirm User Deletion',
                buttons:{
                    Yes: function(){
                        httpFlux.delete('/users/'+userId, null, {
                            success: function(){
                                alert('User Deleted');
                                $('#userDelete_Confirm').dialog( "close" );
                                renderUserModule();
                            },
                            error: function(){
                                alert('ERROR');
                                console.log(arguments);
                            }
                        });
                    },
                    No: function(){
                        $('#userDelete_Confirm').dialog( "close" );
                    }
                }
            }).html('Are you sure you want to delete the user <b>'+record.username+'</b>?');
        },
        error: function(){
            alert('ERROR');
            console.log(arguments);
        }
    });
}

function renderGroupModule(){
    $('.flux-module').addClass('ui-helper-hidden');
    $('#groupModule').removeClass('ui-helper-hidden');
    $('#groupList tbody').empty();
    
    $('.group-add').click(function(){
        console.log('SHOWING GROUP FORM');
        showGroupForm();
    });

    httpFlux.get('/groups', {deleted_at:-1}, {
        success: function(records){
            for(var i=0;i<records.length;i++){
                console.log('appending group');
                var rowHTML = '<tr role="row" class="'+(i%2===0?'even':'odd')+'"><td>'+records[i].name+'</td><td>'+(records[i].enabled?'Yes':'No')+'</td><td>';
                rowHTML+='<button data-id="'+records[i].id+'" data-action="edit"><img src="images/group_edit.png" class="grid-tool"/></button>&nbsp;<button data-id="'+records[i].id+'" data-action="delete"><img src="images/group_delete.png" class="grid-tool"/></button>';
                rowHTML+='</td></tr>';
                $('#groupList tbody').append(rowHTML);
            }
            console.log('DIONG DT');
            $('#groupList').DataTable();
            $('#groupList tbody tr td button').click(function(){
                if($(this).attr('data-action')=='delete'){
                    showDeleteGroupConfirmation($(this).attr('data-id'));
                }else{
                    showGroupForm($(this).attr('data-id'));
                }
            });
        },
        error: function(){
            connectionRefused();
        }
    });
}


function showGroupForm(groupId){
    $('#groupForm').removeClass('ui-helper-hidden').dialog({
        title: groupId?'Edit Group':'Add Group',
        height: 400,
        width: 500,
        modal: true,
        buttons: {
            Save: function(){
                var allFields = $('#groupForm').find('[data-role="field"]');
                var data = {};

                for(var fidx=0;fidx<allFields.length;fidx++){
                    var fieldName = $(allFields[fidx]).attr('name');
                    var attrName = fieldName.replace('groupForm_', '');
                    var attrValue = $(allFields[fidx]).val();
                    if($(allFields[fidx]).attr('type')=='checkbox'){
                        if(attrName=='enabled'){
                            attrValue = $(allFields[fidx]).prop('checked')===true?1:0;
                        }else{
                            attrValue = $(allFields[fidx]).prop('checked')?$(allFields[fidx]).attr('data-id'):null;
                        }
                    }

                    if(attrValue!==null){
                        if(data[attrName]){
                            if((typeof data[attrName])=='string'){
                                data[attrName] = [data[attrName]];
                            }

                            data[attrName].push(attrValue);
                        }else{
                            data[attrName] = attrValue;
                        }
                    }
                }

                if(data.groups && (typeof data.groups)=='string'){
                    data.groups = [data.groups];
                }
                console.log(data);
                httpFlux.put('/groups/'+(groupId>0?groupId:''), data, {
                    success: function(){
                        console.log(arguments);
                        $('#groupForm').dialog( "close" );
                        renderGroupModule();
                    },
                    error: function(){
                        console.log('ERROR');
                        console.log(arguments);
                    }
                });

            },
            Cancel: function() {
                $('#groupForm').dialog( "close" );
            }
        },
        close: function() {
            $('#groupForm form')[ 0 ].reset();
            //allFields.removeClass( "ui-state-error" );
        }
    });

    $('#groupFormProgressBar').progressbar({
        value: false
    }).position({
        of: $('#groupFormProgressBar').parent(),
        my: 'center center',
        at: 'center center'
    }).find('.progress-label').text('Loading').position({
        of: $('#groupFormProgressBar'),
        my: 'center center',
        at: 'center center'
    });

    httpFlux.get('/users', {deleted_at:-1}, {
        success: function(records){
            console.log(records);
            $('#groupUserList .field').remove();
            for(var i=0;i<records.length;i++){
                groupHTML='<div class="field '+(i%2===0?'even':'odd')+'" style="clear: both;"><label for="users" style="float:left;">'+records[i].username+'</label><input type="checkbox" name="groupForm_users" data-role="field" style="float:right;" data-field="users" data-id="'+records[i].id+'"/></div>';
                $('#groupUserList').append(groupHTML);
            }

            if(groupId){
                httpFlux.get('/groups/'+groupId, {include: ['users']}, {
                    success: function(record){
                        console.log(record);
                        $('#groupForm_name').val(record.name);
                        $('#groupForm_enabled').prop('checked', record.enabled===0?false:true);

                        $('#groupFormProgressBar').hide();
                        $('#groupForm form').removeClass('ui-helper-hidden');
                        var formUsers = $('#groupForm form input[data-field="users"]');
                        
                        for(var ugIdx=0;ugIdx<record.users.length;ugIdx++){
                            for(var gIdx=0;gIdx<formUsers.length;gIdx++){

                                console.log(record.users[ugIdx].id, $(formUsers[gIdx]).attr('data-id'));
                                if(record.users[ugIdx].id==$(formUsers[gIdx]).attr('data-id')){
                                    $(formUsers[gIdx]).prop('checked', true);
                                }
                            }
                        }
                    },
                    error: function(){
                        alert('ERROR');
                        console.log(arguments);
                    }
                });
            }else{
                $('#groupFormProgressBar').hide();
                $('#groupForm form').removeClass('ui-helper-hidden');
            }
        },
        error: function(){

        }
    });
}

function showDeleteGroupConfirmation(groupId){
    httpFlux.get('/groups/'+groupId, {}, {
        success: function(record){
            var dlg = $('#groupDelete_Confirm').removeClass('ui-helper-hidden').dialog({
                title: 'Confirm Group Deletion',
                buttons:{
                    Yes: function(){
                        httpFlux.delete('/groups/'+groupId, null, {
                            success: function(){
                                alert('Group Deleted');
                                $('#groupDelete_Confirm').dialog( "close" );
                                renderGroupModule();
                            },
                            error: function(){
                                alert('ERROR');
                                console.log(arguments);
                            }
                        });
                    },
                    No: function(){
                        $('#groupDelete_Confirm').dialog( "close" );
                    }
                }
            }).html('Are you sure you want to delete the group <b>'+record.name+'</b>?');
        },
        error: function(){
            alert('ERROR');
            console.log(arguments);
        }
    });
}

function renderPathModule(){
    $('.flux-module').addClass('ui-helper-hidden');
    $('#pathModule').removeClass('ui-helper-hidden');
    $('#pathList tbody').empty();
    
    $('.path-add').click(function(){
        console.log('SHOWING PATH FORM');
        showPathForm();
        return false;
    });



    httpFlux.get('/paths', {deleted_at:-1}, {
        success: function(records){
            for(var i=0;i<records.length;i++){
                console.log('appending path');
                var rowHTML = '<tr role="row" class="'+(i%2===0?'even':'odd')+'"><td>'+records[i].path+'</td><td>'+(records[i].enabled?'Yes':'No')+'</td><td>';
                rowHTML+='<button data-id="'+records[i].id+'" data-action="edit"><img src="images/link_edit.png" title="Edit Path" class="grid-tool"/></button>&nbsp;<button data-id="'+records[i].id+'" data-action="delete"><img src="images/link_delete.png" title="Delete Path" class="grid-tool"/></button>&nbsp;<button data-id="'+records[i].id+'" data-action="edit_groups"><img src="images/group_edit.png"  title="Edit Permissions" class="grid-tool"/></button>';
                rowHTML+='</td></tr>';
                $('#pathList tbody').append(rowHTML);
            }
            
            $('#pathList').DataTable();
            $('#pathList tbody tr td button').click(function(){
                switch($(this).attr('data-action')){
                    case 'edit':
                        showPathForm($(this).attr('data-id'));
                        break;
                    case 'delete':
                        showDeletePathConfirmation($(this).attr('data-id'));
                        break;
                    case 'edit_groups':
                        showPathGroupForm($(this).attr('data-id'));
                        break;
                }
                return false;
            });
        },
        error: function(){
            connectionRefused();
        }
    });
}

function showPathForm(pathId){
    $('#pathForm').removeClass('ui-helper-hidden').dialog({
        title: pathId?'Edit Path':'Add Path',
        height: 400,
        width: 500,
        modal: false,
        buttons: {
            Save: function(){
                var allFields = $('#pathForm').find('[data-role="field"]');
                var data = {};
                for(var fidx=0;fidx<allFields.length;fidx++){

                    var fieldName = $(allFields[fidx]).attr('name');
                    var attrName = fieldName.replace('pathForm_', '');
                    var attrValue = $(allFields[fidx]).val();
                    if($(allFields[fidx]).attr('type')=='checkbox'){
                        if(attrName=='enabled'){
                            attrValue = $(allFields[fidx]).prop('checked')===true?1:0;
                        }else{
                            attrValue = $(allFields[fidx]).prop('checked')?$(allFields[fidx]).attr('data-id'):null;
                        }
                    }

                    if(attrValue!==null){
                        if(data[attrName]){
                            if((typeof data[attrName])=='string'){
                                data[attrName] = [data[attrName]];
                            }

                            data[attrName].push(attrValue);
                        }else{
                            data[attrName] = attrValue;
                        }
                    }
                }
                //load the path action information
                var actions = [];

                var actionsList = $('#pathActionList tbody tr').each(function(idx, row){
                    actions.push([
                        $(row).attr('data-id'),
                        idx+1
                    ]);
                });

                if(actions.length>0){
                    data.actions = actions;
                }
                
                httpFlux.put('/paths/'+(pathId>0?pathId:''), data, {
                    success: function(){
                        console.log(arguments);
                        $('#pathForm').dialog( "close" );
                        renderPathModule();
                    },
                    error: function(){
                        console.log('ERROR');
                        console.log(arguments);
                    }
                });

            },
            Cancel: function() {
                $('#pathForm').dialog( "close" );
            }
        },
        close: function() {
            $('#pathForm form')[ 0 ].reset();
            //allFields.removeClass( "ui-state-error" );
        }
    });

    $('#pathFormProgressBar').progressbar({
        value: false
    }).position({
        of: $('#pathFormProgressBar').parent(),
        my: 'center center',
        at: 'center center'
    }).find('.progress-label').text('Loading').position({
        of: $('#pathFormProgressBar'),
        my: 'center center',
        at: 'center center'
    });

    
    if(pathId){
        httpFlux.get('/actions', {}, {
            success: function(actions){
                $('#pathForm_newAction').empty();

                for(var i=0;i<actions.length;i++){
                    $('#pathForm_newAction').append('<option value="'+actions[i].id+'">'+actions[i].name+'</option>')
                }

                httpFlux.get('/paths/'+pathId,{include:['actions']}, {
                    success: function(record){
                        $('#pathForm_path').val(record.path);
                        $('#pathForm_enabled').prop('checked', record.enabled===0?false:true);

                        $('#pathFormProgressBar').hide();
                        $('#pathForm form').removeClass('ui-helper-hidden');
                        $('#pathActionList').removeClass('ui-helper-hidden');
                        $('#pathActionList table tbody').empty();
                        if(pathId){
                            for(var aIdx=0;aIdx<record.actions.length;aIdx++){
                                $('#pathActionList table tbody').append('<tr data-id="'+record.actions[aIdx].id+'"><td width="50%">'+record.actions[aIdx].name+'</td><td>'+(record.actions[aIdx].enabled==1?"Yes":"no")+'</td><td>'+record.actions[aIdx].action_order+'</td><td align="right"><button data-id="'+record.actions[aIdx].path_action_id+'" data-action="delete"><img src="images/lightning_delete.png" title="Delete Action"/></button></td></tr>');
                            }

                            $('#pathActionList table tbody tr td button').click(function(){
                                var pathActionId = $(this).attr('data-id');

                                $('#pathActionDelete_Confirm').removeClass('ui-helper-hidden').dialog({
                                    title: 'Confirm Path Action Deletion',
                                    modal: true,
                                    buttons: {
                                        Yes: function(){
                                            httpFlux.delete('/path_actions/'+pathActionId, null, {
                                                success: function(){
                                                    $('#pathActionDelete_Confirm').dialog('close');
                                                    showPathForm(pathId);
                                                },
                                                error: function(){
                                                    $('#pathActionDelete_Confirm').dialog('close');
                                                    console.log(arguments);
                                                    alert('ERROR CHECK CONSOLE');
                                                }
                                            });
                                        },
                                        No: function(){
                                            $('#pathActionDelete_Confirm').dialog('close');
                                        }
                                    }
                                });
                                return false;
                            });
                        }

                        $('#pathActionList table tbody').sortable();
                        if(!$('#pathActionList .pathAction-add').prop('actions_added')){
                            $('#pathActionList .pathAction-add').prop('actions_added', true);
                            $('#pathActionList .pathAction-add').click(function(){
                                                    
                                var data = {
                                    action_id: $('#pathForm_newAction').val(),
                                    path_id: pathId,
                                    action_order: $('#pathActionList table tbody tr').length+1
                                };
                                
                                httpFlux.post('/path_actions', data, {
                                    success: function(result){
                                        showPathForm(pathId);
                                    },
                                    error: function(err){
                                        console.log(err);
                                        alert('ERROR: Check Console');
                                    }
                                });

                                return false;
                            });
                        }
                        
                    },
                    error: function(){
                        alert('ERROR');
                        console.log(arguments);
                    }
                });
            },
            error: function(){
                alert('ERROR');
                        console.log(arguments);
            }
        });
        
    }else{
        $('#pathFormProgressBar').hide();
        $('#pathForm form').removeClass('ui-helper-hidden');
        $('#pathActionList tbody').empty();
        $('#pathActionList').addClass('ui-helper-hidden');
    }

}

function showPathGroupForm(pathId){
    $('#pathGroupForm').removeClass('ui-helper-hidden').dialog({
        title: 'Edit Path Groups',
        height: 400,
        width: 500,
        modal: false,
        buttons: {
            Save: function(){
                var allFields = $('#pathGroupForm').find('[data-role="field"]');
                var data = {};
                for(var fidx=0;fidx<allFields.length;fidx++){

                    var fieldName = $(allFields[fidx]).attr('name');
                    var attrName = fieldName.replace('pathForm_', '');
                    var attrValue = $(allFields[fidx]).val();
                    if($(allFields[fidx]).attr('type')=='checkbox'){
                        if(attrName=='enabled'){
                            attrValue = $(allFields[fidx]).prop('checked')===true?1:0;
                        }else{
                            attrValue = $(allFields[fidx]).prop('checked')?$(allFields[fidx]).attr('data-id'):null;
                        }
                    }

                    if(attrValue!==null){
                        if(data[attrName]){
                            if((typeof data[attrName])=='string'){
                                data[attrName] = [data[attrName]];
                            }

                            data[attrName].push(attrValue);
                        }else{
                            data[attrName] = attrValue;
                        }
                    }
                }
                //load the path action information
                var groups = [];

                var groupsList = $('#pathGroupList tbody tr').each(function(idx, row){
                    groups.push([
                        $(row).attr('data-id'),
                        idx+1
                    ]);
                });

                if(groups.length>0){
                    data.actions = groups;
                }
                
                httpFlux.put('/paths/'+(pathId>0?pathId:''), data, {
                    success: function(){
                        console.log(arguments);
                        $('#pathGroupForm').dialog( "close" );
                        renderPathModule();
                    },
                    error: function(){
                        console.log('ERROR');
                        console.log(arguments);
                    }
                });

            },
            Cancel: function() {
                $('#pathGroupForm').dialog( "close" );
            }
        },
        close: function() {
            $('#pathGroupForm form')[ 0 ].reset();
            //allFields.removeClass( "ui-state-error" );
        }
    });

    $('#pathGroupFormProgressBar').progressbar({
        value: false
    }).position({
        of: $('#pathGroupFormProgressBar').parent(),
        my: 'center center',
        at: 'center center'
    }).find('.progress-label').text('Loading').position({
        of: $('#pathFormProgressBar'),
        my: 'center center',
        at: 'center center'
    });

    
    if(pathId){
        httpFlux.get('/groups', {enabled: 1, deleted_at:-1}, {
            success: function(groups){
                $('#pathGroupForm_newGroup').empty();

                for(var i=0;i<groups.length;i++){
                    $('#pathGroupForm_newGroup').append('<option value="'+groups[i].id+'">'+groups[i].name+'</option>')
                }

                httpFlux.get('/paths/'+pathId,{include:['groups']}, {
                    success: function(record){
                        console.log(record);
                        console.log(record.path);
                        $('#pathGroupForm_path').val(record.path);
                        
                        $('#pathGroupFormProgressBar').hide();
                        $('#pathGroupForm form').removeClass('ui-helper-hidden');
                        $('#pathGroupList').removeClass('ui-helper-hidden');
                        $('#pathGroupList table tbody').empty();
                        
                        if(pathId && record.groups){
                            console.log('LISTING GROUPS');
                            for(var aIdx=0;aIdx<record.groups.length;aIdx++){
                                $('#pathGroupList table tbody').append('<tr data-id="'+record.groups[aIdx].id+'"><td width="50%" >'+record.groups[aIdx].name+'</td><td>'+(record.groups[aIdx].enabled==1?"Yes":"no")+'</td><td align="right"><button data-id="'+record.groups[aIdx].path_group_id+'" data-action="delete"><img src="images/lightning_delete.png" title="Delete Action"/></button></td></tr>');
                            }

                            $('#pathGroupList table tbody tr td button').click(function(){
                                var pathGroupId = $(this).attr('data-id');

                                $('#pathGroupDelete_Confirm').removeClass('ui-helper-hidden').dialog({
                                    title: 'Confirm Path Group Deletion',
                                    modal: true,
                                    buttons: {
                                        Yes: function(){
                                            httpFlux.delete('/path_groups/'+pathGroupId, null, {
                                                success: function(){
                                                    $('#pathGroupDelete_Confirm').dialog('close');
                                                    showPathGroupForm(pathId);
                                                },
                                                error: function(){
                                                    $('#pathGroupDelete_Confirm').dialog('close');
                                                    console.log(arguments);
                                                    alert('ERROR CHECK CONSOLE');
                                                }
                                            });
                                        },
                                        No: function(){
                                            $('#pathGroupDelete_Confirm').dialog('close');
                                        }
                                    }
                                });
                                return false;
                            });
                            $('#pathGroupList table tbody').sortable();
                        }

                        if(!$('#pathGroupList .pathGroup-add').prop('actions_added')){
                            $('#pathGroupList .pathGroup-add').prop('actions_added', true);
                            $('#pathGroupList .pathGroup-add').click(function(){
                                                    
                                var data = {
                                    group_id: $('#pathGroupForm_newGroup').val(),
                                    path_id: pathId
                                };
                                
                                httpFlux.post('/path_groups', data, {
                                    success: function(result){
                                        showPathGroupForm(pathId);
                                    },
                                    error: function(err){
                                        console.log(err);
                                        alert('ERROR: Check Console');
                                    }
                                });

                                return false;
                            });
                        }
                        
                    },
                    error: function(){
                        alert('ERROR');
                        console.log(arguments);
                    }
                });
            },
            error: function(){
                alert('ERROR');
                        console.log(arguments);
            }
        });
        
    }
}

function showDeletePathConfirmation(pathId){
    httpFlux.get('/paths/'+pathId, {}, {
        success: function(record){
            var dlg = $('#pathDelete_Confirm').removeClass('ui-helper-hidden').dialog({
                title: 'Confirm Path Deletion',
                buttons:{
                    Yes: function(){
                        httpFlux.delete('/paths/'+pathId, null, {
                            success: function(){
                                alert('Path Deleted');
                                $('#pathDelete_Confirm').dialog( "close" );
                                renderPathModule();
                            },
                            error: function(){
                                alert('ERROR');
                                console.log(arguments);
                            }
                        });
                    },
                    No: function(){
                        $('#pathDelete_Confirm').dialog( "close" );
                    }
                }
            }).html('Are you sure you want to delete the path <b>'+record.path+'</b>?');
        },
        error: function(){
            alert('ERROR');
            console.log(arguments);
        }
    });
}



function renderActionModule(){
    $('.flux-module').addClass('ui-helper-hidden');
    $('#actionModule').removeClass('ui-helper-hidden');
    $('#actionList tbody').empty();
    
    $('.action-add').click(function(){
        showActionForm();
    });

    httpFlux.get('/actions', {deleted_at:-1}, {
        success: function(records){
            for(var i=0;i<records.length;i++){
                console.log('appending action');
                var rowHTML = '<tr role="row" class="'+(i%2===0?'even':'odd')+'"><td>'+records[i].name+'</td><td>'+records[i].path+'</td><td>'+(records[i].enabled?'Yes':'No')+'</td><td>';
                rowHTML+='<button data-id="'+records[i].id+'" data-action="edit"><img src="images/link_edit.png" class="grid-tool"/></button>&nbsp;<button data-id="'+records[i].id+'" data-action="delete"><img src="images/link_delete.png" class="grid-tool"/></button>';
                rowHTML+='</td></tr>';
                $('#actionList tbody').append(rowHTML);
            }
            
            $('#actionList').DataTable();
            $('#actionList tbody tr td button').click(function(){
                if($(this).attr('data-action')=='delete'){
                    showDeleteActionConfirmation($(this).attr('data-id'));
                }else{
                    showActionForm($(this).attr('data-id'));
                }
            });
        },
        error: function(){
            connectionRefused();
        }
    });
}

function showActionForm(actionId){
    $('#actionForm').removeClass('ui-helper-hidden').dialog({
        title: actionId?'Edit Action':'Add Action',
        height: 400,
        width: 500,
        modal: true,
        buttons: {
            Save: function(){
                var allFields = $('#actionForm').find('[data-role="field"]');
                var data = {};
                console.log(allFields);
                for(var fidx=0;fidx<allFields.length;fidx++){

                    var fieldName = $(allFields[fidx]).attr('name');
                    var attrName = fieldName.replace('actionForm_', '');
                    var attrValue = $(allFields[fidx]).val();

                    if($(allFields[fidx]).attr('type')=='checkbox'){
                        if(attrName=='enabled'){
                            attrValue = $(allFields[fidx]).prop('checked')===true?1:0;
                        }else{
                            attrValue = $(allFields[fidx]).prop('checked')?$(allFields[fidx]).attr('data-id'):null;
                        }
                    }

                    if(attrValue!==null){
                        if(data[attrName]){
                            if((typeof data[attrName])=='string'){
                                data[attrName] = [data[attrName]];
                            }

                            data[attrName].push(attrValue);
                        }else{
                            data[attrName] = attrValue;
                        }
                    }
                }

                if(data.groups && (typeof data.groups)=='string'){
                    data.groups = [data.groups];
                }
                
                httpFlux.put('/actions/'+(actionId>0?actionId:''), data, {
                    success: function(){
                        console.log(arguments);
                        $('#actionForm').dialog( "close" );
                        renderActionModule();
                    },
                    error: function(){
                        console.log('ERROR');
                        console.log(arguments);
                    }
                });

            },
            Cancel: function() {
                $('#actionForm').dialog( "close" );
            }
        },
        close: function() {
            $('#actionForm form')[ 0 ].reset();
            //allFields.removeClass( "ui-state-error" );
        }
    });

    $('#actionFormProgressBar').progressbar({
        value: false
    }).position({
        of: $('#actionFormProgressBar').parent(),
        my: 'center center',
        at: 'center center'
    }).find('.progress-label').text('Loading').position({
        of: $('#actionFormProgressBar'),
        my: 'center center',
        at: 'center center'
    });

    
    if(actionId){
        httpFlux.get('/actions/'+actionId,{}, {
            success: function(record){
                $('#actionForm_name').val(record.name);
                $('#actionForm_path').val(record.path);
                $('#actionForm_enabled').prop('checked', record.enabled===0?false:true);

                $('#actionFormProgressBar').hide();
                $('#actionForm form').removeClass('ui-helper-hidden');
                var formGroups = $('#actionForm form input[data-field="group"]');
                
                /*for(var ugIdx=0;ugIdx<record.groups.length;ugIdx++){
                    for(var gIdx=0;gIdx<formGroups.length;gIdx++){
                        if(record.groups[ugIdx].id==$(formGroups[gIdx]).attr('data-id')){
                            $(formGroups[gIdx]).attr('checked', true);
                        }
                    }
                }*/
            },
            error: function(){
                alert('ERROR');
                console.log(arguments);
            }
        });
    }else{
        $('#actionFormProgressBar').hide();
        $('#actionForm form').removeClass('ui-helper-hidden');
    }

}

function showDeleteActionConfirmation(actionId){
    httpFlux.get('/actions/'+actionId, {}, {
        success: function(record){
            var dlg = $('#actionDelete_Confirm').removeClass('ui-helper-hidden').dialog({
                title: 'Confirm Action Deletion',
                buttons:{
                    Yes: function(){
                        httpFlux.delete('/paths/'+actionId, null, {
                            success: function(){
                                alert('Action Deleted');
                                $('#actionDelete_Confirm').dialog( "close" );
                                renderPathModule();
                            },
                            error: function(){
                                alert('ERROR');
                                console.log(arguments);
                            }
                        });
                    },
                    No: function(){
                        $('#actionDelete_Confirm').dialog( "close" );
                    }
                }
            }).html('Are you sure you want to delete the action <b>'+record.name+'</b>?');
        },
        error: function(){
            alert('ERROR');
            console.log(arguments);
        }
    });
}