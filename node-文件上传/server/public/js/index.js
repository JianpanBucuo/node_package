 
function ajaxEvent(method,url, data, callback,errorEvent,contentType) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        dataType:'json',
        contentType:contentType,
        async: false,
        success: function(res){
                callback && callback(res)
        },
        error: function(e){
            errorEvent&& errorEvent(e)
        }
    })
} 