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
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
    web.setWebViewClient(new WebViewClient(){
      public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){
        Uri u=r.getUrl();
        if("https".equals(u.getScheme())&&"softwareai-mtm.vercel.app".equals(u.getHost()))return false;
        if("https".equals(u.getScheme()))startActivity(new Intent(Intent.ACTION_VIEW,u));
        return true;
      }
    });
    web.addJavascriptInterface(new Bridge(),"AuraNative");
    tts=new TextToSpeech(this,s->{if(s==TextToSpeech.SUCCESS){ttsReady=true;tts.setLanguage(new Locale("vi","VN"));}});
    web.loadUrl(URL);
  }
  private void listen(){
    if(Build.VERSION.SDK_INT>=23&&checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED){
      requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},12);return;
    }
    if(!SpeechRecognizer.isRecognitionAvailable(this)){
      Toast.makeText(this,"Chưa có dịch vụ nhận giọng nói trên điện thoại",Toast.LENGTH_LONG).show();return;
    }
    if(recognition!=null){recognition.destroy();recognition=null;}
    recognition=SpeechRecognizer.createSpeechRecognizer(this);
    recognition.setRecognitionListener(new RecognitionListener(){
      public void onReadyForSpeech(Bundle b){Toast.makeText(MainActivity.this,"AURA đang nghe...",Toast.LENGTH_SHORT).show();}
      public void onBeginningOfSpeech(){}
      public void onRmsChanged(float f){}
      public void onBufferReceived(byte[] b){}
      public void onEndOfSpeech(){}
      public void onError(int e){Toast.makeText(MainActivity.this,"Không nhận được giọng nói ("+e+")",Toast.LENGTH_SHORT).show();}
      public void onResults(Bundle b){
        ArrayList<String> ws=b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if(ws!=null&&!ws.isEmpty())web.evaluateJavascript("window.auraNativeTranscript&&window.auraNativeTranscript("+JSONObject.quote(ws.get(0))+");",null);
      }
      public void onPartialResults(Bundle b){}
      public void onEvent(int e,Bundle b){}
    });
    Intent i=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
    i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
    i.putExtra(RecognizerIntent.EXTRA_LANGUAGE,"vi-VN");
    i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS,1);
    try{recognition.startListening(i);}catch(Exception e){Toast.makeText(this,"Không bật được micro",Toast.LENGTH_SHORT).show();}
  }
  public class Bridge {
    @JavascriptInterface public void listen(){runOnUiThread(()->MainActivity.this.listen());}
    @JavascriptInterface public void speak(String s){runOnUiThread(()->{
      if(ttsReady&&tts!=null){tts.stop();tts.speak(s,TextToSpeech.QUEUE_FLUSH,null,"aura-speech");}
    });}
    @JavascriptInterface public void stopSpeaking(){runOnUiThread(()->{if(tts!=null)tts.stop();});}
  }
  public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
  protected void onPause(){super.onPause();if(tts!=null)tts.stop();}
  protected void onDestroy(){if(recognition!=null)recognition.destroy();if(tts!=null)tts.shutdown();if(web!=null){web.removeJavascriptInterface("AuraNative");web.destroy();}super.onDestroy();}
}
