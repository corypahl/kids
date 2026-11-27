package dev.corypahl.christmas;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.core.content.FileProvider;

import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String APP_URL = "https://kids.corypahl.dev/christmas/";
    private static final String APP_ORIGIN = "https://kids.corypahl.dev";
    private static final int BACKGROUND = Color.rgb(249, 248, 242);
    private static final int BRAND = Color.rgb(24, 93, 77);
    private static final int FILE_REQUEST = 21;
    private static final int SPEECH_REQUEST = 22;
    private static final int AUDIO_PERMISSION_REQUEST = 23;

    private WebView webView;
    private ProgressBar progress;
    private View errorPanel;
    private WebChromeClient.FileChooserParams unusedChooser;
    private android.webkit.ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;
    private PermissionRequest pendingMicRequest;

    // The fidget accelerometer listens only while its game requests motion.
    // No raw movement data leaves the device; JS receives a shake event only.
    private SensorManager fidgetSensorManager;
    private Sensor fidgetAccelerometer;
    private boolean fidgetMotionRequested = false;
    private boolean fidgetListenerActive = false;
    private boolean fidgetGravityReady = false;
    private float fidgetGX, fidgetGY, fidgetGZ;
    private long fidgetLastShakeNanos = 0L;
    private final SensorEventListener fidgetMotionListener = new SensorEventListener() {
        @Override public void onAccuracyChanged(Sensor sensor, int accuracy) { }
        @Override public void onSensorChanged(SensorEvent event) {
            if (!fidgetMotionRequested || event.values.length < 3) return;
            if (!fidgetGravityReady) {
                fidgetGX = event.values[0]; fidgetGY = event.values[1]; fidgetGZ = event.values[2];
                fidgetGravityReady = true;
                return;
            }
            float alpha = .82f;
            fidgetGX = alpha * fidgetGX + (1 - alpha) * event.values[0];
            fidgetGY = alpha * fidgetGY + (1 - alpha) * event.values[1];
            fidgetGZ = alpha * fidgetGZ + (1 - alpha) * event.values[2];
            float dx = event.values[0] - fidgetGX, dy = event.values[1] - fidgetGY,
                    dz = event.values[2] - fidgetGZ;
            double movement = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (movement > 11.5 && event.timestamp - fidgetLastShakeNanos > 750000000L) {
                fidgetLastShakeNanos = event.timestamp;
                if (webView != null && webView.getUrl() != null &&
                        NavigationPolicy.isChristmasUrl(webView.getUrl())) {
                    webView.evaluateJavascript(
                            "window.dispatchEvent(new Event('christmas-native-shake'))", null);
                }
            }
        }
    };

    private void startFidgetSensor() {
        if (fidgetAccelerometer == null || fidgetSensorManager == null || fidgetListenerActive) return;
        fidgetGravityReady = false;
        fidgetListenerActive = fidgetSensorManager.registerListener(
                fidgetMotionListener, fidgetAccelerometer, SensorManager.SENSOR_DELAY_GAME);
    }
    private void stopFidgetSensor() {
        if (fidgetListenerActive && fidgetSensorManager != null) {
            fidgetSensorManager.unregisterListener(fidgetMotionListener);
            fidgetListenerActive = false;
        }
        fidgetGravityReady = false;
    }


    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(BRAND);
        getWindow().setNavigationBarColor(BRAND);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(BACKGROUND);
        setContentView(root);
        fidgetSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        fidgetAccelerometer = fidgetSensorManager == null ? null :
                fidgetSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars()
                        | WindowInsets.Type.displayCutout());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
            root.requestApplyInsets();
        }

        webView = new WebView(this);
        webView.setBackgroundColor(BACKGROUND);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        WebView.setWebContentsDebuggingEnabled(
                (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0);

        // Only load Christmas Village within this WebView; external links open in the browser.
        // The bridge offers a convenience credential, not true proof of APK origin.
        webView.addJavascriptInterface(new ChristmasBridge(), "ChristmasAndroid");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                String url = request.getUrl().toString();
                if (NavigationPolicy.isChristmasUrl(url)) return false;
                if (NavigationPolicy.isExternalWebUrl(url)) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
                    catch (ActivityNotFoundException ignored) { }
                }
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showError();
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (progress != null) progress.setVisibility(View.GONE);
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleMediaPermission(request));
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) {
                if (request == pendingMicRequest) pendingMicRequest = null;
            }
            @Override public boolean onShowFileChooser(WebView view,
                    android.webkit.ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                return launchFileChooser(params);
            }
        });
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setIndeterminate(true);
        progress.setIndeterminateTintList(android.content.res.ColorStateList.valueOf(BRAND));
        root.addView(progress, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(4), Gravity.TOP));

        errorPanel = createErrorPanel(root);
        errorPanel.setVisibility(View.GONE);
        if (Build.VERSION.SDK_INT >= 33)
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, this::goBackOrFinish);

        if (state != null && webView.restoreState(state) != null) return;
        openHome();
    }

    private void handleMediaPermission(PermissionRequest request) {
        String origin = request.getOrigin() == null ? "" : request.getOrigin().toString();
        if (!APP_ORIGIN.equals(origin) && !(APP_ORIGIN + "/").equals(origin)) {
            request.deny(); return;
        }
        String[] resources = request.getResources();
        if (resources.length != 1 ||
                !PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resources[0])) {
            request.deny(); return;
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        } else {
            pendingMicRequest = request;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION_REQUEST);
        }
    }

    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(code, permissions, results);
        if (code != AUDIO_PERMISSION_REQUEST || pendingMicRequest == null) return;
        PermissionRequest request = pendingMicRequest;
        pendingMicRequest = null;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED)
            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        else request.deny();
    }

    private boolean launchFileChooser(WebChromeClient.FileChooserParams params) {
        try {
            Intent picker = params.createIntent();
            String[] accepts = params.getAcceptTypes();
            boolean image = Arrays.stream(accepts).anyMatch(s -> s.startsWith("image/"));
            Intent camera = image ? cameraIntent() : null;
            if (camera != null && params.isCaptureEnabled()) {
                startActivityForResult(camera, FILE_REQUEST);
            } else if (camera != null) {
                Intent chooser = Intent.createChooser(picker, getString(R.string.choose_photo));
                chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{camera});
                startActivityForResult(chooser, FILE_REQUEST);
            } else {
                startActivityForResult(picker, FILE_REQUEST);
            }
            return true;
        } catch (ActivityNotFoundException | IOException ex) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = null;
            return false;
        }
    }

    private Intent cameraIntent() throws IOException {
        Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (camera.resolveActivity(getPackageManager()) == null) return null;
        File temp = File.createTempFile("glitter-", ".jpg", getCacheDir());
        cameraUri = FileProvider.getUriForFile(this,
                BuildConfig.APPLICATION_ID + ".fileprovider", temp);
        camera.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
        camera.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return camera;
    }

    @Override protected void onActivityResult(int code, int resultCode, Intent data) {
        super.onActivityResult(code, resultCode, data);
        if (code == FILE_REQUEST) {
            if (fileCallback != null) {
                Uri[] selection = null;
                if (resultCode == RESULT_OK) {
                    if (data != null) {
                        selection = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                    } else if (cameraUri != null) {
                        selection = new Uri[]{cameraUri};
                    }
                }
                fileCallback.onReceiveValue(selection);
                fileCallback = null;
            }
            cameraUri = null;
        } else if (code == SPEECH_REQUEST) {
            String text = null;
            if (resultCode == RESULT_OK && data != null) {
                ArrayList<String> results = data.getStringArrayListExtra(
                        RecognizerIntent.EXTRA_RESULTS);
                if (results != null && !results.isEmpty()) text = results.get(0);
            }
            emitDictation(text, text == null ? "Dictation cancelled or unavailable." : null);
        }
    }

    private void emitDictation(String text, String error) {
        if (webView == null) return;
        String data = text == null
                ? "{error:" + JSONObject.quote(error) + "}"
                : "{text:" + JSONObject.quote(text) + "}";
        webView.evaluateJavascript("window.dispatchEvent(new CustomEvent(" +
                "'christmas-native-dictation',{detail:" + data + "}))", null);
    }

    private final class ChristmasBridge {
        @JavascriptInterface public String familyKey() {
            return BuildConfig.FAMILY_KEY;
        }
        @JavascriptInterface public boolean motionAvailable() {
            return fidgetAccelerometer != null;
        }
        @JavascriptInterface public void startFidgetMotion() {
            runOnUiThread(() -> {
                fidgetMotionRequested = true;
                startFidgetSensor();
            });
        }
        @JavascriptInterface public void stopFidgetMotion() {
            runOnUiThread(() -> {
                fidgetMotionRequested = false;
                stopFidgetSensor();
            });
        }
        @JavascriptInterface public void dictateWish() {
            runOnUiThread(() -> {
                Intent speech = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                speech.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                        RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                speech.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.US.toLanguageTag());
                speech.putExtra(RecognizerIntent.EXTRA_PROMPT, "Tell Santa what you wish for!");
                try { startActivityForResult(speech, SPEECH_REQUEST); }
                catch (ActivityNotFoundException ex) {
                    emitDictation(null, "Speech recognition is unavailable. Please type a wish.");
                }
            });
        }
    }

    private View createErrorPanel(FrameLayout root) {
        LinearLayout panel = new LinearLayout(this);
        panel.setGravity(Gravity.CENTER);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(dp(24), dp(24), dp(24), dp(24));
        panel.setBackgroundColor(BACKGROUND);
        TextView title = new TextView(this);
        title.setText(R.string.offline_title);
        title.setTextColor(BRAND);
        title.setTextSize(21);
        title.setGravity(Gravity.CENTER);
        panel.addView(title);
        TextView description = new TextView(this);
        description.setText(R.string.offline_description);
        description.setTextSize(14);
        description.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(-2, -2);
        textParams.topMargin = dp(12);
        panel.addView(description, textParams);
        Button retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setOnClickListener(v -> openHome());
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-2, -2);
        retryParams.topMargin = dp(18);
        panel.addView(retry, retryParams);
        root.addView(panel, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        return panel;
    }

    private void showError() {
        progress.setVisibility(View.GONE);
        errorPanel.setVisibility(View.VISIBLE);
    }
    private void openHome() {
        errorPanel.setVisibility(View.GONE);
        progress.setVisibility(View.VISIBLE);
        webView.loadUrl(APP_URL);
    }
    private void goBackOrFinish() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else finish();
    }
    @Override @Deprecated public void onBackPressed() { goBackOrFinish(); }
    @Override protected void onSaveInstanceState(Bundle state) {
        if (webView != null) webView.saveState(state);
        super.onSaveInstanceState(state);
    }
    @Override protected void onPause() {
        stopFidgetSensor();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (fidgetMotionRequested) startFidgetSensor();
    }
    @Override protected void onDestroy() {
        fidgetMotionRequested = false;
        stopFidgetSensor();
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        if (pendingMicRequest != null) pendingMicRequest.deny();
        if (webView != null) {
            ((ViewGroup) webView.getParent()).removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
    private int dp(int units) {
        return Math.round(units * getResources().getDisplayMetrics().density);
    }
}
