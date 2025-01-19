# TODO

- [X] Task 1: List of SS commands
- [X] Task 2: Decide if we run them direct or have a batch that handles them
- [X] Task 3: Build global function that turns current dir into SS dir
- [X] Task 4: Checkout function
- [X] Task 5: Checkin function + comment
- [X] Task 6: Get latest file (file only)
- [ ] Task 7: Get latest recursive (all)
- [X] Task 8: Get current checked out
- [X] Task 9: Show icons on explorer menu
- [X] Task 10: Refresh on explorer to update icons
- [ ] Task 11: Hide files in explorer that arent our checked out
- [X] Task 12: Undo checkout function
- [ ] Task 13: Hide context functions if action not valid (check in/ undo checkout)
- [ ] Task 14: Create list of current checked out


cmd (replace):
-Y <username>,<password>
-C<comment>
-Q <!-- Specifies a quiet operation. -->
-R <!-- Specifies a recursive operation. -->


cmds:
set SSDIR=E:\VSS
set SSDIR=<VSS_DIR> <!-- this can be env variable if possible -->
ss Add <LOCAL_PATH> [-B] [-C] [-D-] [-H] [-I-] [-K] [-N] [-O] [-R] [-W] [-Y] [-?]
ss Checkin <VSS_PATH> [-C] [-H] [-I-] [-K] [-N] [-O] [-P[project]] [-R] [-W] [-Y] [-?]
ss Checkout <VSS_PATH> [-C] [-F] [-G] [-H] [-I-] [-L-] [-L+] [-M] [-N] [-O] [-R] [-V] [-Y] [-?]
ss Get <VSS_PATH> [-G] [-H] [-I-] [-N] [-O] [-R] [-V] [-W] [-Y] [-?]
ss Locate <VSS_PATH> [-H] [-I-] [-N] [-O] [-Y] [-?]
ss History <VSS_PATH> [-B] [-D] [-F-] [-H] [-I-] [-L] [-N] [-O] [-R] [-U<username>] [-V] [-Y] [-#] [-?]
ss Undocheckout <VSS_PATH> [-G] [-H] [-I-] [-N] [-O] [-P<project>] [-R] [-W] [-Y] [-?]

example:
E:\VS Code Extentions>cd ./testcase/dir1
ss get $/TestCase/dir1/ -r -q

notes:
So I can get the file path from:
the right click
the open file

locate doesnt seem too useful in my use

BEST WAY TO HANDLE FILE PATHS:
set SSDIR=<VSS_DIR>
CD <LOCAL_PATH>
<SS_CMD>

So all CMDs shoud set SSDIR and CD to local path
const path = require('path');

const filePath = 'E:\\VS Code Extentions\\TestCase\\dir1\\dir2\\file.txt';
const folderPath = path.dirname(filePath);