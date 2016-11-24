import React from 'react'

export default class NativeDeviceCommunicator extends React.Component {

    constructor (props)
    {
        super(props)
        this.device = {};
        this.exposeNativeFunctions();
        if (this.identifyEnvironment()) { this.requestDeviceToken(); }
    }

    exposeNativeFunctions ()
    {
        window.nativeDeviceCommunicator = {};
        var funcs = Object.getOwnPropertyNames(this.__proto__);
        for (var s in funcs)
        {
            var funcName = funcs[s];
            if (funcName.indexOf('EXPOSE_') != -1)
            {
                var plainName = funcName.replace('EXPOSE_','');
                window.nativeDeviceCommunicator[plainName] = this[funcName].bind(this);
            }
        }
        //console.log(window.nativeDeviceCommunicator);
    }

    identifyEnvironment ()
    {
        var func = false;
        var os = '';
        try {
            func = webkit.messageHandlers.iOSCallbackHandler;
            os = 'ios';
        } catch(err) { }
        try {
            func = Android;
            os = 'android';
        }
        catch(err) {}
        if (func)
        {
            this.setNative(os,func);
            return true;
        }
        return false;
    }

    requestDeviceToken  () { this.doNativeRequest({'action':'RequestDeviceToken'}); }
    showWebsite (url) { this.doNativeRequest({'action':'ShowWebsiteInSFViewController','url':url}); }
    reloadApp () { this.doNativeRequest({'action':'ReloadApp'}); }

    saveToken ()
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', window.location.protocol+'//'+window.location.hostname+':8000/ios/'+this.native.token+'/'+this.native.os);
        xhr.onreadystatechange = function ()
        {
            if (xhr.readyState == 4 && xhr.status == 200) {}
        }.bind(this);
        xhr.send(null);
    }

    /**
     * JS -> Swift
     * @param data
     */
    doNativeRequest (data)  { this.nativeFunc.postMessage(JSON.stringify(data)); }

    /**
     * Swift -> JS && Java -> JS
     * @param deviceToken {string}
     */
    EXPOSE_sendDeviceToken (deviceToken)
    {
        console.log('Received Token in WebView: '+deviceToken);
        if (deviceToken && deviceToken != '')
        {
            this.native.token = deviceToken;
            this.refs.result.textContent = 'Token: '+deviceToken;
            this.saveToken();
        }
    }

    /**
     * Java/Swift -> JS
     * is only triggered when app was in background
     * @param data {object}
     */
    EXPOSE_receivedNativeNotification (data)
    {
        console.log('ReceivedNativeNotification',data);
        this.refs.result.textContent = 'Notification: '+JSON.stringify(data);
    }

    // Swift -> JS
    EXPOSE_appDidEnterBackground ()
    {
        if (!this.native) return;
        this.device.appInForeground = false;
        this.appInBackground();
        //console.log('iOS - AppDidEnterBackground');
    }

    // Swift -> JS
    EXPOSE_appDidBecomeActive () { }

    // Swift -> JS
    EXPOSE_appWillEnterForeground ()
    {
        if (!this.native) return;
        this.native.appInForeground = true;
        this.appInForeground();
        //console.log('iOS - AppWillEnterForeground');
    }

    // Java -> JS
    EXPOSE_activityResumed ()
    {
        if (!this.native) return;
        this.native.appInForeground = true;
        this.appInForeground();
        //console.log('Android - ActivityResumed');
    }

    // Java -> JS
    EXPOSE_activityPaused ()
    {
        if (!this.native) return;
        this.native.appInForeground = false;
        this.appInBackground();
        //console.log('Android - ActivityPaused');
    }

    /**
     * Java/Swift -> JS
     * @param qrCode {string}
     */
    EXPOSE_sendQRCode (qrCode)
    {
        console.log('Received QRCode '+qrCode);
        this.refs.result.textContent = 'QRCode: '+qrCode;
    }

    appInForeground () { }
    appInBackground () { }

    setNative (os,func)
    {
        this.nativeFunc = func;
        this.native = {os:os};
    }

    render ()
    {
        var btns = [
            <div className="btn" onClick={this.showWebsite.bind(this,'http://www.google.com')}>Show Website in SFView Controller</div>,
            <div className="btn" onClick={this.reloadApp.bind(this)}>Reload App</div>,
            <div className="btn" onClick={this.doNativeRequest.bind(this,{'action':'ScanQRCode'})}>Scan QRCode</div>,
            <div ref="result" className="result"></div>
        ]
        return <div>{btns}</div>;
    }
};