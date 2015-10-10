/**
 * This test checks to see if the smtp password failure is handled correctly.
 * The steps are:
 *   - Have an invalid password in the password database.
 *   - Check we get a prompt asking what to do.
 *   - Check retry does what it should do.
 *   - Check cancel does what it should do.
 *
 * XXX Due to problems with the fakeserver + smtp not using one connection for
 * multiple sends, the rest of this test is in test_smtpPasswordFailure2.js.
 */

Components.utils.import("resource:///modules/mailServices.js");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

load("../../../resources/alertTestUtils.js");
load("../../../resources/passwordStorage.js");

var server;
var attempt = 0;

var kSender = "from@foo.invalid";
var kTo = "to@foo.invalid";
var kUsername = "testsmtp";
// This is the same as in the signons file.
var kInvalidPassword = "smtptest";
var kValidPassword = "smtptest1";

function alert(aDialogText, aText)
{
  // The first few attempts may prompt about the password problem, the last
  // attempt shouldn't.
  do_check_true(attempt < 4);

  // Log the fact we've got an alert, but we don't need to test anything here.
  dump("Alert Title: " + aDialogText + "\nAlert Text: " + aText + "\n");
}

function confirmEx(aDialogTitle, aText, aButtonFlags, aButton0Title,
                   aButton1Title, aButton2Title, aCheckMsg, aCheckState) {
  switch (++attempt) {
    // First attempt, retry.
    case 1:
      dump("\nAttempting retry\n");
      return 0;
    // Second attempt, cancel.
    case 2:
      dump("\nCancelling login attempt\n");
      return 1;
    default:
      do_throw("unexpected attempt number " + attempt);
      return 1;
  }
}

add_task(function *() {
  function createHandler(d) {
    var handler = new SMTP_RFC2821_handler(d);
    // Username needs to match signons.txt
    handler.kUsername = kUsername;
    handler.kPassword = kValidPassword;
    handler.kAuthRequired = true;
    return handler;
  }
  server = setupServerDaemon(createHandler);

  // Prepare files for passwords (generated by a script in bug 1018624).
  yield setupForPassword("signons-mailnews1.8.json")

  registerAlertTestUtils();

  // Test file
  var testFile = do_get_file("data/message1.eml");

  // Ensure we have at least one mail account
  localAccountUtils.loadLocalMailAccount();

  server.start();
  var smtpServer = getBasicSmtpServer(server.port);
  var identity = getSmtpIdentity(kSender, smtpServer);

  // Handle the server in a try/catch/finally loop so that we always will stop
  // the server if something fails.
  try {
    // This time with auth
    test = "Auth sendMailMessage";

    smtpServer.authMethod = Ci.nsMsgAuthMethod.passwordCleartext;
    smtpServer.socketType = Ci.nsMsgSocketType.plain;
    smtpServer.username = kUsername;

    dump("Send\n");

    MailServices.smtp.sendMailMessage(testFile, kTo, identity,
                                      null, null, null, null,
                                      false, {}, {});

    server.performTest();

    dump("End Send\n");

    do_check_eq(attempt, 2);

    // Check that we haven't forgetton the login even though we've retried and
    // canceled.
    let count = {};
    let logins = Services.logins
                         .findLogins(count, "smtp://localhost", null,
                                     "smtp://localhost");

    do_check_eq(count.value, 1);
    do_check_eq(logins[0].username, kUsername);
    do_check_eq(logins[0].password, kInvalidPassword);
  } catch (e) {
    do_throw(e);
  } finally {
    server.stop();

    var thread = gThreadManager.currentThread;
    while (thread.hasPendingEvents())
      thread.processNextEvent(true);
  }
});

function run_test() {
  run_next_test();
}
