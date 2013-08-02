var dashboard_installer = dashboard_installer || {};


dashboard_installer.install = function(){
    dashboard_installer.on_jquery(function(err){
        dashboard_installer.ready();
        $.showDialog("dialog/_loading_dashboard.html", {
          submit: function(data, callback) {

          }
        });


    });
}

dashboard_installer.redirect = function() {
    window.location = "/";
}

dashboard_installer.ready = function(){
    // since no dashboard, there is no _couch endpoint which this modified futon needs. reset
    $.couch.urlPrefix = "..";

    $.couch.replicate( "http://garden20.iriscouch.com/dashboard_seed", "dashboard", {
        success: function(data) {
            dashboard_installer.setup_config(function(err){
                if (err) alert('there was an error');
                dashboard_installer.setup_vhosts(function(){
                    $("#dialog, #overlay, #overlay-frame").remove();
                    window.location.reload();
                })
            });

        },
        error: function(status) {
            alert('There was a problem installing.');
            $("#dialog, #overlay, #overlay-frame").remove();
        }
    }, {
        create_target: true,
        doc_ids : [ '_design/dashboard'  ]
    });
}

dashboard_installer.setup_config = function(cb){
    $.couch.db('dashboard').saveDoc(dashboard_installer.config, {
        success : function(data) {
            cb();
        },
        error : function(status) {
            cb(status);
        }
    });
}

dashboard_installer.setup_vhosts = function(cb) {
    dashboard_installer.add_vhost_config('127.0.0.1:5984/dashboard', '/dashboard', function(){
        dashboard_installer.add_vhost_config('127.0.0.1:5984', '/dashboard/_design/dashboard/_rewrite/', function(){
           cb();
        });
    })
}

dashboard_installer.add_vhost_config = function(host, to, cb) {
    $.couch.config({
        success : function(result) {
            cb();
        }
    }, 'vhosts', host, to );
}




dashboard_installer.on_jquery = function(cb) {
    if (dashboard_installer.check_jquery()) {
        cb();
    } else {
        setTimeout(function(){
            dashboard_installer.on_jquery(cb);
        }, 500);
    }
}

dashboard_installer.check_jquery = function() {
    if ($ && $.couch) return true;
    else return false;
}

dashboard_installer.config = {
   "_id": "settings",
   "frontpage": {
       "use_markdown": true,
       "use_html": false,
       "show_activity_feed": false,
       "markdown": "## Welcome to your Garden\n\nHere are some things you might want to do:\n\n- [Configure](./settings#/frontpage) this front page.\n- [Install](./install) some apps.\n\n",
       "markdown_content": "<h2 id=\"welcometoyourgarden\">Welcome to your Garden</h2>\n\n<p>Here are some things you might want to do:</p>\n\n<ul>\n<li><a href=\"./settings#/frontpage\">Configure</a> this front page.</li>\n<li><a href=\"./install\">Install</a> some apps.</li>\n</ul>"
   },
   "host_options": {
       "short_urls": true,
       "hostnames": "http://127.0.0.1:5984/",
       "short_app_urls": true,
       "rootDashboard": true,
       "hosted": false,
       "login_type_undefined": true
   },
   "top_nav_bar": {
       "bg_color": "#1D1D1D",
       "link_color": "#BFBFBF",
       "active_link_color": "#FFFFFF",
       "active_link_bg_color": "#000000",
       "active_bar_color": "#bd0000",
       "show_brand": false,
       "icon_name": null,
       "brand_link": "",
       "show_gravatar": true,
       "show_username": true,
       "notification_theme": "libnotify",
       "admin_show_futon": true
   },
   "sessions": {
       "type": "internal",
       "internal": {
           "login_type": "local",
           "redirect_frontpage_on_anon": false
       },
       "other": {
           "login_url": "/users/_design/users-default/_rewrite/#/login",
           "login_url_next": "/users/_design/users-default/_rewrite/#/login/{next}",
           "signup_url": "/users/_design/users-default/_rewrite/#/signup",
           "profile_url": "/users/_design/users-default/_rewrite/#/profile/{username}"
       },
       "type_internal": true
   }

}