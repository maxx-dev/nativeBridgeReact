import UIKit
import WebKit
import SafariServices
import JavaScriptCore



/**
 * Before you launch the app
 
   1. Activate Push notifications Under NativeBridgeReact > Capabilities
   2. Login into you MemberCenter (https://developer.apple.com) and go to Certificates
   3. Create a "Apple Push Notification Authentication Key (Sandbox & Production)" certificate
   4. Put the key under the server/ directory (also change the name of the key in server/server.js
 
   Info: This key never expires and can be used for multiple apps at the same time.
   Much simpler than the old process!
 */

class ViewController:  UIViewController, WKScriptMessageHandler, UIWebViewDelegate, WKUIDelegate, QRScannerViewControllerDelegate  {
    
    var webView: WKWebView?
    var contentController = WKUserContentController();
    var deviceToken : String = ""
    var jsDeviceCommunicator = "nativeDeviceCommunicator."
    var webviewReady = false
    
    func didDismissQRScannerViewController (sender :QRScannerViewController)
    {
        print("DidDismissDetail Code:",sender.code)
        sendQRCode(code: sender.code)
    }
    
    override func loadView()
    {
        super.loadView()
        
        // for JS to Swift Communication
        contentController.add(self,name: "iOSCallbackHandler")
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true;
        config.applicationNameForUserAgent = "NativeBridgeReact"
        let screenSize: CGRect = UIScreen.main.bounds
        self.webView = WKWebView(frame: screenSize,configuration: config)
        self.view = self.webView!
    }
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        let url = NSURL(string:"http://localhost:8000") // IMPORTANT !!!! : change this to your ip address
        let req = NSMutableURLRequest(url:url! as URL)
        self.webView!.uiDelegate = self
        self.webView!.load(req as URLRequest)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?)
    {
        if (segue.identifier == "QRScanner")
        {
            let vc = segue.destination as! QRScannerViewController
            vc.delegate = self
        }
    }
    
    override func didReceiveMemoryWarning()
    {
        super.didReceiveMemoryWarning()
    }
    
    func showWebsiteInSFViewController (URL : String)
    {
        let url = NSURL(string:URL)
        //webView.loadRequest(navigationAction.request) // Open in webview
        //UIApplication.sharedApplication().openURL(navigationAction.request.URL!) // Open in safari
        let vc = SFSafariViewController(url: url! as URL, entersReaderIfAvailable: false) // Open in Safari ViewController
        present(vc, animated: true, completion: nil)
    }
    
    func dictionaryToString (dict : NSDictionary) -> String
    {
        do {
            
            let data = try JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted)
            return String(data: data,encoding: String.Encoding(rawValue: String.Encoding.ascii.rawValue))!
        }
        catch {
            print(error.localizedDescription)
            return ""
        }
    }
    
    // Swift -> JS
    func receivedNativeNotification (notification: NSDictionary)
    {
        //print(notification)
        //let action:String = notification["action"] as! String!
        //print("Notification Bridge to js: "+action)
        let dataString = dictionaryToString(dict: notification)
        let js = jsDeviceCommunicator+"receivedNativeNotification("+dataString+");"
        runJS(js: js)
    }
    
    // Swift -> JS
    func appDidEnterBackground ()
    {
        let js = jsDeviceCommunicator+"appDidEnterBackground();"
        runJS(js: js)
    }
    
    // Swift -> JS
    func appDidBecomeActive ()
    {
        let js = jsDeviceCommunicator+"appDidBecomeActive();"
        runJS(js: js)
    }
    
    // Swift -> JS
    func appWillEnterForeground ()
    {
        let js = jsDeviceCommunicator+"appWillEnterForeground();"
        runJS(js: js)
    }
    
    // Swift -> JS
    func sendDeviceToken ()
    {
        if !webviewReady { return }
        //print("DeviceToken: "+deviceToken);
        let js = jsDeviceCommunicator+"sendDeviceToken('"+deviceToken+"');"
        runJS(js: js)
    }
    
    // Swift -> JS
    func sendQRCode (code : String)
    {
        let js = jsDeviceCommunicator+"sendQRCode('"+code+"');"
        runJS(js: js)
    }
    
    func runJS (js : String)
    {
        self.webView?.evaluateJavaScript(js)
        {
            (_, error) in
            print(error)
        }
    }
    
    // JS -> Swift
    func userContentController(_ userContentController: WKUserContentController, didReceive message:WKScriptMessage)
    {
        if(message.name == "iOSCallbackHandler")
        {
            handleJSRequest(jsonStr: message.body as! String)
        }
    }
    
    func handleJSRequest (jsonStr : String)
    {
        let data = jsonStr.data(using: String.Encoding.ascii, allowLossyConversion: false)
        do {
            let json = try JSONSerialization.jsonObject(with: data!, options: JSONSerialization.ReadingOptions.mutableContainers)
            //print (json)
            webviewReady = true
            
            if let dict = json as? [String: AnyObject]
            {
                let action = dict["action"] as? String
                
                if(action == "RequestDeviceToken")
                {
                    sendDeviceToken();
                }
                if(action == "ShowWebsiteInSFViewController")
                {
                    showWebsiteInSFViewController(URL: dict["url"] as! String)
                }
                if (action == "ScanQRCode")
                {
                    self.performSegue(withIdentifier: "QRScanner", sender: self)
                }
                if(action == "ReloadApp")
                {
                    webView?.reload()
                }
            }
        }
        catch
        {
            print("handleJSRequest",error)
        }
    }
    
    
    
}

