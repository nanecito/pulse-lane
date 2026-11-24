/* Pulse Lane recording receiver — Google Apps Script web app.
   Deployed from Hugo's Google account: Execute as Me, access Anyone.
   Each game POSTs {key, name, b64} where b64 is a gzipped .ndjson recording.
   Files land in the Drive folder "Pulse Lane recordings"; a later send for
   the same session replaces the earlier one. */
var KEY = 'REPLACE_WITH_KEY';
var FOLDER = 'Pulse Lane recordings';

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.key !== KEY) return out({ ok: false, err: 'key' });
    var name = String(d.name || 'recording.ndjson.gz').replace(/[^\w.\-]/g, '_').slice(0, 120);
    var it = DriveApp.getFoldersByName(FOLDER);
    var folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
    var old = folder.getFilesByName(name);
    while (old.hasNext()) old.next().setTrashed(true);
    folder.createFile(Utilities.newBlob(Utilities.base64Decode(d.b64), 'application/gzip', name));
    return out({ ok: true, name: name });
  } catch (err) {
    return out({ ok: false, err: String(err) });
  }
}

function doGet() { return out({ ok: true, alive: true }); }

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
