This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

### Windows

This section provides complete instructions for running the app on Windows from scratch.

#### Prerequisites

Before you begin, you need to install the following software:

##### 1. Node.js (version 18 or higher)

1. Go to https://nodejs.org/
2. Download the **LTS** (Long Term Support) version
3. Run the installer and follow the prompts (accept all defaults)
4. Verify installation by opening **Command Prompt** or **PowerShell** and typing:
   ```sh
   node --version
   ```
   You should see a version number like `v18.x.x` or higher.

##### 2. Git

1. Go to https://git-scm.com/download/win
2. Download and run the installer
3. Accept all default options during installation
4. Verify installation:
   ```sh
   git --version
   ```

##### 3. Visual Studio 2022

This is required to build Windows native code. The **Community** edition is free.

1. Go to https://visualstudio.microsoft.com/downloads/
2. Download **Visual Studio 2022 Community**
3. Run the installer
4. When the installer opens, select the following **Workloads**:
   - **Desktop development with C++**
   - **Universal Windows Platform development**
5. In the **Individual components** tab, make sure these are selected:
   - **MSVC v143 - VS 2022 C++ x64/x86 build tools (Latest)**
   - **Windows 10 SDK (10.0.19041.0)** or any Windows 10/11 SDK
   - **C++ CMake tools for Windows**
6. Click **Install** (this will take 10-30 minutes depending on your internet speed)

##### 4. Enable Developer Mode on Windows

1. Press `Windows + I` to open **Settings**
2. Go to **Privacy & security** > **For developers**
3. Toggle **Developer Mode** to **On**
4. Click **Yes** when prompted

#### Installation Steps

##### Step 1: Clone the Repository

Open **Command Prompt** or **PowerShell** and run:

```sh
git clone https://github.com/tobetoby/react-app.git
cd react-app
```

##### Step 2: Install Dependencies

In the project folder, run:

```sh
npm install
```

This will download all required packages. Wait for it to complete (may take a few minutes).

#### Running the App

You have two options to run the app:

##### Option A: Single Command (Recommended)

This starts Metro bundler and launches the app in one command:

```sh
npm run windows
```

The first build will take 5-15 minutes. Subsequent builds are much faster.

##### Option B: Two Separate Terminals

**Terminal 1** - Start Metro bundler:
```sh
npm start
```

**Terminal 2** - Build and run the Windows app:
```sh
npm run windows
```

#### What to Expect

1. The Metro bundler window will open showing "Welcome to Metro"
2. Visual Studio will compile the native code (first time takes longer)
3. The app window will launch automatically
4. You should see the Energy System Expansion Plan Manager interface

#### Reloading the App

- Press `Ctrl + R` in the app window to reload JavaScript changes
- If the app gets stuck, close it and run `npm run windows` again

#### Troubleshooting

**"Metro bundler not found" or connection errors:**
- Make sure Metro is running (`npm start` in a separate terminal)
- Check that port 8081 is not blocked by firewall

**Build errors related to Visual Studio:**
- Ensure you installed the correct workloads (see Prerequisites)
- Try running Visual Studio Installer and clicking "Repair"

**"Developer Mode not enabled" error:**
- Follow the steps in "Enable Developer Mode on Windows" above

**App builds but shows blank/white screen:**
- Press `Ctrl + R` to reload
- Check the Metro terminal for JavaScript errors

**Build takes forever or fails with memory errors:**
- Close other applications to free up RAM
- Restart your computer and try again

**Permission denied errors:**
- Run Command Prompt or PowerShell as Administrator

For more Windows-specific troubleshooting, see: https://microsoft.github.io/react-native-windows/docs/getting-started

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
