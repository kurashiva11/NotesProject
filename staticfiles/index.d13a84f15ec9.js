$( function(e) {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    // simply disables save event for chrome
    $(window).keypress(function (event) {
        if (!(event.which == 115 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) && !(event.which == 19)) return true;
        event.preventDefault();
        return false;
    });

    // used to process the cmd+s and ctrl+s events
    $(document).keydown(function (event) {
        if (event.which == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
            event.preventDefault();
            $('.save-file').click();
            return false;
        }
    });

    function get_files(){
        var files = $(".files").text();
        files = files.replace(/\"/g, '\\\"').replace(/\\\'/g, '`');
        files = files.replace(/\'/g, '"').replace(/\`/g, "'");
        files = JSON.parse(files)
        return files;
    }

    function reloadFiles(data){
        $(".files").text( data.filter(".files").text() );
        return get_files();
    }

    $('.file').click(function() {
        var name = $(this).text();
        var files = get_files();

        for(var i=0; i<files.length; i++){
            if(files[i]["name"].trim() == name.trim()){
                var temp = files[i].text;
                $('.notepad').val(temp);
                $(".fileName").val(name);
                break;
            }
        }
    });

    $(".fileDelete").click(function(e) {
        e.stopPropagation();
        var name = $(this).attr("id");

        if(confirm("Are you sure you want to delete " + name + " permanently?")){
            $.ajax({
                type: "post", // or "get"
                url: "deleteFile",
                data: {'name': name},
                headers: {'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()}, // for csrf token
                success: function(data) {
                    location.reload();
                },
                error: function(e){
                    alert("something went wrong");
                    location.reload();
                }
            });
        }

    });

    $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').trigger('focus');
    })

    $('.save-file').click(function() {
        var textarea = $(".notepad");
        var filename = $(".fileName");
        filename.val( filename.val().trim() );
        var temp = textarea.val();
        textarea.val(temp);
        var files = get_files();
        var files_len = files.length;

        $(".save-file").html('<span class="spinner-border spinner-border-sm nav-link"></span>' + " Saving");


        $.ajax({
            type: "post", // or "get"
            url: "addFile",
            data: {'filename': filename.val(), 'filedata': textarea.val()},
            headers: {'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()}, // for csrf token
            success: function(data) {
                files = reloadFiles($(data));
                $(".save-file").html("Save");
                if(files_len < files.length){
                    $(".components").html( $(".components").html() + `<li><a href="#" class='file' id='${filename.val()}'>${filename.val()} <span class="mr-1 fileDelete" id="${filename.val()}" style="float:right;"><i class="fa fa-trash" aria-hidden="true"></i></span></a></li>` );
                }
            },
            error: function(e){
                alert("something went wrong");
                location.reload();
            }
        });
    });
});