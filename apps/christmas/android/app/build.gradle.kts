plugins {
    id("com.android.application")
}
val signingFile = providers.environmentVariable("ANDROID_RELEASE_STORE_FILE").orNull
val signingPass = providers.environmentVariable("ANDROID_RELEASE_STORE_PASSWORD").orNull
val signingAlias = providers.environmentVariable("ANDROID_RELEASE_KEY_ALIAS").orNull
val signingKeyPass = providers.environmentVariable("ANDROID_RELEASE_KEY_PASSWORD").orNull
val familyKey = providers.environmentVariable("ANDROID_CHRISTMAS_FAMILY_KEY").orNull ?: ""

android {
    namespace = "dev.corypahl.christmas"
    compileSdk = 36
    defaultConfig {
        applicationId = "dev.corypahl.christmas"
        minSdk = 26
        targetSdk = 36
        versionCode = providers.environmentVariable("ANDROID_VERSION_CODE").orNull?.toIntOrNull() ?: 1
        versionName = providers.environmentVariable("ANDROID_VERSION_NAME").orNull ?: "0.1.0"
        buildConfigField("String", "FAMILY_KEY",
            "\\"" + familyKey.replace("\\", "\\\\").replace("\\"", "\\\"") + "\\"")
    }
    buildFeatures { buildConfig = true }
    signingConfigs {
        if (!signingFile.isNullOrBlank() && !signingPass.isNullOrBlank()
                && !signingAlias.isNullOrBlank() && !signingKeyPass.isNullOrBlank()) {
            create("upload") {
                storeFile = file(signingFile)
                storePassword = signingPass
                keyAlias = signingAlias
                keyPassword = signingKeyPass
            }
        }
    }
    buildTypes {
        getByName("release") {
            signingConfigs.findByName("upload")?.let { signingConfig = it }
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    testOptions { unitTests.isReturnDefaultValues = true }
}
dependencies {
    implementation("androidx.core:core:1.16.0")
    testImplementation("junit:junit:4.13.2")
}
