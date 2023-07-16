/* ref: jquery-1.8.3.min.js,  jquery-ui-1.9.2.min.js,  jquery-ui-1.9.2.css */
// BUG FIX: (JQuery): modal dialog scrolling issue.
// ReSharper disable UnusedParameter
(function ($, undefined) { if ($.ui && $.ui.dialog) { $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function (event) { return event + '.dialog-overlay'; }).join(' '); } }(jQuery));
// ReSharper restore UnusedParameter


$(document).ready(function () {
  $("#footerSwitch").click(function () { $("#buttonSwitchToMobileSite").click(); });

  /** Hyper Links do not underline when tabbed to using keyboard by default. focus(...) and blur(...) resolves issues. */
  $("a").focus(function () { this.style.cssText = "text-decoration: underline"; });
  $("a").blur(function () { this.style.cssText = ""; });

  // Set focus.
  try { $("input,textarea,select,button").filter(":visible").first().focus(); } catch(e) {}

  /** Remove any branded productName for Error Messages. */
  if ($("#_errorMessage") != null) { $("#_errorMessage").find(".productName").removeClass("productName"); }

  if ($("#_lnkUserIdChange").length)
    $("#_lnkUserIdChange").click(function () { $("#_buttonCancel").click(); });
});

function DispayWorkingPanel() {

    $("#tm_ui").css("height", $("#buttonPanel").height() + "px");
    $("#buttonPanel").hide();
    $("#workingPanelCtrl").show();
 };
