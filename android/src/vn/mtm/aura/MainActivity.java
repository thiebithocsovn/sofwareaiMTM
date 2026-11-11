package vn.mtm.aura;
import android.Manifest;
import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.speech.RecognizerIntent;
import android.speech.RecognitionListener;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.widget.Toast;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Locale;

public final class MainActivity extends Activity {
  private static final String URL="https://softwareai-mtm.vercel.app/";
  private WebView web;
  private SpeechRecognizer recognition;
  private TextToSpeech tts;
  private boolean ttsReady=false;
  public void onCreate(Bundle b){
    super.onCreate(b);
    getWindow().setStatusBarColor(0xff0b1022);
    getWindow().setNavigationBarColor(0xff0b1022);
    web=new WebView(this);
    setContentView(web);
    web.setBackgroundColor(0xff0b1022);
    web.getSettings().setJavaScriptEnabled(true);
    web.getSettings().setDomStorageEnabled(true);
    web.getSettings().setAllowFileAccess(false);
    web.getSettings().setAllowContentAccess(false);
    web.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
    CookieManager.getInstance().setAcceptCooki¶»§q«^