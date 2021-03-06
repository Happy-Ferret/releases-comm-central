/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var RELATIVE_ROOT = "../shared-modules";
var MODULE_REQUIRES = ["calendar-utils", "timezone-utils"];

var helpersForController, switchToView, goToDate;
var switchAppTimezone, verify, DATES, TIMEZONES;

/* rows - dates
   columns - correct time for each event */
var times = [
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
    [[0, 0], [2, 0], [3, 0], [3, 0], [5, 0], [5, 0], [7, 0], [8, 0]],
    [[0, 0], [2, 0], [3, 0], [3, 0], [5, 0], [5, 0], [7, 0], [9, 0]],
    [[0, 0], [2, 0], [3, 0], [3, 0], [5, 0], [5, 0], [7, 0], [9, 0]],
    [[0, 0], [2, 0], [3, 0], [3, 0], [5, 0], [5, 0], [7, 0], [9, 0]],
    [[0, 0], [2, 0], [3, 0], [3, 0], [5, 0], [5, 0], [7, 0], [8, 0]],
    [[0, 0], [2, 0], [3, 0], [3, 0], [5, 0], [6, 0], [7, 0], [8, 0]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]]
];

function setupModule(module) {
    controller = mozmill.getMail3PaneController();
    ({ helpersForController, switchToView, goToDate } =
        collector.getModule("calendar-utils"));
    collector.getModule("calendar-utils").setupModule();
    Object.assign(module, helpersForController(controller));
    ({ switchAppTimezone, verify, DATES, TIMEZONES } = collector.getModule("timezone-utils"));
    collector.getModule("timezone-utils").setupModule();
}

function testTimezones6_checkLosAngeles() {
    controller.click(eid("calendar-tab-button"));
    switchToView(controller, "day");
    goToDate(controller, 2009, 1, 1);

    verify(controller, DATES, TIMEZONES, times);
}

function teardownTest(module) {
    switchAppTimezone(TIMEZONES[4]);
}
