cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "com.filfatstudios.spinnerdialog.SpinnerDialog",
    "file": "plugins/com.filfatstudios.spinnerdialog/www/SpinnerDialog.js",
    "pluginId": "com.filfatstudios.spinnerdialog",
    "clobbers": [
      "SpinnerDialog"
    ]
  },
  {
    "id": "cordova-plugin-app-preferences.apppreferences",
    "file": "plugins/cordova-plugin-app-preferences/www/apppreferences.js",
    "pluginId": "cordova-plugin-app-preferences",
    "clobbers": [
      "plugins.appPreferences"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "com.filfatstudios.spinnerdialog": "1.0.2",
  "cordova-plugin-app-preferences": "0.99.3"
};
// BOTTOM OF METADATA
});