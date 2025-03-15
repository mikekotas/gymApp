import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { App } from '@capacitor/app';
import { Notify, Dialog } from 'quasar';

class UpdateService {
  constructor() {
    this.updateServerUrl = 'https://mikekotas.github.io'; // Replace with your actual server URL
    this.updateJsonPath = '/mobile_apps_assets_apks/GymTraining/app-update.json';
    this.currentVersion = null;
  }

  async initialize() {
    try {
      // Get current app version
      const info = await App.getInfo();
      this.currentVersion = parseInt(info.version.replace(/\./g, ''));
      console.log('Current app version:', info.version, 'Numeric:', this.currentVersion);
    } catch (error) {
      console.error('Error initializing update service:', error);
    }
  }

  async checkForUpdates(showNoUpdateMessage = false) {

    if (!Capacitor.isNativePlatform()) {
      console.log('Update checking only works on mobile devices');
      return false;
    }

    try {
      if (!this.currentVersion) {
        await this.initialize();
      }

      // Fetch update information from server
      const response = await fetch(`${this.updateServerUrl}${this.updateJsonPath}?t=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch update information');
      }

      const updateInfo = await response.json();
      const latestVersion = parseInt(updateInfo.versionCode);

      console.log('Latest version available:', updateInfo.versionName, 'Numeric:', latestVersion);

      if (latestVersion > this.currentVersion) {
        // Show update dialog
        return this.promptForUpdate(updateInfo);
      } else if (showNoUpdateMessage) {
        Notify.create({
          message: 'Your app is up to date!',
          color: 'positive'
        });
      }

      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  promptForUpdate(updateInfo) {
    return new Promise((resolve) => {
      Dialog.create({
        title: 'Update Available',
        message: `A new version (${updateInfo.versionName}) is available. ${updateInfo.updateMessage}`,
        html: true,
        persistent: true,
        ok: {
          label: 'Update Now',
          color: 'primary'
        },
        cancel: updateInfo.forceUpdate ? false : {
          label: 'Later',
          color: 'negative'
        }
      }).onOk(() => {
        this.downloadAndInstallUpdate(updateInfo.downloadUrl);
        resolve(true);
      }).onCancel(() => {
        resolve(false);
      });
    });
  }

  async downloadAndInstallUpdate(downloadUrl) {
    try {
      Notify.create({
        message: 'Downloading update...',
        color: 'info',
        icon: 'cloud_download',
        timeout: 0,
        spinner: true
      });

      // Download the APK
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download update');
      }

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async function() {
        try {
          const base64Data = reader.result.split(',')[1];
          const fileName = 'app-update.apk';

          // Save the file
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
          });

          Notify.dismiss();
          Notify.create({
            message: 'Installing update...',
            color: 'positive',
            timeout: 2000
          });

          // Open the APK file to trigger installation
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: 'application/vnd.android.package-archive'
          });
        } catch (error) {
          console.error('Error saving or opening file:', error);
          Notify.create({
            message: 'Update installation failed. Please try again.',
            color: 'negative'
          });
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error downloading update:', error);
      Notify.dismiss();
      Notify.create({
        message: 'Failed to download update. Please check your connection.',
        color: 'negative'
      });
    }
  }
}

export default new UpdateService();
