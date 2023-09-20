// This script has no effect outside the desktop app. It should not be manually installed.

{
	// IMPORTANT: Always keep this up to date with the version number in app_src/main.js
	const LATEST_VERSION = '2.0.3';

	if (App.isUsingClient) {
		if (typeof POKECLICKER_SCRIPTS_DESKTOP_VERSION !== 'string' 
			|| POKECLICKER_SCRIPTS_DESKTOP_VERSION < LATEST_VERSION) {
			Notifier.notify({
		      type: NotificationConstants.NotificationOption.info,
		      title: 'Pokéclicker Scripts Desktop update',
		      message: 'A new version of Pokéclicker Scripts Desktop is available for download:\n\n<a href="https://github.com/Ephenia/Pokeclicker-Scripts/tree/master/desktop" target="_blank">https://github.com/Ephenia/Pokeclicker-Scripts/tree/master/desktop</a>',
		      timeout: GameConstants.DAY,
		    });
		}
	}
}