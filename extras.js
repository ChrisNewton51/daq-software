(function($) {
    var vsel = false;

    $(document).ready(function() {
        $("#voltage").on("click", function() {
            console.log("test");
            if (vsel) {
                $("#voltage").css("border", "1px solid blue");
                vsel = false;
            } else {
                $("#voltage").css("border", "none");
                vsel = true;
            }
        })

    });
})( jQuery );