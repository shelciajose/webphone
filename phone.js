// Global Settings
var enabledExtendedServices = false;
var enabledGroupServices = false; 
var welcomeScreen = "<div class=\"UiWindowField scroller\"><pre style=\"font-size: 12px\">";
welcomeScreen += "</div>";
var availableLang = ["ja", "zh-hans", "zh", "ru", "tr", "nl"];

// User Settings & Defaults
var wssServer = getDbItem("wssServer", null);           
var profileUserID = getDbItem("profileUserID", null);   
var profileUser = getDbItem("profileUser", null);       
var profileName = getDbItem("profileName", null);       
var WebSocketPort = getDbItem("WebSocketPort", null);   
var ServerPath = getDbItem("ServerPath", null);        
var SipUsername = getDbItem("SipUsername", null);       
var SipPassword = getDbItem("SipPassword", null);     

var TransportConnectionTimeout = parseInt(getDbItem("TransportConnectionTimeout", 15));        
var TransportReconnectionAttempts = parseInt(getDbItem("TransportReconnectionAttempts", 99));  
var TransportReconnectionTimeout = parseInt(getDbItem("TransportReconnectionTimeout", 15));    
var userAgentStr = getDbItem("UserAgentStr", "Asterisk");
var hostingPrefex = getDbItem("HostingPrefex", "");                                 
var RegisterExpires = parseInt(getDbItem("RegisterExpires", 300));                  // Registration expiry time
var WssInTransport = (getDbItem("WssInTransport", "1") == "1");                     
var IpInContact = (getDbItem("IpInContact", "1") == "1");                           
var IceStunServerProtocol = getDbItem("IceStunServerProtocol", "stun");             
var IceStunServerAddress = getDbItem("IceStunServerAddress", "stun.l.google.com");  
var IceStunServerPort = getDbItem("IceStunServerPort", "19302");                    
var IceStunCheckTimeout = parseInt(getDbItem("IceStunCheckTimeout", 500));         
var AutoAnswerEnabled = (getDbItem("AutoAnswerEnabled", "0") == "1");       
var DoNotDisturbEnabled = (getDbItem("DoNotDisturbEnabled", "0") == "1");   
var CallWaitingEnabled = (getDbItem("CallWaitingEnabled", "1") == "1");     
var RecordAllCalls = (getDbItem("RecordAllCalls", "0") == "1");             
var StartVideoFullScreen = (getDbItem("StartVideoFullScreen", "1") == "1"); 
var AutoGainControl = (getDbItem("AutoGainControl", "1") == "1");       
var EchoCancellation = (getDbItem("EchoCancellation", "1") == "1");     
var NoiseSuppression = (getDbItem("NoiseSuppression", "1") == "1");     
var MirrorVideo = getDbItem("VideoOrientation", "rotateY(180deg)");     
var maxFrameRate = getDbItem("FrameRate", "");                          
var videoHeight = getDbItem("VideoHeight", "");                         
var videoAspectRatio = getDbItem("AspectRatio", "");                    
var NotificationsActive = (getDbItem("Notifications", "0") == "1");

var StreamBuffer = parseInt(getDbItem("StreamBuffer", 50));                 
var PosterJpegQuality = parseFloat(getDbItem("PosterJpegQuality", 0.6));    
var VideoResampleSize = getDbItem("VideoResampleSize", "HD");               
var RecordingVideoSize = getDbItem("RecordingVideoSize", "HD");             
var RecordingVideoFps = parseInt(getDbItem("RecordingVideoFps", 12));       
var RecordingLayout = getDbItem("RecordingLayout", "them-pnp");             

var DidLength = parseInt(getDbItem("DidLength", 6));                 
var MaxDidLength = parseInt(getDbItem("maximumNumberLength", 16));   
var DisplayDateFormat = getDbItem("DateFormat", "YYYY-MM-DD");  
var DisplayTimeFormat = getDbItem("TimeFormat", "h:mm:ss A");   
var Language = getDbItem("Language", "auto");   

// Permission Settings
var EnableTextMessaging = (getDbItem("EnableTextMessaging", "1") == "1");              
var DisableFreeDial = (getDbItem("DisableFreeDial", "0") == "1");                       
var DisableBuddies = (getDbItem("DisableBuddies", "0") == "1");                         
var EnableTransfer = (getDbItem("EnableTransfer", "1") == "1");                         
var EnableConference = (getDbItem("EnableConference", "1") == "1");                     
var AutoAnswerPolicy = getDbItem("AutoAnswerPolicy", "allow");                          
var DoNotDisturbPolicy = getDbItem("DoNotDisturbPolicy", "allow");                      
var CallWaitingPolicy = getDbItem("CallWaitingPolicy", "allow");                        
var CallRecordingPolicy = getDbItem("CallRecordingPolicy", "allow");                    
var EnableAccountSettings = (getDbItem("EnableAccountSettings", "1") == "1");           
var EnableAudioVideoSettings = (getDbItem("EnableAudioVideoSettings", "1") == "1");     
var EnableAppearanceSettings = (getDbItem("EnableAppearanceSettings", "1") == "1");     
var EnableNotificationSettings = (getDbItem("EnableNotificationSettings", "1") == "1"); 
var EnableAlphanumericDial = (getDbItem("EnableAlphanumericDial", "0") == "1");         
var EnableVideoCalling = (getDbItem("EnableVideoCalling", "1") == "1");                

// System variables
var localDB = window.localStorage;
var userAgent = null;
var voicemailSubs = null;
var BlfSubs = [];
var CanvasCollection = [];
var Buddies = [];
var isReRegister = false;
var dhtmlxPopup = null;
var selectedBuddy = null;
var selectedLine = null;
var alertObj = null;
var confirmObj = null;
var promptObj = null;
var windowsCollection = null;
var messagingCollection = null;
var HasVideoDevice = false;
var HasAudioDevice = false;
var HasSpeakerDevice = false;
var AudioinputDevices = [];
var VideoinputDevices = [];
var SpeakerDevices = [];
var Lines = [];
var lang = {}
var audioBlobs = {}


// Upgrade Pataches
var oldUserBuddies = localDB.getItem("UserBuddiesJson");
if(oldUserBuddies != null && profileUserID != null) {
    localDB.setItem(profileUserID + "-Buddies", oldUserBuddies);
    localDB.removeItem("UserBuddiesJson");
}
oldUserBuddies = null;

// Utilities
function uID(){
    return Date.now()+Math.floor(Math.random()*10000).toString(16).toUpperCase();
}
function utcDateNow(){
    return moment().utc().format("YYYY-MM-DD HH:mm:ss UTC");
}
function getDbItem(itemIndex, defaultValue){
    var localDB = window.localStorage;
    if(localDB.getItem(itemIndex) != null) return localDB.getItem(itemIndex);
    return defaultValue;
}
function getAudioSrcID(){
    var id = localDB.getItem("AudioSrcId");
    return (id != null)? id : "default";
}
function getAudioOutputID(){
    var id = localDB.getItem("AudioOutputId");
    return (id != null)? id : "default";
}
function getVideoSrcID(){
    var id = localDB.getItem("VideoSrcId");
    return (id != null)? id : "default";
}
function getRingerOutputID(){
    var id = localDB.getItem("RingerOutputId");
    return (id != null)? id : "default";
}
function formatDuration(seconds){
    var sec = Math.floor(parseFloat(seconds));
    if(sec < 0){
        return sec;
    } 
    else if(sec >= 0 && sec < 60){
        return sec + " " + ((sec > 1) ? lang.seconds_plural : lang.second_single);
    } 
    else if(sec >= 60 && sec < 60 * 60){ // greater then a minute and less then an hour
        var duration = moment.duration(sec, 'seconds');
        return duration.minutes() + " "+ ((duration.minutes() > 1) ? lang.minutes_plural: lang.minute_single) +" " + duration.seconds() +" "+ ((duration.seconds() > 1) ? lang.seconds_plural : lang.second_single);
    } 
    else if(sec >= 60 * 60 && sec < 24 * 60 * 60){ // greater than an hour and less then a day
        var duration = moment.duration(sec, 'seconds');
        return duration.hours() + " "+ ((duration.hours() > 1) ? lang.hours_plural : lang.hour_single) +" " + duration.minutes() + " "+ ((duration.minutes() > 1) ? lang.minutes_plural: lang.minute_single) +" " + duration.seconds() +" "+ ((duration.seconds() > 1) ? lang.seconds_plural : lang.second_single);
    } 
   
}
function formatShortDuration(seconds){
    var sec = Math.floor(parseFloat(seconds));
    if(sec < 0){
        return sec;
    } 
    else if(sec >= 0 && sec < 60){
        return "00:"+ ((sec > 9)? sec : "0"+sec );
    } 
    else if(sec >= 60 && sec < 60 * 60){ // greater then a minute and less then an hour
        var duration = moment.duration(sec, 'seconds');
        return ((duration.minutes() > 9)? duration.minutes() : "0"+duration.minutes()) + ":" + ((duration.seconds() > 9)? duration.seconds() : "0"+duration.seconds());
    } 
    else if(sec >= 60 * 60 && sec < 24 * 60 * 60){ // greater than an hour and less then a day
        var duration = moment.duration(sec, 'seconds');
        return ((duration.hours() > 9)? duration.hours() : "0"+duration.hours())  + ":" + ((duration.minutes() > 9)? duration.minutes() : "0"+duration.minutes())  + ":" + ((duration.seconds() > 9)? duration.seconds() : "0"+duration.seconds());
    } 

}
function formatBytes(bytes, decimals) {
    if (bytes === 0) return "0 "+ lang.bytes;
    var k = 1024;
    var dm = (decimals && decimals >= 0)? decimals : 2;
    var sizes = [lang.bytes, lang.kb, lang.mb, lang.gb, lang.tb, lang.pb, lang.eb, lang.zb, lang.yb];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
function UserLocale(){
    var language = window.navigator.userLanguage || window.navigator.language;

    langtag = language.split('-');
    if(langtag.length == 1){
        return ""; 
    } 
    else if(langtag.length == 2) {
        return langtag[1].toLowerCase();  // en-US => us
    }
    else if(langtag.length >= 3) {
        return langtag[1].toLowerCase();  // en-US => us
    }
}
function GetAlternateLanguage(){
    var userLanguage = window.navigator.userLanguage || window.navigator.language; 
    if(Language != "auto") userLanguage = Language;
    userLanguage = userLanguage.toLowerCase();
    if(userLanguage == "en" || userLanguage.indexOf("en-") == 0) return "";  

    for(l = 0; l < availableLang.length; l++){
        if(userLanguage.indexOf(availableLang[l].toLowerCase()) == 0){
            console.log("Alternate Language detected: ", userLanguage);
            
            moment.locale(userLanguage);
            return availableLang[l].toLowerCase();
        }
    }
    return "";
}
function getFilter(filter, keyword){
    if(filter.indexOf(",", filter.indexOf(keyword +": ") + keyword.length + 2) != -1){
        return filter.substring(filter.indexOf(keyword +": ") + keyword.length + 2, filter.indexOf(",", filter.indexOf(keyword +": ") + keyword.length + 2));
    }
    else {
        return filter.substring(filter.indexOf(keyword +": ") + keyword.length + 2);
    }
}
function base64toBlob(base64Data, contentType) {
    if(base64Data.indexOf("," != -1)) base64Data = base64Data.split(",")[1];
    var byteCharacters = atob(base64Data);
    var slicesCount = Math.ceil(byteCharacters.length / 1024);
    var byteArrays = new Array(slicesCount);
    for (var s = 0; s < slicesCount; ++s) {
        var begin = s * 1024;
        var end = Math.min(begin + 1024, byteCharacters.length);
        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[s] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}
function MakeDataArray(defaultValue, count){
    var rtnArray = new Array(count);
    for(var i=0; i< rtnArray.length; i++) {
        rtnArray[i] = defaultValue;
    }
    return rtnArray;
}

// Window and Document Events
$(window).on("beforeunload", function() {
    Unregister();
});
$(window).on("resize", function() {
    UpdateUI();
});

// User Interface
function UpdateUI(){
    if($(window).outerWidth() < 920){
        // Narrow Layout
        if(selectedBuddy == null & selectedLine == null) {
            $("#rightContent").hide();

            $("#leftContent").css("width", "100%");
            $("#leftContent").show();
        }
        else {
            $("#rightContent").css("margin-left", "0px");
            $("#rightContent").show();

            $("#leftContent").hide();
            
            if(selectedBuddy != null) updateScroll(selectedBuddy.identity);
        }
    }
    else {
        // Wide Screen Layout
        if(selectedBuddy == null & selectedLine == null) {
            $("#leftContent").css("width", "100%");
            $("#rightContent").css("margin-left", "0px");
            $("#leftContent").show();
            $("#rightContent").hide();
        }
        else{
            $("#leftContent").css("width", "320px");
            $("#rightContent").css("margin-left", "320px");
            $("#leftContent").show();
            $("#rightContent").show();

            if(selectedBuddy != null) updateScroll(selectedBuddy.identity);
        }
    }
    for(var l=0; l<Lines.length; l++){
        updateLineScroll(Lines[l].LineNumber);
    }
    HidePopup();
}

// UI Windows
function AddSomeoneWindow(numberStr){
    HidePopup();

    var html = "<div border=0 class='UiWindowField scroller'>";

    html += "<div class=UiText>"+ lang.full_name +":</div>";
    html += "<div><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"'></div>";

    html += "<div class=UiText>"+ lang.internal_subscribe_extension +":</div>";
    if(numberStr && numberStr.length > 1 && numberStr.length < DidLength && numberStr.substring(0,1) != "*"){
        html += "<div><input id=AddSomeone_Exten class=UiInputText type=text value="+ numberStr +" placeholder='"+ lang.eg_internal_subscribe_extension +"'></div>";
    } 
    else{
        html += "<div><input id=AddSomeone_Exten class=UiInputText type=text placeholder='"+ lang.eg_internal_subscribe_extension +"'></div>";
    }
    html += "</div>"
    OpenWindow(html, lang.add_someone, 480, 640, false, true, lang.add, function(){

        // Add Contact / Extension
        var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
        if(json == null) json = InitUserBuddies();

        if($("#AddSomeone_Exten").val() == ""){
            // Add Regular Contact
            var id = uID();
            var dateNow = utcDateNow();
            json.DataCollection.push(
                {
                    Type: "contact", 
                    LastActivity: dateNow,
                    ExtensionNumber: "", 
                    MobileNumber: $("#AddSomeone_Mobile").val(),
                    ContactNumber1: $("#AddSomeone_Num1").val(),
                    ContactNumber2: $("#AddSomeone_Num2").val(),
                    uID: null,
                    cID: id,
                    gID: null,
                    DisplayName: $("#AddSomeone_Name").val(),
                    Position: "",
                    Description: $("#AddSomeone_Desc").val(),
                    Email: $("#AddSomeone_Email").val(),
                    MemberCount: 0
                }
            );
            var buddyObj = new Buddy("contact", id, $("#AddSomeone_Name").val(), "", $("#AddSomeone_Mobile").val(), $("#AddSomeone_Num1").val(), $("#AddSomeone_Num2").val(), dateNow, $("#AddSomeone_Desc").val(), $("#AddSomeone_Email").val());
            AddBuddy(buddyObj, false, false);
        }
        else {
            // Add Extension
            var id = uID();
            var dateNow = utcDateNow();
            json.DataCollection.push(
                {
                    Type: "extension",
                    LastActivity: dateNow,
                    ExtensionNumber: $("#AddSomeone_Exten").val(),
                    MobileNumber: $("#AddSomeone_Mobile").val(),
                    ContactNumber1: $("#AddSomeone_Num1").val(),
                    ContactNumber2: $("#AddSomeone_Num2").val(),
                    uID: id,
                    cID: null,
                    gID: null,
                    DisplayName: $("#AddSomeone_Name").val(),
                    Position: $("#AddSomeone_Desc").val(),
                    Description: "", 
                    Email: $("#AddSomeone_Email").val(),
                    MemberCount: 0
                }
            );
            var buddyObj = new Buddy("extension", id, $("#AddSomeone_Name").val(), $("#AddSomeone_Exten").val(), $("#AddSomeone_Mobile").val(), $("#AddSomeone_Num1").val(), $("#AddSomeone_Num2").val(), dateNow, $("#AddSomeone_Desc").val(), $("#AddSomeone_Email").val());
            AddBuddy(buddyObj, false, false, true);
        }
        // Update Size: 
        json.TotalRows = json.DataCollection.length;

        // Save To DB
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));

        UpdateBuddyList();

        CloseWindow();
    }, lang.cancel, function(){
        CloseWindow();
    });
}

function ConfigureExtensionWindow(){
    HidePopup();

    OpenWindow("...", lang.configure_extension , 480, 640, false, true, lang.save, function(){

        // 1 Account
        if(localDB.getItem("profileUserID") == null) localDB.setItem("profileUserID", uID()); // For first time only
        localDB.setItem("wssServer", $("#Configure_Account_wssServer").val());
        localDB.setItem("WebSocketPort", $("#Configure_Account_WebSocketPort").val());
        localDB.setItem("ServerPath", $("#Configure_Account_ServerPath").val());
        localDB.setItem("profileUser", $("#Configure_Account_profileUser").val());
        localDB.setItem("profileName", $("#Configure_Account_profileName").val());
        localDB.setItem("SipUsername", $("#Configure_Account_SipUsername").val());
        localDB.setItem("SipPassword", $("#Configure_Account_SipPassword").val());

        // 2 Audio & Video
        localDB.setItem("AudioOutputId", $("#playbackSrc").val());
        localDB.setItem("VideoSrcId", $("#previewVideoSrc").val());
        localDB.setItem("VideoHeight", $("input[name=Settings_Quality]:checked").val());
        localDB.setItem("AudioSrcId", $("#microphoneSrc").val());
        localDB.setItem("RingOutputId", $("#ringDevice").val());

        // 3 Appearance
        $("#ImageCanvas").croppie('result', { 
            type: 'base64', 
            size: 'viewport', 
            format: 'png', 
            quality: 1, 
            circle: false 
        }).then(function(base64) {
            localDB.setItem("profilePicture", base64);
        });

        // 4 Notifications
        localDB.setItem("Notifications", ($("#Settings_Notifications").is(":checked"))? "1" : "0");

        Alert(lang.alert_settings, lang.reload_required, function(){
            window.location.reload();
        });

        // CloseWindow();
    }, lang.cancel, function(){
        CloseWindow();
    }, function(){
        // DoOnLoad
    },function(){
        // OnClose

        var localVideo = $("#local-video-preview").get(0);
        try{
            var tracks = localVideo.srcObject.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
            localVideo.srcObject = null;
        }
        catch(e){}

        try{
            var tracks = window.SettingsMicrophoneStream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
        }
        catch(e){}
        window.SettingsMicrophoneStream = null;

        try{
            var soundMeter = window.SettingsMicrophoneSoundMeter;
            soundMeter.stop();
        }
        catch(e){}   
        window.SettingsMicrophoneSoundMeter = null;
        
        try{
            window.SettingsOutputAudio.pause();
        }
        catch(e){}
        window.SettingsOutputAudio = null;

        try{
            var tracks = window.SettingsOutputStream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
        }
        catch(e){}
        window.SettingsOutputStream = null;

        try{
            var soundMeter = window.SettingsOutputStreamMeter;
            soundMeter.stop();
        }
        catch(e){}
        window.SettingsOutputStreamMeter = null;

        return true;
    });

    // Write HTML to Tabs
    var windowObj = windowsCollection.window("window");
    var ConfigureTabbar = windowObj.attachTabbar({ 
        tabs: [
            { id: "1", text: lang.account, active:  true },
            { id: "2", text: lang.audio_video, active:  false },
            { id: "3", text: lang.appearance, active:  false },
            { id: "4", text: lang.notifications , active:  false }
        ]
    });
    if(EnableAccountSettings == false) ConfigureTabbar.tabs("1").hide();
    if(EnableAudioVideoSettings == false) ConfigureTabbar.tabs("2").hide();
    if(EnableAppearanceSettings == false) ConfigureTabbar.tabs("3").hide();
    if(EnableNotificationSettings == false) ConfigureTabbar.tabs("4").hide();

    // 1 Account
    var AccountHtml =  "<div class=\"UiWindowField scroller\">";
    AccountHtml += "<div class=UiText>"+ lang.asterisk_server_address +":</div>";
    AccountHtml += "<div><input id=Configure_Account_wssServer class=UiInputText type=text placeholder='"+ lang.eg_asterisk_server_address +"' value='"+ getDbItem("wssServer", "") +"'></div>";

    AccountHtml += "<div class=UiText>"+ lang.websocket_port +":</div>";
    AccountHtml += "<div><input id=Configure_Account_WebSocketPort class=UiInputText type=text placeholder='"+ lang.eg_websocket_port +"' value='"+ getDbItem("WebSocketPort", "") +"'></div>";

    AccountHtml += "<div class=UiText>"+ lang.websocket_path +":</div>";
    AccountHtml += "<div><input id=Configure_Account_ServerPath class=UiInputText type=text placeholder='"+ lang.eg_websocket_path +"' value='"+ getDbItem("ServerPath", "") +"'></div>";

    AccountHtml += "<div class=UiText>"+ lang.internal_subscribe_extension +":</div>";
    AccountHtml += "<div><input id=Configure_Account_profileUser class=UiInputText type=text placeholder='"+ lang.eg_internal_subscribe_extension +"' value='"+ getDbItem("profileUser", "") +"'></div>";

    AccountHtml += "<div class=UiText>"+ lang.full_name +":</div>";
    AccountHtml += "<div><input id=Configure_Account_profileName class=UiInputText type=text placeholder='"+ lang.eg_full_name +"' value='"+ getDbItem("profileName", "") +"'></div>";

    AccountHtml += "<div class=UiText>"+ lang.sip_username +":</div>";
    AccountHtml += "<div><input id=Configure_Account_SipUsername class=UiInputText type=text placeholder='"+ lang.eg_sip_username +"' value='"+ getDbItem("SipUsername", "") +"'></div>";

    AccountHtml += "<div class=UiText>"+ lang.sip_password +":</div>";
    AccountHtml += "<div><input id=Configure_Account_SipPassword class=UiInputText type=password placeholder='"+ lang.eg_sip_password +"' value='"+ getDbItem("SipPassword", "") +"'></div>";
    AccountHtml += "<br><br></div>";

    ConfigureTabbar.tabs("1").attachHTMLString(AccountHtml);

    // 2 Audio & Video
    var AudioVideoHtml = "<div class=\"UiWindowField scroller\">";

    AudioVideoHtml += "<div class=UiText>"+ lang.speaker +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center\"><select id=playbackSrc style=\"width:100%\"></select></div>";
    AudioVideoHtml += "<div class=Settings_VolumeOutput_Container><div id=Settings_SpeakerOutput class=Settings_VolumeOutput></div></div>";
    AudioVideoHtml += "<div><button class=on_white id=preview_output_play><i class=\"fa fa-play\"></i></button></div>";

    AudioVideoHtml += "<div class=UiText>"+ lang.microphone +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center\"><select id=microphoneSrc style=\"width:100%\"></select></div>";
    AudioVideoHtml += "<div class=Settings_VolumeOutput_Container><div id=Settings_MicrophoneOutput class=Settings_VolumeOutput></div></div>";

    AudioVideoHtml += "<div class=UiText>"+ lang.camera +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center\"><select id=previewVideoSrc style=\"width:100%\"></select></div>";
    
    AudioVideoHtml += "<div class=UiText>"+ lang.preview +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center; margin-top:10px\"><video id=local-video-preview class=previewVideo></video></div>";
    
    AudioVideoHtml += "<div id=RingDeviceSection>";
    AudioVideoHtml += "<div class=UiText>"+ lang.ring_device +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center\"><select id=ringDevice style=\"width:100%\"></select></div>";
    AudioVideoHtml += "</div>";
    
    AudioVideoHtml += "<BR><BR></div>";

    ConfigureTabbar.tabs("2").attachHTMLString(AudioVideoHtml);

    // Output
    var selectAudioScr = $("#playbackSrc");

    var playButton = $("#preview_output_play");

    // Microphone
    var selectMicScr = $("#microphoneSrc");
    $("#Settings_AutoGainControl").prop("checked", AutoGainControl);
    $("#Settings_EchoCancellation").prop("checked", EchoCancellation);
    $("#Settings_NoiseSuppression").prop("checked", NoiseSuppression);
    
    // Webcam
    var selectVideoScr = $("#previewVideoSrc");

    // Orientation
    var OriteationSel = $("input[name=Settings_Oriteation]");
    OriteationSel.each(function(){
        if(this.value == MirrorVideo) $(this).prop("checked", true);
    });
    $("#local-video-preview").css("transform", MirrorVideo);   

    // Ring Device
    var selectRingDevice = $("#ringDevice");

    // Handle Audio Source changes (Microphone)
    selectMicScr.change(function(){
        console.log("Call to change Microphone ("+ this.value +")");

        // Change and update visual preview
        try{
            var tracks = window.SettingsMicrophoneStream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
            window.SettingsMicrophoneStream = null;
        }
        catch(e){}

        try{
            soundMeter = window.SettingsMicrophoneSoundMeter;
            soundMeter.stop();
            window.SettingsMicrophoneSoundMeter = null;
        }
        catch(e){}

        // Get Microphone
        var constraints = { 
            audio: {
                deviceId: { exact: this.value }
            }, 
            video: false 
        }
        var localMicrophoneStream = new MediaStream();
        navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream){
            var audioTrack = mediaStream.getAudioTracks()[0];
            if(audioTrack != null){
                // Display Micrphone Levels
                localMicrophoneStream.addTrack(audioTrack);
                window.SettingsMicrophoneStream = localMicrophoneStream;
                window.SettingsMicrophoneSoundMeter = MeterSettingsOutput(localMicrophoneStream, "Settings_MicrophoneOutput", "width", 50);
            }
        }).catch(function(e){
            console.log("Failed to getUserMedia", e);
        });
    });

    // Handle output change (speaker)
    selectAudioScr.change(function(){
        console.log("Call to change Speaker ("+ this.value +")");

        var audioObj = window.SettingsOutputAudio;
        if(audioObj != null) {
            if (typeof audioObj.sinkId !== 'undefined') {
                audioObj.setSinkId(this.value).then(function() {
                    console.log("sinkId applied to audioObj:", this.value);
                }).catch(function(e){
                    console.warn("Failed not apply setSinkId.", e);
                });
            }
        }
    });

    // play button press
    playButton.click(function(){

        try{
            window.SettingsOutputAudio.pause();
        } 
        catch(e){}
        window.SettingsOutputAudio = null;

        try{
            var tracks = window.SettingsOutputStream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
        }
        catch(e){}
        window.SettingsOutputStream = null;

        try{
            var soundMeter = window.SettingsOutputStreamMeter;
            soundMeter.stop();
        }
        catch(e){}
        window.SettingsOutputStreamMeter = null;

        // Load Sample
        console.log("Audio:", audioBlobs.speech_orig.url);
        var audioObj = new Audio(audioBlobs.speech_orig.blob);
        audioObj.preload = "auto";
        audioObj.onplay = function(){
            var outputStream = new MediaStream();
            if (typeof audioObj.captureStream !== 'undefined') {
                outputStream = audioObj.captureStream();
            } 
            else if (typeof audioObj.mozCaptureStream !== 'undefined') {
                return;
                outputStream = audioObj.mozCaptureStream();
            }
            else if (typeof audioObj.webkitCaptureStream !== 'undefined') {
                outputStream = audioObj.webkitCaptureStream();
            }
            else {
                console.warn("Cannot display Audio Levels")
                return;
            }
            // Monitor Output
            window.SettingsOutputStream = outputStream;
            window.SettingsOutputStreamMeter = MeterSettingsOutput(outputStream, "Settings_SpeakerOutput", "width", 50);
        }
        audioObj.oncanplaythrough = function(e) {
            if (typeof audioObj.sinkId !== 'undefined') {
                audioObj.setSinkId(selectAudioScr.val()).then(function() {
                    console.log("Set sinkId to:", selectAudioScr.val());
                }).catch(function(e){
                    console.warn("Failed not apply setSinkId.", e);
                });
            }
            // Play
            audioObj.play().then(function(){
                // Audio Is Playing
            }).catch(function(e){
                console.warn("Unable to play audio file", e);
            });
            console.log("Playing sample audio file... ");
        }

        window.SettingsOutputAudio = audioObj;
    });

    // Change Video Image
    OriteationSel.change(function(){
        console.log("Call to change Orientation ("+ this.value +")");
        $("#local-video-preview").css("transform", this.value);
    });

    // Handle video input change (WebCam)
    selectVideoScr.change(function(){
        console.log("Call to change WebCam ("+ this.value +")");

        var localVideo = $("#local-video-preview").get(0);
        localVideo.muted = true;
        localVideo.playsinline = true;
        localVideo.autoplay = true;

        var tracks = localVideo.srcObject.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });

        var constraints = {
            audio: false,
            video: {
                deviceId: (this.value != "default")? { exact: this.value } : "default"
            }
        }
        console.log("Constraints:", constraints);
        var localStream = new MediaStream();
        if(navigator.mediaDevices){
            navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
                var videoTrack = newStream.getVideoTracks()[0];
                localStream.addTrack(videoTrack);
                localVideo.srcObject = localStream;
                localVideo.onloadedmetadata = function(e) {
                    localVideo.play();
                }
            }).catch(function(e){
                console.error(e);
                Alert(lang.alert_error_user_media, lang.error);
            });
        }
    });

    var localVideo = $("#local-video-preview").get(0);
    localVideo.muted = true;
    localVideo.playsinline = true;
    localVideo.autoplay = true;
    var localVideoStream = new MediaStream();
    var localMicrophoneStream = new MediaStream();
    if(navigator.mediaDevices){
        navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){
            var savedVideoDevice = getVideoSrcID();
            var videoDeviceFound = false;
            var savedAudioDevice = getAudioSrcID();
            var audioDeviceFound = false;
            var MicrophoneFound = false;
            var SpeakerFound = false;
            var VideoFound = false;

            for (var i = 0; i < deviceInfos.length; ++i) {
                console.log("Found Device ("+ deviceInfos[i].kind +"): ", deviceInfos[i].label);

                // Check Devices
                if (deviceInfos[i].kind === "audioinput") {
                    MicrophoneFound = true;
                    if(savedAudioDevice != "default" && deviceInfos[i].deviceId == savedAudioDevice) {
                        audioDeviceFound = true;
                    }                   
                }
                else if (deviceInfos[i].kind === "audiooutput") {
                    SpeakerFound = true;
                }
                else if (deviceInfos[i].kind === "videoinput") {
                    VideoFound = true;
                    if(savedVideoDevice != "default" && deviceInfos[i].deviceId == savedVideoDevice) {
                        videoDeviceFound = true;
                    }
                }
            }

            var contraints = {
                audio: MicrophoneFound,
                video: VideoFound
            }

            if(MicrophoneFound){
                contraints.audio = { deviceId: "default" }
                if(audioDeviceFound) contraints.audio.deviceId = { exact: savedAudioDevice }
            }
            if(VideoFound){
                contraints.video = { deviceId: "default" }
                if(videoDeviceFound) contraints.video.deviceId = { exact: savedVideoDevice }
            }

            console.log("Get User Media", contraints);
            // Get User Media
            navigator.mediaDevices.getUserMedia(contraints).then(function(mediaStream){
                // Handle Video
                var videoTrack = (mediaStream.getVideoTracks().length >= 1)? mediaStream.getVideoTracks()[0] : null;
                if(VideoFound && videoTrack != null){
                    localVideoStream.addTrack(videoTrack);
                    // Display Preview Video
                    localVideo.srcObject = localVideoStream;
                    localVideo.onloadedmetadata = function(e) {
                        localVideo.play();
                    }
                }
                else {
                    console.warn("No video / webcam devices found. Video Calling will not be possible.")
                }

                // Handle Audio
                var audioTrack = (mediaStream.getAudioTracks().length >= 1)? mediaStream.getAudioTracks()[0] : null ;
                if(MicrophoneFound && audioTrack != null){
                    localMicrophoneStream.addTrack(audioTrack);
                    // Display Micrphone Levels
                    window.SettingsMicrophoneStream = localMicrophoneStream;
                    window.SettingsMicrophoneSoundMeter = MeterSettingsOutput(localMicrophoneStream, "Settings_MicrophoneOutput", "width", 50);
                }
                else {
                    console.warn("No microphone devices found. Calling will not be possible.")
                }

                // Display Output Levels
                $("#Settings_SpeakerOutput").css("width", "0%");
                if(!SpeakerFound){
                    console.log("No speaker devices found, make sure one is plugged in.")
                    $("#playbackSrc").hide();
                    $("#RingDeviceSection").hide();
                }

                // Return .then()
                return navigator.mediaDevices.enumerateDevices();
            }).then(function(deviceInfos){
                for (var i = 0; i < deviceInfos.length; ++i) {
                    console.log("Found Device ("+ deviceInfos[i].kind +") Again: ", deviceInfos[i].label, deviceInfos[i].deviceId);

                    var deviceInfo = deviceInfos[i];
                    var devideId = deviceInfo.deviceId;
                    var DisplayName = deviceInfo.label;
                    if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));

                    var option = $('<option/>');
                    option.prop("value", devideId);

                    if (deviceInfo.kind === "audioinput") {
                        option.text((DisplayName != "")? DisplayName : "Microphone");
                        if(getAudioSrcID() == devideId) option.prop("selected", true);
                        selectMicScr.append(option);
                    }
                    else if (deviceInfo.kind === "audiooutput") {
                        option.text((DisplayName != "")? DisplayName : "Speaker");
                        if(getAudioOutputID() == devideId) option.prop("selected", true);
                        selectAudioScr.append(option);
                        selectRingDevice.append(option.clone());
                    }
                    else if (deviceInfo.kind === "videoinput") {
                        if(getVideoSrcID() == devideId) option.prop("selected", true);
                        option.text((DisplayName != "")? DisplayName : "Webcam");
                        selectVideoScr.append(option);
                    }
                }
                // Add "Default" option
                if(selectVideoScr.children('option').length > 0){
                    var option = $('<option/>');
                    option.prop("value", "default");
                    if(getVideoSrcID() == "default" || getVideoSrcID() == "" || getVideoSrcID() == "null") option.prop("selected", true);
                    option.text("(Default)");
                    selectVideoScr.append(option);
                }
            }).catch(function(e){
                console.error(e);
                Alert(lang.alert_error_user_media, lang.error);
            });
        }).catch(function(e){
            console.error("Error getting Media Devices", e);
        });
    }
    else {
        Alert(lang.alert_media_devices, lang.error);
    }

    // 3 Appearance
    var AppearanceHtml = "<div class=\"UiWindowField scroller\">"; 
    AppearanceHtml += "<div id=ImageCanvas style=\"width:150px; height:150px\"></div>";
    AppearanceHtml += "<div style=\"float:left; margin-left:200px;\"><input id=fileUploader type=file></div>";
    AppearanceHtml += "<div style=\"margin-top: 50px\"></div>";
    AppearanceHtml += "<div>";

    ConfigureTabbar.tabs("3").attachHTMLString(AppearanceHtml);

    cropper = $("#ImageCanvas").croppie({
        viewport: { width: 150, height: 150, type: 'circle' }
    });

    // Preview Existing Image
    $("#ImageCanvas").croppie('bind', { url: getPicture("profilePicture") }).then();

    // Wireup File Change
    $("#fileUploader").change(function () {
        var filesArray = $(this).prop('files');
    
        if (filesArray.length == 1) {
            var uploadId = Math.floor(Math.random() * 1000000000);
            var fileObj = filesArray[0];
            var fileName = fileObj.name;
            var fileSize = fileObj.size;
    
            if (fileSize <= 52428800) {
                console.log("Adding (" + uploadId + "): " + fileName + " of size: " + fileSize + "bytes");
                var reader = new FileReader();
                reader.Name = fileName;
                reader.UploadId = uploadId;
                reader.Size = fileSize;
                reader.onload = function (event) {
                    $("#ImageCanvas").croppie('bind', {
                        url: event.target.result
                    });
                }
    
                // Use onload for this
                reader.readAsDataURL(fileObj);
            }
            else {
                Alert(lang.alert_file_size, lang.error);
            }
        }
        else {
            Alert(lang.alert_single_file, lang.error);
        }
    });

    // 4 Notifications
    var NotificationsHtml = "<div class=\"UiWindowField scroller\">";
    NotificationsHtml += "<div class=UiText>"+ lang.notifications +":</div>";
    NotificationsHtml += "<div><input type=checkbox id=Settings_Notifications><label for=Settings_Notifications> "+ lang.enable_onscreen_notifications +"<label></div>";
    NotificationsHtml += "<div>";
    ConfigureTabbar.tabs("4").attachHTMLString(NotificationsHtml);
    var NotificationsCheck = $("#Settings_Notifications");
    NotificationsCheck.prop("checked", NotificationsActive);
    NotificationsCheck.change(function(){
        if(this.checked){
            if(Notification.permission != "granted"){
                if(checkNotificationPromise()){
                    Notification.requestPermission().then(function(p){
                        console.log(p);
                        HandleNotifyPermission(p);
                    });
                }
                else {
                    Notification.requestPermission(function(p){
                        console.log(p);
                        HandleNotifyPermission(p)
                    });
                }
            }
        }
    });

}
function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    }
    catch(e) {
        return false;
    }
    return true;
}
function HandleNotifyPermission(p){
    if(p == "granted") {
        // Good
    }
    else {
        Alert(lang.alert_notification_permission, lang.permission, function(){
            console.log("Attempting to uncheck the checkbox...");
            $("#Settings_Notifications").prop("checked", false);
        });
    }
}
function EditBuddyWindow(buddy){
    try{
        dhtmlxPopup.hide();
    }
    catch(e){}

    var buddyObj = null;
    var itemId = -1;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    $.each(json.DataCollection, function (i, item) {
        if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
            buddyObj = item;
            itemId = i;
            return false;
        }
    });

    if(buddyObj == null){
        Alert(lang.alert_not_found, lang.error);
        return;
    }
    
    var cropper;
    
    var html = "<div border=0 class='UiWindowField scroller'>";
    html += "<div id=ImageCanvas style=\"width:150px; height:150px\"></div>";
    html += "<div style=\"float:left; margin-left:200px;\"><input id=fileUploader type=file></div>";
    html += "<div style=\"margin-top: 50px\"></div>";
    
    html += "<div class=UiText>"+ lang.full_name +":</div>";
    html += "<div><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"' value='"+ ((buddyObj.DisplayName && buddyObj.DisplayName != "null" && buddyObj.DisplayName != "undefined")? buddyObj.DisplayName : "") +"'></div>";

    html += "<div class=UiText>"+ lang.mobile_number +":</div>";
    html += "<div><input id=AddSomeone_Mobile class=UiInputText type=text placeholder='"+ lang.eg_mobile_number +"' value='"+ ((buddyObj.MobileNumber && buddyObj.MobileNumber != "null" && buddyObj.MobileNumber != "undefined")? buddyObj.MobileNumber : "") +"'></div>";
    html += "</div>"
    OpenWindow(html, lang.edit, 480, 640, false, true, lang.save, function(){

        buddyObj.LastActivity = utcDateNow();
        buddyObj.DisplayName = $("#AddSomeone_Name").val();
        if(buddyObj.Type == "extension"){
            buddyObj.Position = $("#AddSomeone_Desc").val();
        }
        else {
            buddyObj.Description = $("#AddSomeone_Desc").val();
        }
        buddyObj.MobileNumber = $("#AddSomeone_Mobile").val();
        buddyObj.Email = $("#AddSomeone_Email").val();
        buddyObj.ContactNumber1 = $("#AddSomeone_Num1").val();
        buddyObj.ContactNumber2 = $("#AddSomeone_Num2").val();

        // Update Image
        var constraints = { 
            type: 'base64', 
            size: 'viewport', 
            format: 'png', 
            quality: 1, 
            circle: false 
        }
        $("#ImageCanvas").croppie('result', constraints).then(function(base64) {
            if(buddyObj.Type == "extension"){
                localDB.setItem("img-"+ buddyObj.uID +"-extension", base64);
                $("#contact-"+ buddyObj.uID +"-picture-main").css("background-image", 'url('+ getPicture(buddyObj.uID, 'extension') +')');
            }
            else if(buddyObj.Type == "contact") {
                localDB.setItem("img-"+ buddyObj.cID +"-contact", base64);
                $("#contact-"+ buddyObj.cID +"-picture-main").css("background-image", 'url('+ getPicture(buddyObj.cID, 'contact') +')');
            }
            else if(buddyObj.Type == "group") {
                localDB.setItem("img-"+ buddyObj.gID +"-group", base64);
                $("#contact-"+ buddyObj.gID +"-picture-main").css("background-image", 'url('+ getPicture(buddyObj.gID, 'group') +')');
            }
            // Update
            UpdateBuddyList();
        });

        // Update: 
        json.DataCollection[itemId] = buddyObj;

        // Save To DB
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));

        // Update the Memory Array, so that the UpdateBuddyList can make the changes
        for(var b = 0; b < Buddies.length; b++) {
            if(buddyObj.Type == "extension"){
                if(buddyObj.uID == Buddies[b].identity){
                    Buddies[b].lastActivity = buddyObj.LastActivity;
                    Buddies[b].CallerIDName = buddyObj.DisplayName;
                    Buddies[b].Desc = buddyObj.Position;
                }                
            }
            else if(buddyObj.Type == "contact") {
                if(buddyObj.cID == Buddies[b].identity){
                    Buddies[b].lastActivity = buddyObj.LastActivity;
                    Buddies[b].CallerIDName = buddyObj.DisplayName;
                    Buddies[b].Desc = buddyObj.Description;
                }                
            }
            else if(buddyObj.Type == "group") {
                
            }
        }

        CloseWindow();
    }, lang.cancel, function(){
        CloseWindow();
    }, function(){
        // DoOnLoad
        cropper = $("#ImageCanvas").croppie({
            viewport: { width: 150, height: 150, type: 'circle' }
        });

        // Preview Existing Image
        if(buddyObj.Type == "extension"){
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyObj.uID, "extension") }).then();
        }
        else if(buddyObj.Type == "contact") {
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyObj.cID, "contact") }).then();
        }
        else if(buddyObj.Type == "group") {
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyObj.gID, "group") }).then();
        }

        // Wireup File Change
        $("#fileUploader").change(function () {
            var filesArray = $(this).prop('files');
        
            if (filesArray.length == 1) {
                var uploadId = Math.floor(Math.random() * 1000000000);
                var fileObj = filesArray[0];
                var fileName = fileObj.name;
                var fileSize = fileObj.size;
        
                if (fileSize <= 52428800) {
                    console.log("Adding (" + uploadId + "): " + fileName + " of size: " + fileSize + "bytes");
        
                    var reader = new FileReader();
                    reader.Name = fileName;
                    reader.UploadId = uploadId;
                    reader.Size = fileSize;
                    reader.onload = function (event) {
                        $("#ImageCanvas").croppie('bind', {
                            url: event.target.result
                        });
                    }
                    reader.readAsDataURL(fileObj);
                }
                else {
                    Alert(lang.alert_file_size, lang.error);
                }
            }
            else {
                Alert(lang.alert_single_file, lang.error);
            }
        });
    });
}

// Document Ready
$(document).ready(function () {
    // Load Langauge File
    $.getJSON(hostingPrefex + "lang/en.json", function (data){
        lang = data;
        var userLang = GetAlternateLanguage();
        if(userLang != ""){
            $.getJSON(hostingPrefex +"lang/"+ userLang +".json", function (altdata){
                lang = altdata;
            }).always(function() {
                console.log("Alternate Lanaguage Pack loaded: ", lang);
                InitUi();
            });
        }
        else {
            console.log("Lanaguage Pack already loaded: ", lang);
            InitUi();
        }
    });
});

// Init UI
function InitUi(){

    var phone = $("#Phone");
    phone.empty();
    phone.attr("class", "pageContainer");

    // Left Section
    var leftSection = $("<div>");
    leftSection.attr("id", "leftContent");
    leftSection.attr("style", "float:left; height: 100%; width:320px");
    var leftHTML = "<table style=\"height:100%; width:100%\" cellspacing=5 cellpadding=0>";
    leftHTML += "<tr><td class=streamSection style=\"height: 77px\">";
    // Profile User
    leftHTML += "<div class=profileContainer>";
    leftHTML += "<div class=contact id=UserProfile style=\"margin-bottom:5px;\">";
    leftHTML += "<div id=UserProfilePic class=buddyIcon></div>";
    leftHTML += "<span id=reglink class=dotOffline></span>";
    leftHTML += "<span id=dereglink class=dotOnline style=\"display:none\"><i class=\"fa fa-wifi\" style=\"line-height: 14px; text-align: center; display: block;\"></i></span>";
    leftHTML += "<span id=WebRtcFailed class=dotFailed style=\"display:none\"><i class=\"fa fa-cross\" style=\"line-height: 14px; text-align: center; display: block;\"></i></span>";
    leftHTML += "<div class=contactNameText style=\"margin-right: 0px;\"><i class=\"fa fa-phone-square\"></i> <span id=UserDID></span> - <span id=UserCallID></span></div>";
    leftHTML += "<div id=regStatus class=presenceText>&nbsp;</div>";
    leftHTML += "</div>";
    // Search / Add Buddies
    leftHTML += "<div style=\"padding-left:5px\">";
    leftHTML += "<span class=searchClean><INPUT id=txtFindBuddy type=text autocomplete=none style=\"width:160px;\"></span>";
    leftHTML += "&nbsp;";
    leftHTML += "<button id=BtnFreeDial><i class=\"fa fa-phone\"></i></button>";
    leftHTML += "<button id=BtnAddSomeone><i class=\"fa fa-user-plus\"></i></button>";
    //leftHTML += "<button id=BtnCreateGroup><i class=\"fa fa-users\"></i><i class=\"fa fa-plus\" style=\"font-size:9px\"></i></button>";
    leftHTML += "</div>";
    leftHTML += "</div>";
    leftHTML += "</td></tr>";
    // Lines & Buddies
    leftHTML += "<tr><td class=streamSection><div id=myContacts class=\"contactArea cleanScroller\"></div></td></tr>";
    leftHTML += "</table>";

    leftSection.html(leftHTML);
    
    // Right Section
    var rightSection = $("<div>");
    rightSection.attr("id", "rightContent");
    rightSection.attr("style", "margin-left: 320px; height: 100%");

    phone.append(leftSection);
    phone.append(rightSection);

    // Setup Windows
    windowsCollection = new dhtmlXWindows("material");
    messagingCollection = new dhtmlXWindows("material");

    if(DisableFreeDial == true) $("#BtnFreeDial").hide();
    if(DisableBuddies == true) $("#BtnAddSomeone").hide();
    if(enabledGroupServices == false) $("#BtnCreateGroup").hide();

    $("#UserDID").html(profileUser);
    $("#UserCallID").html(profileName);
    $("#UserProfilePic").css("background-image", "url('"+ getPicture("profilePicture") +"')");
    
    $("#txtFindBuddy").attr("placeholder", lang.find_someone)
    $("#txtFindBuddy").on('keyup', function(event){
        UpdateBuddyList();
    });
    $("#BtnFreeDial").attr("title", lang.call)
    $("#BtnFreeDial").on('click', function(event){
        ShowDial(this);
    });
    $("#BtnAddSomeone").attr("title", lang.add_someone)
    $("#BtnAddSomeone").on('click', function(event){
        AddSomeoneWindow();
    });
    $("#BtnCreateGroup").attr("title", lang.create_group)
    $("#BtnCreateGroup").on('click', function(event){
        CreateGroupWindow();
    });
    $("#UserProfile").on('click', function(event){
        ShowMyProfileMenu(this);
    });

    UpdateUI();
    
    // Check if you account is created
    if(profileUserID == null ){
        ConfigureExtensionWindow();
        return; // Don't load any more, after applying settings, the page must reload.
    }

    PopulateBuddyList();

    // Select Last user
    if(localDB.getItem("SelectedBuddy") != null){
        console.log("Selecting previously selected buddy...", localDB.getItem("SelectedBuddy"));
        SelectBuddy(localDB.getItem("SelectedBuddy"));
        UpdateUI();
    }

    // Show Welcome Screen
    if(welcomeScreen){
        if(localDB.getItem("WelcomeScreenAccept") != "yes"){
            OpenWindow(welcomeScreen, lang.welcome, 480, 800, true, false, lang.accept, function(){
                localDB.setItem("WelcomeScreenAccept", "yes");
                CloseWindow();
            }, null, null, null, null);
        }
    }

    PreloadAudioFiles();

    CreateUserAgent();
}

function PreloadAudioFiles(){
    audioBlobs.Alert = { file : "Alert.mp3", url : hostingPrefex +"media/Alert.mp3" }
    audioBlobs.Ringtone = { file : "Ringtone_1.mp3", url : hostingPrefex +"media/Ringtone_1.mp3" }
    audioBlobs.speech_orig = { file : "speech_orig.mp3", url : hostingPrefex +"media/speech_orig.mp3" }
    audioBlobs.Busy_UK = { file : "Tone_Busy-UK.mp3", url : hostingPrefex +"media/Tone_Busy-UK.mp3" }
    audioBlobs.Busy_US = { file : "Tone_Busy-US.mp3", url : hostingPrefex +"media/Tone_Busy-US.mp3" }
    audioBlobs.CallWaiting = { file : "Tone_CallWaiting.mp3", url : hostingPrefex +"media/Tone_CallWaiting.mp3" }
    audioBlobs.Congestion_UK = { file : "Tone_Congestion-UK.mp3", url : hostingPrefex +"media/Tone_Congestion-UK.mp3" }
    audioBlobs.Congestion_US = { file : "Tone_Congestion-US.mp3", url : hostingPrefex +"media/Tone_Congestion-US.mp3" }
    audioBlobs.EarlyMedia_Australia = { file : "Tone_EarlyMedia-Australia.mp3", url : hostingPrefex +"media/Tone_EarlyMedia-Australia.mp3" }
    audioBlobs.EarlyMedia_European = { file : "Tone_EarlyMedia-European.mp3", url : hostingPrefex +"media/Tone_EarlyMedia-European.mp3" }
    audioBlobs.EarlyMedia_Japan = { file : "Tone_EarlyMedia-Japan.mp3", url : hostingPrefex +"media/Tone_EarlyMedia-Japan.mp3" }
    audioBlobs.EarlyMedia_UK = { file : "Tone_EarlyMedia-UK.mp3", url : hostingPrefex +"media/Tone_EarlyMedia-UK.mp3" }
    audioBlobs.EarlyMedia_US = { file : "Tone_EarlyMedia-US.mp3", url : hostingPrefex +"media/Tone_EarlyMedia-US.mp3" }
    
    $.each(audioBlobs, function (i, item) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", item.url, true);
        oReq.responseType = "blob";
        oReq.onload = function(oEvent) {
            var reader = new FileReader();
            reader.readAsDataURL(oReq.response);
            reader.onload = function() {
                item.blob = reader.result;
            }
        }
        oReq.send();
    });
    // console.log(audioBlobs);
}

// Create User Agent
function CreateUserAgent() {
    try {
        console.log("Creating User Agent...");
        userAgent = new SIP.UA({
            displayName: profileName,
            uri: SipUsername + "@" + wssServer,
            transportOptions: {
                wsServers: "wss://" + wssServer + ":"+ WebSocketPort +""+ ServerPath,
                traceSip: false,
                connectionTimeout: TransportConnectionTimeout,
                maxReconnectionAttempts: TransportReconnectionAttempts,
                reconnectionTimeout: TransportReconnectionTimeout,
            },
            sessionDescriptionHandlerFactoryOptions:{
                peerConnectionOptions :{
                    alwaysAcquireMediaFirst: true,
                    iceCheckingTimeout: IceStunCheckTimeout,
                    rtcConfiguration: { 
                        iceServers : [
                            { urls: IceStunServerProtocol + ":"+ IceStunServerAddress +":"+ IceStunServerPort }
                        ]
                    }
                }
            },
            authorizationUser: SipUsername,
            password: SipPassword,
            registerExpires: RegisterExpires,
            hackWssInTransport: WssInTransport,
            hackIpInContact: IpInContact,
            userAgentString: userAgentStr,
            autostart: false,
            register: false,
        });
        console.log("Creating User Agent... Done");
    }
    catch (e) {
        console.error("Error creating User Agent: "+ e);
        $("#regStatus").html(lang.error_user_agant);
        alert(e.message);
        return;
    }

    // UA Register events
    userAgent.on('registered', function () {
        console.log("Registered!");
        $("#regStatus").html(lang.registered);

        $("#reglink").hide();
        $("#dereglink").show();

        // Start Subscribe Loop
        if(!isReRegister) {
            SubscribeAll();
        }
        isReRegister = true;

        // Custom Web hook
        if(typeof web_hook_on_register !== 'undefined') web_hook_on_register(userAgent);
    });
    userAgent.on('registrationFailed', function (response, cause) {
        console.log("Registration Failed: " + cause);
        $("#regStatus").html(lang.registration_failed);

        $("#reglink").show();
        $("#dereglink").hide();

        // Custom Web hook
        if(typeof web_hook_on_registrationFailed !== 'undefined') web_hook_on_registrationFailed(cause);
    });
    userAgent.on('unregistered', function () {
        console.log("Unregistered, bye!");
        $("#regStatus").html(lang.unregistered);

        $("#reglink").show();
        $("#dereglink").hide();

        // Custom Web hook
        if(typeof web_hook_on_unregistered !== 'undefined') web_hook_on_unregistered();
    });

    // UA transport
    userAgent.on('transportCreated', function (transport) {
        console.log("Transport Object Created");
        
        // Transport Events
        transport.on('connected', function () {
            console.log("Connected to Web Socket!");
            $("#regStatus").html(lang.connected_to_web_socket);

            $("#WebRtcFailed").hide();

            // Auto start register
            Register();
        });
        transport.on('disconnected', function () {
            console.log("Disconnected from Web Socket!");
            $("#regStatus").html(lang.disconnected_from_web_socket);
        });
        transport.on('transportError', function () {
            console.log("Web Socket error!");
            $("#regStatus").html(lang.web_socket_error);

            $("#WebRtcFailed").show();

            // Custom Web hook
            if(typeof web_hook_on_transportError !== 'undefined') web_hook_on_transportError(transport, userAgent);
        });
    });

    // Inbound Calls
    userAgent.on("invite", function (session) {
        ReceiveCall(session);

        // Custom Web hook
        if(typeof web_hook_on_invite !== 'undefined') web_hook_on_invite(session);
    });

    // Inbound Text Message
    userAgent.on('message', function (message) {
        ReceiveMessage(message);

        // Custom Web hook
        if(typeof web_hook_on_message !== 'undefined') web_hook_on_message(message);
    });

    // Start the WebService Connection loop
    console.log("Connecting to Web Socket...");
    $("#regStatus").html(lang.connecting_to_web_socket);
    userAgent.start();
    
    // Register Buttons
    $("#reglink").on('click', Register);
    $("#dereglink").on('click', Unregister);

    // WebRTC Error Page
    $("#WebRtcFailed").on('click', function(){
        Confirm(lang.error_connecting_web_socket, lang.web_socket_error, function(){
            window.open("https://"+ wssServer +":"+ WebSocketPort +"/httpstatus");
        }, null);
    });
}

// Registration
function Register() {
    if (userAgent == null || userAgent.isRegistered()) return;
    console.log("Sending Registration...");
    $("#regStatus").html(lang.sending_registration);
    userAgent.register()
}
function Unregister() {
    if (userAgent == null || !userAgent.isRegistered()) return;

    console.log("Unsubscribing...");
    $("#regStatus").html(lang.unsubscribing);
    try {
        UnsubscribeAll();
    } catch (e) { }

    console.log("Disconnecting...");
    $("#regStatus").html(lang.disconnecting);
    userAgent.unregister();

    isReRegister = false;
}

// Inbound Calls
function ReceiveCall(session) {
    var callerID = session.remoteIdentity.displayName;
    var did = session.remoteIdentity.uri.user;

    console.log("New Incoming Call!", callerID +" <"+ did +">");

    var CurrentCalls = countSessions(session.id);
    console.log("Current Call Count:", CurrentCalls);

    var buddyObj = FindBuddyByDid(did);
    if(buddyObj == null) {
        var buddyType = (did.length > DidLength)? "contact" : "extension";
        var focusOnBuddy = (CurrentCalls==0);
        buddyObj = MakeBuddy(buddyType, true, focusOnBuddy, true, callerID, did);
    } else {
        // Double check that the buddy has the same caller ID as the incoming call
        // With Buddies that are contacts, eg +441234567890 <+441234567890> leave as as
        if(buddyObj.type == "extension" && buddyObj.CallerIDName != callerID){
            UpdateBuddyCalerID(buddyObj, callerID);
        }
        else if(buddyObj.type == "contact" && callerID != did && buddyObj.CallerIDName != callerID){
            UpdateBuddyCalerID(buddyObj, callerID);
        }
    }
    var buddy = buddyObj.identity;

    // Time Stamp
    window.clearInterval(session.data.callTimer);
    var startTime = moment.utc();
    session.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    $("#contact-" + buddy + "-timer").show();
    session.data.callTimer = window.setInterval(function(){
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime)); 
        $("#contact-" + buddy + "-timer").html(formatShortDuration(duration.asSeconds()));
    }, 1000);
    session.data.buddyId = buddy;
    session.data.calldirection = "inbound";
    session.data.terminateby = "them";
    session.data.withvideo = false;
    var videoInvite = false;
    if(session.request.body){
        if(session.request.body.indexOf("m=video") > -1) videoInvite = true;
    }

    // Inbound You or They Rejected
    session.on('rejected', function (response, cause) {
        console.log("Call rejected: " + cause);

        session.data.reasonCode = response.status_code
        session.data.reasonText = cause
    
        AddCallMessage(buddy, session, response.status_code, cause);

        // Custom Web hook
        if(typeof web_hook_on_terminate !== 'undefined') web_hook_on_terminate(session);
    });
    session.on('terminated', function(response, cause) {

        // Stop the ringtone
        if(session.data.rinngerObj){
            session.data.rinngerObj.pause();
            session.data.rinngerObj.removeAttribute('src');
            session.data.rinngerObj.load();
            session.data.rinngerObj = null;
        }
        CloseWindow();
        console.log("Call terminated");
        window.clearInterval(session.data.callTimer);
        $("#contact-" + buddy + "-timer").html("");
        $("#contact-" + buddy + "-timer").hide();
        $("#contact-" + buddy + "-msg").html("");
        $("#contact-" + buddy + "-msg").hide();
        $("#contact-" + buddy + "-AnswerCall").hide();
        RefreshStream(buddyObj);
        updateScroll(buddyObj.identity);
        UpdateBuddyList();
    });

    // Start Handle Call
    if(DoNotDisturbEnabled || DoNotDisturbPolicy == "enabled") {
        console.log("Do Not Disturb Enabled, rejecting call.");
        RejectCall(buddyObj.identity);
        return;
    }
    if(CurrentCalls >= 1){
        if(CallWaitingEnabled == false || CallWaitingEnabled == "disabled"){
            console.log("Call Waiting Disabled, rejecting call.");
            RejectCall(buddyObj.identity);
            return;
        }
    }
    if(AutoAnswerEnabled || AutoAnswerPolicy == "enabled"){
        if(CurrentCalls == 0){ 
            console.log("Auto Answer Call...");
            var buddyId = buddyObj.identity;
            window.setTimeout(function(){
                if(videoInvite) {
                    AnswerVideoCall(buddyId)
                }
                else {
                    AnswerAudioCall(buddyId);
                }
            }, 1000);

            // Select Buddy
            SelectBuddy(buddyObj.identity);
            return;
        }
        else {
            console.warn("Could not auto answer call, already on a call.");
        }
    }
    
    // Show the Answer Thingy
    $("#contact-" + buddyObj.identity + "-msg").html(lang.incomming_call_from +" " + callerID +" &lt;"+ did +"&gt;");
    $("#contact-" + buddyObj.identity + "-msg").show();
    if(videoInvite){
        $("#contact-"+ buddyObj.identity +"-answer-video").show();
    }
    else {
        $("#contact-"+ buddyObj.identity +"-answer-video").hide();
    }
    $("#contact-" + buddyObj.identity + "-AnswerCall").show();
    updateScroll(buddyObj.identity);

    // Play Ring Tone if not on the phone
    if(CurrentCalls >= 1){
        // Play Alert
        console.log("Audio:", audioBlobs.CallWaiting.url);
        var rinnger = new Audio(audioBlobs.CallWaiting.blob);
        rinnger.preload = "auto";
        rinnger.loop = false;
        rinnger.oncanplaythrough = function(e) {
            if (typeof rinnger.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                rinnger.setSinkId(getRingerOutputID()).then(function() {
                    console.log("Set sinkId to:", getRingerOutputID());
                }).catch(function(e){
                    console.warn("Failed not apply setSinkId.", e);
                });
            }
            rinnger.play().then(function(){
            }).catch(function(e){
                console.warn("Unable to play audio file.", e);
            }); 
        }
        session.data.rinngerObj = rinnger;
    } else {
        // Play Ring Tone
        console.log("Audio:", audioBlobs.Ringtone.url);
        var rinnger = new Audio(audioBlobs.Ringtone.blob);
        rinnger.preload = "auto";
        rinnger.loop = true;
        rinnger.oncanplaythrough = function(e) {
            if (typeof rinnger.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                rinnger.setSinkId(getRingerOutputID()).then(function() {
                    console.log("Set sinkId to:", getRingerOutputID());
                }).catch(function(e){
                    console.warn("Failed not apply setSinkId.", e);
                });
            }
            
            rinnger.play().then(function(){
            }).catch(function(e){
                console.warn("Unable to play audio file.", e);
            }); 
        }
        session.data.rinngerObj = rinnger;
    }

    var streamVisible = $("#stream-"+ buddyObj.identity).is(":visible");
    if (streamVisible) {
        HidePopup();
    } 
    else {
        CloseWindow();
        var callAnswerHtml = "<div class=\"UiWindowField scroller\" style=\"text-align:center\">"
        callAnswerHtml += "<div style=\"font-size: 18px; margin-top:05px\">"+ callerID + "<div>";
        if(callerID != did) {
            callAnswerHtml += "<div style=\"font-size: 18px; margin-top:05px\">&lt;"+ did + "&gt;<div>";
        }
        callAnswerHtml += "<div class=callAnswerBuddyIcon style=\"background-image: url("+ getPicture(buddyObj.identity) +"); margin-top:15px\"></div>";
        callAnswerHtml += "<div style=\"margin-top:5px\"><button onclick=\"AnswerAudioCall('"+ buddyObj.identity +"')\" class=answerButton><i class=\"fa fa-phone\"></i> "+ lang.answer_call +"</button></div>";
        if(videoInvite) {
            callAnswerHtml += "<div style=\"margin-top:15px\"><button onclick=\"AnswerVideoCall('"+ buddyObj.identity +"')\" class=answerButton><i class=\"fa fa-video-camera\"></i> "+ lang.answer_call_with_video +"</button></div>";
        }
        callAnswerHtml += "</div>";
        OpenWindow(callAnswerHtml, lang.incomming_call_from, 350, 300, true, false, lang.reject_call, function(){
            RejectCall(buddyObj.identity);
            CloseWindow();
        }, "Close", function(){
            CloseWindow();
        }, null, null);
        IncreaseMissedBadge(buddyObj.identity);

        // Show notification
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                var noticeOptions = { body: lang.incomming_call_from +" " + callerID +" <"+ did +">", icon: getPicture(buddyObj.identity) }
                var inComingCallNotification = new Notification(lang.incomming_call, noticeOptions);
                inComingCallNotification.onclick = function (event) {

                    var buddyId = buddyObj.identity;
                    window.setTimeout(function(){
                        if(videoInvite) {
                            AnswerVideoCall(buddyId)
                        }
                        else {
                            AnswerAudioCall(buddyId);
                        }
                    }, 1000);
                    // Select Buddy
                    SelectBuddy(buddyObj.identity);

                    return;
                }
            }
        }
    }
}
function AnswerAudioCall(buddy) {
    CloseWindow();
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) {
        console.warn("Audio Answer failed, null buddy");
        $("#contact-" + buddy + "-msg").html(lang.call_failed);
        $("#contact-" + buddy + "-AnswerCall").hide();
        return;
    }
    var session = getSession(buddy);
    if (session == null) {
        console.warn("Audio Answer failed, null session");
        $("#contact-" + buddy + "-msg").html(lang.call_failed);
        $("#contact-" + buddy + "-AnswerCall").hide();
        return;
    }
    
    // Stop the ringtone
    if(session.data.rinngerObj){
        session.data.rinngerObj.pause();
        session.data.rinngerObj.removeAttribute('src');
        session.data.rinngerObj.load();
        session.data.rinngerObj = null;
    }

    // Check vitals
    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        $("#contact-" + buddy + "-msg").html(lang.call_failed);
        $("#contact-" + buddy + "-AnswerCall").hide();
        return;
    }
    $("#contact-" + buddy + "-timer").html("");
    $("#contact-" + buddy + "-timer").hide();
    $("#contact-" + buddy + "-msg").html("");
    $("#contact-" + buddy + "-msg").hide();
    $("#contact-" + buddy + "-AnswerCall").hide();

    // Create a new Line and move the session over to the line
    var callerID = session.remoteIdentity.displayName;
    var did = session.remoteIdentity.uri.user;
    var newLineNumber = Lines.length + 1;
    lineObj = new Line(newLineNumber, callerID, did, buddyObj);
    lineObj.SipSession = session;
    lineObj.SipSession.data.line = lineObj.LineNumber;
    lineObj.SipSession.data.buddyId = lineObj.BuddyObj.identity;
    Lines.push(lineObj);
    AddLineHtml(lineObj);
    SelectLine(newLineNumber);
    UpdateBuddyList();
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: false
            }
        }
    }

    // Configure Audio
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }

    // Send Answer
    lineObj.SipSession.accept(spdOptions);
    lineObj.SipSession.data.withvideo = false;
    lineObj.SipSession.data.VideoSourceDevice = null;
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();

    // Wire up UI
    wireupAudioSession(lineObj);
    $("#contact-" + buddy + "-msg").html(lang.call_in_progress);

    // Clear Answer Buttons
    $("#contact-" + buddy + "-AnswerCall").hide();
}
function AnswerVideoCall(buddy) {
    CloseWindow();

    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) {
        console.warn("Audio Answer failed, null buddy");
        $("#contact-" + buddy + "-msg").html(lang.call_failed);
        $("#contact-" + buddy + "-AnswerCall").hide();
        return;
    }

    var session = getSession(buddy);
    if (session == null) {
        console.warn("Video Answer failed, null session");
        $("#contact-" + buddy + "-msg").html(lang.call_failed);
        $("#contact-" + buddy + "-AnswerCall").hide();
        return;
    }

    // Stop the ringtone
    if(session.data.rinngerObj){
        session.data.rinngerObj.pause();
        session.data.rinngerObj.removeAttribute('src');
        session.data.rinngerObj.load();
        session.data.rinngerObj = null;
    }

    // Check vitals
    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        $("#contact-" + buddy + "-msg").html(lang.call_failed);
        $("#contact-" + buddy + "-AnswerCall").hide();
        return;
    }
    if(HasVideoDevice == false){
        console.warn("No video devices (webcam) found, switching to audio call.");
        AnswerAudioCall(buddy);
        return;
    }
    $("#contact-" + buddy + "-timer").html("");
    $("#contact-" + buddy + "-timer").hide();
    $("#contact-" + buddy + "-msg").html("");
    $("#contact-" + buddy + "-msg").hide();
    $("#contact-" + buddy + "-AnswerCall").hide();

    // Create a new Line and move the session over to the line
    var callerID = session.remoteIdentity.displayName;
    var did = session.remoteIdentity.uri.user;
    var newLineNumber = Lines.length + 1;
    lineObj = new Line(newLineNumber, callerID, did, buddyObj);
    lineObj.SipSession = session;
    lineObj.SipSession.data.line = lineObj.LineNumber;
    lineObj.SipSession.data.buddyId = lineObj.BuddyObj.identity;
    Lines.push(lineObj);
    AddLineHtml(lineObj);
    SelectLine(newLineNumber);
    UpdateBuddyList();
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: { deviceId : "default" }
            }
        }
    }

    // Configure Audio
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    // Add additional Constraints
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }

    // Configure Video
    var currentVideoDevice = getVideoSrcID();
    if(currentVideoDevice != "default"){
        var confirmedVideoDevice = false;
        for (var i = 0; i < VideoinputDevices.length; ++i) {
            if(currentVideoDevice == VideoinputDevices[i].deviceId) {
                confirmedVideoDevice = true;
                break;
            }
        }
        if(confirmedVideoDevice){
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.deviceId = { exact: currentVideoDevice }
        }
        else {
            console.warn("The video device you used before is no longer available, default settings applied.");
            localDB.setItem("VideoSrcId", "default"); // resets for later and subsequent calls
        }
    }
    // Add additional Constraints
    if(supportedConstraints.frameRate && maxFrameRate != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.frameRate = maxFrameRate;
    }
    if(supportedConstraints.height && videoHeight != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.height = videoHeight;
    }
    if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.aspectRatio = videoAspectRatio;
    }

    // Send Answer
    lineObj.SipSession.accept(spdOptions);
    lineObj.SipSession.data.withvideo = true;
    lineObj.SipSession.data.VideoSourceDevice = getVideoSrcID();
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();

    // Wire up UI
    wireupVideoSession(lineObj);
    $("#contact-" + buddy + "-msg").html(lang.call_in_progress);

    // Clear Answer Buttons
    $("#contact-" + buddy + "-AnswerCall").hide();

    if(StartVideoFullScreen) ExpandVideoArea(lineObj.LineNumber);
}

function RejectCall(buddy) {
    var session = getSession(buddy);
    if (session == null) {
        console.warn("Reject failed, null session");
        $("#contact-" + buddy + "-msg").html(lang.call_failed);
        $("#contact-" + buddy + "-AnswerCall").hide();
    }
    session.data.terminateby = "us";
    session.reject({ 
        statusCode: 486, 
        reasonPhrase: "Busy Here" 
    });
    $("#contact-" + buddy + "-msg").html(lang.call_rejected);
}

// Session Wireup
function wireupAudioSession(lineObj) {
    if (lineObj == null) return;

    var MessageObjId = "#line-" + lineObj.LineNumber + "-msg";
    var session = lineObj.SipSession;

    session.on('progress', function (response) {
        // Provisional 1xx
        if(response.status_code == 100){
            $(MessageObjId).html(lang.trying);
        } else if(response.status_code == 180){
            $(MessageObjId).html(lang.ringing);
            
            var soundFile = audioBlobs.EarlyMedia_European;
            if(UserLocale().indexOf("us") > -1) soundFile = audioBlobs.EarlyMedia_US;
            if(UserLocale().indexOf("gb") > -1) soundFile = audioBlobs.EarlyMedia_UK;
            if(UserLocale().indexOf("au") > -1) soundFile = audioBlobs.EarlyMedia_Australia;
            if(UserLocale().indexOf("jp") > -1) soundFile = audioBlobs.EarlyMedia_Japan;

            // Play Early Media
            console.log("Audio:", soundFile.url);
            var earlyMedia = new Audio(soundFile.blob);
            earlyMedia.preload = "auto";
            earlyMedia.loop = true;
            earlyMedia.oncanplaythrough = function(e) {
                if (typeof earlyMedia.sinkId !== 'undefined' && getAudioOutputID() != "default") {
                    earlyMedia.setSinkId(getAudioOutputID()).then(function() {
                        console.log("Set sinkId to:", getAudioOutputID());
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                earlyMedia.play().then(function(){
                    // Audio Is Playing
                }).catch(function(e){
                    console.warn("Unable to play audio file.", e);
                }); 
            }
            session.data.earlyMedia = earlyMedia;
        } else {
            $(MessageObjId).html(response.reason_phrase + "...");
        }

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("progress", session);
    });
    session.on('trackAdded', function () {
        var pc = session.sessionDescriptionHandler.peerConnection;

        // Gets Remote Audio Track (Local audio is setup via initial GUM)
        var remoteStream = new MediaStream();
        pc.getReceivers().forEach(function (receiver) {
            if(receiver.track && receiver.track.kind == "audio"){
                remoteStream.addTrack(receiver.track);
            } 
        });
        var remoteAudio = $("#line-" + lineObj.LineNumber + "-remoteAudio").get(0);
        remoteAudio.srcObject = remoteStream;
        remoteAudio.onloadedmetadata = function(e) {
            if (typeof remoteAudio.sinkId !== 'undefined') {
                remoteAudio.setSinkId(getAudioOutputID()).then(function(){
                    console.log("sinkId applied: "+ getAudioOutputID());
                }).catch(function(e){
                    console.warn("Error using setSinkId: ", e);
                });
            }
            remoteAudio.play();
        }

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("trackAdded", session);
    });
    session.on('accepted', function (data) {

        if(session.data.earlyMedia){
            session.data.earlyMedia.pause();
            session.data.earlyMedia.removeAttribute('src');
            session.data.earlyMedia.load();
            session.data.earlyMedia = null;
        }

        window.clearInterval(session.data.callTimer);
        var startTime = moment.utc();
        session.data.callTimer = window.setInterval(function(){
            var now = moment.utc();
            var duration = moment.duration(now.diff(startTime)); 
            $("#line-" + lineObj.LineNumber + "-timer").html(formatShortDuration(duration.asSeconds()));
        }, 1000);

        if(RecordAllCalls || CallRecordingPolicy == "enabled") {
            StartRecording(lineObj.LineNumber);
        }

        $("#line-" + lineObj.LineNumber + "-progress").hide();
        $("#line-" + lineObj.LineNumber + "-VideoCall").hide();
        $("#line-" + lineObj.LineNumber + "-ActiveCall").show();

        // Audo Monitoring
        lineObj.LocalSoundMeter = StartLocalAudioMediaMonitoring(lineObj.LineNumber, session);
        lineObj.RemoteSoundMeter = StartRemoteAudioMediaMonitoring(lineObj.LineNumber, session);
        
        $(MessageObjId).html(lang.call_in_progress);

        updateLineScroll(lineObj.LineNumber);

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("accepted", session);
    });
    session.on('rejected', function (response, cause) {
        // Should only apply befor answer
        $(MessageObjId).html(lang.call_rejected +": " + cause);
        console.log("Call rejected: " + cause);
        teardownSession(lineObj, response.status_code, response.reason_phrase);
    });
    session.on('failed', function (response, cause) {
        $(MessageObjId).html(lang.call_failed + ": " + cause);
        console.log("Call failed: " + cause);
        teardownSession(lineObj, 0, "Call failed");
    });
    session.on('cancel', function () {
        $(MessageObjId).html(lang.call_cancelled);
        console.log("Call Cancelled");
        teardownSession(lineObj, 0, "Cancelled by caller");
    });
    // referRequested
    // replaced
    session.on('bye', function () {
        $(MessageObjId).html(lang.call_ended);
        console.log("Call ended, bye!");
        teardownSession(lineObj, 16, "Normal Call clearing");
    });
    session.on('terminated', function (message, cause) {
        console.log("Session terminated");
    });
    session.on('reinvite', function (session) {
        console.log("Session reinvited!");
    });
    //dtmf
    session.on('directionChanged', function() {
        var direction = session.sessionDescriptionHandler.getDirection();
        console.log("Direction Change: ", direction);

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("directionChanged", session);
    });

    $("#line-" + lineObj.LineNumber + "-btn-settings").removeAttr('disabled');
    $("#line-" + lineObj.LineNumber + "-btn-audioCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-videoCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-search").removeAttr('disabled');
    $("#line-" + lineObj.LineNumber + "-btn-remove").prop('disabled','disabled');

    $("#line-" + lineObj.LineNumber + "-progress").show();
    $("#line-" + lineObj.LineNumber + "-msg").show();
    updateLineScroll(lineObj.LineNumber);
    UpdateUI();
}
function wireupVideoSession(lineObj) {
    if (lineObj == null) return;

    var MessageObjId = "#line-" + lineObj.LineNumber + "-msg";
    var session = lineObj.SipSession;

    session.on('trackAdded', function () {
        // Gets remote tracks
        var pc = session.sessionDescriptionHandler.peerConnection;
        var remoteAudioStream = new MediaStream();
        var remoteVideoStream = new MediaStream();
        pc.getReceivers().forEach(function (receiver) {
            if(receiver.track){
                if(receiver.track.kind == "audio"){
                    remoteAudioStream.addTrack(receiver.track);
                }
                if(receiver.track.kind == "video"){
                    remoteVideoStream.addTrack(receiver.track);
                }
            }
        });
        var remoteAudio = $("#line-" + lineObj.LineNumber + "-remoteAudio").get(0);
        remoteAudio.srcObject = remoteAudioStream;
        remoteAudio.onloadedmetadata = function(e) {
            if (typeof remoteAudio.sinkId !== 'undefined') {
                remoteAudio.setSinkId(getAudioOutputID()).then(function(){
                    console.log("sinkId applied: "+ getAudioOutputID());
                }).catch(function(e){
                    console.warn("Error using setSinkId: ", e);
                });
            }
            remoteAudio.play();
        }

        var remoteVideo = $("#line-" + lineObj.LineNumber + "-remoteVideo").get(0);
        remoteVideo.srcObject = remoteVideoStream;
        remoteVideo.onloadedmetadata = function(e) {
            remoteVideo.play();
        }

        window.setTimeout(function(){
            var localVideoStream = new MediaStream();
            var pc = session.sessionDescriptionHandler.peerConnection;
            pc.getSenders().forEach(function (sender) {
                if(sender.track && sender.track.kind == "video"){
                    localVideoStream.addTrack(sender.track);
                }
            });
            var localVideo = $("#line-" + lineObj.LineNumber + "-localVideo").get(0);
            localVideo.srcObject = localVideoStream;
            localVideo.onloadedmetadata = function(e) {
                localVideo.play();
            }
        }, 1000);

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("trackAdded", session);
    });
    session.on('progress', function (response) {
        // Provisional 1xx
        if(response.status_code == 100){
            $(MessageObjId).html(lang.trying);
        } else if(response.status_code == 180){
            $(MessageObjId).html(lang.ringing);

            var soundFile = audioBlobs.EarlyMedia_European;
            if(UserLocale().indexOf("us") > -1) soundFile = audioBlobs.EarlyMedia_US;
            if(UserLocale().indexOf("gb") > -1) soundFile = audioBlobs.EarlyMedia_UK;
            if(UserLocale().indexOf("au") > -1) soundFile = audioBlobs.EarlyMedia_Australia;
            if(UserLocale().indexOf("jp") > -1) soundFile = audioBlobs.EarlyMedia_Japan;

            // Play Early Media
            console.log("Audio:", soundFile.url);
            var earlyMedia = new Audio(soundFile.blob);
            earlyMedia.preload = "auto";
            earlyMedia.loop = true;
            earlyMedia.oncanplaythrough = function(e) {
                if (typeof earlyMedia.sinkId !== 'undefined' && getAudioOutputID() != "default") {
                    earlyMedia.setSinkId(getAudioOutputID()).then(function() {
                        console.log("Set sinkId to:", getAudioOutputID());
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                earlyMedia.play().then(function(){
                    // Audio Is Playing
                }).catch(function(e){
                    console.warn("Unable to play audio file.", e);
                }); 
            }
            session.data.earlyMedia = earlyMedia;
        } else {
            $(MessageObjId).html(response.reason_phrase + "...");
        }

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("progress", session);
    });
    session.on('accepted', function (data) {
        
        if(session.data.earlyMedia){
            session.data.earlyMedia.pause();
            session.data.earlyMedia.removeAttribute('src');
            session.data.earlyMedia.load();
            session.data.earlyMedia = null;
        }

        window.clearInterval(session.data.callTimer);
        $("#line-" + lineObj.LineNumber + "-timer").show();
        var startTime = moment.utc();
        session.data.callTimer = window.setInterval(function(){
            var now = moment.utc();
            var duration = moment.duration(now.diff(startTime)); 
            $("#line-" + lineObj.LineNumber + "-timer").html(formatShortDuration(duration.asSeconds()));
        }, 1000);

        if(RecordAllCalls || CallRecordingPolicy == "enabled") {
            StartRecording(lineObj.LineNumber);
        }

        $("#line-"+ lineObj.LineNumber +"-progress").hide();
        $("#line-"+ lineObj.LineNumber +"-VideoCall").show();
        $("#line-"+ lineObj.LineNumber +"-ActiveCall").show();
        $("#line-"+ lineObj.LineNumber +"-btn-Transfer").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-CancelTransfer").hide();
        $("#line-"+ lineObj.LineNumber +"-Transfer").hide();

        // Default to use Camera
        $("#line-"+ lineObj.LineNumber +"-src-camera").prop("disabled", true);
        $("#line-"+ lineObj.LineNumber +"-src-canvas").prop("disabled", false);
        $("#line-"+ lineObj.LineNumber +"-src-desktop").prop("disabled", false);
        $("#line-"+ lineObj.LineNumber +"-src-video").prop("disabled", false);

        updateLineScroll(lineObj.LineNumber);

        // Start Audio Monitoring
        lineObj.LocalSoundMeter = StartLocalAudioMediaMonitoring(lineObj.LineNumber, session);
        lineObj.RemoteSoundMeter = StartRemoteAudioMediaMonitoring(lineObj.LineNumber, session);

        $(MessageObjId).html(lang.call_in_progress);

        if(StartVideoFullScreen) ExpandVideoArea(lineObj.LineNumber);

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("accepted", session);
    });
    session.on('rejected', function (response, cause) {
        $(MessageObjId).html(lang.call_rejected +": "+ cause);
        console.log("Call rejected: "+ cause);
        teardownSession(lineObj, response.status_code, response.reason_phrase);
    });
    session.on('failed', function (response, cause) {
        $(MessageObjId).html(lang.call_failed +": "+ cause);
        console.log("Call failed: "+ cause);
        teardownSession(lineObj, 0, "call failed");
    });
    session.on('cancel', function () {
        $(MessageObjId).html(lang.call_cancelled);
        console.log("Call Cancelled");
        teardownSession(lineObj, 0, "Cancelled by caller");
    });
    
    session.on('bye', function () {
        $(MessageObjId).html(lang.call_ended);
        console.log("Call ended, bye!");
        teardownSession(lineObj, 16, "Normal Call clearing");
    });
    session.on('terminated', function (message, cause) {
        console.log("Session terminated");
    });
    session.on('reinvite', function (session) {
        console.log("Session reinvited!");
    });
    // dtmf
    session.on('directionChanged', function() {
        var direction = session.sessionDescriptionHandler.getDirection();
        console.log("Direction Change: ", direction);

        // Custom Web hook
        if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("directionChanged", session);
    });

    $("#line-" + lineObj.LineNumber + "-btn-settings").removeAttr('disabled');
    $("#line-" + lineObj.LineNumber + "-btn-audioCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-videoCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-search").removeAttr('disabled');
    $("#line-" + lineObj.LineNumber + "-btn-remove").prop('disabled','disabled');

    $("#line-" + lineObj.LineNumber + "-progress").show();
    $("#line-" + lineObj.LineNumber + "-msg").show()
    updateLineScroll(lineObj.LineNumber);
    UpdateUI();
}
function teardownSession(lineObj, reasonCode, reasonText) {
    if(lineObj == null || lineObj.SipSession == null) return;

    var session = lineObj.SipSession;
    if(session.data.teardownComplete == true) return;
    session.data.teardownComplete = true;

    session.data.reasonCode = reasonCode
    session.data.reasonText = reasonText
    // Call UI
    HidePopup();

    // End any child calls
    if(session.data.childsession){
        try{
            if(session.data.childsession.status == SIP.Session.C.STATUS_CONFIRMED){
                session.data.childsession.bye();
            } 
            else{
                session.data.childsession.cancel();
            }
        } catch(e){}
    }
    session.data.childsession = null;

    // Mixed Tracks
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        session.data.AudioSourceTrack.stop();
        session.data.AudioSourceTrack = null;
    }
    // Stop any Early Media
    if(session.data.earlyMedia){
        session.data.earlyMedia.pause();
        session.data.earlyMedia.removeAttribute('src');
        session.data.earlyMedia.load();
        session.data.earlyMedia = null;
    }

    // Stop Recording if we are
    StopRecording(lineObj.LineNumber,true);

    // Audio Meters
    if(lineObj.LocalSoundMeter != null){
        lineObj.LocalSoundMeter.stop();
        lineObj.LocalSoundMeter = null;
    }
    if(lineObj.RemoteSoundMeter != null){
        lineObj.RemoteSoundMeter.stop();
        lineObj.RemoteSoundMeter = null;
    }

    // End timers
    window.clearInterval(session.data.videoResampleInterval);
    window.clearInterval(session.data.callTimer);

    // Add to stream
    AddCallMessage(lineObj.BuddyObj.identity, session, reasonCode, reasonText);

    // Close up the UI
    window.setTimeout(function () {
        RemoveLine(lineObj);
    }, 1000);

    UpdateBuddyList();
    UpdateUI();

    // Custom Web hook
    if(typeof web_hook_on_terminate !== 'undefined') web_hook_on_terminate(session);
}

// Mic and Speaker Levels
function StartRemoteAudioMediaMonitoring(lineNum, session) {
    console.log("Creating RemoteAudio AudioContext on Line:" + lineNum);

    // Create local SoundMeter
    var soundMeter = new SoundMeter(session.id, lineNum);
    if(soundMeter == null){
        console.warn("AudioContext() RemoteAudio not available... it fine.");
        return null;
    }

    // Ready the getStats request
    var remoteAudioStream = new MediaStream();
    var audioReceiver = null;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getReceivers().forEach(function (RTCRtpReceiver) {
        if(RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "audio"){
            if(audioReceiver == null) {
                remoteAudioStream.addTrack(RTCRtpReceiver.track);
                audioReceiver = RTCRtpReceiver;
            }
            else {
                console.log("Found another Track, but audioReceiver not null");
                console.log(RTCRtpReceiver);
                console.log(RTCRtpReceiver.track);
            }
        }
    });


    // Setup Charts
    var maxDataLength = 100;
    soundMeter.startTime = Date.now();
    Chart.defaults.global.defaultFontSize = 12;

    var ChatHistoryOptions = { 
        responsive: false,
        maintainAspectRatio: false,
        devicePixelRatio: 1,
        animation: false,
        scales: {
            yAxes: [{
                ticks: { beginAtZero: true } //, min: 0, max: 100
            }]
        }, 
    }

    // Receive Kilobits per second
    soundMeter.ReceiveBitRateChart = new Chart($("#line-"+ lineNum +"-AudioReceiveBitRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_kilobits_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(168, 0, 0, 0.5)',
                borderColor: 'rgba(168, 0, 0, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChatHistoryOptions
    });
    soundMeter.ReceiveBitRateChart.lastValueBytesReceived = 0;
    soundMeter.ReceiveBitRateChart.lastValueTimestamp = 0;

    // Receive Packets per second
    soundMeter.ReceivePacketRateChart = new Chart($("#line-"+ lineNum +"-AudioReceivePacketRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_packets_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(168, 0, 0, 0.5)',
                borderColor: 'rgba(168, 0, 0, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChatHistoryOptions
    });
    soundMeter.ReceivePacketRateChart.lastValuePacketReceived = 0;
    soundMeter.ReceivePacketRateChart.lastValueTimestamp = 0;

    // Receive Packet Loss
    soundMeter.ReceivePacketLossChart = new Chart($("#line-"+ lineNum +"-AudioReceivePacketLoss"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_packet_loss,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(168, 99, 0, 0.5)',
                borderColor: 'rgba(168, 99, 0, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChatHistoryOptions
    });
    soundMeter.ReceivePacketLossChart.lastValuePacketLoss = 0;
    soundMeter.ReceivePacketLossChart.lastValueTimestamp = 0;

    // Receive Jitter
    soundMeter.ReceiveJitterChart = new Chart($("#line-"+ lineNum +"-AudioReceiveJitter"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_jitter,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(0, 38, 168, 0.5)',
                borderColor: 'rgba(0, 38, 168, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChatHistoryOptions
    });

    // Receive Audio Levels
    soundMeter.ReceiveLevelsChart = new Chart($("#line-"+ lineNum +"-AudioReceiveLevels"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_audio_levels,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(140, 0, 168, 0.5)',
                borderColor: 'rgba(140, 0, 168, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChatHistoryOptions
    });

    // Connect to Source
    soundMeter.connectToSource(remoteAudioStream, function (e) {
        if (e != null) return;

        // Create remote SoundMeter
        console.log("SoundMeter for RemoteAudio Connected, displaying levels for Line: " + lineNum);
        soundMeter.levelsInterval = window.setInterval(function () {
            // Calculate Levels
            //value="0" max="1" high="0.25" (this seems low... )
            var level = soundMeter.instant * 4.0;
            if (level > 1) level = 1;
            var instPercent = level * 100;

            $("#line-" + lineNum + "-Speaker").css("height", instPercent.toFixed(2) +"%");
        }, 50);
        soundMeter.networkInterval = window.setInterval(function (){
            // Calculate Network Conditions
            if(audioReceiver != null) {
                audioReceiver.getStats().then(function(stats) {
                    stats.forEach(function(report){

                        var theMoment = utcDateNow();
                        var ReceiveBitRateChart = soundMeter.ReceiveBitRateChart;
                        var ReceivePacketRateChart = soundMeter.ReceivePacketRateChart;
                        var ReceivePacketLossChart = soundMeter.ReceivePacketLossChart;
                        var ReceiveJitterChart = soundMeter.ReceiveJitterChart;
                        var ReceiveLevelsChart = soundMeter.ReceiveLevelsChart;
                        var elapsedSec = Math.floor((Date.now() - soundMeter.startTime)/1000);
                        if(report.type == "inbound-rtp"){

                            if(ReceiveBitRateChart.lastValueTimestamp == 0) {
                                ReceiveBitRateChart.lastValueTimestamp = report.timestamp;
                                ReceiveBitRateChart.lastValueBytesReceived = report.bytesReceived;

                                ReceivePacketRateChart.lastValueTimestamp = report.timestamp;
                                ReceivePacketRateChart.lastValuePacketReceived = report.packetsReceived;

                                ReceivePacketLossChart.lastValueTimestamp = report.timestamp;
                                ReceivePacketLossChart.lastValuePacketLoss = report.packetsLost;

                                return;
                            }
                            // Receive Kilobits Per second
                            var kbitsPerSec = (8 * (report.bytesReceived - ReceiveBitRateChart.lastValueBytesReceived))/1000;

                            ReceiveBitRateChart.lastValueTimestamp = report.timestamp;
                            ReceiveBitRateChart.lastValueBytesReceived = report.bytesReceived;

                            soundMeter.ReceiveBitRate.push({ value: kbitsPerSec, timestamp : theMoment});
                            ReceiveBitRateChart.data.datasets[0].data.push(kbitsPerSec);
                            ReceiveBitRateChart.data.labels.push("");
                            if(ReceiveBitRateChart.data.datasets[0].data.length > maxDataLength) {
                                ReceiveBitRateChart.data.datasets[0].data.splice(0,1);
                                ReceiveBitRateChart.data.labels.splice(0,1);
                            }
                            ReceiveBitRateChart.update();

                            // Receive Packets Per Second
                            var PacketsPerSec = (report.packetsReceived - ReceivePacketRateChart.lastValuePacketReceived);

                            ReceivePacketRateChart.lastValueTimestamp = report.timestamp;
                            ReceivePacketRateChart.lastValuePacketReceived = report.packetsReceived;

                            soundMeter.ReceivePacketRate.push({ value: PacketsPerSec, timestamp : theMoment});
                            ReceivePacketRateChart.data.datasets[0].data.push(PacketsPerSec);
                            ReceivePacketRateChart.data.labels.push("");
                            if(ReceivePacketRateChart.data.datasets[0].data.length > maxDataLength) {
                                ReceivePacketRateChart.data.datasets[0].data.splice(0,1);
                                ReceivePacketRateChart.data.labels.splice(0,1);
                            }
                            ReceivePacketRateChart.update();
                            // Receive Packet Loss
                            var PacketsLost = (report.packetsLost - ReceivePacketLossChart.lastValuePacketLoss);
                            ReceivePacketLossChart.lastValueTimestamp = report.timestamp;
                            ReceivePacketLossChart.lastValuePacketLoss = report.packetsLost;

                            soundMeter.ReceivePacketLoss.push({ value: PacketsLost, timestamp : theMoment});
                            ReceivePacketLossChart.data.datasets[0].data.push(PacketsLost);
                            ReceivePacketLossChart.data.labels.push("");
                            if(ReceivePacketLossChart.data.datasets[0].data.length > maxDataLength) {
                                ReceivePacketLossChart.data.datasets[0].data.splice(0,1);
                                ReceivePacketLossChart.data.labels.splice(0,1);
                            }
                            ReceivePacketLossChart.update();

                            // Receive Jitter
                            soundMeter.ReceiveJitter.push({ value: report.jitter, timestamp : theMoment});
                            ReceiveJitterChart.data.datasets[0].data.push(report.jitter);
                            ReceiveJitterChart.data.labels.push("");
                            if(ReceiveJitterChart.data.datasets[0].data.length > maxDataLength) {
                                ReceiveJitterChart.data.datasets[0].data.splice(0,1);
                                ReceiveJitterChart.data.labels.splice(0,1);
                            }
                            ReceiveJitterChart.update();
                        }
                        if(report.type == "track") {

                            // Receive Audio Levels
                            var levelPercent = (report.audioLevel * 100);
                            soundMeter.ReceiveLevels.push({ value: levelPercent, timestamp : theMoment});
                            ReceiveLevelsChart.data.datasets[0].data.push(levelPercent);
                            ReceiveLevelsChart.data.labels.push("");
                            if(ReceiveLevelsChart.data.datasets[0].data.length > maxDataLength)
                            {
                                ReceiveLevelsChart.data.datasets[0].data.splice(0,1);
                                ReceiveLevelsChart.data.labels.splice(0,1);
                            }
                            ReceiveLevelsChart.update();
                        }
                    });
                });
            }
        } ,1000);
    });

    return soundMeter;
}
function StartLocalAudioMediaMonitoring(lineNum, session) {
    console.log("Creating LocalAudio AudioContext on line " + lineNum);

    // Create local SoundMeter
    var soundMeter = new SoundMeter(session.id, lineNum);
    if(soundMeter == null){
        console.warn("AudioContext() LocalAudio not available... its fine.")
        return null;
    }

    // Ready the getStats request
    var localAudioStream = new MediaStream();
    var audioSender = null;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio"){
            if(audioSender == null){
                console.log("Adding Track to Monitor: ", RTCRtpSender.track.label);
                localAudioStream.addTrack(RTCRtpSender.track);
                audioSender = RTCRtpSender;
            }
            else {
                console.log("Found another Track, but audioSender not null");
                console.log(RTCRtpSender);
                console.log(RTCRtpSender.track);
            }
        }
    });

    // Setup Charts
    var maxDataLength = 100;
    soundMeter.startTime = Date.now();
    Chart.defaults.global.defaultFontSize = 12;
    var ChatHistoryOptions = { 
        responsive: false,    
        maintainAspectRatio: false,
        devicePixelRatio: 1,
        animation: false,
        scales: {
            yAxes: [{
                ticks: { beginAtZero: true }
            }]
        }, 
    }

    // Send Kilobits Per Second
    soundMeter.SendBitRateChart = new Chart($("#line-"+ lineNum +"-AudioSendBitRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.send_kilobits_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(0, 121, 19, 0.5)',
                borderColor: 'rgba(0, 121, 19, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChatHistoryOptions
    });
    soundMeter.SendBitRateChart.lastValueBytesSent = 0;
    soundMeter.SendBitRateChart.lastValueTimestamp = 0;

    // Send Packets Per Second
    soundMeter.SendPacketRateChart = new Chart($("#line-"+ lineNum +"-AudioSendPacketRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.send_packets_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(0, 121, 19, 0.5)',
                borderColor: 'rgba(0, 121, 19, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChatHistoryOptions
    });
    soundMeter.SendPacketRateChart.lastValuePacketSent = 0;
    soundMeter.SendPacketRateChart.lastValueTimestamp = 0;    

    // Connect to Source
    soundMeter.connectToSource(localAudioStream, function (e) {
        if (e != null) return;

        console.log("SoundMeter for LocalAudio Connected, displaying levels for Line: " + lineNum);
        soundMeter.levelsInterval = window.setInterval(function () {
       
            var level = soundMeter.instant * 4.0;
            if (level > 1) level = 1;
            var instPercent = level * 100;
            $("#line-" + lineNum + "-Mic").css("height", instPercent.toFixed(2) +"%");
        }, 50);
        soundMeter.networkInterval = window.setInterval(function (){            
            if(audioSender != null) {
                audioSender.getStats().then(function(stats) {
                    stats.forEach(function(report){

                        var theMoment = utcDateNow();
                        var SendBitRateChart = soundMeter.SendBitRateChart;
                        var SendPacketRateChart = soundMeter.SendPacketRateChart;
                        var elapsedSec = Math.floor((Date.now() - soundMeter.startTime)/1000);
                        if(report.type == "outbound-rtp"){
                            if(SendBitRateChart.lastValueTimestamp == 0) {
                                SendBitRateChart.lastValueTimestamp = report.timestamp;
                                SendBitRateChart.lastValueBytesSent = report.bytesSent;

                                SendPacketRateChart.lastValueTimestamp = report.timestamp;
                                SendPacketRateChart.lastValuePacketSent = report.packetsSent;
                                return;
                            }

                            // Send Kilobits Per second
                            var kbitsPerSec = (8 * (report.bytesSent - SendBitRateChart.lastValueBytesSent))/1000;

                            SendBitRateChart.lastValueTimestamp = report.timestamp;
                            SendBitRateChart.lastValueBytesSent = report.bytesSent;

                            soundMeter.SendBitRate.push({ value: kbitsPerSec, timestamp : theMoment});
                            SendBitRateChart.data.datasets[0].data.push(kbitsPerSec);
                            SendBitRateChart.data.labels.push("");
                            if(SendBitRateChart.data.datasets[0].data.length > maxDataLength) {
                                SendBitRateChart.data.datasets[0].data.splice(0,1);
                                SendBitRateChart.data.labels.splice(0,1);
                            }
                            SendBitRateChart.update();

                            // Send Packets Per Second
                            var PacketsPerSec = report.packetsSent - SendPacketRateChart.lastValuePacketSent;
                            SendPacketRateChart.lastValueTimestamp = report.timestamp;
                            SendPacketRateChart.lastValuePacketSent = report.packetsSent;
                            soundMeter.SendPacketRate.push({ value: PacketsPerSec, timestamp : theMoment});
                            SendPacketRateChart.data.datasets[0].data.push(PacketsPerSec);
                            SendPacketRateChart.data.labels.push("");
                            if(SendPacketRateChart.data.datasets[0].data.length > maxDataLength) {
                                SendPacketRateChart.data.datasets[0].data.splice(0,1);
                                SendPacketRateChart.data.labels.splice(0,1);
                            }
                            SendPacketRateChart.update();
                        }
                        if(report.type == "track") {
                        }
                    });
                });
            }
        } ,1000);
    });

    return soundMeter;
}

// Sounds Meter Class
class SoundMeter {
    constructor(sessionId, lineNum) {
        var audioContext = null;
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        }
        catch(e) {
            console.warn("AudioContext() LocalAudio not available... its fine.");
        }
        if (audioContext == null) return null;
        this.lineNum = lineNum;
        this.sessionId = sessionId;
        this.levelsInterval = null;
        this.networkInterval = null;
        this.startTime = 0;
        this.ReceiveBitRateChart = null;
        this.ReceiveBitRate = [];
        this.ReceivePacketRateChart = null;
        this.ReceivePacketRate = [];
        this.ReceivePacketLossChart = null;
        this.ReceivePacketLoss = [];
        this.ReceiveJitterChart = null;
        this.ReceiveJitter = [];
        this.ReceiveLevelsChart = null;
        this.ReceiveLevels = [];
        this.SendBitRateChart = null;
        this.SendBitRate = [];
        this.SendPacketRateChart = null;
        this.SendPacketRate = [];
        this.context = audioContext;
        this.instant = 0.0;
        this.script = audioContext.createScriptProcessor(2048, 1, 1);
        const that = this;
        this.script.onaudioprocess = function (event) {
            const input = event.inputBuffer.getChannelData(0);
            let i;
            let sum = 0.0;
            for (i = 0; i < input.length; ++i) {
                sum += input[i] * input[i];
            }
            that.instant = Math.sqrt(sum / input.length);
        }
    }
    connectToSource(stream, callback) {
        console.log("SoundMeter connecting...");
        try {
            this.mic = this.context.createMediaStreamSource(stream);
            this.mic.connect(this.script);
            // necessary to make sample run, but should not be.
            this.script.connect(this.context.destination);
            callback(null);
        }
        catch(e) {
            console.error(e); // Probably not audio track
            callback(e);
        }
    }
    stop() {
        console.log("Disconnecting SoundMeter...");
        try {
            window.clearInterval(this.levelsInterval);
            this.levelsInterval = null;
        }
        catch(e) { }
        try {
            window.clearInterval(this.networkInterval);
            this.networkInterval = null;
        }
        catch(e) { }
        this.mic.disconnect();
        this.script.disconnect();
        this.mic = null;
        this.script = null;
        try {
            this.context.close();
        }
        catch(e) { }
        this.context = null;

        // Save to IndexDb
        var lineObj = FindLineByNumber(this.lineNum);
        var QosData = {
            ReceiveBitRate: this.ReceiveBitRate,
            ReceivePacketRate: this.ReceivePacketRate,
            ReceivePacketLoss: this.ReceivePacketLoss,
            ReceiveJitter: this.ReceiveJitter,
            ReceiveLevels: this.ReceiveLevels,
            SendBitRate: this.SendBitRate,
            SendPacketRate: this.SendPacketRate,
        }
        SaveQosData(QosData, this.sessionId, lineObj.BuddyObj.identity);
    }
}
function MeterSettingsOutput(audioStream, objectId, direction, interval){
    var soundMeter = new SoundMeter(null, null);
    soundMeter.startTime = Date.now();
    soundMeter.connectToSource(audioStream, function (e) {
        if (e != null) return;

        console.log("SoundMeter Connected, displaying levels to:"+ objectId);
        soundMeter.levelsInterval = window.setInterval(function () {
            // Calculate Levels
            //value="0" max="1" high="0.25" (this seems low... )
            var level = soundMeter.instant * 4.0;
            if (level > 1) level = 1;
            var instPercent = level * 100;

            $("#"+objectId).css(direction, instPercent.toFixed(2) +"%"); // Settings_MicrophoneOutput "width" 50
        }, interval);
    });

    return soundMeter;
}

// QOS
function SaveQosData(QosData, sessionId, buddy){
    var indexedDB = window.indexedDB;
    var request = indexedDB.open("CallQosData");
    request.onerror = function(event) {
        console.error("IndexDB Request Error:", event);
    }
    request.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
        var IDB = event.target.result;

        // Create Object Store
        if(IDB.objectStoreNames.contains("CallQos") == false){
            var objectStore = IDB.createObjectStore("CallQos", { keyPath: "uID" });
            objectStore.createIndex("sessionid", "sessionid", { unique: false });
            objectStore.createIndex("buddy", "buddy", { unique: false });
            objectStore.createIndex("QosData", "QosData", { unique: false });
        }
        else {
            console.warn("IndexDB requested upgrade, but object store was in place");
        }
    }
    request.onsuccess = function(event) {
        console.log("IndexDB connected to CallQosData");

        var IDB = event.target.result;
        if(IDB.objectStoreNames.contains("CallQos") == false){
            console.warn("IndexDB CallQosData.CallQos does not exists");
            return;
        }
        IDB.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }

        // Prepare data to write
        var data = {
            uID: uID(),
            sessionid: sessionId,
            buddy: buddy,
            QosData: QosData
        }
        // Commit Transaction
        var transaction = IDB.transaction(["CallQos"], "readwrite");
        var objectStoreAdd = transaction.objectStore("CallQos").add(data);
        objectStoreAdd.onsuccess = function(event) {
            console.log("Call CallQos Sucess: ", sessionId);
        }
    }
}
function DisplayQosData(sessionId){
    var indexedDB = window.indexedDB;
    var request = indexedDB.open("CallQosData");
    request.onerror = function(event) {
        console.error("IndexDB Request Error:", event);
    }
    request.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
    }
    request.onsuccess = function(event) {
        console.log("IndexDB connected to CallQosData");

        var IDB = event.target.result;
        if(IDB.objectStoreNames.contains("CallQos") == false){
            console.warn("IndexDB CallQosData.CallQos does not exists");
            return;
        } 

        var transaction = IDB.transaction(["CallQos"]);
        var objectStoreGet = transaction.objectStore("CallQos").index('sessionid').getAll(sessionId);
        objectStoreGet.onerror = function(event) {
            console.error("IndexDB Get Error:", event);
        }
        objectStoreGet.onsuccess = function(event) {
            if(event.target.result && event.target.result.length == 2){
                // This is the correct data

                var QosData0 = event.target.result[0].QosData;
                var QosData1 = event.target.result[1].QosData;
                Chart.defaults.global.defaultFontSize = 12;

                var ChatHistoryOptions = { 
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    scales: {
                        yAxes: [{
                            ticks: { beginAtZero: true } //, min: 0, max: 100
                        }],
                        xAxes: [{
                            display: false
                        }]
                    }, 
                }

                // ReceiveBitRateChart
                var labelset = [];
                var dataset = [];
                var data = (QosData0.ReceiveBitRate.length > 0)? QosData0.ReceiveBitRate : QosData1.ReceiveBitRate;
                $.each(data, function(i,item){
                    labelset.push(moment.utc(item.timestamp.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat));
                    dataset.push(item.value);
                });
                var ReceiveBitRateChart = new Chart($("#cdr-AudioReceiveBitRate"), {
                    type: 'line',
                    data: {
                        labels: labelset,
                        datasets: [{
                            label: lang.receive_kilobits_per_second,
                            data: dataset,
                            backgroundColor: 'rgba(168, 0, 0, 0.5)',
                            borderColor: 'rgba(168, 0, 0, 1)',
                            borderWidth: 1,
                            pointRadius: 1
                        }]
                    },
                    options: ChatHistoryOptions
                });

                // ReceivePacketRateChart
                var labelset = [];
                var dataset = [];
                var data = (QosData0.ReceivePacketRate.length > 0)? QosData0.ReceivePacketRate : QosData1.ReceivePacketRate;
                $.each(data, function(i,item){
                    labelset.push(moment.utc(item.timestamp.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat));
                    dataset.push(item.value);
                });
                var ReceivePacketRateChart = new Chart($("#cdr-AudioReceivePacketRate"), {
                    type: 'line',
                    data: {
                        labels: labelset,
                        datasets: [{
                            label: lang.receive_packets_per_second,
                            data: dataset,
                            backgroundColor: 'rgba(168, 0, 0, 0.5)',
                            borderColor: 'rgba(168, 0, 0, 1)',
                            borderWidth: 1,
                            pointRadius: 1
                        }]
                    },
                    options: ChatHistoryOptions
                });

                // AudioReceivePacketLossChart
                var labelset = [];
                var dataset = [];
                var data = (QosData0.ReceivePacketLoss.length > 0)? QosData0.ReceivePacketLoss : QosData1.ReceivePacketLoss;
                $.each(data, function(i,item){
                    labelset.push(moment.utc(item.timestamp.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat));
                    dataset.push(item.value);
                });
                var AudioReceivePacketLossChart = new Chart($("#cdr-AudioReceivePacketLoss"), {
                    type: 'line',
                    data: {
                        labels: labelset,
                        datasets: [{
                            label: lang.receive_packet_loss,
                            data: dataset,
                            backgroundColor: 'rgba(168, 99, 0, 0.5)',
                            borderColor: 'rgba(168, 99, 0, 1)',
                            borderWidth: 1,
                            pointRadius: 1
                        }]
                    },
                    options: ChatHistoryOptions
                });

                // AudioReceiveJitterChart
                var labelset = [];
                var dataset = [];
                var data = (QosData0.ReceiveJitter.length > 0)? QosData0.ReceiveJitter : QosData1.ReceiveJitter;
                $.each(data, function(i,item){
                    labelset.push(moment.utc(item.timestamp.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat));
                    dataset.push(item.value);
                });
                var AudioReceiveJitterChart = new Chart($("#cdr-AudioReceiveJitter"), {
                    type: 'line',
                    data: {
                        labels: labelset,
                        datasets: [{
                            label: lang.receive_jitter,
                            data: dataset,
                            backgroundColor: 'rgba(0, 38, 168, 0.5)',
                            borderColor: 'rgba(0, 38, 168, 1)',
                            borderWidth: 1,
                            pointRadius: 1
                        }]
                    },
                    options: ChatHistoryOptions
                });
                
                // AudioReceiveLevelsChart
                var labelset = [];
                var dataset = [];
                var data = (QosData0.ReceiveLevels.length > 0)? QosData0.ReceiveLevels : QosData1.ReceiveLevels;
                $.each(data, function(i,item){
                    labelset.push(moment.utc(item.timestamp.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat));
                    dataset.push(item.value);
                });
                var AudioReceiveLevelsChart = new Chart($("#cdr-AudioReceiveLevels"), {
                    type: 'line',
                    data: {
                        labels: labelset,
                        datasets: [{
                            label: lang.receive_audio_levels,
                            data: dataset,
                            backgroundColor: 'rgba(140, 0, 168, 0.5)',
                            borderColor: 'rgba(140, 0, 168, 1)',
                            borderWidth: 1,
                            pointRadius: 1
                        }]
                    },
                    options: ChatHistoryOptions
                });
                
                // SendPacketRateChart
                var labelset = [];
                var dataset = [];
                var data = (QosData0.SendPacketRate.length > 0)? QosData0.SendPacketRate : QosData1.SendPacketRate;
                $.each(data, function(i,item){
                    labelset.push(moment.utc(item.timestamp.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat));
                    dataset.push(item.value);
                });
                var SendPacketRateChart = new Chart($("#cdr-AudioSendPacketRate"), {
                    type: 'line',
                    data: {
                        labels: labelset,
                        datasets: [{
                            label: lang.send_packets_per_second,
                            data: dataset,
                            backgroundColor: 'rgba(0, 121, 19, 0.5)',
                            borderColor: 'rgba(0, 121, 19, 1)',
                            borderWidth: 1,
                            pointRadius: 1
                        }]
                    },
                    options: ChatHistoryOptions
                });

                // AudioSendBitRateChart
                var labelset = [];
                var dataset = [];
                var data = (QosData0.SendBitRate.length > 0)? QosData0.SendBitRate : QosData1.SendBitRate;
                $.each(data, function(i,item){
                    labelset.push(moment.utc(item.timestamp.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat));
                    dataset.push(item.value);
                });
                var AudioSendBitRateChart = new Chart($("#cdr-AudioSendBitRate"), {
                    type: 'line',
                    data: {
                        labels: labelset,
                        datasets: [{
                            label: lang.send_kilobits_per_second,
                            data: dataset,
                            backgroundColor: 'rgba(0, 121, 19, 0.5)',
                            borderColor: 'rgba(0, 121, 19, 1)',
                            borderWidth: 1,
                            pointRadius: 1
                        }]
                    },
                    options: ChatHistoryOptions
                });

            } else{
                console.warn("Result not expected", event.target.result);
            }
        }
    }
}
function DeleteQosData(buddy){
    var indexedDB = window.indexedDB;
    var request = indexedDB.open("CallQosData");
    request.onerror = function(event) {
        console.error("IndexDB Request Error:", event);
    }
    request.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
        // If this is the case, there will be no call recordings
    }
    request.onsuccess = function(event) {
        console.log("IndexDB connected to CallQosData");

        var IDB = event.target.result;
        if(IDB.objectStoreNames.contains("CallQos") == false){
            console.warn("IndexDB CallQosData.CallQos does not exists");
            return;
        }
        IDB.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }

        // Loop and Delete
        console.log("Deleting CallQosData: ", buddy);
        var transaction = IDB.transaction(["CallQos"], "readwrite");
        var objectStore = transaction.objectStore("CallQos");
        var objectStoreGet = objectStore.index('buddy').getAll(buddy);

        objectStoreGet.onerror = function(event) {
            console.error("IndexDB Get Error:", event);
        }
        objectStoreGet.onsuccess = function(event) {
            if(event.target.result && event.target.result.length > 0){
                // There sre some rows to delete
                $.each(event.target.result, function(i, item){
                    // console.log("Delete: ", item.uID);
                    try{
                        objectStore.delete(item.uID);
                    } catch(e){
                        console.log("Call CallQosData Delete failed: ", e);
                    }
                });
            }
        }

    }
}

function SubscribeBuddy(buddyObj) {
    var dialogOptions = { expires: 300, extraHeaders: ['Accept: application/pidf+xml'] }
    // var dialogOptions = { expires: 300, extraHeaders: ['Accept: application/pidf+xml', 'application/xpidf+xml', 'application/simple-message-summary', 'application/im-iscomposing+xml'] }

    if(buddyObj.type == "extension") {
        console.log("SUBSCRIBE: "+ buddyObj.ExtNo +"@" + wssServer);
        var blfObj = userAgent.subscribe(buddyObj.ExtNo +"@" + wssServer, 'presence', dialogOptions);
        blfObj.data.buddyId = buddyObj.identity;
        blfObj.on('notify', function (notification) {
            RecieveBlf(notification);
        });
        BlfSubs.push(blfObj);
    }
}
function RecieveBlf(notification) {
    if (userAgent == null || !userAgent.isRegistered()) return;

    var ContentType = notification.request.headers["Content-Type"][0].parsed;
    if (ContentType == "application/pidf+xml") {
        var xml = $($.parseXML(notification.request.body));

        var Entity = xml.find("presence").attr("entity");
        var Contact = xml.find("presence").find("tuple").find("contact").text();
        if (SipUsername == Entity.split("@")[0].split(":")[1] || SipUsername == Contact.split("@")[0].split(":")[1]){
            // Message is for you.
        } 
        else {
            console.warn("presence message not for you.", xml);
            return;
        }

        var buddy = xml.find("presence").find("tuple").attr("id");

        var statusObj = xml.find("presence").find("tuple").find("status");
        var availability = xml.find("presence").find("tuple").find("status").find("basic").text();
        var friendlyState = xml.find("presence").find("note").text();
        var dotClass = "dotOffline";
        if (friendlyState == "Not online") dotClass = "dotOffline";
        if (friendlyState == "Ready") dotClass = "dotOnline";
        if (friendlyState == "On the phone") dotClass = "dotInUse";
        if (friendlyState == "Ringing") dotClass = "dotRinging";
        if (friendlyState == "On hold") dotClass = "dotOnHold";
        if (friendlyState == "Unavailable") dotClass = "dotOffline";

        var buddyObj = FindBuddyByExtNo(buddy);
        if(buddyObj != null)
        {
            console.log("Setting Presence for "+ buddyObj.identity +" to "+ friendlyState);
            $("#contact-" + buddyObj.identity + "-devstate").prop("class", dotClass);
            $("#contact-" + buddyObj.identity + "-devstate-main").prop("class", dotClass);
            buddyObj.devState = dotClass;
            buddyObj.presence = friendlyState;

            if (friendlyState == "Not online") friendlyState = lang.state_not_online;
            if (friendlyState == "Ready") friendlyState = lang.state_ready;
            if (friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
            if (friendlyState == "Ringing") friendlyState = lang.state_ringing;
            if (friendlyState == "On hold") friendlyState = lang.state_on_hold;
            if (friendlyState == "Unavailable") friendlyState = lang.state_unavailable;
            $("#contact-" + buddyObj.identity + "-presence").html(friendlyState);
            $("#contact-" + buddyObj.identity + "-presence-main").html(friendlyState);
        }
    }
    else if (ContentType == "application/dialog-info+xml")
    {
        var xml = $($.parseXML(notification.request.body));
        var ObservedUser = xml.find("dialog-info").attr("entity");
        var buddy = ObservedUser.split("@")[0].split(":")[1];

        var version = xml.find("dialog-info").attr("version");

        var DialogState = xml.find("dialog-info").attr("state");
        if (DialogState != "full") return;

        var extId = xml.find("dialog-info").find("dialog").attr("id");
        if (extId != buddy) return;

        var state = xml.find("dialog-info").find("dialog").find("state").text();
        var friendlyState = "Unknown";
        if (state == "terminated") friendlyState = "Ready";
        if (state == "trying") friendlyState = "On the phone";
        if (state == "proceeding") friendlyState = "On the phone";
        if (state == "early") friendlyState = "Ringing";
        if (state == "confirmed") friendlyState = "On the phone";

        var dotClass = "dotOffline";
        if (friendlyState == "Not online") dotClass = "dotOffline";
        if (friendlyState == "Ready") dotClass = "dotOnline";
        if (friendlyState == "On the phone") dotClass = "dotInUse";
        if (friendlyState == "Ringing") dotClass = "dotRinging";
        if (friendlyState == "On hold") dotClass = "dotOnHold";
        if (friendlyState == "Unavailable") dotClass = "dotOffline";

        var buddyObj = FindBuddyByExtNo(buddy);
        if(buddyObj != null)
        {
            console.log("Setting Presence for "+ buddyObj.identity +" to "+ friendlyState);
            $("#contact-" + buddyObj.identity + "-devstate").prop("class", dotClass);
            $("#contact-" + buddyObj.identity + "-devstate-main").prop("class", dotClass);
            buddyObj.devState = dotClass;
            buddyObj.presence = friendlyState;

            if (friendlyState == "Unknown") friendlyState = lang.state_unknown;
            if (friendlyState == "Not online") friendlyState = lang.state_not_online;
            if (friendlyState == "Ready") friendlyState = lang.state_ready;
            if (friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
            if (friendlyState == "Ringing") friendlyState = lang.state_ringing;
            if (friendlyState == "On hold") friendlyState = lang.state_on_hold;
            if (friendlyState == "Unavailable") friendlyState = lang.state_unavailable;
            $("#contact-" + buddyObj.identity + "-presence").html(friendlyState);
            $("#contact-" + buddyObj.identity + "-presence-main").html(friendlyState);
        }
    }
}
function UnsubscribeAll() {
    console.log("Unsubscribing "+ BlfSubs.length + " subscriptions...");
    for (var blf = 0; blf < BlfSubs.length; blf++) {
        BlfSubs[blf].unsubscribe();
        BlfSubs[blf].close();
    }
    BlfSubs = new Array();

    for(var b=0; b<Buddies.length; b++) {
        var buddyObj = Buddies[b];
        if(buddyObj.type == "extension") {
            $("#contact-" + buddyObj.identity + "-devstate").prop("class", "dotOffline");
            $("#contact-" + buddyObj.identity + "-devstate-main").prop("class", "dotOffline");
            $("#contact-" + buddyObj.identity + "-presence").html(lang.state_unknown);
            $("#contact-" + buddyObj.identity + "-presence-main").html(lang.state_unknown);
        }
    }
}
function UnsubscribeBuddy(buddyObj) {
    if(buddyObj.type != "extension") return;

    for (var blf = 0; blf < BlfSubs.length; blf++) {
        var blfObj = BlfSubs[blf];
        if(blfObj.data.buddyId == buddyObj.identity){
        console.log("Unsubscribing:", buddyObj.identity);
            if(blfObj.dialog != null){
                blfObj.unsubscribe();
                blfObj.close();
            }
            BlfSubs.splice(blf, 1);
            break;
        }
    }
}

// Buddy: Chat / Instant Message / XMPP

function InitinaliseStream(buddy){
    var template = { TotalRows:0, DataCollection:[] }
    localDB.setItem(buddy + "-stream", JSON.stringify(template));
    return JSON.parse(localDB.getItem(buddy + "-stream"));
}
function SendChatMessage(buddy) {
    if (userAgent == null) return;
    if (!userAgent.isRegistered()) return;

    var message = $("#contact-" + buddy + "-ChatMessage").val();
    message = $.trim(message);
    if(message == "") {
        Alert(lang.alert_empty_text_message, lang.no_message);
        return;
    }

    var messageId = uID();
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj.type == "extension" || buddyObj.type == "group") {
        var chatBuddy = buddyObj.ExtNo + "@" + wssServer;
        console.log("MESSAGE: "+ chatBuddy + " (extension)");
        var messageObj = userAgent.message(chatBuddy, message);
        messageObj.data.direction = "outbound";
        messageObj.data.messageId = messageId;
        messageObj.on("accepted", function (response, cause){
            if(response.status_code == 202) {
                console.log("Message Accepted:", messageId);

                // Update DB
                var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
                if(currentStream != null || currentStream.DataCollection != null){
                    $.each(currentStream.DataCollection, function (i, item) {
                        if (item.ItemType == "MSG" && item.ItemId == messageId) {
                            // Found
                            item.Sent = true;
                            return false;
                        }
                    });
                    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));

                    RefreshStream(buddyObj);
                }
            } else {
                console.warn("Message Error", response.status_code, cause);

                // Update DB
                var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
                if(currentStream != null || currentStream.DataCollection != null){
                    $.each(currentStream.DataCollection, function (i, item) {
                        if (item.ItemType == "MSG" && item.ItemId == messageId) {
                            // Found
                            item.Sent = false;
                            return false;
                        }
                    });
                    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));

                    RefreshStream(buddyObj);
                }                
            }
        });

        // Custom Web hook
        if(typeof web_hook_on_message !== 'undefined') web_hook_on_message(messageObj);
    } 

    // Update Stream
    var DateTime = moment.utc().format("YYYY-MM-DD HH:mm:ss UTC");
    var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
    if(currentStream == null) currentStream = InitinaliseStream(buddy);

    // Add New Message
    var newMessageJson = {
        ItemId: messageId,
        ItemType: "MSG",
        ItemDate: DateTime,
        SrcUserId: profileUserID,
        Src: "\""+ profileName +"\" <"+ profileUser +">",
        DstUserId: buddy,
        Dst: "",
        MessageData: message
    }

    currentStream.DataCollection.push(newMessageJson);
    currentStream.TotalRows = currentStream.DataCollection.length;
    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));

    // Post Add Activity
    $("#contact-" + buddy + "-ChatMessage").val("");
    $("#contact-" + buddy + "-dictate-message").hide();
    $("#contact-" + buddy + "-emoji-menu").hide();

    if(buddyObj.recognition != null){
        buddyObj.recognition.abort();
        buddyObj.recognition = null;
    }

    ClearChatPreview(buddy);
    UpdateBuddyActivity(buddy);
    RefreshStream(buddyObj);
}
function ReceiveMessage(message) {
    var callerID = message.remoteIdentity.displayName;
    var did = message.remoteIdentity.uri.user;

    console.log("New Incoming Message!", "\""+ callerID +"\" <"+ did +">");

    message.data.direction = "inbound";

    if(did.length > DidLength) {
        console.warn("DID length greater then extensions length")
        return;
    }

    var CurrentCalls = countSessions("0");

    var buddyObj = FindBuddyByDid(did);
    // Make new contact of its not there
    if(buddyObj == null) {
        var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
        if(json == null) json = InitUserBuddies();

        // Add Extension
        var id = uID();
        var dateNow = utcDateNow();
        json.DataCollection.push({
            Type: "extension",
            LastActivity: dateNow,
            ExtensionNumber: did,
            MobileNumber: "",
            ContactNumber1: "",
            ContactNumber2: "",
            uID: id,
            cID: null,
            gID: null,
            DisplayName: callerID,
            Position: "",
            Description: "", 
            Email: "",
            MemberCount: 0
        });
        buddyObj = new Buddy("extension", id, callerID, did, "", "", "", dateNow, "", "");
        AddBuddy(buddyObj, true, (CurrentCalls==0), true);

        // Update Size: 
        json.TotalRows = json.DataCollection.length;

        // Save To DB
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    var origionalMessage = message.body;
    var formattedMessage = ReformatMessage(origionalMessage); // Check if its Json ??
    var messageId = uID();
    var DateTime = utcDateNow();

    // Get the actual Person sending (since all group messages come from the group)
    var ActualSender = "";
    if(buddyObj.type == "group") {
        var assertedIdentity = message.request.headers["P-Asserted-Identity"][0].raw; // Name Surname <ExtNo> 
        // console.log(assertedIdentity);
        var bits = assertedIdentity.split(" <");
        var CallerID = bits[0];
        var CallerIDNum = bits[1].replace(">", "");

        ActualSender = CallerID; // P-Asserted-Identity;
    }

    // Current Stream
    var currentStream = JSON.parse(localDB.getItem(buddyObj.identity + "-stream"));
    if(currentStream == null) currentStream = InitinaliseStream(buddyObj.identity);

    // Add New Message
    var newMessageJson = {
        ItemId: messageId,
        ItemType: "MSG",
        ItemDate: DateTime,
        SrcUserId: buddyObj.identity,
        Src: "\""+ buddyObj.CallerIDName +"\" <"+ buddyObj.ExtNo +">",
        DstUserId: profileUserID,
        Dst: "",
        MessageData: origionalMessage
    }

    currentStream.DataCollection.push(newMessageJson);
    currentStream.TotalRows = currentStream.DataCollection.length;
    localDB.setItem(buddyObj.identity + "-stream", JSON.stringify(currentStream));

    // Update Last Activity
    UpdateBuddyActivity(buddyObj.identity);
    RefreshStream(buddyObj);

    // Handle Stream Not visible
    var streamVisible = $("#stream-"+ buddyObj.identity).is(":visible");
    if (!streamVisible) {
        // Add or Increase the Badge
        IncreaseMissedBadge(buddyObj.identity);
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                var imageUrl = getPicture(buddyObj.identity);
                var noticeOptions = { body: origionalMessage.substring(0, 250), icon: imageUrl }
                var inComingChatNotification = new Notification(lang.message_from + " : " + buddyObj.CallerIDName, noticeOptions);
                inComingChatNotification.onclick = function (event) {
                    // Show Message
                    SelectBuddy(buddyObj.identity);
                }
            }
        }
        // Play Alert
        console.log("Audio:", audioBlobs.Alert.url);
        var rinnger = new Audio(audioBlobs.Alert.blob);
        rinnger.preload = "auto";
        rinnger.loop = false;
        rinnger.oncanplaythrough = function(e) {
            if (typeof rinnger.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                rinnger.setSinkId(getRingerOutputID()).then(function() {
                    console.log("Set sinkId to:", getRingerOutputID());
                }).catch(function(e){
                    console.warn("Failed not apply setSinkId.", e);
                });
            }
            // If there has been no interaction with the page at all... this page will not work
            rinnger.play().then(function(){
                // Audio Is Playing
            }).catch(function(e){
                console.warn("Unable to play audio file.", e);
            });
        }
        message.data.rinngerObj = rinnger; // Will be attached to this object until its disposed.
    } else {
        // Message window is active.
    }
}
function AddCallMessage(buddy, session, reasonCode, reasonText) {

    var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
    if(currentStream == null) currentStream = InitinaliseStream(buddy);

    var CallEnd = moment.utc(); // Take Now as the Hangup Time
    var callDuration = 0;
    var totalDuration = 0;
    var ringTime = 0;

    var CallStart = moment.utc(session.data.callstart.replace(" UTC", "")); // Actual start (both inbound and outbound)
    var CallAnswer = null; // On Accept when inbound, Remote Side when Outbound
    if(session.startTime){
        // The time when WE answered the call (May be null - no answer)
        // or
        // The time when THEY answered the call (May be null - no answer)
        CallAnswer = moment.utc(session.startTime);  // Local Time gets converted to UTC 

        callDuration = moment.duration(CallEnd.diff(CallAnswer));
        ringTime = moment.duration(CallAnswer.diff(CallStart));
    }
    totalDuration = moment.duration(CallEnd.diff(CallStart));

    console.log(session.data.reasonCode + "("+ session.data.reasonText +")")

    var srcId = "";
    var srcCallerID = "";
    var dstId = ""
    var dstCallerID = "";
    if(session.data.calldirection == "inbound") {
        srcId = buddy;
        dstId = profileUserID;
        srcCallerID = "<"+ session.remoteIdentity.uri.user +"> "+ session.remoteIdentity.displayName;
        dstCallerID = "<"+ profileUser+"> "+ profileName;
    } else if(session.data.calldirection == "outbound") {
        srcId = profileUserID;
        dstId = buddy;
        srcCallerID = "<"+ profileUser+"> "+ profileName;
        dstCallerID = session.remoteIdentity.uri.user;
    }

    var callDirection = session.data.calldirection;
    var withVideo = session.data.withvideo;
    var sessionId = session.id;
    var hanupBy = session.data.terminateby;

    var newMessageJson = {
        CdrId: uID(),
        ItemType: "CDR",
        ItemDate: CallStart.format("YYYY-MM-DD HH:mm:ss UTC"),
        CallAnswer: (CallAnswer)? CallAnswer.format("YYYY-MM-DD HH:mm:ss UTC") : null,
        CallEnd: CallEnd.format("YYYY-MM-DD HH:mm:ss UTC"),
        SrcUserId: srcId,
        Src: srcCallerID,
        DstUserId: dstId,
        Dst: dstCallerID,
        RingTime: (ringTime != 0)? ringTime.asSeconds() : 0,
        Billsec: (callDuration != 0)? callDuration.asSeconds() : 0,
        TotalDuration: (totalDuration != 0)? totalDuration.asSeconds() : 0,
        ReasonCode: reasonCode,
        ReasonText: reasonText,
        WithVideo: withVideo,
        SessionId: sessionId,
        CallDirection: callDirection,
        Terminate: hanupBy,
        // CRM
        MessageData: null,
        Tags: [],
        //Reporting
        Transfers: (session.data.transfer)? session.data.transfer : [],
        Mutes: (session.data.mute)? session.data.mute : [],
        Holds: (session.data.hold)? session.data.hold : [],
        Recordings: (session.data.recordings)? session.data.recordings : [],
        ConfCalls: (session.data.confcalls)? session.data.confcalls : [],
        QOS: []
    }

    console.log("New CDR", newMessageJson);

    currentStream.DataCollection.push(newMessageJson);
    currentStream.TotalRows = currentStream.DataCollection.length;
    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));

    UpdateBuddyActivity(buddy);
}

function updateLineScroll(lineNum) {
    RefreshLineActivity(lineNum);

    var element = $("#line-"+ lineNum +"-CallDetails").get(0);
    element.scrollTop = element.scrollHeight;
}
function updateScroll(buddy) {
    var history = $("#contact-"+ buddy +"-ChatHistory");
    if(history.children().length > 0) history.children().last().get(0).scrollIntoView(false);
    history.get(0).scrollTop = history.get(0).scrollHeight;
}
function PreviewImage(obj){
    OpenWindow(obj.src, "Preview Image", 600, 800, false, true); //no close, no resize
}

// Missed Item Notification
function IncreaseMissedBadge(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    // Up the Missed Count
    buddyObj.missed += 1;

    // Take Out
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.missed = item.missed +1;
                return false;
            }
        });
        // Put Back
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    // Update Badge
    $("#contact-" + buddy + "-missed").text(buddyObj.missed);
    $("#contact-" + buddy + "-missed").show();
    console.log("Set Missed badge for "+ buddy +" to: "+ buddyObj.missed);
}
function UpdateBuddyActivity(buddy){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    // Update Last Activity Time
    var timeStamp = utcDateNow();
    buddyObj.lastActivity = timeStamp;
    console.log("Last Activity is now: "+ timeStamp);

    // Take Out
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.LastActivity = timeStamp;
                return false;
            }
        });
        // Put Back
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    // List Update
    UpdateBuddyList();
}
function ClearMissedBadge(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    buddyObj.missed = 0;

    // Take Out
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.missed = 0;
                return false;
            }
        });
        // Put Back
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }


    $("#contact-" + buddy + "-missed").text(buddyObj.missed);
    $("#contact-" + buddy + "-missed").hide(400);
}

// Outbound Calling
function VideoCall(lineObj, dialledNumber) {
    if (userAgent == null) return;
    if (!userAgent.isRegistered()) return;
    if(lineObj == null) return;

    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        return;
    }

    if(HasVideoDevice == false){
        console.warn("No video devices (webcam) found, switching to audio call.");
        AudioCall(lineObj, dialledNumber);
        return;
    }

    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: { deviceId : "default" }
            }
        }
    }

    // Configure Audio
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    // Add additional Constraints
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }

    // Configure Video
    var currentVideoDevice = getVideoSrcID();
    if(currentVideoDevice != "default"){
        var confirmedVideoDevice = false;
        for (var i = 0; i < VideoinputDevices.length; ++i) {
            if(currentVideoDevice == VideoinputDevices[i].deviceId) {
                confirmedVideoDevice = true;
                break;
            }
        }
        if(confirmedVideoDevice){
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.deviceId = { exact: currentVideoDevice }
        }
        else {
            console.warn("The video device you used before is no longer available, default settings applied.");
            localDB.setItem("VideoSrcId", "default"); // resets for later and subsequent calls
        }
    }
    // Add additional Constraints
    if(supportedConstraints.frameRate && maxFrameRate != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.frameRate = maxFrameRate;
    }
    if(supportedConstraints.height && videoHeight != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.height = videoHeight;
    }
    console.log(supportedConstraints)
    console.log(supportedConstraints.aspectRatio)
    console.log(videoAspectRatio)
    if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.aspectRatio = videoAspectRatio;
    }

    $("#line-" + lineObj.LineNumber + "-msg").html(lang.starting_video_call);
    $("#line-" + lineObj.LineNumber + "-timer").show();

    // Invite
    console.log("INVITE (video): " + dialledNumber + "@" + wssServer, spdOptions);
    lineObj.SipSession = userAgent.invite("sip:" + dialledNumber + "@" + wssServer, spdOptions);

    var startTime = moment.utc();
    lineObj.SipSession.data.line = lineObj.LineNumber;
    lineObj.SipSession.data.buddyId = lineObj.BuddyObj.identity;
    lineObj.SipSession.data.calldirection = "outbound";
    lineObj.SipSession.data.dst = dialledNumber;
    lineObj.SipSession.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    lineObj.SipSession.data.callTimer = window.setInterval(function(){
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime)); 
        $("#line-" + lineObj.LineNumber + "-timer").html(formatShortDuration(duration.asSeconds()));
    }, 1000);
    lineObj.SipSession.data.VideoSourceDevice = getVideoSrcID();
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();
    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.withvideo = true;

    updateLineScroll(lineObj.LineNumber);

    // Do Nessesary UI Wireup
    wireupVideoSession(lineObj);

    // Custom Web hook
    if(typeof web_hook_on_invite !== 'undefined') web_hook_on_invite(lineObj.SipSession);
}
function AudioCallMenu(buddy, obj){
    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    if(dhtmlxPopup != null)
    {
        dhtmlxPopup.hide();
        dhtmlxPopup.unload();
        dhtmlxPopup = null;
    }
    dhtmlxPopup = new dhtmlXPopup();

    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj.type == "extension") {
        // Extension
        var items = [
            {id: 1, name: "<i class=\"fa fa-phone-square\"></i> "+ lang.call_extension, number: buddyObj.ExtNo},
        ];
        if(buddyObj.MobileNumber != null && buddyObj.MobileNumber != "") items.push({id: 2, name: "<i class=\"fa fa-mobile\"></i> "+ lang.call_mobile, number: buddyObj.MobileNumber});
        if(buddyObj.ContactNumber1 != null && buddyObj.ContactNumber1 != "") items.push({id: 3, name: "<i class=\"fa fa-phone\"></i> "+ lang.call_number, number: buddyObj.ContactNumber1});
        if(buddyObj.ContactNumber2 != null && buddyObj.ContactNumber2 != "") items.push({id: 4, name: "<i class=\"fa fa-phone\"></i> "+ lang.call_number, number: buddyObj.ContactNumber2});
        dhtmlxPopup.attachList("name,number", items);
        dhtmlxPopup.attachEvent("onClick", function(id){
            var NumberToDial = dhtmlxPopup.getItemData(id).number;
            console.log("Menu click AudioCall("+ buddy +", "+ NumberToDial +")");
            dhtmlxPopup.hide();
            DialByLine("audio", buddy, NumberToDial);
        });
    } else if(buddyObj.type == "contact") {
        // Contact
        var items = [];
        if(buddyObj.MobileNumber != null && buddyObj.MobileNumber != "") items.push({id: 1, name: "<i class=\"fa fa-mobile\"></i> "+ lang.call_mobile, number: buddyObj.MobileNumber});
        if(buddyObj.ContactNumber1 != null && buddyObj.ContactNumber1 != "") items.push({id: 2, name: "<i class=\"fa fa-phone\"></i> "+ lang.call_number, number: buddyObj.ContactNumber1});
        if(buddyObj.ContactNumber2 != null && buddyObj.ContactNumber2 != "") items.push({id: 3, name: "<i class=\"fa fa-phone\"></i> "+ lang.call_number, number: buddyObj.ContactNumber2});
        dhtmlxPopup.attachList("name,number", items);
        dhtmlxPopup.attachEvent("onClick", function(id){
            var NumberToDial = dhtmlxPopup.getItemData(id).number;
            console.log("Menu click AudioCall("+ buddy +", "+ NumberToDial +")");
            dhtmlxPopup.hide();
            DialByLine("audio", buddy, NumberToDial);
        });
    } else if(buddyObj.type == "group") {
        dhtmlxPopup.attachList("name,number", [
            {id: 1, name: "<i class=\"fa fa-users\"></i> "+ lang.call_group, number: buddyObj.ExtNo }
        ]);
        dhtmlxPopup.attachEvent("onClick", function(id){
            console.log("Menu click AudioCallGroup("+ buddy +")");
            dhtmlxPopup.hide();
            DialByLine("audio", buddy, dhtmlxPopup.getItemData(id).number);
        });
    }
    dhtmlxPopup.show(x, y, w, h);
}
function AudioCall(lineObj, dialledNumber) {
    if(userAgent == null) return;
    if(userAgent.isRegistered() == false) return;
    if(lineObj == null) return;

    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        return;
    }

    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: false
            }
        }
    }
    // Configure Audio
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    // Add additional Constraints
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }

    $("#line-" + lineObj.LineNumber + "-msg").html(lang.starting_audio_call);
    $("#line-" + lineObj.LineNumber + "-timer").show();

    // Invite
    console.log("INVITE (audio): " + dialledNumber + "@" + wssServer);
    lineObj.SipSession = userAgent.invite("sip:" + dialledNumber + "@" + wssServer, spdOptions);

    var startTime = moment.utc();
    lineObj.SipSession.data.line = lineObj.LineNumber;
    lineObj.SipSession.data.buddyId = lineObj.BuddyObj.identity;
    lineObj.SipSession.data.calldirection = "outbound";
    lineObj.SipSession.data.dst = dialledNumber;
    lineObj.SipSession.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    lineObj.SipSession.data.callTimer = window.setInterval(function(){
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime)); 
        $("#line-" + lineObj.LineNumber + "-timer").html(formatShortDuration(duration.asSeconds()));
    }, 1000);
    lineObj.SipSession.data.VideoSourceDevice = null;
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();
    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.withvideo = false;

    updateLineScroll(lineObj.LineNumber);

    // Do Nessesary UI Wireup
    wireupAudioSession(lineObj);

    // Custom Web hook
    if(typeof web_hook_on_invite !== 'undefined') web_hook_on_invite(lineObj.SipSession);
}

// Sessions & During Call Activity
function getSession(buddy) {
    if(userAgent == null) {
        console.warn("userAgent is null");
        return;
    }
    if(userAgent.isRegistered() == false) {
        console.warn("userAgent is not registered");
        return;
    }

    var rtnSession = null;
    $.each(userAgent.sessions, function (i, session) {
        if(session.data.buddyId == buddy) {
            rtnSession = session;
            return false;
        }
    });
    return rtnSession;
}
function countSessions(id){
    var rtn = 0;
    if(userAgent == null) {
        console.warn("userAgent is null");
        return 0;
    }
    $.each(userAgent.sessions, function (i, session) {
        if(id != session.id) rtn ++;
    });
    return rtn;
}
function StartRecording(lineNum){
    if(CallRecordingPolicy == "disabled") {
        console.warn("Policy Disabled: Call Recording");
        return;
    }
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;

    $("#line-"+ lineObj.LineNumber +"-btn-start-recording").hide();
    $("#line-"+ lineObj.LineNumber +"-btn-stop-recording").show();

    var session = lineObj.SipSession;
    if(session == null){
        console.warn("Could not find session");
        return;
    }

    var id = uID();

    if(!session.data.recordings) session.data.recordings = [];
    session.data.recordings.push({
        uID: id,
        startTime: utcDateNow(),
        stopTime: utcDateNow(),
    });

    if(!session.data.mediaRecorder){
        console.log("Creating call recorder...");

        var recordStream = new MediaStream();
        var pc = session.sessionDescriptionHandler.peerConnection;
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                console.log("Adding sender audio track to record:", RTCRtpSender.track.label);
                recordStream.addTrack(RTCRtpSender.track);
            }
        });
        pc.getReceivers().forEach(function (RTCRtpReceiver) {
            if(RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "audio") {
                console.log("Adding receiver audio track to record:", RTCRtpReceiver.track.label);
                recordStream.addTrack(RTCRtpReceiver.track);
            }
            if(session.data.withvideo){
                if(RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "video") {
                    console.log("Adding receiver video track to record:", RTCRtpReceiver.track.label);
                    recordStream.addTrack(RTCRtpReceiver.track);
                }
            }
        });

        // Resample the Video Recording
        if(session.data.withvideo){
            var recordingWidth = 640;
            var recordingHeight = 360;
            var pnpVideSize = 100;
            if(RecordingVideoSize == "HD"){
                recordingWidth = 1280;
                recordingHeight = 720;
                pnpVideSize = 144;
            }
            if(RecordingVideoSize == "FHD"){
                recordingWidth = 1920;
                recordingHeight = 1080;
                pnpVideSize = 240;
            }

            // them-pnp
            var pnpVideo = $("#line-" + lineObj.LineNumber + "-localVideo").get(0);
            var mainVideo = $("#line-" + lineObj.LineNumber + "-remoteVideo").get(0);
            if(RecordingLayout == "us-pnp"){
                pnpVideo = $("#line-" + lineObj.LineNumber + "-remoteVideo").get(0);
                mainVideo = $("#line-" + lineObj.LineNumber + "-localVideo").get(0);
            }
            var recordingCanvas = $('<canvas/>').get(0);
            recordingCanvas.width = (RecordingLayout == "side-by-side")? (recordingWidth * 2) + 5: recordingWidth;
            recordingCanvas.height = recordingHeight;
            var recordingContext = recordingCanvas.getContext("2d");

            window.clearInterval(session.data.recordingRedrawInterval);
            session.data.recordingRedrawInterval = window.setInterval(function(){

                // Main Video
                var videoWidth = (mainVideo.videoWidth > 0)? mainVideo.videoWidth : recordingWidth ;
                var videoHeight = (mainVideo.videoHeight > 0)? mainVideo.videoHeight : recordingHeight ;

                if(videoWidth >= videoHeight){
                    // Landscape / Square
                    var scale = recordingWidth / videoWidth;
                    videoWidth = recordingWidth;
                    videoHeight = videoHeight * scale;
                    if(videoHeight > recordingHeight){
                        var scale = recordingHeight / videoHeight;
                        videoHeight = recordingHeight;
                        videoWidth = videoWidth * scale;
                    }
                } 
                else {
                    // Portrait
                    var scale = recordingHeight / videoHeight;
                    videoHeight = recordingHeight;
                    videoWidth = videoWidth * scale;
                }
                var offsetX = (videoWidth < recordingWidth)? (recordingWidth - videoWidth) / 2 : 0;
                var offsetY = (videoHeight < recordingHeight)? (recordingHeight - videoHeight) / 2 : 0;
                if(RecordingLayout == "side-by-side") offsetX = recordingWidth + 5 + offsetX;

                // Picture-in-Picture Video
                var pnpVideoHeight = pnpVideo.videoHeight;
                var pnpVideoWidth = pnpVideo.videoWidth;
                if(pnpVideoHeight > 0){
                    if(pnpVideoWidth >= pnpVideoHeight){
                        var scale = pnpVideSize / pnpVideoHeight;
                        pnpVideoHeight = pnpVideSize;
                        pnpVideoWidth = pnpVideoWidth * scale;
                    } 
                    else{
                        var scale = pnpVideSize / pnpVideoWidth;
                        pnpVideoWidth = pnpVideSize;
                        pnpVideoHeight = pnpVideoHeight * scale;
                    }
                }
                var pnpOffsetX = 10;
                var pnpOffsetY = 10;
                if(RecordingLayout == "side-by-side"){
                    pnpVideoWidth = pnpVideo.videoWidth;
                    pnpVideoHeight = pnpVideo.videoHeight;
                    if(pnpVideoWidth >= pnpVideoHeight){
                        // Landscape / Square
                        var scale = recordingWidth / pnpVideoWidth;
                        pnpVideoWidth = recordingWidth;
                        pnpVideoHeight = pnpVideoHeight * scale;
                        if(pnpVideoHeight > recordingHeight){
                            var scale = recordingHeight / pnpVideoHeight;
                            pnpVideoHeight = recordingHeight;
                            pnpVideoWidth = pnpVideoWidth * scale;
                        }
                    } 
                    else {
                        // Portrait
                        var scale = recordingHeight / pnpVideoHeight;
                        pnpVideoHeight = recordingHeight;
                        pnpVideoWidth = pnpVideoWidth * scale;
                    }
                    pnpOffsetX = (pnpVideoWidth < recordingWidth)? (recordingWidth - pnpVideoWidth) / 2 : 0;
                    pnpOffsetY = (pnpVideoHeight < recordingHeight)? (recordingHeight - pnpVideoHeight) / 2 : 0;
                }

                // Draw Elements
                recordingContext.fillRect(0, 0, recordingCanvas.width, recordingCanvas.height);
                if(mainVideo.videoHeight > 0){
                    recordingContext.drawImage(mainVideo, offsetX, offsetY, videoWidth, videoHeight);
                }
                if(pnpVideo.videoHeight > 0 && (RecordingLayout == "side-by-side" || RecordingLayout == "us-pnp" || RecordingLayout == "them-pnp")){
                    // Only Draw the Pnp Video when needed
                    recordingContext.drawImage(pnpVideo, pnpOffsetX, pnpOffsetY, pnpVideoWidth, pnpVideoHeight);
                }
            }, Math.floor(1000/RecordingVideoFps));
            var recordingVideoMediaStream = recordingCanvas.captureStream(RecordingVideoFps);
        }

        var mixedAudioVideoRecordStream = new MediaStream();
        mixedAudioVideoRecordStream.addTrack(MixAudioStreams(recordStream).getAudioTracks()[0]);
        if(session.data.withvideo){
            // mixedAudioVideoRecordStream.addTrack(recordStream.getVideoTracks()[0]);
            mixedAudioVideoRecordStream.addTrack(recordingVideoMediaStream.getVideoTracks()[0]);
        }

        var mediaType = "audio/webm";
        if(session.data.withvideo) mediaType = "video/webm";
        var options = {
            mimeType : mediaType
        }
        var mediaRecorder = new MediaRecorder(mixedAudioVideoRecordStream, options);
        mediaRecorder.data = {}
        mediaRecorder.data.id = ""+ id;
        mediaRecorder.data.sessionId = ""+ session.id;
        mediaRecorder.data.buddyId = ""+ lineObj.BuddyObj.identity;
        mediaRecorder.ondataavailable = function(event) {
            console.log("Got Call Recording Data: ", event.data.size +"Bytes", this.data.id, this.data.buddyId, this.data.sessionId);
            // Save the Audio/Video file
            SaveCallRecording(event.data, this.data.id, this.data.buddyId, this.data.sessionId);
        }

        console.log("Starting Call Recording", id);
        session.data.mediaRecorder = mediaRecorder;
        session.data.mediaRecorder.start(); // Safari does not support timeslice
        session.data.recordings[session.data.recordings.length-1].startTime = utcDateNow();

        $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_recording_started);

        updateLineScroll(lineNum);
    }
    else if(session.data.mediaRecorder.state == "inactive") {
        session.data.mediaRecorder.data = {}
        session.data.mediaRecorder.data.id = ""+ id;
        session.data.mediaRecorder.data.sessionId = ""+ session.id;
        session.data.mediaRecorder.data.buddyId = ""+ lineObj.BuddyObj.identity;

        console.log("Starting Call Recording", id);
        session.data.mediaRecorder.start();
        session.data.recordings[session.data.recordings.length-1].startTime = utcDateNow();

        $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_recording_started);

        updateLineScroll(lineNum);
    } 
    else {
        console.warn("Recorder is in an unknow state");
    }
}
function SaveCallRecording(blob, id, buddy, sessionid){
    var indexedDB = window.indexedDB;
    var request = indexedDB.open("CallRecordings");
    request.onerror = function(event) {
        console.error("IndexDB Request Error:", event);
    }
    request.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
        var IDB = event.target.result;

        // Create Object Store
        if(IDB.objectStoreNames.contains("Recordings") == false){
            var objectStore = IDB.createObjectStore("Recordings", { keyPath: "uID" });
            objectStore.createIndex("sessionid", "sessionid", { unique: false });
            objectStore.createIndex("bytes", "bytes", { unique: false });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("mediaBlob", "mediaBlob", { unique: false });
        }
        else {
            console.warn("IndexDB requested upgrade, but object store was in place");
        }
    }
    request.onsuccess = function(event) {
        console.log("IndexDB connected to CallRecordings");

        var IDB = event.target.result;
        if(IDB.objectStoreNames.contains("Recordings") == false){
            console.warn("IndexDB CallRecordings.Recordings does not exists");
            return;
        }
        IDB.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }
    
        // Prepare data to write
        var data = {
            uID: id,
            sessionid: sessionid,
            bytes: blob.size,
            type: blob.type,
            mediaBlob: blob
        }
        // Commit Transaction
        var transaction = IDB.transaction(["Recordings"], "readwrite");
        var objectStoreAdd = transaction.objectStore("Recordings").add(data);
        objectStoreAdd.onsuccess = function(event) {
            console.log("Call Recording Sucess: ", id, blob.size, blob.type, buddy, sessionid);
        }
    }
}
function StopRecording(lineNum, noConfirm){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    var session = lineObj.SipSession;
    if(noConfirm == true){
        // Called at the end of a caill
        $("#line-"+ lineObj.LineNumber +"-btn-start-recording").show();
        $("#line-"+ lineObj.LineNumber +"-btn-stop-recording").hide();

        if(session.data.mediaRecorder){
            if(session.data.mediaRecorder.state == "recording"){
                console.log("Stopping Call Recording");
                session.data.mediaRecorder.stop();
                session.data.recordings[session.data.recordings.length-1].stopTime = utcDateNow();
                window.clearInterval(session.data.recordingRedrawInterval);

                $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_recording_stopped);

                updateLineScroll(lineNum);
            } 
            else{
                console.warn("Recorder is in an unknow state");
            }
        }
        return;
    } 
    else {
        // User attempts to end call recording
        if(CallRecordingPolicy == "enabled"){
            console.log("Policy Enabled: Call Recording");
        }

        Confirm(lang.confirm_stop_recording, lang.stop_recording, function(){
            $("#line-"+ lineObj.LineNumber +"-btn-start-recording").show();
            $("#line-"+ lineObj.LineNumber +"-btn-stop-recording").hide();
    
            if(session.data.mediaRecorder){
                if(session.data.mediaRecorder.state == "recording"){
                    console.log("Stopping Call Recording");
                    session.data.mediaRecorder.stop();
                    session.data.recordings[session.data.recordings.length-1].stopTime = utcDateNow();
                    window.clearInterval(session.data.recordingRedrawInterval);

                    $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_recording_stopped);

                    updateLineScroll(lineNum);
                }
                else{
                    console.warn("Recorder is in an unknow state");
                }
            }
        });
    }
}
function PlayAudioCallRecording(obj, cdrId, uID){
    var container = $(obj).parent();
    container.empty();

    var audioObj = new Audio();
    audioObj.autoplay = false;
    audioObj.controls = true;

    // Make sure you are playing out via the correct device
    var sinkId = getAudioOutputID();
    if (typeof audioObj.sinkId !== 'undefined') {
        audioObj.setSinkId(sinkId).then(function(){
            console.log("sinkId applied: "+ sinkId);
        }).catch(function(e){
            console.warn("Error using setSinkId: ", e);
        });
    } else {
        console.warn("setSinkId() is not possible using this browser.")
    }

    container.append(audioObj);

    // Get Call Recording
    var indexedDB = window.indexedDB;
    var request = indexedDB.open("CallRecordings");
    request.onerror = function(event) {
        console.error("IndexDB Request Error:", event);
    }
    request.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
    }
    request.onsuccess = function(event) {
        console.log("IndexDB connected to CallRecordings");

        var IDB = event.target.result;
        if(IDB.objectStoreNames.contains("Recordings") == false){
            console.warn("IndexDB CallRecordings.Recordings does not exists");
            return;
        } 

        var transaction = IDB.transaction(["Recordings"]);
        var objectStoreGet = transaction.objectStore("Recordings").get(uID);
        objectStoreGet.onerror = function(event) {
            console.error("IndexDB Get Error:", event);
        }
        objectStoreGet.onsuccess = function(event) {
            $("#cdr-media-meta-size-"+ cdrId +"-"+ uID).html(" Size: "+ formatBytes(event.target.result.bytes));
            $("#cdr-media-meta-codec-"+ cdrId +"-"+ uID).html(" Codec: "+ event.target.result.type);

            // Play
            audioObj.src = window.URL.createObjectURL(event.target.result.mediaBlob);
            audioObj.oncanplaythrough = function(){
                audioObj.play().then(function(){
                    console.log("Playback started");
                }).catch(function(e){
                    console.error("Error playing back file: ", e);
                });
            }
        }
    }
}
function PlayVideoCallRecording(obj, cdrId, uID, buddy){
    var container = $(obj).parent();
    container.empty();

    var videoObj = $("<video>").get(0);
    videoObj.id = "callrecording-video-"+ cdrId;
    videoObj.autoplay = false;
    videoObj.controls = true;
    videoObj.ontimeupdate = function(event){
        $("#cdr-video-meta-width-"+ cdrId +"-"+ uID).html(lang.width + " : "+ event.target.videoWidth +"px");
        $("#cdr-video-meta-height-"+ cdrId +"-"+ uID).html(lang.height +" : "+ event.target.videoHeight +"px");
    }

    var sinkId = getAudioOutputID();
    if (typeof videoObj.sinkId !== 'undefined') {
        videoObj.setSinkId(sinkId).then(function(){
            console.log("sinkId applied: "+ sinkId);
        }).catch(function(e){
            console.warn("Error using setSinkId: ", e);
        });
    } else {
        console.warn("setSinkId() is not possible using this browser.")
    }

    container.append(videoObj);

    // Get Call Recording
    var indexedDB = window.indexedDB;
    var request = indexedDB.open("CallRecordings");
    request.onerror = function(event) {
        console.error("IndexDB Request Error:", event);
    }
    request.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
    }
    request.onsuccess = function(event) {
        console.log("IndexDB connected to CallRecordings");

        var IDB = event.target.result;
        if(IDB.objectStoreNames.contains("Recordings") == false){
            console.warn("IndexDB CallRecordings.Recordings does not exists");
            return;
        } 

        var transaction = IDB.transaction(["Recordings"]);
        var objectStoreGet = transaction.objectStore("Recordings").get(uID);
        objectStoreGet.onerror = function(event) {
            console.error("IndexDB Get Error:", event);
        }
        objectStoreGet.onsuccess = function(event) {
            $("#cdr-media-meta-size-"+ cdrId +"-"+ uID).html(" Size: "+ formatBytes(event.target.result.bytes));
            $("#cdr-media-meta-codec-"+ cdrId +"-"+ uID).html(" Codec: "+ event.target.result.type);

            // Play
            videoObj.src = window.URL.createObjectURL(event.target.result.mediaBlob);
            videoObj.oncanplaythrough = function(){
                try{
                    videoObj.scrollIntoViewIfNeeded(false);
                } catch(e){}
                videoObj.play().then(function(){
                    console.log("Playback started");
                }).catch(function(e){
                    console.error("Error playing back file: ", e);
                });

                // Create a Post Image after a second
                if(buddy){
                    window.setTimeout(function(){
                        var canvas = $("<canvas>").get(0);
                        var videoWidth = videoObj.videoWidth;
                        var videoHeight = videoObj.videoHeight;
                        if(videoWidth > videoHeight){
                            // Landscape
                            if(videoHeight > 225){
                                var p = 225 / videoHeight;
                                videoHeight = 225;
                                videoWidth = videoWidth * p;
                            }
                        }
                        else {
                            // Portrait
                            if(videoHeight > 225){
                                var p = 225 / videoWidth;
                                videoWidth = 225;
                                videoHeight = videoHeight * p;
                            }
                        }
                        canvas.width = videoWidth;
                        canvas.height = videoHeight;
                        canvas.getContext('2d').drawImage(videoObj, 0, 0, videoWidth, videoHeight);  
                        canvas.toBlob(function(blob) {
                            var reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = function() {
                                var Poster = { width: videoWidth, height: videoHeight, posterBase64: reader.result }
                                console.log("Capturing Video Poster...");
    
                                // Update DB
                                var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
                                if(currentStream != null || currentStream.DataCollection != null){
                                    $.each(currentStream.DataCollection, function(i, item) {
                                        if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                                            // Found
                                            if(item.Recordings && item.Recordings.length >= 1){
                                                $.each(item.Recordings, function(r, recording) {
                                                    if(recording.uID == uID) recording.Poster = Poster;
                                                });
                                            }
                                            return false;
                                        }
                                    });
                                    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));
                                    console.log("Capturing Video Poster, Done");
                                }
                            }
                        }, 'image/jpeg', PosterJpegQuality);
                    }, 1000);
                }
            }
        }
    }
}

// Stream Manipulations
function MixAudioStreams(MultiAudioTackStream){
    // Takes in a MediaStream with any mumber of audio tracks and mixes them together

    var audioContext = null;
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    catch(e){
        console.warn("AudioContext() not available, cannot record");
        return MultiAudioTackStream;
    }
    var mixedAudioStream = audioContext.createMediaStreamDestination();
    MultiAudioTackStream.getAudioTracks().forEach(function(audioTrack){
        var srcStream = new MediaStream();
        srcStream.addTrack(audioTrack);
        var streamSourceNode = audioContext.createMediaStreamSource(srcStream);
        streamSourceNode.connect(mixedAudioStream);
    });

    return mixedAudioStream.stream;
}
function cancelSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    lineObj.SipSession.data.terminateby = "us";

    console.log("Cancelling session : "+ lineNum);
    lineObj.SipSession.cancel();

    $("#line-" + lineNum + "-msg").html(lang.call_cancelled);
}
function holdSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    console.log("Putting Call on hold: "+ lineNum);
    if(lineObj.SipSession.local_hold == false){
        lineObj.SipSession.hold();
    }
    // Log Hold
    if(!lineObj.SipSession.data.hold) lineObj.SipSession.data.hold = [];
    lineObj.SipSession.data.hold.push({ event: "hold", eventTime: utcDateNow() });

    $("#line-" + lineNum + "-btn-Hold").hide();
    $("#line-" + lineNum + "-btn-Unhold").show();
    $("#line-" + lineNum + "-msg").html(lang.call_on_hold);

    updateLineScroll(lineNum);
}
function unholdSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    console.log("Taking call off hold: "+ lineNum);
    if(lineObj.SipSession.local_hold == true){
        lineObj.SipSession.unhold();
    }
    // Log Hold
    if(!lineObj.SipSession.data.hold) lineObj.SipSession.data.hold = [];
    lineObj.SipSession.data.hold.push({ event: "unhold", eventTime: utcDateNow() });

    $("#line-" + lineNum + "-msg").html(lang.call_in_progress);
    $("#line-" + lineNum + "-btn-Hold").show();
    $("#line-" + lineNum + "-btn-Unhold").hide();

    updateLineScroll(lineNum);
}
function endSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    console.log("Ending call with: "+ lineNum);
    lineObj.SipSession.data.terminateby = "us";
    lineObj.SipSession.bye();

    $("#line-" + lineNum + "-msg").html(lang.call_ended);
    $("#line-" + lineNum + "-ActiveCall").hide();

    updateLineScroll(lineNum);
}
function sendDTMF(lineNum, itemStr) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    console.log("Sending DTMF ("+ itemStr +"): "+ lineNum);
    lineObj.SipSession.dtmf(itemStr);

    $("#line-" + lineNum + "-msg").html(lang.send_dtmf + ": "+ itemStr);

    updateLineScroll(lineNum);

    // Custom Web hook
    if(typeof web_hook_on_dtmf !== 'undefined') web_hook_on_dtmf(itemStr, lineObj.SipSession);
}
function switchVideoSource(lineNum, srcId){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-" + lineNum + "-msg").html(lang.switching_video_source);

    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var constraints = { 
        audio: false, 
        video: { deviceId: "default" }
    }
    if(srcId != "default"){
        constraints.video.deviceId = { exact: srcId }
    }

    // Add additional Constraints
    if(supportedConstraints.frameRate && maxFrameRate != "") {
        constraints.video.frameRate = maxFrameRate;
    }
    if(supportedConstraints.height && videoHeight != "") {
        constraints.video.height = videoHeight;
    }
    if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
        constraints.video.aspectRatio = videoAspectRatio;
    }

    session.data.VideoSourceDevice = srcId;

    var pc = session.sessionDescriptionHandler.peerConnection;

    var localStream = new MediaStream();
    navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
        var newMediaTrack = newStream.getVideoTracks()[0];
        // var pc = session.sessionDescriptionHandler.peerConnection;
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
                console.log("Switching Video Track : "+ RTCRtpSender.track.label + " to "+ newMediaTrack.label);
                RTCRtpSender.track.stop();
                RTCRtpSender.replaceTrack(newMediaTrack);
                localStream.addTrack(newMediaTrack);
            }
        });
    }).catch(function(e){
        console.error("Error on getUserMedia", e, constraints);
    });

    // Restore Audio Stream is it was changed
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        });
    }

    // Set Preview
    console.log("Showing as preview...");
    var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
    localVideo.srcObject = localStream;
    localVideo.onloadedmetadata = function(e) {
        localVideo.play();
    }
}
function SendCanvas(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;
    
    $("#line-" + lineNum + "-msg").html(lang.switching_to_canvas);

    // Create scratch Pad
    RemoveScratchpad(lineNum);

    var newCanvas = $('<canvas/>');
    newCanvas.prop("id", "line-" + lineNum + "-scratchpad");
    $("#line-" + lineNum + "-scratchpad-container").append(newCanvas);
    $("#line-" + lineNum + "-scratchpad").css("display", "inline-block");
    $("#line-" + lineNum + "-scratchpad").css("width", "640px"); // SD
    $("#line-" + lineNum + "-scratchpad").css("height", "360px"); // SD
    $("#line-" + lineNum + "-scratchpad").prop("width", 640); // SD
    $("#line-" + lineNum + "-scratchpad").prop("height", 360); // SD
    $("#line-" + lineNum + "-scratchpad-container").show();

    console.log("Canvas for Scratchpad created...");

    scratchpad = new fabric.Canvas("line-" + lineNum + "-scratchpad");
    scratchpad.id = "line-" + lineNum + "-scratchpad";
    scratchpad.backgroundColor = "#FFFFFF";
    scratchpad.isDrawingMode = true;
    scratchpad.renderAll();
    scratchpad.redrawIntrtval = window.setInterval(function(){
        scratchpad.renderAll();
    }, 1000);

    CanvasCollection.push(scratchpad);

    // Get The Canvas Stream
    var canvasMediaStream = $("#line-"+ lineNum +"-scratchpad").get(0).captureStream(25);
    var canvasMediaTrack = canvasMediaStream.getVideoTracks()[0];

    // Switch Tracks
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
            console.log("Switching Track : "+ RTCRtpSender.track.label + " to Scratchpad Canvas");
            RTCRtpSender.track.stop();
            RTCRtpSender.replaceTrack(canvasMediaTrack);
        }
    });

    // Restore Audio Stream is it was changed
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        });
    }

    // Set Preview
    console.log("Showing as preview...");
    var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
    localVideo.srcObject = canvasMediaStream;
    localVideo.onloadedmetadata = function(e) {
        localVideo.play();
    }
}
function SendVideo(lineNum, src){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", true);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-" + lineNum + "-msg").html(lang.switching_to_shared_video);

    $("#line-" + lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();

    $("#line-"+ lineNum +"-localVideo").hide();
    $("#line-"+ lineNum +"-remoteVideo").appendTo("#line-" + lineNum + "-preview-container");

    // Create Video Object
    var newVideo = $("#line-" + lineNum + "-sharevideo");
    newVideo.prop("src", src);
    newVideo.off("loadedmetadata");
    newVideo.on("loadedmetadata", function () {
        console.log("Video can play now... ");

        // Resample Video
        var ResampleSize = 360;
        if(VideoResampleSize == "HD") ResampleSize = 720;
        if(VideoResampleSize == "FHD") ResampleSize = 1080;

        var videoObj = newVideo.get(0);
        var resampleCanvas = $('<canvas/>').get(0);

        var videoWidth = videoObj.videoWidth;
        var videoHeight = videoObj.videoHeight;
        if(videoWidth >= videoHeight){
            // Landscape / Square
            if(videoHeight > ResampleSize){
                var p = ResampleSize / videoHeight;
                videoHeight = ResampleSize;
                videoWidth = videoWidth * p;
            }
        }
        else {
            // Portrate.
            if(videoWidth > ResampleSize){
                var p = ResampleSize / videoWidth;
                videoWidth = ResampleSize;
                videoHeight = videoHeight * p;
            }
        }

        resampleCanvas.width = videoWidth;
        resampleCanvas.height = videoHeight;
        var resampleContext = resampleCanvas.getContext("2d");

        window.clearInterval(session.data.videoResampleInterval);
        session.data.videoResampleInterval = window.setInterval(function(){
            resampleContext.drawImage(videoObj, 0, 0, videoWidth, videoHeight);
        }, 40); // 25frames per second

        // Capture the streams
        var videoMediaStream = null;
        if('captureStream' in videoObj) {
            videoMediaStream = videoObj.captureStream();
        }
        else if('mozCaptureStream' in videoObj) {
            videoMediaStream = videoObj.mozCaptureStream();
        }
        else {
            console.warn("Cannot capture stream from video, this will result in no audio being transmitted.")
        }
        var resampleVideoMediaStream = resampleCanvas.captureStream(25);

        // Get the Tracks
        var videoMediaTrack = resampleVideoMediaStream.getVideoTracks()[0];
        var audioTrackFromVideo = (videoMediaStream != null )? videoMediaStream.getAudioTracks()[0] : null;

        // Switch & Merge Tracks
        var pc = session.sessionDescriptionHandler.peerConnection;
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
                console.log("Switching Track : "+ RTCRtpSender.track.label);
                RTCRtpSender.track.stop();
                RTCRtpSender.replaceTrack(videoMediaTrack);
            }
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                console.log("Switching to mixed Audio track on session");
                
                session.data.AudioSourceTrack = RTCRtpSender.track;

                var mixedAudioStream = new MediaStream();
                if(audioTrackFromVideo) mixedAudioStream.addTrack(audioTrackFromVideo);
                mixedAudioStream.addTrack(RTCRtpSender.track);
                var mixedAudioTrack = MixAudioStreams(mixedAudioStream).getAudioTracks()[0];
                mixedAudioTrack.IsMixedTrack = true;

                RTCRtpSender.replaceTrack(mixedAudioTrack);
            }
        });

        // Set Preview
        console.log("Showing as preview...");
        var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
        localVideo.srcObject = videoMediaStream;
        localVideo.onloadedmetadata = function(e) {
            localVideo.play().then(function(){
                console.log("Playing Preview Video File");
            }).catch(function(e){
                console.error("Cannot play back video", e);
            });
        }
        // Play the video
        console.log("Starting Video...");
        $("#line-"+ lineNum +"-sharevideo").get(0).play();
    });

    $("#line-"+ lineNum +"-sharevideo").show();
    console.log("Video for Sharing created...");
}
function ShareScreen(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-" + lineNum + "-msg").html(lang.switching_to_shared_screeen);

    var localStream = new MediaStream();
    var pc = session.sessionDescriptionHandler.peerConnection;


    // Restore Audio Stream is it was changed
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        });
    }

}
function DisableVideoStream(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
            console.log("Disable Video Track : "+ RTCRtpSender.track.label + "");
            RTCRtpSender.track.enabled = false; 
        }
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
            if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        }
    });

    // Set Preview
    console.log("Showing as preview...");
    var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
    localVideo.pause();
    localVideo.removeAttribute('src');
    localVideo.load();

    $("#line-" + lineNum + "-msg").html(lang.video_disabled);
}

// Phone Lines
var Line = function(lineNumber, displayName, displayNumber, buddyObj){
    this.LineNumber = lineNumber;
    this.DisplayName = displayName;
    this.DisplayNumber = displayNumber;
    this.IsSelected = false;
    this.BuddyObj = buddyObj;
    this.SipSession = null;
    this.LocalSoundMeter = null;
    this.RemoteSoundMeter = null;
}
function ShowDial(obj){
    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    HidePopup();
    dhtmlxPopup = new dhtmlXPopup();
    var html = "<div><input id=dialText class=dialTextInput oninput=\"handleDialInput(this, event)\" style=\"width:160px; margin-top:15px\"></div>";
    html += "<table cellspacing=10 cellpadding=0 style=\"margin-left:auto; margin-right: auto\">";
    html += "<tr><td><button class=dtmfButtons onclick=\"KeyPress('1')\"><div>1</div><span>&nbsp;</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('2')\"><div>2</div><span>ABC</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('3')\"><div>3</div><span>DEF</span></button></td></tr>";
    html += "<tr><td><button class=dtmfButtons onclick=\"KeyPress('4')\"><div>4</div><span>GHI</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('5')\"><div>5</div><span>JKL</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('6')\"><div>6</div><span>MNO</span></button></td></tr>";
    html += "<tr><td><button class=dtmfButtons onclick=\"KeyPress('7')\"><div>7</div><span>PQRS</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('8')\"><div>8</div><span>TUV</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('9')\"><div>9</div><span>WXYZ</span></button></td></tr>";
    html += "<tr><td><button class=dtmfButtons onclick=\"KeyPress('*')\">*</button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('0')\">0</button></td>"
    html += "<td><button class=dtmfButtons onclick=\"KeyPress('#')\">#</button></td></tr>";
    html += "</table>";
    html += "<div style=\"text-align: center; margin-bottom:15px\">";
    html += "<button class=\"roundButtons dialButtons\" id=dialAudio style=\"width:48px; height:48px;\" title=\""+ lang.audio_call  +"\" onclick=\"DialByLine('audio')\"><i class=\"fa fa-phone\"></i></button>";
    if(EnableVideoCalling){
        html += "<button class=\"roundButtons dialButtons\" id=dialVideo style=\"width:48px; height:48px; margin-left:20px\" title=\""+ lang.video_call +"\" onclick=\"DialByLine('video')\"><i class=\"fa fa-video-camera\"></i></button>";
    }
    html += "</div>";

    dhtmlxPopup.attachHTML(html);
    dhtmlxPopup.show(x, y, w, h);
}
function handleDialInput(obj, event){
    if(EnableAlphanumericDial){
        $("#dialText").val($("#dialText").val().replace(/[^\da-zA-Z\*\#\+]/g, "").substring(0,MaxDidLength));
    }
    else {
        $("#dialText").val($("#dialText").val().replace(/[^\d\*\#\+]/g, "").substring(0,MaxDidLength));
    }
    $("#dialVideo").prop('disabled', ($("#dialText").val().length >= DidLength));
}
function KeyPress(num){
    $("#dialText").val(($("#dialText").val()+num).substring(0,MaxDidLength));
    $("#dialVideo").prop('disabled', ($("#dialText").val().length >= DidLength));
}
function DialByLine(type, buddy, numToDial, CallerID){
    if(userAgent == null || userAgent.isRegistered()==false){
        ConfigureExtensionWindow();
        return;
    }

    var numDial = (numToDial)? numToDial : $("#dialText").val();
    if(EnableAlphanumericDial){
        numDial = numDial.replace(/[^\da-zA-Z\*\#\+]/g, "").substring(0,MaxDidLength);
    } 
    else {
        numDial = numDial.replace(/[^\d\*\#\+]/g, "").substring(0,MaxDidLength);
    }
    if(numDial.length == 0) {
        console.warn("Enter number to dial");
        return;
    }

    var buddyObj = (buddy)? FindBuddyByIdentity(buddy) : FindBuddyByDid(numDial);
    if(buddyObj == null) {
        var buddyType = (numDial.length > DidLength)? "contact" : "extension";
        if(buddyType.substring(0,1) == "*" || buddyType.substring(0,1) == "#") buddyType = "contact";
        buddyObj = MakeBuddy(buddyType, true, false, true, (CallerID)? CallerID : numDial, numDial);
    }

    // Create a Line
    var newLineNumber = Lines.length + 1;
    lineObj = new Line(newLineNumber, buddyObj.CallerIDName, numDial, buddyObj);
    Lines.push(lineObj);
    AddLineHtml(lineObj);
    SelectLine(newLineNumber);
    UpdateBuddyList();

    // Start Call Invite
    if(type == "audio"){
        AudioCall(lineObj, numDial);
    } 
    else {
        VideoCall(lineObj, numDial);
    }

    try{
        $("#line-" + newLineNumber).get(0).scrollIntoViewIfNeeded();
    } catch(e){}
}
function SelectLine(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;
    
    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].IsSelected == true && Lines[l].LineNumber == lineObj.LineNumber){
            // Nothing to do, you re-selected the same buddy;
            return;
        }
    }

    console.log("Selecting Line : "+ lineObj.LineNumber);

    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });
    $("#line-ui-" + lineObj.LineNumber).prop('class', 'streamSelected');
    SwitchLines(lineObj.LineNumber);

    // Update Lines List
    for(var l = 0; l < Lines.length; l++) {
        var classStr = (Lines[l].LineNumber == lineObj.LineNumber)? "buddySelected" : "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.local_hold)? "buddyActiveCallHollding" : "buddyActiveCall";

        $("#line-" + Lines[l].LineNumber).prop('class', classStr);
        Lines[l].IsSelected = (Lines[l].LineNumber == lineObj.LineNumber);
    }
    // Update Buddy List
    for(var b = 0; b < Buddies.length; b++) {
        $("#contact-" + Buddies[b].identity).prop("class", "buddy");
        Buddies[b].IsSelected = false;
    }

    // Change to Stream if in Narrow view
    UpdateUI();
}
function FindLineByNumber(lineNum) {
    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].LineNumber == lineNum) return Lines[l];
    }
    return null;
}
function AddLineHtml(lineObj){
    var html = "<table id=\"line-ui-"+ lineObj.LineNumber +"\" class=stream cellspacing=5 cellpadding=0>";
    html += "<tr><td class=streamSection style=\"height: 48px;\">";

    // Close|Return|Back Button
    html += "<div style=\"float:left; margin:0px; padding:5px; height:38px; line-height:38px\">"
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-back\" onclick=\"CloseLine('"+ lineObj.LineNumber +"')\" class=roundButtons title=\""+ lang.back +"\"><i class=\"fa fa-chevron-left\"></i></button> ";
    html += "</div>"

    // Profile UI
    html += "<div class=contact style=\"float: left;\">";
    html += "<div class=lineIcon>"+ lineObj.LineNumber +"</div>";
    html += "<div class=contactNameText><i class=\"fa fa-phone\"></i> "+ lang.line +" "+ lineObj.LineNumber +"</div>";
    html += "<div class=presenceText>"+ lineObj.DisplayName +" <"+ lineObj.DisplayNumber +"></div>";
    html += "</div>";

    // Action Buttons
    html += "<div style=\"float:right; line-height: 46px;\">";
    // html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-videoCall\" onclick=\"VideoCall('"+ lineObj.LineNumber+"')\" class=roundButtons title=\""+ lang.video_call +"\"><i class=\"fa fa-video-camera\"></i></button> ";
    html += "</div>";

    // Separator --------------------------------------------------------------------------
    html += "<div style=\"clear:both; height:0px\"></div>"

    // Calling UI --------------------------------------------------------------------------
    html += "<div id=\"line-"+ lineObj.LineNumber +"-calling\">";

    // Gneral Messages
    html += "<div id=\"line-"+ lineObj.LineNumber +"-timer\" style=\"float: right; margin-top: 5px; margin-right: 10px; display:none;\"></div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-msg\" class=callStatus style=\"display:none\">...</div>";

    // Dialing Out Progress
    html += "<div id=\"line-"+ lineObj.LineNumber +"-progress\" style=\"display:none; margin-top: 10px\">";
    html += "<div class=progressCall>";
    html += "<button onclick=\"cancelSession('"+ lineObj.LineNumber +"')\" class=hangupButton><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i> "+ lang.cancel +"</button>";
    html += "</div>";
    html += "</div>";

    // Active Call UI
    html += "<div id=\"line-"+ lineObj.LineNumber +"-ActiveCall\" style=\"display:none; margin-top: 10px;\">";

    // Video UI
    if(lineObj.BuddyObj.type == "extension") {
        html += "<div id=\"line-"+ lineObj.LineNumber +"-VideoCall\" class=videoCall style=\"display:none\">";

        // Presentation
        html += "<div style=\"height:35px; line-height:35px; text-align: right\">"+ lang.present +": ";
        html += "<div class=pill-nav style=\"border-color:#333333\">";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-src-camera\" onclick=\"PresentCamera('"+ lineObj.LineNumber +"')\" title=\""+ lang.camera +"\" disabled><i class=\"fa fa-video-camera\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-src-canvas\" onclick=\"PresentScratchpad('"+ lineObj.LineNumber +"')\" title=\""+ lang.scratchpad +"\"><i class=\"fa fa-pencil-square\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-src-desktop\" onclick=\"PresentScreen('"+ lineObj.LineNumber +"')\" title=\""+ lang.screen +"\"><i class=\"fa fa-desktop\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-src-video\" onclick=\"PresentVideo('"+ lineObj.LineNumber +"')\" title=\""+ lang.video +"\"><i class=\"fa fa-file-video-o\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-src-blank\" onclick=\"PresentBlank('"+ lineObj.LineNumber +"')\" title=\""+ lang.blank +"\"><i class=\"fa fa-ban\"></i></button>";
        html += "</div>";
        html += "&nbsp;<button id=\"line-"+ lineObj.LineNumber +"-expand\" onclick=\"ExpandVideoArea('"+ lineObj.LineNumber +"')\"><i class=\"fa fa-expand\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-restore\" onclick=\"RestoreVideoArea('"+ lineObj.LineNumber +"')\" style=\"display:none\"><i class=\"fa fa-compress\"></i></button>";
        html += "</div>";

        // Preview
        html += "<div id=\"line-"+ lineObj.LineNumber +"-preview-container\" class=PreviewContainer>";
        html += "<video id=\"line-"+ lineObj.LineNumber +"-localVideo\" muted></video>"; // Default Display
        html += "</div>";

        // Stage
        html += "<div id=\"line-"+ lineObj.LineNumber +"-stage-container\" class=StageContainer>";
        html += "<video id=\"line-"+ lineObj.LineNumber +"-remoteVideo\" muted></video>"; // Default Display
        html += "<div id=\"line-"+ lineObj.LineNumber +"-scratchpad-container\" style=\"display:none\"></div>";
        html += "<video id=\"line-"+ lineObj.LineNumber +"-sharevideo\" controls muted style=\"display:none; object-fit: contain;\"></video>";
        html += "</div>";

        html += "</div>";
    }

    // Audio Call
    html += "<div id=\"line-"+ lineObj.LineNumber +"-AudioCall\" style=\"display:none;\">";
    html += "<audio id=\"line-"+ lineObj.LineNumber+"-remoteAudio\"></audio>";
    html += "</div>";

    // In Call Buttons
    html += "<div style=\"text-align:center\">";
    html += "<div style=\"margin-top:10px\">";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-ShowDtmf\" onclick=\"ShowDtmfMenu(this, '"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.show_key_pad +"\"><i class=\"fa fa-keyboard-o\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Mute\" onclick=\"MuteSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.mute +"\"><i class=\"fa fa-microphone-slash\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Unmute\" onclick=\"UnmuteSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.unmute +"\" style=\"color: red; display:none\"><i class=\"fa fa-microphone\"></i></button>";
    if(typeof MediaRecorder != "undefined" && (CallRecordingPolicy == "allow" || CallRecordingPolicy == "enabled")){
        // Safari: must enable in Develop > Experimental Features > MediaRecorder
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-start-recording\" onclick=\"StartRecording('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.start_call_recording +"\"><i class=\"fa fa-dot-circle-o\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-stop-recording\" onclick=\"StopRecording('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.stop_call_recording +"\" style=\"color: red; display:none\"><i class=\"fa fa-circle\"></i></button>";
    }
    if(EnableTransfer){
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Transfer\" onclick=\"StartTransferSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.transfer_call +"\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber+"-btn-CancelTransfer\" onclick=\"CancelTransferSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.cancel_transfer +"\" style=\"color: red; display:none\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i></button>";
    }
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Hold\" onclick=\"holdSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\"  title=\""+ lang.hold_call +"\"><i class=\"fa fa-pause-circle\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Unhold\" onclick=\"unholdSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons\" title=\""+ lang.resume_call +"\" style=\"color: red; display:none\"><i class=\"fa fa-play-circle\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-End\" onclick=\"endSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons inCallButtons hangupButton\" title=\""+ lang.end_call +"\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i></button>";
    html += "</div>";
    
    
    // Monitoring
    html += "<div  id=\"line-"+ lineObj.LineNumber +"-monitoring\" style=\"margin-top:10px\">";
    html += "<span style=\"vertical-align: middle\"><i class=\"fa fa-microphone\"></i></span> ";
    html += "<span class=meterContainer title=\""+ lang.microphone_levels +"\">";
    html += "<span id=\"line-"+ lineObj.LineNumber +"-Mic\" class=meterLevel style=\"height:0%\"></span>";
    html += "</span> ";
    html += "<span style=\"vertical-align: middle\"><i class=\"fa fa-volume-up\"></i></span> ";
    html += "<span class=meterContainer title=\""+ lang.speaker_levels +"\">";
    html += "<span id=\"line-"+ lineObj.LineNumber +"-Speaker\" class=meterLevel style=\"height:0%\"></span>";
    html += "</span> ";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-settings\" onclick=\"ChangeSettings('"+ lineObj.LineNumber +"', this)\"><i class=\"fa fa-cogs\"></i> "+ lang.device_settings +"</button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-call-stats\" onclick=\"ShowCallStats('"+ lineObj.LineNumber +"', this)\"><i class=\"fa fa-area-chart\"></i> "+ lang.call_stats +"</button>";
    html += "</div>";

    html += "<div id=\"line-"+ lineObj.LineNumber +"-AdioStats\" class=\"audioStats cleanScroller\" style=\"display:none\">";
    html += "<div style=\"text-align:right\"><button onclick=\"HideCallStats('"+ lineObj.LineNumber +"', this)\"><i class=\"fa fa-times\"></i></button></div>";
    html += "<fieldset class=audioStatsSet>";
    html += "<legend>"+ lang.send_statistics +"</legend>";
    html += "<canvas id=\"line-"+ lineObj.LineNumber +"-AudioSendBitRate\" class=audioGraph width=600 height=160 style=\"width:600px; height:160px\"></canvas>";
    html += "<canvas id=\"line-"+ lineObj.LineNumber +"-AudioSendPacketRate\" class=audioGraph width=600 height=160 style=\"width:600px; height:160px\"></canvas>";
    html += "</fieldset>";
    html += "<fieldset class=audioStatsSet>";
    html += "<legend>"+ lang.receive_statistics +"</legend>";
    html += "<canvas id=\"line-"+ lineObj.LineNumber +"-AudioReceiveBitRate\" class=audioGraph width=600 height=160 style=\"width:600px; height:160px\"></canvas>";
    html += "<canvas id=\"line-"+ lineObj.LineNumber +"-AudioReceivePacketRate\" class=audioGraph width=600 height=160 style=\"width:600px; height:160px\"></canvas>";
    html += "<canvas id=\"line-"+ lineObj.LineNumber +"-AudioReceivePacketLoss\" class=audioGraph width=600 height=160 style=\"width:600px; height:160px\"></canvas>";
    html += "<canvas id=\"line-"+ lineObj.LineNumber +"-AudioReceiveJitter\" class=audioGraph width=600 height=160 style=\"width:600px; height:160px\"></canvas>";
    html += "<canvas id=\"line-"+ lineObj.LineNumber +"-AudioReceiveLevels\" class=audioGraph width=600 height=160 style=\"width:600px; height:160px\"></canvas>";
    html += "</fieldset>";
    html += "</div>";

    html += "</div>";
    html += "</div>";
    html += "</div>";

    html += "</td></tr>";
    html += "<tr><td class=\"streamSection streamSectionBackground\" style=\"background-image:url('"+ hostingPrefex +"images.jpg')\">";
    
    html += "<div id=\"line-"+ lineObj.LineNumber +"-CallDetails\" class=\"chatHistory cleanScroller\">";
    // In Call Activity
    html += "</div>";

    html += "</td></tr>";
    html += "</table>";

    $("#rightContent").append(html);
}
function RemoveLine(lineObj){
    if(lineObj == null) return;

    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].LineNumber == lineObj.LineNumber) {
            Lines.splice(l,1);
            break;
        }
    }

    CloseLine(lineObj.LineNumber);
    $("#line-ui-"+ lineObj.LineNumber).remove();

    UpdateBuddyList();

    if(localDB.getItem("SelectedBuddy") != null){
        console.log("Selecting previously selected buddy...", localDB.getItem("SelectedBuddy"));
        SelectBuddy(localDB.getItem("SelectedBuddy"));
        UpdateUI();
    }
}
function CloseLine(lineNum){
    // Lines and Buddies (Left)
    $(".buddySelected").each(function () {
        $(this).prop('class', 'buddy');
    });
    // Streams (Right)
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });

    SwitchLines(0);

    console.log("Closing Line: "+ lineNum);
    for(var l = 0; l < Lines.length; l++){
        Lines[l].IsSelected = false;
    }
    selectedLine = null;
    for(var b = 0; b < Buddies.length; b++){
        Buddies[b].IsSelected = false;
    }
    selectedBuddy = null;
    UpdateUI();
}
function SwitchLines(lineNum){
    $.each(userAgent.sessions, function (i, session) {
        // All the other calls, not on hold
        if(session.local_hold == false && session.data.line != lineNum) {
            console.log("Putting an active call on hold: Line: "+ session.data.line +" buddy: "+ session.data.buddyId);
            session.hold(); // Check state

            // Log Hold
            if(!session.data.hold) session.data.hold = [];
            session.data.hold.push({ event: "hold", eventTime: utcDateNow() });
        }
        $("#line-" + session.data.line + "-btn-Hold").hide();
        $("#line-" + session.data.line + "-btn-Unhold").show();
        session.data.IsCurrentCall = false;
    });

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj != null && lineObj.SipSession != null) {
        var session = lineObj.SipSession;
        if(session.local_hold == true) {
            console.log("Taking call off hold:  Line: "+ lineNum +" buddy: "+ session.data.buddyId);
            session.unhold();

            // Log Hold
            if(!session.data.hold) session.data.hold = [];
            session.data.hold.push({ event: "unhold", eventTime: utcDateNow() });
        }
        $("#line-" + lineNum + "-btn-Hold").show();
        $("#line-" + lineNum + "-btn-Unhold").hide();
        session.data.IsCurrentCall = true;
    }
    selectedLine = lineNum;

    RefreshLineActivity(lineNum);
}
function RefreshLineActivity(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) {
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-CallDetails").empty();

    var callDetails = [];

    var ringTime = 0;
    var CallStart = moment.utc(session.data.callstart.replace(" UTC", ""));
    var CallAnswer = null;
    if(session.startTime){
        CallAnswer = moment.utc(session.startTime);
        ringTime = moment.duration(CallAnswer.diff(CallStart));
    }
    CallStart = CallStart.format("YYYY-MM-DD HH:mm:ss UTC")
    CallAnswer = (CallAnswer)? CallAnswer.format("YYYY-MM-DD HH:mm:ss UTC") : null,
    ringTime = (ringTime != 0)? ringTime.asSeconds() : 0

    var srcCallerID = "";
    var dstCallerID = "";
    if(session.data.calldirection == "inbound") {
        srcCallerID = "<"+ session.remoteIdentity.uri.user +"> "+ session.remoteIdentity.displayName;
    } 
    else if(session.data.calldirection == "outbound") {
        dstCallerID = session.remoteIdentity.uri.user;
    }

    var withVideo = (session.data.withvideo)? "("+ lang.with_video +")" : "";
    var startCallMessage = (session.data.calldirection == "inbound")? lang.you_received_a_call_from + " " + srcCallerID  +" "+ withVideo : lang.you_made_a_call_to + " " + dstCallerID +" "+ withVideo;
    callDetails.push({ 
        Message: startCallMessage,
        TimeStr : CallStart
    });
    if(CallAnswer){
        var answerCallMessage = (session.data.calldirection == "inbound")? lang.you_answered_after + " " + ringTime + " " + lang.seconds_plural : lang.they_answered_after + " " + ringTime + " " + lang.seconds_plural;
        callDetails.push({ 
            Message: answerCallMessage,
            TimeStr : CallAnswer
        });
    }

    var Transfers = (session.data.transfer)? session.data.transfer : [];
    $.each(Transfers, function(item, transfer){
        var msg = (transfer.type == "Blind")? lang.you_started_a_blind_transfer_to +" "+ transfer.to +". " : lang.you_started_an_attended_transfer_to + " "+ transfer.to +". ";
        if(transfer.accept && transfer.accept.complete == true){
            msg += lang.the_call_was_completed
        }
        else if(transfer.accept.disposition != "") {
            msg += lang.the_call_was_not_completed +" ("+ transfer.accept.disposition +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : transfer.transferTime
        });
    });
    var Mutes = (session.data.mute)? session.data.mute : []
    $.each(Mutes, function(item, mute){
        callDetails.push({
            Message : (mute.event == "mute")? lang.you_put_the_call_on_mute : lang.you_took_the_call_off_mute,
            TimeStr : mute.eventTime
        });
    });
    var Holds = (session.data.hold)? session.data.hold : []
    $.each(Holds, function(item, hold){
        callDetails.push({
            Message : (hold.event == "hold")? lang.you_put_the_call_on_hold : lang.you_took_the_call_off_hold,
            TimeStr : hold.eventTime
        });
    });
    var Recordings = (session.data.recordings)? session.data.recordings : []
    $.each(Recordings, function(item, recording){
        var msg = lang.call_is_being_recorded;
        if(recording.startTime != recording.stopTime){
            msg += "("+ lang.now_stopped +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : recording.startTime
        });
    });
    var ConfCalls = (session.data.confcalls)? session.data.confcalls : []
    $.each(ConfCalls, function(item, confCall){
        var msg = lang.you_started_a_conference_call_to +" "+ confCall.to +". ";
        if(confCall.accept && confCall.accept.complete == true){
            msg += lang.the_call_was_completed
        }
        else if(confCall.accept.disposition != "") {
            msg += lang.the_call_was_not_completed +" ("+ confCall.accept.disposition +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : confCall.startTime
        });
    });

    callDetails.sort(function(a, b){
        var aMo = moment.utc(a.TimeStr.replace(" UTC", ""));
        var bMo = moment.utc(b.TimeStr.replace(" UTC", ""));
        if (aMo.isSameOrAfter(bMo, "second")) {
            return -1;
        } else return 1;
        return 0;
    });

    $.each(callDetails, function(item, detail){
        var Time = moment.utc(detail.TimeStr.replace(" UTC", "")).local().format(DisplayTimeFormat);
        var messageString = "<table class=timelineMessage cellspacing=0 cellpadding=0><tr>"
        messageString += "<td class=timelineMessageArea>"
        messageString += "<div class=timelineMessageDate><i class=\"fa fa-circle timelineMessageDot\"></i>"+ Time +"</div>"
        messageString += "<div class=timelineMessageText>"+ detail.Message +"</div>"
        messageString += "</td>"
        messageString += "</tr></table>";
        $("#line-"+ lineNum +"-CallDetails").prepend(messageString);
    });
}

// Buddy & Contacts
var Buddy = function(type, identity, CallerIDName, ExtNo, MobileNumber, ContactNumber1, ContactNumber2, lastActivity, desc, Email){
    this.type = type; // extension | contact | group
    this.identity = identity;
    this.CallerIDName = CallerIDName;
    this.Email = Email;
    this.Desc = desc;
    this.ExtNo = ExtNo;
    this.MobileNumber = MobileNumber;
    this.ContactNumber1 = ContactNumber1;
    this.ContactNumber2 = ContactNumber2;
    this.lastActivity = lastActivity; // Full Date as string eg "1208-03-21 15:34:23 UTC"
    this.devState = "dotOffline";
    this.presence = "Unknown";
    this.missed = 0;
    this.IsSelected = false;
    this.imageObjectURL = "";
}
function InitUserBuddies(){
    var template = { TotalRows:0, DataCollection:[] }
    localDB.setItem(profileUserID + "-Buddies", JSON.stringify(template));
    return JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
}
function MakeBuddy(type, update, focus, subscribe, callerID, did){
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json == null) json = InitUserBuddies();

    var buddyObj = null;
    if(type == "contact"){
        var id = uID();
        var dateNow = utcDateNow();
        json.DataCollection.push({
            Type: "contact", 
            LastActivity: dateNow,
            ExtensionNumber: "", 
            MobileNumber: "",
            ContactNumber1: did,
            ContactNumber2: "",
            uID: null,
            cID: id,
            gID: null,
            DisplayName: callerID,
            Position: "",
            Description: "",
            Email: "",
            MemberCount: 0
        });
        buddyObj = new Buddy("contact", id, callerID, "", "", did, "", dateNow, "", "");
        AddBuddy(buddyObj, update, focus);
    }
    else {
        var id = uID();
        var dateNow = utcDateNow();
        json.DataCollection.push({
            Type: "extension",
            LastActivity: dateNow,
            ExtensionNumber: did,
            MobileNumber: "",
            ContactNumber1: "",
            ContactNumber2: "",
            uID: id,
            cID: null,
            gID: null,
            DisplayName: callerID,
            Position: "",
            Description: "", 
            Email: "",
            MemberCount: 0
        });
        buddyObj = new Buddy("extension", id, callerID, did, "", "", "", dateNow, "", "");
        AddBuddy(buddyObj, update, focus, subscribe);
    }
    // Update Size: 
    json.TotalRows = json.DataCollection.length;

    // Save To DB
    localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));

    // Return new buddy
    return buddyObj;
}
function UpdateBuddyCalerID(buddyObj, callerID){
    buddyObj.CallerIDName = callerID;

    var buddy = buddyObj.identity;
    // Update DB
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null){
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.DisplayName = callerID;
                return false;
            }
        });
        // Save To DB
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    UpdateBuddyList();
}
function AddBuddy(buddyObj, update, focus, subscribe){
    Buddies.push(buddyObj);
    if(update == true) UpdateBuddyList();
    AddBuddyMessageStream(buddyObj);
    if(subscribe == true) SubscribeBuddy(buddyObj);
    if(focus == true) SelectBuddy(buddyObj.identity);
}
function PopulateBuddyList() {
    console.log("Clearing Buddies...");
    Buddies = new Array();
    console.log("Adding Buddies...");
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json == null) return;

    console.log("Total Buddies: " + json.TotalRows);
    $.each(json.DataCollection, function (i, item) {
        if(item.Type == "extension"){
            // extension
            var buddy = new Buddy("extension", item.uID, item.DisplayName, item.ExtensionNumber, item.MobileNumber, item.ContactNumber1, item.ContactNumber2, item.LastActivity, item.Position, item.Email);
            AddBuddy(buddy, false, false);
        }
        else if(item.Type == "contact"){
            // contact
            var buddy = new Buddy("contact", item.cID, item.DisplayName, "", item.MobileNumber, item.ContactNumber1, item.ContactNumber2, item.LastActivity, item.Description, item.Email);
            AddBuddy(buddy, false, false);
        }
        else if(item.Type == "group"){
            // group
            var buddy = new Buddy("group", item.gID, item.DisplayName, item.ExtensionNumber, "", "", "", item.LastActivity, item.MemberCount + " member(s)", item.Email);
            AddBuddy(buddy, false, false);
        }
    });

    // Update List (after add)
    console.log("Updating Buddy List...");
    UpdateBuddyList();
}
function UpdateBuddyList(){
    var filter = $("#txtFindBuddy").val();

    $("#myContacts").empty();

    for(var l = 0; l < Lines.length; l++) {
        var classStr = (Lines[l].IsSelected)? "buddySelected" : "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.local_hold)? "buddyActiveCallHollding" : "buddyActiveCall";

        var html = "<div id=\"line-"+ Lines[l].LineNumber +"\" class="+ classStr +" onclick=\"SelectLine('"+ Lines[l].LineNumber +"')\">";
        html += "<div class=lineIcon>"+ Lines[l].LineNumber +"</div>";
        html += "<div class=contactNameText><i class=\"fa fa-phone\"></i> "+ lang.line +" "+ Lines[l].LineNumber +"</div>";
        html += "<div id=\"Line-"+ Lines[l].ExtNo +"-datetime\" class=contactDate>&nbsp;</div>";
        html += "<div class=presenceText>"+ Lines[l].DisplayName +" <"+ Lines[l].DisplayNumber +">" +"</div>";
        html += "</div>";
        $("#myContacts").append(html);
    }

    if(Lines.length > 0 & Buddies.length > 0){
        $("#myContacts").append("<hr style=\"height:1px; background-color:#696969\">");
    }
    
    // Sort and shuffle Buddy List
    Buddies.sort(function(a, b){
        var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
        var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
        if (aMo.isSameOrAfter(bMo, "second")) {
            return -1;
        } else return 1;
        return 0;
    });


    for(var b = 0; b < Buddies.length; b++) {
        var buddyObj = Buddies[b];

        if(filter && filter.length >= 1){
            // Perform Filter Display
            var display = false;
            if(buddyObj.CallerIDName.toLowerCase().indexOf(filter.toLowerCase()) > -1 ) display = true;
            if(buddyObj.ExtNo.toLowerCase().indexOf(filter.toLowerCase()) > -1 ) display = true;
            if(buddyObj.Desc.toLowerCase().indexOf(filter.toLowerCase()) > -1 ) display = true;
            if(!display) continue;
        }

        var today = moment.utc();
        var lastActivity = moment.utc(buddyObj.lastActivity.replace(" UTC", ""));
        var displayDateTime = "";
        if(lastActivity.isSame(today, 'day'))
        {
            displayDateTime = lastActivity.local().format(DisplayTimeFormat);
        } 
        else {
            displayDateTime = lastActivity.local().format(DisplayDateFormat);
        }

        var classStr = (buddyObj.IsSelected)? "buddySelected" : "buddy";
        if(buddyObj.type == "extension") { 
            var friendlyState = buddyObj.presence;
            if (friendlyState == "Unknown") friendlyState = lang.state_unknown;
            if (friendlyState == "Not online") friendlyState = lang.state_not_online;
            if (friendlyState == "Ready") friendlyState = lang.state_ready;
            if (friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
            if (friendlyState == "Ringing") friendlyState = lang.state_ringing;
            if (friendlyState == "On hold") friendlyState = lang.state_on_hold;
            if (friendlyState == "Unavailable") friendlyState = lang.state_unavailable;

            // An extension on the same system
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onmouseenter=\"ShowBuddyDial(this, '"+ buddyObj.identity +"')\" onmouseleave=\"HideBuddyDial(this, '"+ buddyObj.identity +"')\" onclick=\"SelectBuddy('"+ buddyObj.identity +"', 'extension')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-devstate\" class=\""+ buddyObj.devState +"\"></span>";
            if(EnableVideoCalling){
                html += "<span id=\"contact-"+ buddyObj.identity +"-audio-dial\" class=quickDial style=\"right: 44px; display:none\" title="+ lang.audio_call +" onclick=\"QuickDialAudio('"+ buddyObj.identity +"', this, event)\"><i class=\"fa fa-phone\"></i></span>";
                html += "<span id=\"contact-"+ buddyObj.identity +"-video-dial\" class=quickDial style=\"right: 23px; display:none\" title="+ lang.video_call +" onclick=\"QuickDialVideo('"+ buddyObj.identity +"', '"+ buddyObj.ExtNo +"', event)\"><i class=\"fa fa-video-camera\"></i></span>";
            }
            else {
                html += "<span id=\"contact-"+ buddyObj.identity +"-audio-dial\" class=quickDial style=\"right: 23px; display:none\" title="+ lang.audio_call +" onclick=\"QuickDialAudio('"+ buddyObj.identity +"', this, event)\"><i class=\"fa fa-phone\"></i></span>";
            }
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\"display:none\">"+ buddyObj.missed +"</span>";
            html += "<div class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity) +"')\"></div>";
            html += "<div class=contactNameText><i class=\"fa fa-phone-square\"></i> "+ buddyObj.ExtNo +" - "+ buddyObj.CallerIDName +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ displayDateTime +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-presence\" class=presenceText>"+ friendlyState +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
        } else if(buddyObj.type == "contact") { 
            // An Addressbook Contact
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onmouseenter=\"ShowBuddyDial(this, '"+ buddyObj.identity +"')\" onmouseleave=\"HideBuddyDial(this, '"+ buddyObj.identity +"')\" onclick=\"SelectBuddy('"+ buddyObj.identity +"', 'contact')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-audio-dial\" class=quickDial style=\"right: 23px; display:none\" title="+ lang.audio_call +" onclick=\"QuickDialAudio('"+ buddyObj.identity +"', this, event)\"><i class=\"fa fa-phone\"></i></span>";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\"display:none\">0</span>";
            html += "<div class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"contact") +"')\"></div>";
            html += "<div class=contactNameText><i class=\"fa fa-address-card\"></i> "+ buddyObj.CallerIDName +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ displayDateTime +"</div>";
            html += "<div class=presenceText>"+ buddyObj.Desc +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
        } else if(buddyObj.type == "group"){ 
            // A collection of extensions and contacts
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onmouseenter=\"ShowBuddyDial(this, '"+ buddyObj.identity +"')\" onmouseleave=\"HideBuddyDial(this, '"+ buddyObj.identity +"')\" onclick=\"SelectBuddy('"+ buddyObj.identity +"', 'group')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-audio-dial\" class=quickDial style=\"right: 23px; display:none\" title="+ lang.audio_call +" onclick=\"QuickDialAudio('"+ buddyObj.identity +"', this, event)\"><i class=\"fa fa-phone\"></i></span>";
            // html += "<span id=\"contact-"+ buddyObj.identity +"-video-dial\" class=quickDial style=\"right: 23px; display:none\" title="+ lang.video_call +"><i class=\"fa fa-video-camera\"></i></span>";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\"display:none\">0</span>";
            html += "<div class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"group") +"')\"></div>";
            html += "<div class=contactNameText><i class=\"fa fa-users\"></i> "+ buddyObj.CallerIDName +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ displayDateTime +"</div>";
            html += "<div class=presenceText>"+ buddyObj.Desc +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
        }
    }

    // Make Select
    for(var b = 0; b < Buddies.length; b++) {
        if(Buddies[b].IsSelected) {
            SelectBuddy(Buddies[b].identity, Buddies[b].type);
            break;
        }
    }
}
function AddBuddyMessageStream(buddyObj) {
    var html = "<table id=\"stream-"+ buddyObj.identity +"\" class=stream cellspacing=5 cellpadding=0>";
    html += "<tr><td class=streamSection style=\"height: 48px;\">";

    // Close|Return|Back Button
    html += "<div style=\"float:left; margin:0px; padding:5px; height:38px; line-height:38px\">"
    html += "<button id=\"contact-"+ buddyObj.identity +"-btn-back\" onclick=\"CloseBuddy('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.back +"\"><i class=\"fa fa-chevron-left\"></i></button> ";
    html += "</div>"
    
    // Profile UI
    html += "<div class=contact style=\"float: left; position: absolute; left: 47px; right: 160px;\" onclick=\"ShowBuddyProfileMenu('"+ buddyObj.identity +"', this, '"+ buddyObj.type +"')\">";
    if(buddyObj.type == "extension") {
        html += "<span id=\"contact-"+ buddyObj.identity +"-devstate-main\" class=\""+ buddyObj.devState +"\"></span>";
    }

    if(buddyObj.type == "extension") {
        html += "<div id=\"contact-"+ buddyObj.identity +"-picture-main\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity) +"')\"></div>";
    }
    else if(buddyObj.type == "contact") {
        html += "<div class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"contact") +"')\"></div>";
    }
    else if(buddyObj.type == "group")
    {
        html += "<div class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"group") +"')\"></div>";
    }

    if(buddyObj.type == "extension") {
        html += "<div class=contactNameText style=\"margin-right: 0px;\"><i class=\"fa fa-phone-square\"></i> "+ buddyObj.ExtNo +" - "+ buddyObj.CallerIDName +"</div>";
    }
    else if(buddyObj.type == "contact") {
        html += "<div class=contactNameText style=\"margin-right: 0px;\"><i class=\"fa fa-address-card\"></i> "+ buddyObj.CallerIDName +"</div>";
    } 
    else if(buddyObj.type == "group") {
        html += "<div class=contactNameText style=\"margin-right: 0px;\"><i class=\"fa fa-users\"></i> "+ buddyObj.CallerIDName +"</div>";
    }
    if(buddyObj.type == "extension") {
        var friendlyState = buddyObj.presence;
        if (friendlyState == "Unknown") friendlyState = lang.state_unknown;
        if (friendlyState == "Not online") friendlyState = lang.state_not_online;
        if (friendlyState == "Ready") friendlyState = lang.state_ready;
        if (friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
        if (friendlyState == "Ringing") friendlyState = lang.state_ringing;
        if (friendlyState == "On hold") friendlyState = lang.state_on_hold;
        if (friendlyState == "Unavailable") friendlyState = lang.state_unavailable;

        html += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText>"+ friendlyState +"</div>";
    } else{
        html += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText>"+ buddyObj.Desc +"</div>";
    }
    html += "</div>";

    // Action Buttons
    html += "<div style=\"float:right; line-height: 46px;\">";
    html += "<button id=\"contact-"+ buddyObj.identity +"-btn-audioCall\" onclick=\"AudioCallMenu('"+ buddyObj.identity +"', this)\" class=roundButtons title=\""+ lang.audio_call +"\"><i class=\"fa fa-phone\"></i></button> ";
    if(buddyObj.type == "extension" && EnableVideoCalling) {
        html += "<button id=\"contact-"+ buddyObj.identity +"-btn-videoCall\" onclick=\"DialByLine('video', '"+ buddyObj.identity +"', '"+ buddyObj.ExtNo +"');\" class=roundButtons title=\""+ lang.video_call +"\"><i class=\"fa fa-video-camera\"></i></button> ";
    }
    html += "<button id=\"contact-"+ buddyObj.identity +"-btn-search\" onclick=\"FindSomething('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.find_something +"\"><i class=\"fa fa-search\"></i></button> ";
    html += "<button id=\"contact-"+ buddyObj.identity +"-btn-remove\" onclick=\"RemoveBuddy('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.remove +"\"><i class=\"fa fa-trash\"></i></button> ";
    html += "</div>";

    // Separator --------------------------------------------------------------------------
    html += "<div style=\"clear:both; height:0px\"></div>"

    // Calling UI --------------------------------------------------------------------------
    html += "<div id=\"contact-"+ buddyObj.identity +"-calling\">";

    // Gneral Messages
    html += "<div id=\"contact-"+ buddyObj.identity +"-timer\" style=\"float: right; margin-top: 5px; margin-right: 10px; display:none;\"></div>";
    html += "<div id=\"contact-"+ buddyObj.identity +"-msg\" class=callStatus style=\"display:none\">...</div>";

    // Call Answer UI
    html += "<div id=\"contact-"+ buddyObj.identity +"-AnswerCall\" class=answerCall style=\"display:none\">";
    html += "<div>";
    html += "<button onclick=\"AnswerAudioCall('"+ buddyObj.identity +"')\" class=answerButton><i class=\"fa fa-phone\"></i> "+ lang.answer_call +"</button> ";
    if(buddyObj.type == "extension" && EnableVideoCalling) {
        html += "<button id=\"contact-"+ buddyObj.identity +"-answer-video\" onclick=\"AnswerVideoCall('"+ buddyObj.identity +"')\" class=answerButton><i class=\"fa fa-video-camera\"></i> "+ lang.answer_call_with_video +"</button> ";
    }
    html += "<button onclick=\"RejectCall('"+ buddyObj.identity +"')\" class=hangupButton><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i> "+ lang.reject_call +"</button> ";
    html += "</div>";
    html += "</div>";

    html += "</div>";

    // Search & Related Elements
    html += "<div id=\"contact-"+ buddyObj.identity +"-search\" style=\"margin-top:6px; display:none\">";
    html += "<span class=searchClean style=\"width:100%\"><input type=text style=\"width:90%\" autocomplete=none oninput=SearchStream(this,'"+ buddyObj.identity +"') placeholder=\""+ lang.find_something_in_the_message_stream +"\"></span>";
    html += "</div>";

    html += "</td></tr>";
    html += "<tr><td class=\"streamSection streamSectionBackground\" style=\"background-image:url('"+ hostingPrefex +"images.jpg')\">";

    html += "<div id=\"contact-"+ buddyObj.identity +"-ChatHistory\" class=\"chatHistory cleanScroller\" ondragenter=\"setupDragDrop(event, '"+ buddyObj.identity +"')\" ondragover=\"setupDragDrop(event, '"+ buddyObj.identity +"')\" ondragleave=\"cancelDragDrop(event, '"+ buddyObj.identity +"')\" ondrop=\"onFileDragDrop(event, '"+ buddyObj.identity +"')\">";
    // Previous Chat messages
    html += "</div>";

    html += "</td></tr>";
    if((buddyObj.type == "extension" || buddyObj.type == "group") && EnableTextMessaging) {
        html += "<tr><td  class=streamSection style=\"height:80px\">";

        // Dictate Message
        html += "<div id=\"contact-"+ buddyObj.identity +"-dictate-message\" style=\"display:none\"></div>";

        // Emoji Menu Bar
        html += "<div id=\"contact-"+ buddyObj.identity +"-emoji-menu\" style=\"display:none\"></div>";
        // Type Area
        html += "<table class=sendMessageContainer cellpadding=0 cellspacing=0><tr>";
        html += "<td><textarea id=\"contact-"+ buddyObj.identity +"-ChatMessage\" class=\"chatMessage cleanScroller\" placeholder=\""+ lang.type_your_message_here +"\" onkeydown=\"chatOnkeydown(event, this,'"+ buddyObj.identity +"')\" onkeyup=\"chatOnkeyup(event, this,'"+ buddyObj.identity +"')\" oninput=\"chatOnkeyup(event, this,'"+ buddyObj.identity +"')\" onpaste=\"chatOnbeforepaste(event, this,'"+ buddyObj.identity +"')\"></textarea></td>";
        html += "<td style=\"width:40px\"><button onclick=\"AddMenu(this, '"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.menu +"\"><i class=\"fa fa-ellipsis-h\"></i></button></td>";
        html += "</tr></table>";
        
        html += "</td></tr>";
    }
    html += "</table>";

    $("#rightContent").append(html);
}
function RemoveBuddyMessageStream(buddyObj){
    CloseBuddy(buddyObj.identity);

    UpdateBuddyList();

    // Remove Stream
    $("#stream-"+ buddyObj.identity).remove();
    var stream = JSON.parse(localDB.getItem(buddyObj.identity + "-stream"));
    localDB.removeItem(buddyObj.identity + "-stream");

    // Remove Buddy
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    var x = 0;
    $.each(json.DataCollection, function (i, item) {
        if(item.uID == buddyObj.identity || item.cID == buddyObj.identity || item.gID == buddyObj.identity){
            x = i;
            return false;
        }
    });
    json.DataCollection.splice(x,1);
    json.TotalRows = json.DataCollection.length;
    localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));

    // Remove Images
    localDB.removeItem("img-"+ buddyObj.identity +"-extension");
    localDB.removeItem("img-"+ buddyObj.identity +"-contact");
    localDB.removeItem("img-"+ buddyObj.identity +"-group");

    // Remove Call Recordings
    if(stream && stream.DataCollection && stream.DataCollection.length >= 1){
        DeleteCallRecordings(buddyObj.identity, stream);
    }
    
    // Remove QOS Data
    DeleteQosData(buddyObj.identity);
}
function DeleteCallRecordings(buddy, stream){
    var indexedDB = window.indexedDB;
    var request = indexedDB.open("CallRecordings");
    request.onerror = function(event) {
        console.error("IndexDB Request Error:", event);
    }
    request.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
        // If this is the case, there will be no call recordings
    }
    request.onsuccess = function(event) {
        console.log("IndexDB connected to CallRecordings");

        var IDB = event.target.result;
        if(IDB.objectStoreNames.contains("Recordings") == false){
            console.warn("IndexDB CallRecordings.Recordings does not exists");
            return;
        }
        IDB.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }

        // Loop and Delete
        $.each(stream.DataCollection, function (i, item) {
            if (item.Recordings && item.Recordings.length) {
                $.each(item.Recordings, function (i, recording) {
                    console.log("Deleting Call Recording: ", recording.uID);
                    var objectStore = IDB.transaction(["Recordings"], "readwrite").objectStore("Recordings");
                    try{
                        var deleteRequest = objectStore.delete(recording.uID);
                        deleteRequest.onsuccess = function(event) {
                            console.log("Call Recording Deleted: ", recording.uID);
                        }
                    } catch(e){
                        console.log("Call Recording Delete failed: ", e);
                    }
                });
            }
        });
    }
}

function MakeUpName(){
    var shortname = 4;
    var longName = 12;
    var letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    var rtn = "";
    rtn += letters[Math.floor(Math.random() * letters.length)];
    for(var n=0; n<Math.floor(Math.random() * longName) + shortname; n++){
        rtn += letters[Math.floor(Math.random() * letters.length)].toLowerCase();
    }
    rtn += " ";
    rtn += letters[Math.floor(Math.random() * letters.length)];
    for(var n=0; n<Math.floor(Math.random() * longName) + shortname; n++){
        rtn += letters[Math.floor(Math.random() * letters.length)].toLowerCase();
    }
    return rtn;
}
function MakeUpNumber(){
    var numbers = ["0","1","2","3","4","5","6","7","8","9","0"];
    var rtn = "0";
    for(var n=0; n<9; n++){
        rtn += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return rtn;
}
function MakeUpBuddies(int){
    for(var i=0; i<int; i++){
        var buddyObj = new Buddy("contact", uID(), MakeUpName(), "", "", MakeUpNumber(), "", utcDateNow(), "Testing", "");
        AddBuddy(buddyObj, false, false);
    }
    UpdateBuddyList();
}

function SelectBuddy(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    for(var b = 0; b < Buddies.length; b++) {
        if(Buddies[b].IsSelected == true && Buddies[b].identity == buddy){
            // Nothing to do, you re-selected the same buddy;
            return;
        }
    }

    console.log("Selecting Buddy: "+ buddy);

    selectedBuddy = buddyObj;

    // Can only display one thing on the Right
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });
    $("#stream-" + buddy).prop('class', 'streamSelected');

    // Update Lines List
    for(var l = 0; l < Lines.length; l++) {
        var classStr = "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.local_hold)? "buddyActiveCallHollding" : "buddyActiveCall";
        $("#line-" + Lines[l].LineNumber).prop('class', classStr);
        Lines[l].IsSelected = false;
    }

    ClearMissedBadge(buddy);
    // Update Buddy List
    for(var b = 0; b < Buddies.length; b++) {
        var classStr = (Buddies[b].identity == buddy)? "buddySelected" : "buddy";
        $("#contact-" + Buddies[b].identity).prop('class', classStr);

        $("#contact-"+ Buddies[b].identity +"-ChatHistory").empty();

        Buddies[b].IsSelected = (Buddies[b].identity == buddy);
    }

    UpdateUI();
    RefreshStream(buddyObj);

    try{
        $("#contact-" + buddy).get(0).scrollIntoViewIfNeeded();
    } catch(e){}
    localDB.setItem("SelectedBuddy", buddy);
}
function CloseBuddy(buddy){
    $(".buddySelected").each(function () {
        $(this).prop('class', 'buddy');
    });
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });

    console.log("Closing Buddy: "+ buddy);
    for(var b = 0; b < Buddies.length; b++){
        Buddies[b].IsSelected = false;
    }
    selectedBuddy = null;
    for(var l = 0; l < Lines.length; l++){
        Lines[l].IsSelected = false;
    }
    selectedLine = null;
    localDB.setItem("SelectedBuddy", null);
    UpdateUI();
}
function RemoveBuddy(buddy){
    Confirm(lang.confirm_remove_buddy, lang.remove_buddy, function(){
        for(var b = 0; b < Buddies.length; b++) {
            if(Buddies[b].identity == buddy) {
                RemoveBuddyMessageStream(Buddies[b]);
                UnsubscribeBuddy(Buddies[b])
                Buddies.splice(b, 1);
                break;
            }
        }
        UpdateBuddyList();
    });
}
function FindBuddyByDid(did){
    // Used only in Inboud
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].ExtNo == did || Buddies[b].MobileNumber == did || Buddies[b].ContactNumber1 == did || Buddies[b].ContactNumber2 == did) {
            return Buddies[b];
        }
    }
    return null;
}
function FindBuddyByExtNo(ExtNo){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].type == "extension" && Buddies[b].ExtNo == ExtNo) return Buddies[b];
    }
    return null;
}

function FindBuddyByIdentity(identity){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].identity == identity) return Buddies[b];
    }
    return null;
}
function SearchStream(obj, buddy){
    var q = obj.value;

    var buddyObj = FindBuddyByIdentity(buddy);
    if(q == ""){
        console.log("Restore Stream");
        RefreshStream(buddyObj);
    }
    else{
        RefreshStream(buddyObj, q);
    }
}
function RefreshStream(buddyObj, filter) {
    $("#contact-" + buddyObj.identity + "-ChatHistory").empty();

    var json = JSON.parse(localDB.getItem(buddyObj.identity +"-stream"));
    if(json == null || json.DataCollection == null) return;
    json.DataCollection.sort(function(a, b){
        var aMo = moment.utc(a.ItemDate.replace(" UTC", ""));
        var bMo = moment.utc(b.ItemDate.replace(" UTC", ""));
        if (aMo.isSameOrAfter(bMo, "second")) {
            return -1;
        } else return 1;
        return 0;
    });

    // Filter
    if(filter && filter != ""){
        console.log("Rows without filter ("+ filter +"): ", json.DataCollection.length);
        json.DataCollection = json.DataCollection.filter(function(item){
            if(filter.indexOf("date: ") != -1){
                var dateFilter = getFilter(filter, "date");
                if(dateFilter != "" && item.ItemDate.indexOf(dateFilter) != -1) return true;
            }
            if(item.MessageData && item.MessageData.length > 1){
                if(item.MessageData.toLowerCase().indexOf(filter.toLowerCase()) != -1) return true;
                if(filter.toLowerCase().indexOf(item.MessageData.toLowerCase()) != -1) return true;
            }
            if (item.ItemType == "MSG") {
            } 
            else if (item.ItemType == "CDR") {
                // Tag Search
                if(item.Tags && item.Tags.length > 1){
                    var tagFilter = getFilter(filter, "tag");
                    if(tagFilter != "") {
                        if(item.Tags.some(function(i){
                            if(tagFilter.toLowerCase().indexOf(i.value.toLowerCase()) != -1) return true;
                            if(i.value.toLowerCase().indexOf(tagFilter.toLowerCase()) != -1) return true;
                            return false;
                        }) == true) return true;
                    }
                }
            }
            return false;
        });
        console.log("Rows After Filter: ", json.DataCollection.length);
    }

    // Create Buffer
    if(json.DataCollection.length > StreamBuffer){
        console.log("Rows:", json.DataCollection.length, " (will be trimed to "+ StreamBuffer +")");
        json.DataCollection.splice(StreamBuffer);
    }

    $.each(json.DataCollection, function (i, item) {

        var IsToday = moment.utc(item.ItemDate.replace(" UTC", "")).isSame(moment.utc(), "day");
        var DateTime = moment.utc(item.ItemDate.replace(" UTC", "")).local().calendar(null, { sameElse: DisplayDateFormat });
        if(IsToday) DateTime = moment.utc(item.ItemDate.replace(" UTC", "")).local().format(DisplayTimeFormat);

        if (item.ItemType == "MSG") {
            var deliveryStatus = "<i class=\"fa fa-question-circle-o SendingMessage\"></i>"
            if(item.Sent == true) deliveryStatus = "<i class=\"fa fa-check SentMessage\"></i>";
            if(item.Sent == false) deliveryStatus = "<i class=\"fa fa-exclamation-circle FailedMessage\"></i>";
            if(item.Delivered) deliveryStatus += "<i class=\"fa fa-check DeliveredMessage\"></i>";

            var formattedMessage = ReformatMessage(item.MessageData);
            var longMessage = (formattedMessage.length > 1000);

            if (item.SrcUserId == profileUserID) {
                // You are the source (sending)
                var messageString = "<table class=ourChatMessage cellspacing=0 cellpadding=0><tr>"
                messageString += "<td class=ourChatMessageText onmouseenter=\"ShowChatMenu(this)\" onmouseleave=\"HideChatMenu(this)\">"
                messageString += "<span onclick=\"ShowMessgeMenu(this,'MSG','"+  item.ItemId +"', '"+ buddyObj.identity +"')\" class=chatMessageDropdown style=\"display:none\"><i class=\"fa fa-chevron-down\"></i></span>";
                messageString += "<div id=msg-text-"+ item.ItemId +" class=messageText style=\""+ ((longMessage)? "max-height:190px; overflow:hidden" : "") +"\">" + formattedMessage + "</div>"
                if(longMessage){
                    messageString += "<div id=msg-readmore-"+  item.ItemId +" class=messageReadMore><span onclick=\"ExpandMessage(this,'"+ item.ItemId +"', '"+ buddyObj.identity +"')\">"+ lang.read_more +"</span></div>"
                }
                messageString += "<div class=messageDate>" + DateTime + " " + deliveryStatus +"</div>"
                messageString += "</td>"
                messageString += "</tr></table>";
            } 
            else {
                var messageString = "<table class=theirChatMessage cellspacing=0 cellpadding=0><tr>"
                messageString += "<td class=theirChatMessageText onmouseenter=\"ShowChatMenu(this)\" onmouseleave=\"HideChatMenu(this)\">";
                messageString += "<span onclick=\"ShowMessgeMenu(this,'MSG','"+  item.ItemId +"', '"+ buddyObj.identity +"')\" class=chatMessageDropdown style=\"display:none\"><i class=\"fa fa-chevron-down\"></i></span>";
                if(buddyObj.type == "group"){
                    messageString += "<div class=messageDate>" + ActualSender + "</div>";
                }
                messageString += "<div id=msg-text-"+ item.ItemId +" class=messageText style=\""+ ((longMessage)? "max-height:190px; overflow:hidden" : "") +"\">" + formattedMessage + "</div>";
                if(longMessage){
                    messageString += "<div id=msg-readmore-"+  item.ItemId +" class=messageReadMore><span onclick=\"ExpandMessage(this,'"+ item.ItemId +"', '"+ buddyObj.identity +"')\">"+ lang.read_more +"</span></div>"
                }
                messageString += "<div class=messageDate>"+ DateTime + "</div>";
                messageString += "</td>";
                messageString += "</tr></table>";
            }
            $("#contact-" + buddyObj.identity + "-ChatHistory").prepend(messageString);
        } 
        else if (item.ItemType == "CDR") {
            var iconColor = (item.Billsec > 0)? "green" : "red";
            var formattedMessage = "";
            var flag = "<span id=cdr-flagged-"+  item.CdrId +" style=\""+ ((item.Flagged)? "" : "display:none") +"\">";
            flag += "<i class=\"fa fa-flag FlagCall\"></i> ";
            flag += "</span>";
            var callComment = "";
            if(item.MessageData) callComment = item.MessageData;
            if(!item.Tags) item.Tags = [];
            var CallTags = "<ul id=cdr-tags-"+  item.CdrId +" class=tags style=\""+ ((item.Tags && item.Tags.length > 0)? "" : "display:none" ) +"\">"
            $.each(item.Tags, function (i, tag) {
                CallTags += "<li onclick=\"TagClick(this, '"+ item.CdrId +"', '"+ buddyObj.identity +"')\">"+ tag.value +"</li>";
            });
            CallTags += "<li class=tagText><input maxlength=24 type=text onkeypress=\"TagKeyPress(event, this, '"+ item.CdrId +"', '"+ buddyObj.identity +"')\" onfocus=\"TagFocus(this)\"></li>";
            CallTags += "</ul>";

            var callIcon = (item.WithVideo)? "fa-video-camera" :  "fa-phone";
            formattedMessage += "<i class=\"fa "+ callIcon +"\" style=\"color:"+ iconColor +"\"></i>";
            var audioVideo = (item.WithVideo)? lang.a_video_call :  lang.an_audio_call;

            var recordingsHtml = "";
            if(item.Recordings && item.Recordings.length >= 1){
                $.each(item.Recordings, function (i, recording) {
                    if(recording.uID){
                        var StartTime = moment.utc(recording.startTime.replace(" UTC", "")).local();
                        var StopTime = moment.utc(recording.stopTime.replace(" UTC", "")).local();
                        var recordingDuration = moment.duration(StopTime.diff(StartTime));
                        recordingsHtml += "<div class=callRecording>";
                        if(item.WithVideo){
                            if(recording.Poster){
                                var posterWidth = recording.Poster.width;
                                var posterHeight = recording.Poster.height;
                                var posterImage = recording.Poster.posterBase64;
                                recordingsHtml += "<div><IMG src=\""+ posterImage +"\"><button onclick=\"PlayVideoCallRecording(this, '"+ item.CdrId +"', '"+ recording.uID +"')\" class=videoPoster><i class=\"fa fa-play\"></i></button></div>";
                            }
                            else {
                                recordingsHtml += "<div><button onclick=\"PlayVideoCallRecording(this, '"+ item.CdrId +"', '"+ recording.uID +"', '"+ buddyObj.identity +"')\"><i class=\"fa fa-video-camera\"></i></button></div>";
                            }
                        } 
                        else {
                            recordingsHtml += "<div><button onclick=\"PlayAudioCallRecording(this, '"+ item.CdrId +"', '"+ recording.uID +"', '"+ buddyObj.identity +"')\"><i class=\"fa fa-play\"></i></button></div>";
                        } 
                        recordingsHtml += "<div>"+ lang.started +": "+ StartTime.format(DisplayTimeFormat) +" <i class=\"fa fa-long-arrow-right\"></i> "+ lang.stopped +": "+ StopTime.format(DisplayTimeFormat) +"</div>";
                        recordingsHtml += "<div>"+ lang.recording_duration +": "+ formatShortDuration(recordingDuration.asSeconds()) +"</div>";
                        recordingsHtml += "<div>";
                        recordingsHtml += "<span id=\"cdr-video-meta-width-"+ item.CdrId +"-"+ recording.uID +"\"></span>";
                        recordingsHtml += "<span id=\"cdr-video-meta-height-"+ item.CdrId +"-"+ recording.uID +"\"></span>";
                        recordingsHtml += "<span id=\"cdr-media-meta-size-"+ item.CdrId +"-"+ recording.uID +"\"></span>";
                        recordingsHtml += "<span id=\"cdr-media-meta-codec-"+ item.CdrId +"-"+ recording.uID +"\"></span>";
                        recordingsHtml += "</div>";
                        recordingsHtml += "</div>";
                    }
                });
            }

            if (item.SrcUserId == profileUserID) {
                // (Outbound) You(profileUserID) initiated a call
                if(item.Billsec == "0") {
                    formattedMessage += " "+ lang.you_tried_to_make +" "+ audioVideo +" ("+ item.ReasonText +").";
                } 
                else {
                    formattedMessage += " "+ lang.you_made + " "+ audioVideo +", "+ lang.and_spoke_for +" " + formatDuration(item.Billsec) + ".";
                }
                var messageString = "<table class=ourChatMessage cellspacing=0 cellpadding=0><tr>"
                messageString += "<td style=\"padding-right:4px;\">" + flag + "</td>"
                messageString += "<td class=ourChatMessageText onmouseenter=\"ShowChatMenu(this)\" onmouseleave=\"HideChatMenu(this)\">";
                messageString += "<span onClick=\"ShowMessgeMenu(this,'CDR','"+  item.CdrId +"', '"+ buddyObj.identity +"')\" class=chatMessageDropdown style=\"display:none\"><i class=\"fa fa-chevron-down\"></i></span>";
                messageString += "<div>" + formattedMessage + "</div>";
                messageString += "<div>" + CallTags + "</div>";
                messageString += "<div id=cdr-comment-"+  item.CdrId +" class=cdrComment>" + callComment + "</div>";
                messageString += "<div class=callRecordings>" + recordingsHtml + "</div>";
                messageString += "<div class=messageDate>" + DateTime  + "</div>";
                messageString += "</td>"
                messageString += "</tr></table>";
            } 
            else {
                if(item.Billsec == "0"){
                    formattedMessage += " "+ lang.you_missed_a_call + " ("+ item.ReasonText +").";
                } 
                else {
                    formattedMessage += " "+ lang.you_recieved + " "+ audioVideo +", "+ lang.and_spoke_for +" " + formatDuration(item.Billsec) + ".";
                }
                var messageString = "<table class=theirChatMessage cellspacing=0 cellpadding=0><tr>";
                messageString += "<td class=theirChatMessageText onmouseenter=\"ShowChatMenu(this)\" onmouseleave=\"HideChatMenu(this)\">";
                messageString += "<span onClick=\"ShowMessgeMenu(this,'CDR','"+  item.CdrId +"', '"+ buddyObj.identity +"')\" class=chatMessageDropdown style=\"display:none\"><i class=\"fa fa-chevron-down\"></i></span>";
                messageString += "<div style=\"text-align:left\">" + formattedMessage + "</div>";
                messageString += "<div>" + CallTags + "</div>";
                messageString += "<div id=cdr-comment-"+  item.CdrId +" class=cdrComment>" + callComment + "</div>";
                messageString += "<div class=callRecordings>" + recordingsHtml + "</div>";
                messageString += "<div class=messageDate> " + DateTime + "</div>";
                messageString += "</td>";
                messageString += "<td style=\"padding-left:4px\">" + flag + "</td>";
                messageString += "</tr></table>";
            }
            $("#contact-" + buddyObj.identity + "-ChatHistory").prepend(messageString);
        } 
    });

    updateScroll(buddyObj.identity);
    window.setTimeout(function(){
        updateScroll(buddyObj.identity);
    }, 300);
}
function ShowChatMenu(obj){
    $(obj).children("span").show();
}
function HideChatMenu(obj){
    $(obj).children("span").hide();
}
function ExpandMessage(obj, ItemId, buddy){
    $("#msg-text-" + ItemId).css("max-height", "");
    $("#msg-text-" + ItemId).css("overflow", "");
    $("#msg-readmore-" + ItemId).remove();

    HidePopup(500);
}
function ShowBuddyDial(obj, buddy){
    $("#contact-"+ buddy +"-audio-dial").show();
    $("#contact-"+ buddy +"-video-dial").show();
}
function HideBuddyDial(obj, buddy){
    $("#contact-"+ buddy +"-audio-dial").hide();
    $("#contact-"+ buddy +"-video-dial").hide();
}
function QuickDialAudio(buddy, obj, event){
    AudioCallMenu(buddy, obj);
    event.stopPropagation();
}
function QuickDialVideo(buddy, ExtNo, event){
    event.stopPropagation();
    window.setTimeout(function(){
        DialByLine('video', buddy, ExtNo);
    }, 300);
}

// Sessions
function ExpandVideoArea(lineNum){
    $("#line-" + lineNum + "-ActiveCall").prop("class","FullScreenVideo");
    $("#line-" + lineNum + "-VideoCall").css("height", "calc(100% - 100px)");
    $("#line-" + lineNum + "-VideoCall").css("margin-top", "0px");

    $("#line-" + lineNum + "-preview-container").prop("class","PreviewContainer PreviewContainer_FS");
    $("#line-" + lineNum + "-stage-container").prop("class","StageContainer StageContainer_FS");

    $("#line-" + lineNum + "-restore").show();
    $("#line-" + lineNum + "-expand").hide();

    $("#line-" + lineNum + "-monitoring").hide();    
}
function RestoreVideoArea(lineNum){
    $("#line-" + lineNum + "-ActiveCall").prop("class","");
    $("#line-" + lineNum + "-VideoCall").css("height", "");
    $("#line-" + lineNum + "-VideoCall").css("margin-top", "10px");

    $("#line-" + lineNum + "-preview-container").prop("class","PreviewContainer");
    $("#line-" + lineNum + "-stage-container").prop("class","StageContainer");

    $("#line-" + lineNum + "-restore").hide();
    $("#line-" + lineNum + "-expand").show();

    $("#line-" + lineNum + "-monitoring").show();
}
function MuteSession(lineNum){
    $("#line-"+ lineNum +"-btn-Unmute").show();
    $("#line-"+ lineNum +"-btn-Mute").hide();

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    var session = lineObj.SipSession;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track.kind == "audio") {
            if(RTCRtpSender.track.IsMixedTrack == true){
                if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                    console.log("Muting Audio Track : "+ session.data.AudioSourceTrack.label);
                    session.data.AudioSourceTrack.enabled = false;
                }
            }
            else {
                console.log("Muting Audio Track : "+ RTCRtpSender.track.label);
                RTCRtpSender.track.enabled = false;
            }
        }
    });

    if(!session.data.mute) session.data.mute = [];
    session.data.mute.push({ event: "mute", eventTime: utcDateNow() });
    session.data.ismute = true;

    $("#line-" + lineNum + "-msg").html(lang.call_on_mute);

    updateLineScroll(lineNum);

    // Custom Web hook
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("mute", session);
}
function UnmuteSession(lineNum){
    $("#line-"+ lineNum +"-btn-Unmute").hide();
    $("#line-"+ lineNum +"-btn-Mute").show();

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    var session = lineObj.SipSession;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track.kind == "audio") {
            if(RTCRtpSender.track.IsMixedTrack == true){
                if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                    console.log("Unmuting Audio Track : "+ session.data.AudioSourceTrack.label);
                    session.data.AudioSourceTrack.enabled = true;
                }
            }
            else {
                console.log("Unmuting Audio Track : "+ RTCRtpSender.track.label);
                RTCRtpSender.track.enabled = true;
            }
        }
    });

    if(!session.data.mute) session.data.mute = [];
    session.data.mute.push({ event: "unmute", eventTime: utcDateNow() });
    session.data.ismute = false;

    $("#line-" + lineNum + "-msg").html(lang.call_off_mute);

    updateLineScroll(lineNum);
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("unmute", session);
}
function ShowDtmfMenu(obj, lineNum){
    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    HidePopup();
    dhtmlxPopup = new dhtmlXPopup();
    var html = "<div style=\"margin-top:15px; margin-bottom:15px\">";
    html += "<table cellspacing=10 cellpadding=0 style=\"margin-left:auto; margin-right: auto\">";
    html += "<tr><td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '1')\"><div>1</div><span>&nbsp;</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '2')\"><div>2</div><span>ABC</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '3')\"><div>3</div><span>DEF</span></button></td></tr>";
    html += "<tr><td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '4')\"><div>4</div><span>GHI</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '5')\"><div>5</div><span>JKL</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '6')\"><div>6</div><span>MNO</span></button></td></tr>";
    html += "<tr><td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '7')\"><div>7</div><span>PQRS</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '8')\"><div>8</div><span>TUV</span></button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '9')\"><div>9</div><span>WXYZ</span></button></td></tr>";
    html += "<tr><td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '*')\">*</button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '0')\">0</button></td>"
    html += "<td><button class=dtmfButtons onclick=\"sendDTMF('"+ lineNum +"', '#')\">#</button></td></tr>";
    html += "</table>";
    html += "</div>";
    dhtmlxPopup.attachHTML(html);
    dhtmlxPopup.show(x, y, w, h);
}

// Stream Functionality
function ShowMessgeMenu(obj, typeStr, cdrId, buddy) {
    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    HidePopup();
    dhtmlxPopup = new dhtmlXPopup();
    var menu = null;
    if (typeStr == "CDR") {
        var TagState = $("#cdr-flagged-"+ cdrId).is(":visible");
        var TagText = (TagState)? lang.clear_flag : lang.flag_call;
        menu = [
            { id: 1, name: "<i class=\"fa fa-external-link\"></i> "+ lang.show_call_detail_record },
            { id: 2, name: "<i class=\"fa fa-tags\"></i> "+ lang.tag_call },
            { id: 3, name: "<i class=\"fa fa-flag\"></i> "+ TagText },
            { id: 4, name: "<i class=\"fa fa-quote-left\"></i> "+ lang.edit_comment },
        ];
    }
    if (typeStr == "MSG") {
        menu = [
            { id: 10, name: "<i class=\"fa fa-clipboard\"></i> "+ lang.copy_message },
            // { id: 11, name: "<i class=\"fa fa-pencil\"></i> Edit Message" },
            { id: 12, name: "<i class=\"fa fa-quote-left\"></i> "+ lang.quote_message },
        ];
    }
    dhtmlxPopup.attachList("name", menu);
    dhtmlxPopup.attachEvent("onClick", function(id){
        HidePopup();
        if(id == 1){

            var cdr = null;
            var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
            if(currentStream != null || currentStream.DataCollection != null){
                $.each(currentStream.DataCollection, function (i, item) {
                    if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                        cdr = item;
                        return false;
                    }
                });
            }
            if(cdr == null) return;

            var callDetails = [];
            var html = "<div class=\"UiWindowField scroller\">";
            var CallDate = moment.utc(cdr.ItemDate.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat);
            var CallAnswer = (cdr.CallAnswer)? moment.utc(cdr.CallAnswer.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat) : null ;
            var ringTime = (cdr.RingTime)? cdr.RingTime : 0 ;
            var CallEnd = moment.utc(cdr.CallEnd.replace(" UTC", "")).local().format(DisplayDateFormat +" "+ DisplayTimeFormat);

            var srcCallerID = "";
            var dstCallerID = "";
            if(cdr.CallDirection == "inbound") {
                srcCallerID = cdr.Src;
            } 
            else if(cdr.CallDirection == "outbound") {
                dstCallerID = cdr.Dst;
            }
            html += "<div class=UiText><b>SIP CallID</b> : "+ cdr.SessionId +"</div>";
            html += "<div class=UiText><b>"+ lang.call_direction +"</b> : "+ cdr.CallDirection +"</div>";
            html += "<div class=UiText><b>"+ lang.call_date_and_time +"</b> : "+ CallDate +"</div>";
            html += "<div class=UiText><b>"+ lang.ring_time +"</b> : "+ formatDuration(ringTime) +" ("+ ringTime +")</div>";
            html += "<div class=UiText><b>"+ lang.talk_time +"</b> : " + formatDuration(cdr.Billsec) +" ("+ cdr.Billsec +")</div>";
            html += "<div class=UiText><b>"+ lang.call_duration +"</b> : "+ formatDuration(cdr.TotalDuration) +" ("+ cdr.TotalDuration +")</div>";
            html += "<div class=UiText><b>"+ lang.video_call +"</b> : "+ ((cdr.WithVideo)? lang.yes : lang.no) +"</div>";
            html += "<div class=UiText><b>"+ lang.flagged +"</b> : "+ ((cdr.Flagged)? "<i class=\"fa fa-flag FlagCall\"></i> " + lang.yes : lang.no)  +"</div>";
            html += "<hr>";
            html += "<h2 style=\"font-size: 16px\">"+ lang.call_tags +"</h2>";
            html += "<hr>";
            $.each(cdr.Tags, function(item, tag){
                html += "<span class=cdrTag>"+ tag.value +"</span>"
            });

            html += "<h2 style=\"font-size: 16px\">"+ lang.call_notes +"</h2>";
            html += "<hr>";
            if(cdr.MessageData){
                html += "\"" + cdr.MessageData + "\"";
            }

            html += "<h2 style=\"font-size: 16px\">"+ lang.activity_timeline +"</h2>";
            html += "<hr>";

            var withVideo = (cdr.WithVideo)? "("+ lang.with_video +")" : "";
            var startCallMessage = (cdr.CallDirection == "inbound")? lang.you_received_a_call_from + " " + srcCallerID  +" "+ withVideo : lang.you_made_a_call_to + " " + dstCallerID +" "+ withVideo;
            callDetails.push({ 
                Message: startCallMessage,
                TimeStr: cdr.ItemDate
            });
            if(CallAnswer){
                var answerCallMessage = (cdr.CallDirection == "inbound")? lang.you_answered_after + " " + ringTime + " " + lang.seconds_plural : lang.they_answered_after + " " + ringTime + " " + lang.seconds_plural;
                callDetails.push({ 
                    Message: answerCallMessage,
                    TimeStr: cdr.CallAnswer
                });
            }
            $.each(cdr.Transfers, function(item, transfer){
                var msg = (transfer.type == "Blind")? lang.you_started_a_blind_transfer_to +" "+ transfer.to +". " : lang.you_started_an_attended_transfer_to + " "+ transfer.to +". ";
                if(transfer.accept && transfer.accept.complete == true){
                    msg += lang.the_call_was_completed
                }
                else if(transfer.accept.disposition != "") {
                    msg += lang.the_call_was_not_completed +" ("+ transfer.accept.disposition +")"
                }
                callDetails.push({
                    Message : msg,
                    TimeStr : transfer.transferTime
                });
            });
            $.each(cdr.Mutes, function(item, mute){
                callDetails.push({
                    Message : (mute.event == "mute")? lang.you_put_the_call_on_mute : lang.you_took_the_call_off_mute,
                    TimeStr : mute.eventTime
                });
            });
            $.each(cdr.Holds, function(item, hold){
                callDetails.push({
                    Message : (hold.event == "hold")? lang.you_put_the_call_on_hold : lang.you_took_the_call_off_hold,
                    TimeStr : hold.eventTime
                });
            });
            $.each(cdr.ConfCalls, function(item, confCall){
                var msg = lang.you_started_a_conference_call_to +" "+ confCall.to +". ";
                if(confCall.accept && confCall.accept.complete == true){
                    msg += lang.the_call_was_completed
                }
                else if(confCall.accept.disposition != "") {
                    msg += lang.the_call_was_not_completed +" ("+ confCall.accept.disposition +")"
                }
                callDetails.push({
                    Message : msg,
                    TimeStr : confCall.startTime
                });
            });
            $.each(cdr.Recordings, function(item, recording){
                var StartTime = moment.utc(recording.startTime.replace(" UTC", "")).local();
                var StopTime = moment.utc(recording.stopTime.replace(" UTC", "")).local();
                var recordingDuration = moment.duration(StopTime.diff(StartTime));

                var msg = lang.call_is_being_recorded;
                if(recording.startTime != recording.stopTime){
                    msg += "("+ formatShortDuration(recordingDuration.asSeconds()) +")"
                }
                callDetails.push({
                    Message : msg,
                    TimeStr : recording.startTime
                });
            });
            callDetails.push({
                Message: (cdr.Terminate == "us")? "You ended the call." : "They ended the call",
                TimeStr : cdr.CallEnd
            });

            callDetails.sort(function(a, b){
                var aMo = moment.utc(a.TimeStr.replace(" UTC", ""));
                var bMo = moment.utc(b.TimeStr.replace(" UTC", ""));
                if (aMo.isSameOrAfter(bMo, "second")) {
                    return 1;
                } else return -1;
                return 0;
            });
            $.each(callDetails, function(item, detail){
                var Time = moment.utc(detail.TimeStr.replace(" UTC", "")).local().format(DisplayTimeFormat);
                var messageString = "<table class=timelineMessage cellspacing=0 cellpadding=0><tr>"
                messageString += "<td class=timelineMessageArea>"
                messageString += "<div class=timelineMessageDate style=\"color: #333333\"><i class=\"fa fa-circle timelineMessageDot\"></i>"+ Time +"</div>"
                messageString += "<div class=timelineMessageText style=\"color: #000000\">"+ detail.Message +"</div>"
                messageString += "</td>"
                messageString += "</tr></table>";
                html += messageString;
            });

            html += "<h2 style=\"font-size: 16px\">"+ lang.call_recordings +"</h2>";
            html += "<hr>";
            var recordingsHtml = "";
            $.each(cdr.Recordings, function(r, recording){
                if(recording.uID){
                    var StartTime = moment.utc(recording.startTime.replace(" UTC", "")).local();
                    var StopTime = moment.utc(recording.stopTime.replace(" UTC", "")).local();
                    var recordingDuration = moment.duration(StopTime.diff(StartTime));
                    recordingsHtml += "<div>";
                    if(cdr.WithVideo){
                        recordingsHtml += "<div><video id=\"callrecording-video-"+ recording.uID +"\" controls style=\"width: 100%\"></div>";
                    } 
                    else {
                        recordingsHtml += "<div><audio id=\"callrecording-audio-"+ recording.uID +"\" controls style=\"width: 100%\"></div>";
                    } 
                    recordingsHtml += "<div>"+ lang.started +": "+ StartTime.format(DisplayTimeFormat) +" <i class=\"fa fa-long-arrow-right\"></i> "+ lang.stopped +": "+ StopTime.format(DisplayTimeFormat) +"</div>";
                    recordingsHtml += "<div>"+ lang.recording_duration +": "+ formatShortDuration(recordingDuration.asSeconds()) +"</div>";
                    recordingsHtml += "<div><a id=\"download-"+ recording.uID +"\">"+ lang.save_as +"</a> ("+ lang.right_click_and_select_save_link_as +")</div>";
                    recordingsHtml += "</div>";
                }
            });
            html += recordingsHtml;

            html += "<h2 style=\"font-size: 16px\">"+ lang.send_statistics +"</h2>";
            html += "<hr>";
            html += "<div style=\"position: relative; margin: auto; height: 160px; width: 100%;\"><canvas id=\"cdr-AudioSendBitRate\"></canvas></div>";
            html += "<div style=\"position: relative; margin: auto; height: 160px; width: 100%;\"><canvas id=\"cdr-AudioSendPacketRate\"></canvas></div>";

            html += "<h2 style=\"font-size: 16px\">"+ lang.receive_statistics +"</h2>";
            html += "<hr>";
            html += "<div style=\"position: relative; margin: auto; height: 160px; width: 100%;\"><canvas id=\"cdr-AudioReceiveBitRate\"></canvas></div>";
            html += "<div style=\"position: relative; margin: auto; height: 160px; width: 100%;\"><canvas id=\"cdr-AudioReceivePacketRate\"></canvas></div>";
            html += "<div style=\"position: relative; margin: auto; height: 160px; width: 100%;\"><canvas id=\"cdr-AudioReceivePacketLoss\"></canvas></div>";
            html += "<div style=\"position: relative; margin: auto; height: 160px; width: 100%;\"><canvas id=\"cdr-AudioReceiveJitter\"></canvas></div>";
            html += "<div style=\"position: relative; margin: auto; height: 160px; width: 100%;\"><canvas id=\"cdr-AudioReceiveLevels\"></canvas></div>";

            html += "<br><br></div>";
            OpenWindow(html, lang.call_detail_record, 480, 640, false, true, null, null, lang.cancel, function(){
                CloseWindow();
            }, function(){
                // Queue video and audio
                $.each(cdr.Recordings, function(r, recording){
                    var mediaObj = null;
                    if(cdr.WithVideo){
                        mediaObj = $("#callrecording-video-"+ recording.uID).get(0);
                    }
                    else {
                        mediaObj = $("#callrecording-audio-"+ recording.uID).get(0);
                    }
                    var downloadURL = $("#download-"+ recording.uID);

                    // Playback device
                    var sinkId = getAudioOutputID();
                    if (typeof mediaObj.sinkId !== 'undefined') {
                        mediaObj.setSinkId(sinkId).then(function(){
                            console.log("sinkId applied: "+ sinkId);
                        }).catch(function(e){
                            console.warn("Error using setSinkId: ", e);
                        });
                    } else {
                        console.warn("setSinkId() is not possible using this browser.")
                    }

                    // Get Call Recording
                    var indexedDB = window.indexedDB;
                    var request = indexedDB.open("CallRecordings");
                    request.onerror = function(event) {
                        console.error("IndexDB Request Error:", event);
                    }
                    request.onupgradeneeded = function(event) {
                        console.warn("Upgrade Required for IndexDB... probably because of first time use.");
                    }
                    request.onsuccess = function(event) {
                        console.log("IndexDB connected to CallRecordings");

                        var IDB = event.target.result;
                        if(IDB.objectStoreNames.contains("Recordings") == false){
                            console.warn("IndexDB CallRecordings.Recordings does not exists");
                            return;
                        } 

                        var transaction = IDB.transaction(["Recordings"]);
                        var objectStoreGet = transaction.objectStore("Recordings").get(recording.uID);
                        objectStoreGet.onerror = function(event) {
                            console.error("IndexDB Get Error:", event);
                        }
                        objectStoreGet.onsuccess = function(event) {
                            var mediaBlobUrl = window.URL.createObjectURL(event.target.result.mediaBlob);
                            mediaObj.src = mediaBlobUrl;

                            // Download Link
                            if(cdr.WithVideo){
                                downloadURL.prop("download",  "Video-Call-Recording-"+ recording.uID +".webm");
                            }
                            else {
                                downloadURL.prop("download",  "Audio-Call-Recording-"+ recording.uID +".webm");
                            }
                            downloadURL.prop("href", mediaBlobUrl);
                        }
                    }

                });
                DisplayQosData(cdr.SessionId);
            });
        }
        if(id == 2){
            $("#cdr-tags-"+ cdrId).show();
        }
        if(id == 3){
            var TagState = $("#cdr-flagged-"+ cdrId).is(":visible");
            if(TagState){
                console.log("Clearing Flag from: ", cdrId);
                $("#cdr-flagged-"+ cdrId).hide();
                var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
                if(currentStream != null || currentStream.DataCollection != null){
                    $.each(currentStream.DataCollection, function (i, item) {
                        if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                            // Found
                            item.Flagged = false;
                            return false;
                        }
                    });
                    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));
                }
            }
            else {
                console.log("Flag Call: ", cdrId);
                $("#cdr-flagged-"+ cdrId).show();
                var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
                if(currentStream != null || currentStream.DataCollection != null){
                    $.each(currentStream.DataCollection, function (i, item) {
                        if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                            // Found
                            item.Flagged = true;
                            return false;
                        }
                    });
                    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));
                }
            }
        }
        if(id == 4){
            var currentText = $("#cdr-comment-"+ cdrId).text();
            $("#cdr-comment-"+ cdrId).empty();

            var textboxObj = $("<input maxlength=500 type=text>").appendTo("#cdr-comment-"+ cdrId);
            textboxObj.on("focus", function(){
                HidePopup(500);
            });
            textboxObj.on("blur", function(){
                var newText = $(this).val();
                SaveComment(cdrId, buddy, newText);
            });
            textboxObj.keypress(function(event){
                window.setTimeout(function(){
                    if(dhtmlxPopup != null)
                    {
                        dhtmlxPopup.hide();
                        dhtmlxPopup.unload();
                        dhtmlxPopup = null;
                    }
                }, 500);

                var keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode == '13') {
                    event.preventDefault();

                    var newText = $(this).val();
                    SaveComment(cdrId, buddy, newText);
                }
            });
            textboxObj.val(currentText);
            textboxObj.focus();
        }

        // Text Messages
        if(id == 10){
            var msgtext = $("#msg-text-"+ cdrId).text();
            navigator.clipboard.writeText(msgtext).then(function(){
                console.log("Text coppied to the clipboard:", msgtext);
            }).catch(function(){
                console.error("Error writing to the clipboard:", e);
            });
        }
        if(id == 12){
            var msgtext = $("#msg-text-"+ cdrId).text();
            msgtext = "\""+ msgtext + "\"";
            var textarea = $("#contact-"+ buddy +"-ChatMessage");
            console.log("Quote Message:", msgtext);
            textarea.val(msgtext +"\n" + textarea.val());
            RefreshChatPreview(null, textarea.val(), buddy);
        }
        if(id == 20){
            var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
            if(currentStream != null || currentStream.DataCollection != null){
                $.each(currentStream.DataCollection, function (i, item) {
                    if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                        // Found
                        currentStream.DataCollection.splice(i, 1);
                        return false;
                    }
                });
                localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));
                RefreshStream(FindBuddyByIdentity(buddy));
            }
        }
        // Delete Poster Image
        if(id == 21){
            var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
            if(currentStream != null || currentStream.DataCollection != null){
                $.each(currentStream.DataCollection, function (i, item) {
                    if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                        // Found
                        if(item.Recordings && item.Recordings.length >= 1){
                            $.each(item.Recordings, function(r, recording) {
                                recording.Poster = null;
                            });
                        }
                        console.log("Poster Imagers Deleted");
                        return false;
                    }
                });
                localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));
                RefreshStream(FindBuddyByIdentity(buddy));
            }
        }
    });
    dhtmlxPopup.show(x, y, w, h);
}
function SaveComment(cdrId, buddy, newText){
    console.log("Setting Comment:", newText);

    $("#cdr-comment-"+ cdrId).empty();
    $("#cdr-comment-"+ cdrId).append(newText);

    // Update DB
    var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
    if(currentStream != null || currentStream.DataCollection != null){
        $.each(currentStream.DataCollection, function (i, item) {
            if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                // Found
                item.MessageData = newText;
                return false;
            }
        });
        localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));
    }
}
function TagKeyPress(event, obj, cdrId, buddy){
    HidePopup(500);

    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13' || keycode == '44') {
        event.preventDefault();

        if ($(obj).val() == "") return;

        console.log("Adding Tag:", $(obj).val());

        $("#cdr-tags-"+ cdrId+" li:last").before("<li onclick=\"TagClick(this, '"+ cdrId +"', '"+ buddy +"')\">"+ $(obj).val() +"</li>");
        $(obj).val("");
        UpdateTags(cdrId, buddy);
    }
}
function TagClick(obj, cdrId, buddy){
    window.setTimeout(function(){
        if(dhtmlxPopup != null)
        {
            dhtmlxPopup.hide();
            dhtmlxPopup.unload();
            dhtmlxPopup = null;
        }
    }, 500);

    console.log("Removing Tag:", $(obj).text());
    $(obj).remove();

    // Dpdate DB
    UpdateTags(cdrId, buddy);
}
function UpdateTags(cdrId, buddy){
    var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
    if(currentStream != null || currentStream.DataCollection != null){
        $.each(currentStream.DataCollection, function (i, item) {
            if (item.ItemType == "CDR" && item.CdrId == cdrId) {
                // Found
                item.Tags = [];
                $("#cdr-tags-"+ cdrId).children('li').each(function () {
                    if($(this).prop("class") != "tagText") item.Tags.push({ value: $(this).text() });
                });
                return false;
            }
        });
        localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));
    }
}

function TagFocus(obj){
    HidePopup(500);
}
function AddMenu(obj, buddy){
    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    HidePopup();
    dhtmlxPopup = new dhtmlXPopup();

    var menu = [
        { id: 1, name: "<i class=\"fa fa-smile-o\"></i> " + lang.select_expression },
        { id: 2, name: "<i class=\"fa fa-microphone\"></i> " + lang.dictate_message  }
    ];
    if(enabledExtendedServices){
        menu.push({ id: 3, name: "<i class=\"fa fa-share-alt\"></i> Share File" });
        menu.push({ id: 4, name: "<i class=\"fa fa-camera\"></i> Take Picture" });
        menu.push({ id: 5, name: "<i class=\"fa fa-file-audio-o\"></i> Record Audio Message" });
        menu.push({ id: 6, name: "<i class=\"fa fa-file-video-o\"></i> Record Video Message" });
    }

    dhtmlxPopup.attachList("name", menu);
    dhtmlxPopup.attachEvent("onClick", function(id){
        dhtmlxPopup.hide();
        dhtmlxPopup.unload();
        dhtmlxPopup = null;

        // Emoji Bar
        if(id == "1"){
            ShowEmojiBar(buddy);
        }
        // Disctate Message
        if(id == "2"){
            ShowDictate(buddy);
        }
        // 


    });
    dhtmlxPopup.show(x, y, w, h);
}
function ShowEmojiBar(buddy){
    var messageContainer = $("#contact-"+ buddy +"-emoji-menu");
    var textarea = $("#contact-"+ buddy +"-ChatMessage");

    var menuBar = $("<div>");
    menuBar.prop("class", "emojiButton")
    var emojis = ["😀","😁","😂","😃","😄","😅","😆","😇","😈","😉","😊","😋","😌","😍","😎","😏","😐","😑","😒","😓","😔","😕","😖","😗","😘","😙","😚","😛","😜","😝","😞","😟","😠","😡","😢","😣","😤","😥","😦","😧","😨","😩","😪","😫","😬","😭","😮","😯","😰","😱","😲","😳","😴","😵","😶","😷","🙁","🙂","🙃","🙄","🤐","🤑","🤒","🤓","🤔","🤕","🤠","🤡","🤢","🤣","🤤","🤥","🤧","🤨","🤩","🤪","🤫","🤬","🤭","🤮","🤯","🧐"];
    $.each(emojis, function(i,e){
        var emoji = $("<button>");
        emoji.html(e);
        emoji.on('click', function(){
            var i = textarea.prop('selectionStart');
            var v = textarea.val();
            textarea.val(v.substring(0, i) + $(this).html() + v.substring(i, v.length));
            RefreshChatPreview(null, textarea.val(), buddy);
            messageContainer.hide();

            updateScroll(buddy);
        });
        menuBar.append(emoji);
    });

    messageContainer.empty();
    messageContainer.append(menuBar);
    messageContainer.show();

    updateScroll(buddy);
}
function ShowDictate(buddy){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null){
        return;
    }

    if(buddyObj.recognition != null){
        buddyObj.recognition.abort();
        buddyObj.recognition = null;
    }
    try {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        buddyObj.recognition = new SpeechRecognition();
    }
    catch(e) {
        console.error(e);
        Alert(lang.alert_speech_recognition, lang.speech_recognition);
        return;
    }

    var instructions = $("<div>");
    var messageContainer = $("#contact-"+ buddy +"-dictate-message");
    var textarea = $("#contact-"+ buddy +"-ChatMessage");

    buddyObj.recognition.continuous = true;
    buddyObj.recognition.onstart = function() { 
        instructions.html("<i class=\"fa fa-microphone\" style=\"font-size: 21px\"></i><i class=\"fa fa-cog fa-spin\" style=\"font-size:10px; vertical-align:text-bottom; margin-left:2px\"></i> "+ lang.im_listening);
        updateScroll(buddy);
    }
    buddyObj.recognition.onspeechend = function() {
        instructions.html(lang.msg_silence_detection);
        window.setTimeout(function(){
            messageContainer.hide();
            updateScroll(buddy);
        }, 1000);
    }
    buddyObj.recognition.onerror = function(event) {
        if(event.error == 'no-speech') {
            instructions.html(lang.msg_no_speech);
        }
        else {
            if(buddyObj.recognition){
                console.warn("SpeechRecognition Error: ", event);
                buddyObj.recognition.abort();
            }
            buddyObj.recognition = null;
        }
        window.setTimeout(function(){
            messageContainer.hide();
            updateScroll(buddy);
        }, 1000);
    }
    buddyObj.recognition.onresult = function(event) {
        var transcript = event.results[event.resultIndex][0].transcript;
        if((event.resultIndex == 1 && transcript == event.results[0][0].transcript) == false) {
            if($.trim(textarea.val()).endsWith(".") || $.trim(textarea.val()) == "") {
                if(transcript == "\r" || transcript == "\n" || transcript == "\r\n" || transcript == "\t"){
                    // WHITESPACE ONLY
                }
                else {
                    transcript = $.trim(transcript);
                    transcript = transcript.replace(/^./, " "+ transcript[0].toUpperCase());
                }
            }
            console.log("Dictate:", transcript);
            textarea.val(textarea.val() + transcript);
            RefreshChatPreview(null, textarea.val(), buddy);
        }
    }
    messageContainer.empty();
    messageContainer.append(instructions);
    messageContainer.show();

    updateScroll(buddy);

    buddyObj.recognition.start();
}
// My Profile
function ShowMyProfileMenu(obj){
    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    HidePopup();
    dhtmlxPopup = new dhtmlXPopup();
    var menu = [
        {id: 2, name: "<i class=\"fa fa-refresh\"></i> "+ lang.refresh_registration , enabled: ""},
        {id: 3, name: "<i class=\"fa fa-wrench\"></i> "+ lang.configure_extension, enabled: ""},
    ];
    if(DisableBuddies == true) {
        $.each(menu, function(i, item){
            if(item.id == 4) {
                menu.splice(i, 1);
                return false;
            }
        });
    }
    if(enabledGroupServices == false) {
        $.each(menu, function(i, item){
            if(item.id == 5) {
                menu.splice(i, 1);
                return false;
            }
        });
    }
    dhtmlxPopup.attachList("name,enabled", menu);
    dhtmlxPopup.attachEvent("onClick", function(id){
        HidePopup();

        if(id == 2) RefreshRegistration();
        if(id == 3) ConfigureExtensionWindow();
    });
    dhtmlxPopup.show(x, y, w, h);
}
function RefreshRegistration(){
    Unregister();
    console.log("Unregister complete...");
    window.setTimeout(function(){
        console.log("Starting registration...");
        Register();
    }, 1000);
}

function ShowBuddyProfileMenu(buddy, obj, typeStr){
    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    HidePopup();
    dhtmlxPopup = new dhtmlXPopup();

    var buddyObj = FindBuddyByIdentity(buddy);

    if(typeStr == "extension")
    {
        var html = "<div style=\"width:200px; cursor:pointer\" onclick=\"EditBuddyWindow('"+ buddy +"')\">";
        html += "<div class=\"buddyProfilePic\" style=\"background-image:url('"+ getPicture(buddy, "extension") +"')\"></div>";
        html += "<div id=ProfileInfo style=\"text-align:center\"><i class=\"fa fa-spinner fa-spin\"></i></div>"
        html += "</div>";
        dhtmlxPopup.attachHTML(html);
        
        // Done
        $("#ProfileInfo").html("");

        $("#ProfileInfo").append("<div class=ProfileTextLarge style=\"margin-top:15px\">"+ buddyObj.CallerIDName +"</div>");
        $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.Desc +"</div>");

        $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.extension_number +":</div>");
        $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.ExtNo +" </div>");

        if(buddyObj.Email && buddyObj.Email != "null" && buddyObj.Email != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.email +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.Email +" </div>");
        }
        if(buddyObj.MobileNumber && buddyObj.MobileNumber != "null" && buddyObj.MobileNumber != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.mobile +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.MobileNumber +" </div>");
        }
        if(buddyObj.ContactNumber1 && buddyObj.ContactNumber1 != "null" && buddyObj.ContactNumber1 != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.alternative_contact +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.ContactNumber1 +" </div>");
        }
        if(buddyObj.ContactNumber2 && buddyObj.ContactNumber2 != "null" && buddyObj.ContactNumber2 != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.alternative_contact +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.ContactNumber2 +" </div>");
        }
    }
    else if(typeStr == "contact"){
        var html = "<div style=\"width:200px; cursor:pointer\" onclick=\"EditBuddyWindow('"+ buddy +"')\">";
        html += "<div class=\"buddyProfilePic\" style=\"background-image:url('"+ getPicture(buddy, "contact") +"')\"></div>";
        html += "<div id=ProfileInfo style=\"text-align:center\"><i class=\"fa fa-spinner fa-spin\"></i></div>"
        html += "</div>";
        dhtmlxPopup.attachHTML(html);

        $("#ProfileInfo").html("");
        $("#ProfileInfo").append("<div class=ProfileTextLarge style=\"margin-top:15px\">"+ buddyObj.CallerIDName +"</div>");
        $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.Desc +"</div>");

        if(buddyObj.Email && buddyObj.Email != "null" && buddyObj.Email != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.email +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.Email +" </div>");
        }
        if(buddyObj.MobileNumber && buddyObj.MobileNumber != "null" && buddyObj.MobileNumber != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.mobile +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.MobileNumber +" </div>");
        }
        if(buddyObj.ContactNumber1 && buddyObj.ContactNumber1 != "null" && buddyObj.ContactNumber1 != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.alternative_contact +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.ContactNumber1 +" </div>");
        }
        if(buddyObj.ContactNumber2 && buddyObj.ContactNumber2 != "null" && buddyObj.ContactNumber2 != "undefined"){
            $("#ProfileInfo").append("<div class=ProfileTextSmall style=\"margin-top:15px\">"+ lang.alternative_contact +":</div>");
            $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.ContactNumber2 +" </div>");
        }
    }
    else if(typeStr == "group"){
        var html = "<div style=\"width:200px; cursor:pointer\" onclick=\"EditBuddyWindow('"+ buddy +"')\">";
        html += "<div class=\"buddyProfilePic\" style=\"background-image:url('"+ getPicture(buddy, "group") +"')\"></div>";
        html += "<div id=ProfileInfo style=\"text-align:center\"><i class=\"fa fa-spinner fa-spin\"></i></div>"
        html += "</div>";
        dhtmlxPopup.attachHTML(html);

        $("#ProfileInfo").html("");

        $("#ProfileInfo").append("<div class=ProfileTextLarge style=\"margin-top:15px\">"+ buddyObj.CallerIDName +"</div>");
        $("#ProfileInfo").append("<div class=ProfileTextMedium>"+ buddyObj.Desc +"</div>");
    }
    dhtmlxPopup.show(x, y, w, h);
}

// Device and Settings
function ChangeSettings(lineNum, obj){

    var x = window.dhx4.absLeft(obj);
    var y = window.dhx4.absTop(obj);
    var w = obj.offsetWidth;
    var h = obj.offsetHeight;

    HidePopup();

    // Check if you are in a call
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;
    var session = lineObj.SipSession;

    dhtmlxPopup = new dhtmlXPopup();
    dhtmlxPopup.attachHTML("<div id=DeviceSelector style=\"width:250px\">"+ lang.loading +"</DIV>");
    dhtmlxPopup.show(x, y, w, h);

    var audioSelect = $('<select/>');
    audioSelect.prop("id", "audioSrcSelect");
    audioSelect.css("width", "100%");

    var videoSelect = $('<select/>');
    videoSelect.prop("id", "videoSrcSelect");
    videoSelect.css("width", "100%");

    var speakerSelect = $('<select/>');
    speakerSelect.prop("id", "audioOutputSelect");
    speakerSelect.css("width", "100%");

    var ringerSelect = $('<select/>');
    ringerSelect.prop("id", "ringerSelect");
    ringerSelect.css("width", "100%");

    // Handle Audio Source changes (Microphone)
    audioSelect.change(function(){
        console.log("Call to change Microphone: ", this.value);

        HidePopup();

        // First Stop Recording the call
        var mustRestartRecording = false;
        if(session.data.mediaRecorder && session.data.mediaRecorder.state == "recording"){
            StopRecording(lineNum, true);
            mustRestartRecording = true;
        }

        // Stop Monitoring
        if(lineObj.LocalSoundMeter) lineObj.LocalSoundMeter.stop();

        // Save Setting
        session.data.AudioSourceDevice = this.value;

        var constraints = {
            audio: {
                deviceId: (this.value != "default")? { exact: this.value } : "default"
            },
            video: false
        }
        navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
            // Assume that since we are selecting from a dropdown, this is possible
            var newMediaTrack = newStream.getAudioTracks()[0];
            var pc = session.sessionDescriptionHandler.peerConnection;
            pc.getSenders().forEach(function (RTCRtpSender) {
                if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                    console.log("Switching Audio Track : "+ RTCRtpSender.track.label + " to "+ newMediaTrack.label);
                    RTCRtpSender.track.stop(); // Must stop, or this mic will stay in use
                    RTCRtpSender.replaceTrack(newMediaTrack).then(function(){
                        // Start Recording again
                        if(mustRestartRecording) StartRecording(lineNum);
                        // Monitor Adio Stream
                        lineObj.LocalSoundMeter = StartLocalAudioMediaMonitoring(lineNum, session);
                    }).catch(function(e){
                        console.error("Error replacing track: ", e);
                    });
                }
            });
        }).catch(function(e){
            console.error("Error on getUserMedia");
        });
    });
    speakerSelect.change(function(){
        console.log("Call to change Speaker: ", this.value);

        HidePopup();
        session.data.AudioOutputDevice = this.value;

        // Also change the sinkId
        var sinkId = this.value;
        console.log("Attempting to set Audio Output SinkID for line "+ lineNum +" [" + sinkId + "]");

        // Remote Audio
        var element = $("#line-"+ lineNum +"-remoteAudio").get(0);
        if(element) {
            if (typeof element.sinkId !== 'undefined') {
                element.setSinkId(sinkId).then(function(){
                    console.log("sinkId applied: "+ sinkId);
                }).catch(function(e){
                    console.warn("Error using setSinkId: ", e);
                });
            } else {
                console.warn("setSinkId() is not possible using this browser.")
            }
        }
    });
    videoSelect.change(function(){
        console.log("Call to change WebCam");

        HidePopup();

        switchVideoSource(lineNum, this.value);
    });
    if(!navigator.mediaDevices) {
        console.warn("navigator.mediaDevices not possible.");
        return;
    }

    for (var i = 0; i < AudioinputDevices.length; ++i) {
        var deviceInfo = AudioinputDevices[i];
        var devideId = deviceInfo.deviceId;
        var DisplayName = (deviceInfo.label)? deviceInfo.label : "";
        if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));

        // Create Option
        var option = $('<option/>');
        option.prop("value", devideId);
        option.text((DisplayName != "")? DisplayName : "Microphone");
        if(session.data.AudioSourceDevice == devideId) option.prop("selected", true);
        audioSelect.append(option);
    }
    for (var i = 0; i < VideoinputDevices.length; ++i) {
        var deviceInfo = VideoinputDevices[i];
        var devideId = deviceInfo.deviceId;
        var DisplayName = (deviceInfo.label)? deviceInfo.label : "";
        if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));

        // Create Option
        var option = $('<option/>');
        option.prop("value", devideId);
        option.text((DisplayName != "")? DisplayName : "Webcam");
        if(session.data.VideoSourceDevice == devideId) option.prop("selected", true);
        videoSelect.append(option);
    }
    if(HasSpeakerDevice){
        for (var i = 0; i < SpeakerDevices.length; ++i) {
            var deviceInfo = SpeakerDevices[i];
            var devideId = deviceInfo.deviceId;
            var DisplayName = (deviceInfo.label)? deviceInfo.label : "";
            if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));

            // Create Option
            var option = $('<option/>');
            option.prop("value", devideId);
            option.text((DisplayName != "")? DisplayName : "Speaker"); 
            if(session.data.AudioOutputDevice == devideId) option.prop("selected", true);
            speakerSelect.append(option);
        }
    }
    // Show Popup
    dhtmlxPopup.attachHTML("<div id=DeviceSelector style=\"width:250px\"></DIV>");

    // Mic Serttings
    $("#DeviceSelector").append("<div style=\"margin-top:20px\">"+ lang.microphone +": </div>");
    $("#DeviceSelector").append(audioSelect);
    
    // Speaker
    if(HasSpeakerDevice){
        $("#DeviceSelector").append("<div style=\"margin-top:20px\">"+ lang.speaker +": </div>");
        $("#DeviceSelector").append(speakerSelect);
    }
    // Camera
    if(session.data.withvideo == true){
        $("#DeviceSelector").append("<div style=\"margin-top:20px\">"+ lang.camera +": </div>");
        $("#DeviceSelector").append(videoSelect);
    }

    // Show Menu
    dhtmlxPopup.show(x, y, w, h);
}

// Media Presentation
function PresentCamera(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", true);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").show();
    $("#line-"+ lineNum + "-remoteVideo").appendTo("#line-"+ lineNum + "-stage-container");

    switchVideoSource(lineNum, session.data.VideoSourceDevice);
}
function PresentScreen(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", true);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").hide();
    $("#line-"+ lineNum + "-remoteVideo").appendTo("#line-"+ lineNum + "-stage-container");

    ShareScreen(lineNum);
}
function PresentScratchpad(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", true);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").hide();
    $("#line-"+ lineNum + "-remoteVideo").appendTo("#line-"+ lineNum + "-preview-container");

    SendCanvas(lineNum);
}
function PresentVideo(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    var html = "<div class=\"UiWindowField\"><input type=file  accept=\"video/*\" id=SelectVideoToSend></div>";
    OpenWindow(html, lang.select_video, 150, 360, false, false, null, null, lang.cancel, function(){
        // Cancel
        CloseWindow();
    }, function(){
        // Do OnLoad
        $("#SelectVideoToSend").on('change', function(event){
            var input = event.target;
            if(input.files.length >= 1){
                CloseWindow();

                // Send Video (Can only send one file)
                SendVideo(lineNum, URL.createObjectURL(input.files[0]));
            }
            else {
                console.warn("Please Select a file to present.");
            }
        });
    }, null);
}
function PresentBlank(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", true);
    
    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").hide();
    $("#line-"+ lineNum + "-remoteVideo").appendTo("#line-"+ lineNum + "-stage-container");

    DisableVideoStream(lineNum);
}
function RemoveScratchpad(lineNum){
    var scratchpad = GetCanvas("line-" + lineNum + "-scratchpad");
    if(scratchpad != null){
        window.clearInterval(scratchpad.redrawIntrtval);

        RemoveCanvas("line-" + lineNum + "-scratchpad");
        $("#line-"+ lineNum + "-scratchpad-container").empty();

        scratchpad = null;
    }
}

// Call Statistics
function ShowCallStats(lineNum, obj){
    console.log("Show Call Stats");
    $("#line-"+ lineNum +"-AdioStats").show(300);
}
function HideCallStats(lineNum, obj){
    console.log("Hide Call Stats");
    $("#line-"+ lineNum +"-AdioStats").hide(300);
}

// Chatting
function chatOnbeforepaste(event, obj, buddy){
    console.log("Handle paste, checking for Images...");
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;

    // find pasted image among pasted items
    var preventDefault = false;
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            console.log("Image found! Opening image editor...");

            var blob = items[i].getAsFile();

            // read the image in
            var reader = new FileReader();
            reader.onload = function (event) {

                // Image has loaded, open Image Preview editer
                console.log("Image loaded... setting placeholder...");
                var placeholderImage = new Image();
                placeholderImage.onload = function () {

                    console.log("Placeholder loaded... CreateImageEditor...");

                    CreateImageEditor(buddy, placeholderImage);
                }
                placeholderImage.src = event.target.result;
            }
            reader.readAsDataURL(blob);

            preventDefault = true;
            continue;
        }
    }

    // Pevent default if you found an image
    if (preventDefault) event.preventDefault();
}
function chatOnkeydown(event, obj, buddy) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13'){
        if(event.shiftKey || event.ctrlKey) {
            // Leave as is
            // Windows and Mac react differently here.
        } else {
            event.preventDefault();
            
            SendChatMessage(buddy);
            return false;
        }
    } 

    // handle paste, etc
    RefreshChatPreview(event, $.trim($(obj).val()), buddy);
}
function chatOnInput(event, obj, buddy) {
    console.log(event);
    RefreshChatPreview(event, $.trim($(obj).val()), buddy);
}
function chatOnkeyup(event, obj, buddy) {
    RefreshChatPreview(event, $.trim($(obj).val()), buddy);
}
function RefreshChatPreview(event, str, buddy) {
    if (str != "") {
        var chatMessage = ReformatMessage(str);

        $("#contact-" + buddy + "-msgPreviewhtml").html(chatMessage);
        $("#contact-" + buddy + "-msgPreview").show();
    }
    else {
        ClearChatPreview(buddy);
    }

    updateScroll(buddy);
}
function ClearChatPreview(buddy) {
    $("#contact-" + buddy + "-msgPreviewhtml").html("");
    $("#contact-" + buddy + "-msgPreview").hide();
}
function ReformatMessage(str) {
    var msg = str;
    msg = msg.replace(/</gi, "&lt;");
    msg = msg.replace(/>/gi, "&gt;");
    msg = msg.replace(/\n/gi, "<br>");
    msg = msg.replace(/(:\)|:\-\)|:o\))/g, String.fromCodePoint(0x1F642));     // :) :-) :o)
    msg = msg.replace(/(:\(|:\-\(|:o\()/g, String.fromCodePoint(0x1F641));     // :( :-( :o(
    msg = msg.replace(/(;\)|;\-\)|;o\))/g, String.fromCodePoint(0x1F609));     // ;) ;-) ;o)
    msg = msg.replace(/(:'\(|:'\-\()/g, String.fromCodePoint(0x1F62A));        // :'( :'‑(
    msg = msg.replace(/(:'\(|:'\-\()/g, String.fromCodePoint(0x1F602));        // :') :'‑)
    msg = msg.replace(/(:\$)/g, String.fromCodePoint(0x1F633));                // :$
    msg = msg.replace(/(>:\()/g, String.fromCodePoint(0x1F623));               // >:(
    msg = msg.replace(/(:\×)/g, String.fromCodePoint(0x1F618));                // :×
    msg = msg.replace(/(:\O|:\‑O)/g, String.fromCodePoint(0x1F632));             // :O :‑O
    msg = msg.replace(/(:P|:\-P|:p|:\-p)/g, String.fromCodePoint(0x1F61B));      // :P :-P :p :-p
    msg = msg.replace(/(;P|;\-P|;p|;\-p)/g, String.fromCodePoint(0x1F61C));      // ;P ;-P ;p ;-p
    msg = msg.replace(/(:D|:\-D)/g, String.fromCodePoint(0x1F60D));             // :D :-D

    msg = msg.replace(/(\(like\))/g, String.fromCodePoint(0x1F44D));           // (like)

    // Make clickable Hyperlinks
    msg = msg.replace(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/gi, function (x) {
        var niceLink = (x.length > 50) ? x.substring(0, 47) + "..." : x;
        var rtn = "<A target=_blank class=previewHyperlink href=\"" + x + "\">" + niceLink + "</A>";
        return rtn;
    });
    return msg;
}
function getPicture(buddy, typestr){
    if(buddy == "profilePicture"){
        // Special handling for profile image
        var dbImg = localDB.getItem("profilePicture");
        if(dbImg == null){
            return hostingPrefex + "default.png";
        }
        else {
            return dbImg; 
            // return URL.createObjectURL(base64toBlob(dbImg, 'image/png'));
        }
    }

    typestr = (typestr)? typestr : "extension";
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj.imageObjectURL != ""){
        // Use Cache
        return buddyObj.imageObjectURL;
    }
    var dbImg = localDB.getItem("img-"+ buddy +"-"+ typestr);
    if(dbImg == null){
        return hostingPrefex + "default.png";
    }
    else {
        buddyObj.imageObjectURL = URL.createObjectURL(base64toBlob(dbImg, 'image/png'));
        return buddyObj.imageObjectURL;
    }
}

function GetCanvas(canvasId){
    for(var c = 0; c < CanvasCollection.length; c++){
        try {
            if(CanvasCollection[c].id == canvasId) return CanvasCollection[c];
        } catch(e) {
            console.warn("CanvasCollection.id not available");
        }
    }
    return null;
}
function RemoveCanvas(canvasId){
    for(var c = 0; c < CanvasCollection.length; c++){
        try{
            if(CanvasCollection[c].id == canvasId) {
                console.log("Found Old Canvas, Disposing...");

                CanvasCollection[c].clear()
                CanvasCollection[c].dispose();

                CanvasCollection[c].id = "--deleted--";

                console.log("CanvasCollection.splice("+ c +", 1)");
                CanvasCollection.splice(c, 1);
                break;
            }
        }
        catch(e){ }
    }
    console.log("There are "+ CanvasCollection.length +" canvas now.");
}
var ImageEditor_Select = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        return true;
    }
    return false;
}
var ImageEditor_FreedrawPen = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.freeDrawingBrush.color = canvas.PenColour;
        canvas.freeDrawingBrush.width = canvas.PenWidth;
        canvas.ToolSelected = "Draw";
        canvas.isDrawingMode = true;
        console.log(canvas)
        return true;
    }
    return false;
}
var ImageEditor_FreedrawPaint = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.freeDrawingBrush.color = canvas.PaintColour;
        canvas.freeDrawingBrush.width = canvas.PaintWidth;
        canvas.ToolSelected = "Paint";
        canvas.isDrawingMode = true;
        return true;
    }
    return false;
}
var ImageEditor_Pan = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "Pan";
        canvas.isDrawingMode = false;
        return true;
    }
    return false;
}
var ImageEditor_ResetZoom = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.setZoom(1);
        canvas.setViewportTransform([1,0,0,1,0,0]);
        // canvas.viewportTransform[4] = 0;
        // canvas.viewportTransform[5] = 0;
        return true;
    } 
    return false;
}
var ImageEditor_ZoomIn = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var zoom = canvas.getZoom();
        zoom = zoom + 0.5;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;

        var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
        var center = fabric.util.transformPoint(point, canvas.viewportTransform);

        canvas.zoomToPoint(point, zoom);

        return true;
    }
    return false;
}
var ImageEditor_ZoomOut = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var zoom = canvas.getZoom();
        zoom = zoom - 0.5;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;

        var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
        var center = fabric.util.transformPoint(point, canvas.viewportTransform);

        canvas.zoomToPoint(point, zoom);

        return true;
    }
    return false;
}
var ImageEditor_AddCircle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var circle = new fabric.Circle({
            radius: 20, fill: canvas.FillColour
        })
        canvas.add(circle);
        canvas.centerObject(circle);
        canvas.setActiveObject(circle);
        return true;
    }
    return false;
}
var ImageEditor_AddRectangle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var rectangle = new fabric.Rect({ 
            width: 40, height: 40, fill: canvas.FillColour
        })
        canvas.add(rectangle);
        canvas.centerObject(rectangle);
        canvas.setActiveObject(rectangle);
        return true;
    }
    return false;
}
var ImageEditor_AddTriangle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var triangle = new fabric.Triangle({
            width: 40, height: 40, fill: canvas.FillColour
        })
        canvas.add(triangle);
        canvas.centerObject(triangle);
        canvas.setActiveObject(triangle);
        return true;
    }
    return false;
}
var ImageEditor_AddEmoji = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var text = new fabric.Text(String.fromCodePoint(0x1F642), { fontSize : 24 });
        canvas.add(text);
        canvas.centerObject(text);
        canvas.setActiveObject(text);
        return true;
    }
    return false;
}
var ImageEditor_AddText = function (buddy, textString){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var text = new fabric.IText(textString, { fill: canvas.FillColour, fontFamily: 'arial', fontSize : 18 });
        canvas.add(text);
        canvas.centerObject(text);
        canvas.setActiveObject(text);
        return true;
    }
    return false;
}
var ImageEditor_Clear = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;

        var activeObjects = canvas.getActiveObjects();
        for (var i=0; i<activeObjects.length; i++){
            canvas.remove(activeObjects[i]);
        }
        canvas.discardActiveObject();

        return true;
    }
    return false;
}
var ImageEditor_ClearAll = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var savedBgImage = canvas.backgroundImage;

        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        canvas.clear();

        canvas.backgroundImage = savedBgImage;
        return true;
    }
    return false;
}
var ImageEditor_Cancel = function (buddy){
    console.log("Removing ImageEditor...");

    $("#contact-" + buddy + "-imagePastePreview").empty();
    RemoveCanvas("contact-" + buddy + "-imageCanvas");
    $("#contact-" + buddy + "-imagePastePreview").hide();
}
var ImageEditor_Send = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var imgData = canvas.toDataURL({ format: 'png' });
        SendImageDataMessage(buddy, imgData);
        return true;
    }
    return false;
}

// Find something in the message stream
function FindSomething(buddy) {
    $("#contact-" + buddy + "-search").toggle();
    if($("#contact-" + buddy + "-search").is(":visible") == false){
        RefreshStream(FindBuddyByIdentity(buddy));
    }
    updateScroll(buddy);
}

// FileShare an Upload
var allowDradAndDrop = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}
function onFileDragDrop(e, buddy){
    var filesArray = e.dataTransfer.files;
    console.log("You are about to upload " + filesArray.length + " file.");
    $("#contact-"+ buddy +"-ChatHistory").css("outline", "none");

    for (var f = 0; f < filesArray.length; f++){
        var fileObj = filesArray[f];
        var reader = new FileReader();
        reader.onload = function (event) {
            if(fileObj.size <= 52428800){
                // Add to Stream
                SendFileDataMessage(buddy, event.target.result, fileObj.name, fileObj.size);
            }
            else{
                alert("The file '"+ fileObj.name +"' is bigger than 50MB, you cannot upload this file")
            }
        }
        console.log("Adding: "+ fileObj.name + " of size: "+ fileObj.size +"bytes");
        reader.readAsDataURL(fileObj);
    }

    // Prevent Default
    preventDefault(e);
}
function cancelDragDrop(e, buddy){
    // dragleave dragend
    $("#contact-"+ buddy +"-ChatHistory").css("outline", "none");
    preventDefault(e);
}
function setupDragDrop(e, buddy){
    // dragover dragenter
    $("#contact-"+ buddy +"-ChatHistory").css("outline", "2px dashed #184369");
    preventDefault(e);
}
function preventDefault(e){
    e.preventDefault();
    e.stopPropagation();
}

// UI Elements
function OpenWindow(html, title, height, width, hideCloseButton, allowResize, button1_Text, button1_onClick, button2_Text, button2_onClick, DoOnLoad, OnClose) {
    console.log("Open Window: " + title);
    try {
        windowsCollection.window("window").close();
    } catch (e) { }

    // Create Window
    var windowObj = windowsCollection.createWindow("window", 100, 0, width, height);
    windowObj.setText(title);
    if (allowResize) {
        windowObj.allowResize();
    } else {
        windowObj.denyResize();
    }
    windowObj.setModal(true);
    windowObj.button("park").hide();
    windowObj.button("park").disable();
    if (allowResize) {
        windowObj.button("minmax").show();
    } else {
        windowObj.button("minmax").hide();
    }

    if (hideCloseButton) {
        windowObj.button("close").hide();
        windowObj.button("close").disable();
    }
    windowObj.button("help").hide();
    windowObj.button("help").disable();
    windowObj.attachHTMLString(html);
    if(DoOnLoad)DoOnLoad();
    if(OnClose){
        windowObj.attachEvent("onClose", function(win){
            return OnClose(win);
        });
    }
    var windowWidth = $(window).outerWidth();
    var windowHeight = $(window).outerHeight();
    if(windowWidth <= width || windowHeight <= height){
        console.log("Window width is small, consider fullscreen");
        windowObj.allowResize();
        windowObj.maximize();
        windowObj.denyResize();
    }
    windowObj.center();
    var buttonHtml = "<div class=UiWindowButtonBar>";
    if(button1_Text) buttonHtml += "<button id=WindowButton1>"+ button1_Text +"</button>";
    if(button2_Text) buttonHtml += "<button id=WindowButton2>"+ button2_Text +"</button>";
    buttonHtml += "</div>"
    windowObj.attachStatusBar({text: buttonHtml});
    $("#WindowButton1").click(function () {
        console.log("Window Button 1 clicked");
        if (button1_onClick) button1_onClick();
    });
    $("#WindowButton2").click(function () {
        console.log("Window Button 2 clicked");
        if (button2_onClick) button2_onClick();
    });
    windowObj.show();
}
function CloseWindow() {
    console.log("Call to close any open window");

    try {
        windowsCollection.window("window").close();
    } catch (e) { }
}
function WindowProgressOn() {
    try {
        windowsCollection.window("window").progressOn();
    } catch (e) { }

}
function WindowProgressOff() {
    try {
        windowsCollection.window("window").progressOff();
    } catch (e) { }
}
function Alert(messageStr, TitleStr, onOk) {
    if (confirmObj != null) {
        confirmObj.close();
        confirmObj = null;
    }
    if (promptObj != null) {
        promptObj.close();
        promptObj = null;
    }
    if (alertObj != null) {
        console.error("Alert not null, while Alert called: " + TitleStr + ", saying:" + messageStr);
        return;
    }
    else {
        console.log("Alert called with Title: " + TitleStr + ", saying: " + messageStr);
    }
    alertObj = messagingCollection.createWindow("alert", 0, 0, 300, 300);
    alertObj.setText(TitleStr);
    alertObj.center();
    alertObj.denyResize();
    alertObj.setModal(true);
    alertObj.button("park").hide();
    alertObj.button("park").disable();
    alertObj.button("minmax").hide();
    alertObj.button("minmax").disable();
    alertObj.button("close").hide();
    alertObj.button("close").disable();
    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=AllertMessageText>" + messageStr + "</div>";
    html += "<div class=UiButtonBar><button id=AlertOkButton style=\"width:80px\">"+ lang.ok +"</button></div>";
    html += "</div>"
    alertObj.attachHTMLString(html);
    var offsetTextHeight = $('#AllertMessageText').outerHeight();
    $("#AlertOkButton").click(function () {
        console.log("Alert OK clicked");
        if (onOk) onOk();
        alertObj.close();
        alertObj = null;
    });
    alertObj.setDimension(300, offsetTextHeight + 100);
    alertObj.show();
    $("#AlertOkButton").focus();
}
function Confirm(messageStr, TitleStr, onOk, onCancel) {
    if (alertObj != null) {
        alertObj.close();
        alertObj = null;
    }
    if (promptObj != null) {
        promptObj.close();
        promptObj = null;
    }
    if (confirmObj != null) {
        console.error("Confirm not null, while Confrim called with Title: " + TitleStr + ", saying: " + messageStr);
        return;
    }
    else {
        console.log("Confirm called with Title: " + TitleStr + ", saying: " + messageStr);
    }
    confirmObj = messagingCollection.createWindow("confirm", 0, 0, 300, 300);
    confirmObj.setText(TitleStr);
    confirmObj.center();
    confirmObj.denyResize();
    confirmObj.setModal(true);
    confirmObj.button("park").hide();
    confirmObj.button("park").disable();
    confirmObj.button("minmax").hide();
    confirmObj.button("minmax").disable();
    confirmObj.button("close").hide();
    confirmObj.button("close").disable();
    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=ConfrimMessageText>" + messageStr + "</div>";
    html += "<div class=UiButtonBar><button id=ConfirmOkButton style=\"width:80px\">"+ lang.ok +"</button><button id=ConfrimCancelButton style=\"width:80px\">"+ lang.cancel +"</button></div>";
    html += "</div>";
    confirmObj.attachHTMLString(html);
    var offsetTextHeight = $('#ConfrimMessageText').outerHeight();
    $("#ConfirmOkButton").click(function () {
        console.log("Confrim OK clicked");
        if (onOk) onOk();
        confirmObj.close();
        confirmObj = null;
    });
    $("#ConfrimCancelButton").click(function () {
        console.log("Confirm Cancel clicked");
        if (onCancel) onCancel();
        confirmObj.close();
        confirmObj = null;
    });
    confirmObj.setDimension(300, offsetTextHeight + 100);
    confirmObj.show();
    $("#ConfrimOkButton").focus();
}
function Prompt(messageStr, TitleStr, FieldText, defaultValue, dataType, placeholderText, onOk, onCancel) {
    if (alertObj != null) {
        alertObj.close();
        alertObj = null;
    }
    if (confirmObj != null) {
        confirmObj.close();
        confirmObj = null;
    }
    if (promptObj != null) {
        console.error("Prompt not null, while Prompt called with Title: " + TitleStr + ", saying: " + messageStr);
        return;
    }
    else {
        console.log("Prompt called with Title: " + TitleStr + ", saying: " + messageStr);
    }
    promptObj = messagingCollection.createWindow("prompt", 0, 0, 350, 350);
    promptObj.setText(TitleStr);
    promptObj.center();
    promptObj.denyResize();
    promptObj.setModal(true);
    promptObj.button("park").hide();
    promptObj.button("park").disable();
    promptObj.button("minmax").hide();
    promptObj.button("minmax").disable();
    promptObj.button("close").hide();
    promptObj.button("close").disable();
    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=PromptMessageText>";
    html += messageStr;
    html += "<div style=\"margin-top:10px\">" + FieldText + " : </div>";
    html += "<div style=\"margin-top:5px\"><INPUT id=PromptValueField type=" + dataType + " value=\"" + defaultValue + "\" placeholder=\"" + placeholderText + "\" style=\"width:98%\"></div>"
    html += "</div>";
    html += "<div class=UiButtonBar><button id=PromptOkButton style=\"width:80px\">"+ lang.ok +"</button>&nbsp;<button id=PromptCancelButton class=UiButton style=\"width:80px\">"+ lang.cancel +"</button></div>";
    html += "</div>";
    promptObj.attachHTMLString(html);
    var offsetTextHeight = $('#PromptMessageText').outerHeight();
    $("#PromptOkButton").click(function () {
        console.log("Prompt OK clicked, with value: " + $("#PromptValueField").val());
        if (onOk) onOk($("#PromptValueField").val());
        promptObj.close();
        promptObj = null;
    });
    $("#PromptCancelButton").click(function () {
        console.log("Prompt Cancel clicked");
        if (onCancel) onCancel();
        promptObj.close();
        promptObj = null;
    });

    promptObj.setDimension(350, offsetTextHeight + 100);
    promptObj.show();

    $("#PromptOkButton").focus();
}
function HidePopup(timeout){
    if(timeout){
        window.setTimeout(function(){
            if(dhtmlxPopup != null){
                dhtmlxPopup.hide();
                dhtmlxPopup.unload();
                dhtmlxPopup = null;
            }
        }, timeout);
    } else {
        if(dhtmlxPopup != null){
            dhtmlxPopup.hide();
            dhtmlxPopup.unload();
            dhtmlxPopup = null;
        }
    }
}
// Device Detection
function DetectDevices(){
    navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){
        HasVideoDevice = false;
        HasAudioDevice = false;
        HasSpeakerDevice = false; // Safari and Firefox don't have these
        AudioinputDevices = [];
        VideoinputDevices = [];
        SpeakerDevices = [];
        for (var i = 0; i < deviceInfos.length; ++i) {
            if (deviceInfos[i].kind === "audioinput") {
                HasAudioDevice = true;
                AudioinputDevices.push(deviceInfos[i]);
            } 
            else if (deviceInfos[i].kind === "audiooutput") {
                HasSpeakerDevice = true;
                SpeakerDevices.push(deviceInfos[i]);
            }
            else if (deviceInfos[i].kind === "videoinput") {
                HasVideoDevice = true;
                VideoinputDevices.push(deviceInfos[i]);
            }
        }
        // console.log(AudioinputDevices, VideoinputDevices);
    }).catch(function(e){
        console.error("Error enumerating devices", e);
    });
}
DetectDevices();
window.setInterval(function(){
    DetectDevices();
}, 10000);
// End Of File
