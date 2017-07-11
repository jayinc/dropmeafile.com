
serviceUrl = "http://localhost:30112/dropmeafile";
bucket = null;
extensions = {
  ai: { icon: "file_ai.png" },
  avi: { icon: "file_avi.png" },
  css: { icon: "file_css.png" },
  doc: { icon: "file_doc.png" },
  docx: { icon: "file_doc.png" },
  eps: { icon: "file_eps.png" },
  gif: { icon: "file_gif.png" },
  html: { icon: "file_html.png" },
  htm: { icon: "file_html.png" },
  jpg: { icon: "file_jpg.png" },
  mov: { icon: "file_mov.png" },
  mp4: { icon: "file_mov.png" },
  mp3: { icon: "file_mp3.png" },
  pdf: { icon: "file_pdf.png" },
  png: { icon: "file_png.png" },
  ppt: { icon: "file_ppt.png" },
  pptx: { icon: "file_ppt.png" },
  psd: { icon: "file_psd.png" },
  txt: { icon: "file_txt.png" },
  wav: { icon: "file_wav.png" },
  xls: { icon: "file_xls.png" },
  xlsx: { icon: "file_xls.png" },
  zip: { icon: "file_zip.png" },
  "7z": { icon: "file_zip.png" },
  other: { icon: "file_other.png" }
}
expireList = [
  { value: 5*60, desc: "5 minutes" },
  { value: 30*60, desc: "30 minutes" },
  { value: 2*3600, desc: "2 hours" },
  { value: 24*3600, desc: "1 day" },
  { value: 72*3600, desc: "3 days" },
]
expireIndex = 4;

var fileuploadOptions = {
  dataType: 'json',
  singleFileUploads: true,
  sequentialUploads: true,
  add: onUploadAdd,
  progress: onUploadProgress,
  done: onUploadDone
}

if (location.hash) openBucket(location.hash.substr(1));
else createBucket();


function initFileupload(fileInput, bucketId) {
  fileuploadOptions.url = serviceUrl + "/" + bucketId;
  $(fileInput).fileupload(fileuploadOptions);
}

function onUploadAdd(e, data) {
  var pendingFiles = data.files.map(function(f) {return {name: f.name}});
  bucket.files.push.apply(bucket.files, pendingFiles);
  data.context = pendingFiles;
  data.submit();
}

function onUploadProgress(e, data) {
  var pendingFiles = data.context;
  for (var i=0; i<pendingFiles.length; i++) pendingFiles[i].progress = data.loaded / data.total;
}

function onUploadDone(e, data) {
  var pendingFiles = data.context;
  var files = data.result;
  for (var i=0; i<pendingFiles.length; i++) {
    pendingFiles[i].progress = null;
    $.extend(pendingFiles[i], files[i]);
  }
}

function selectFile(file) {
  window.open(serviceUrl + "/" + bucket.id + "/" + file.id);
}

function openBucket(bucketId) {
  $.get({
    url: serviceUrl + "/" + bucketId,
    success: function(result) {
      bucket = result;
    },
    error: function() {
      alertModal.show("Bucket not found", function() {
        location.href = "/";
      })
    }
  })
}

function createBucket() {
  $.post(serviceUrl, function(result) {
    bucket = result;
  })
}

function getExtension(filename) {
  var index = filename.lastIndexOf(".");
  return index != -1 ? filename.substr(index+1).toLowerCase() : null;
}

function setExpiration(expire) {
  $.post({
    url: serviceUrl + "/" + bucket.id + "/expiration",
    contentType: "application/json",
    data: JSON.stringify({seconds: expire.value}),
    success: function() {
      var whenExpires = moment().add(expire.value, "seconds");
      alertPopup.show("Bucket will expire on " + whenExpires.format("MM/DD") + " at " + whenExpires.format("hh:mm a"), "success");
    }
  })
}

pickupDialog = new function() {
  this.visible = false;

  this.show = function() {
    this.visible = true;
  }
  this.hide = function() {
    this.visible = false;
  }
}

recipientsDialog = new function() {
  this.visible = false;

  this.show = function() {
    this.visible = true;
  }
}

function pickup(data) {
  var recipient = data.name + "-" + data.passphrase;
  $.get({
    url: serviceUrl + "/pickup/" + encodeURIComponent(recipient),
    success: function(result) {
      bucket = result;
      pickupDialog.hide();
    },
    error: function() {
      alertPopup.show("Bucket not found");
    }
  })
}

function copyUrl() {
  alertPopup.show("This page's URL has been copied to your clipboard.", "success");
}

alertPopup = new function() {
  this.message = null;
  this.context = null;
  this.visible = false;
  var timer;

  this.show = function(message, context) {
    this.message = message;
    this.context = context;
    this.visible = true;
    clearTimeout(timer);
    timer = setTimeout(this.hide.bind(this), 5000);
  }
  this.hide = function() {
    this.visible = false;
  }
}

alertModal = new function() {
  this.message = null;
  this.visible = false;
  this.onHide = null;

  this.show = function(message, onHide) {
    this.message = message;
    this.visible = true;
    this.onHide = onHide;
  }
  this.hide = function() {
    this.visible = false;
    if (this.onHide) this.onHide();
  }
}
